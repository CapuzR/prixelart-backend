# Mejoras propuestas para el módulo de Órdenes y Analítica (MongoDB/TypeScript)

> **Contexto**: Se compararon dos versiones del servicio de órdenes (**v1** y **v2**). La **v2** introduce mejoras importantes (atomicidad, trazabilidad y composición de cambios), pero aún hay ajustes y correcciones que conviene aplicar para robustecer el comportamiento, la consistencia de datos y el rendimiento.

---

## 1) Resumen ejecutivo

* **Lo que ya mejora v2**: una sola operación de actualización por transacción, **historial** de cambios (`HistoryEntry`), pre-cálculo del estado futuro antes de escribir, y menor número de *roundtrips* a la base de datos.
* **Bugs a corregir** (prioridad alta):

  1. Uso de `findOneAndUpdate` devolviendo el *wrapper* en lugar de `result.value`.
  2. Doble conteo de clientes **recurrentes** en `getCustomerAnalytics`.
  3. Filtro de `readAllOrders` que no evalúa el **último** estado global.
  4. Validar `ObjectId` antes de construirlo.
  5. Duplicación de entradas de historial al procesar comisiones.
  6. Envío de correo con una versión **desactualizada** del documento insertado.
* **Mejoras de diseño** (prioridad media):

  * Relectura del documento tras `commit` cuando sea necesario.
  * Política clara de acoplamiento **estado global ↔ estados de líneas** (idempotencia y reversión).
  * Fuente de verdad para totales/subtotales en cálculos de comisiones.
  * Normalización de campos de imagen (`mockUp` / `thumbUrl`).
  * Constantes y *helpers*; timestamps consistentes; índices adecuados; *shape* de retornos.

---

## 2) Objetivos

1. **Confiabilidad**: evitar estados parciales, duplicaciones y errores por incompatibilidades de *driver*.
2. **Trazabilidad**: consolidar historia de cambios y causales.
3. **Consistencia**: misma semántica de estados, totales y payloads en todo el servicio.
4. **Rendimiento**: reducir *roundtrips* y apoyar consultas analíticas con índices adecuados.

---

## 3) Cambios clave introducidos por v2 (beneficios)

* **Atomicidad y auditoría**: se compone un único `finalUpdatePayload` (`$set` + `$push`) y se aplica en una sola llamada; además, se agregan entradas de `history` con `changeDescriptions`.
* **Decisiones sobre estado antes de escribir**: v2 calcula un **estado futuro** (mezcla de `originalOrder` + `update`) para decidir si auto-finaliza líneas y/o procesa comisiones.
* **Menos *roundtrips***: al evitar múltiples `updateOne` por línea/comisión, la transacción se simplifica y reduce contención.

> Con todo, v2 **no** re-lee el documento tras confirmar la transacción. Esto es aceptable si no hay modificaciones adicionales del lado del servidor (triggers), pero conviene formalizar la estrategia (ver §6.2).

---

## 4) Correcciones prioritarias (bugs)

### 4.1 `findOneAndUpdate` debe usar `.value`

El *driver* de MongoDB devuelve un **wrapper** `ModifyResult<T>`; el documento actualizado está en `result.value`. Afecta a:

* `addVoucher`
* `updatePaymentMethod`
* `updateShippingMethod`

**Patch**:

```ts
const { value } = await paymentMethods.findOneAndUpdate(
  { _id: new ObjectId(id) },
  { $set: updateData },
  { returnDocument: 'after' }
);
if (!value) return { success: false, message: 'No encontrado' };
return { success: true, message: 'Actualizado', result: value };
```

---

### 4.2 Doble conteo en clientes recurrentes

En `getCustomerAnalytics`, el branch `else` suma 2 veces al contador de **recurrentes** si hubo ventas en el período.

**Patch (contar sólo si compró en el período)**:

```ts
const salesInPeriod = group.orders
  .filter((o: any) => o.createdOn >= startDate && o.createdOn <= endDate)
  .reduce((sum: number, o: any) => sum + o.total, 0);

if (salesInPeriod > 0) {
  analytics.returningCustomers.count += 1;
  analytics.returningCustomers.totalSales += salesInPeriod;
}
```

> Alternativa: si quiere **contar** todo cliente recurrente detectado aunque no haya comprado en el período, incremente siempre `count` y sume `totalSales` sólo si `salesInPeriod > 0`.

---

### 4.3 Filtro de `readAllOrders` por último estado

El criterio actual `{'status.name': { $ne: 'Anulado' }}` no corresponde al modelo (el estado es un arreglo de tuplas `[OrderStatus, Date]`). Se debe evaluar el **último** estado.

**Patch (ejemplo con `$expr`)**:

```ts
const orders = await order.find({
  createdOn: { $gte: fiveMonthsAgo },
  $expr: {
    $ne: [
      { $toString: { $arrayElemAt: [{ $arrayElemAt: ['$status', -1] }, 0] } },
      String(OrderStatus.Canceled) // Ajustar al valor real del enum
    ]
  }
}).sort({ createdOn: -1 }).toArray();
```

---

### 4.4 Validación de `ObjectId`

Algunas funciones llaman `new ObjectId(id)` sin validar. Si `id` es inválido, lanza excepción.

**Patch**:

```ts
if (!ObjectId.isValid(id)) {
  return { success: false, message: 'ID inválido.' };
}
```

---

### 4.5 Duplicación de entradas de historial al procesar comisiones (v2)

En v2, la entrada de historial "Las comisiones…" se agrega **dentro** del bucle por línea, generando duplicados. Muévala **fuera** del bucle y agréguela sólo si se procesó al menos una comisión.

**Patch**:

```ts
let processedAnyCommission = false;
// dentro del bucle, cuando realmente insertas un movimiento e incrementas saldo:
processedAnyCommission = true;

// fuera del bucle
if (processedAnyCommission) {
  finalUpdatePayload.$set.commissionsProcessed = true;
  historyEntriesToAdd.push({
    timestamp: new Date(),
    user: adminUsername,
    description: 'Las comisiones de la orden han sido procesadas y liquidadas.',
  });
}
```

---

### 4.6 Envío de correo con documento desactualizado

`createOrder` envía correo con `{ ...order, _id }` en lugar de la **versión insertada** (que incluye `validatedLines`, `totalUnits`, `history`, etc.). Envíe lo **insertado** o el documento re-leído.

**Patch**:

```ts
const insertedDoc = {
  ...order,
  consumerDetails: { ...order.consumerDetails, basic: { ...order.consumerDetails?.basic, id: clientId?.toString() } },
  lines: validatedLines,
  totalUnits,
  history: [{ timestamp: createdAt, user: order.seller || order.createdBy, description: 'Pedido creado.' }],
  createdOn: createdAt,
  _id: insertedId,
};

await sendEmail(insertedDoc);
```

---

## 5) Mejoras de diseño y consistencia

### 5.1 Relectura tras `commit`

* **Problema**: v2 devuelve `{ ...originalOrder, ...$set }` sin re-leer. Si otro proceso (o el propio *driver* con operadores como `$currentDate`) modifica el doc, la respuesta al cliente no reflejará el estado en BD.
* **Recomendación**: tras `commit`, re-leer el documento **sólo** cuando sea necesario (por ejemplo, si el *payload* contiene campos derivados o si la API promete “estado actual”).

```ts
await session.commitTransaction();
const final = await orders.findOne({ _id: orderObjectId });
return { success: true, result: final, message: 'Orden actualizada exitosamente.' };
```

### 5.2 Política de acoplamiento **estado global ↔ líneas**

* **Auto-finalización** de líneas cuando el estado global ∈ {`ReadyToShip`, `Delivered`, `Finished`} es útil, pero defina:

  * ¿Qué ocurre si el estado **retrocede** (devoluciones/reaperturas)?
  * Idempotencia: no volver a añadir `Finished` si ya existe un evento igual más reciente.
* **Sugerencia**: encapsular en un *helper* que reciba el `futureOrderState` y devuelva líneas actualizadas **sólo cuando aplique**.

### 5.3 Fuente de verdad para cálculos monetarios

* **Comisiones**: v2 usa `pricePerUnit * quantity`. Si existe `lines.subtotal` (post-descuentos o impuestos), **aclare** cuál es la fuente oficial. Recomendación: usar `lines.subtotal` para reflejar exactamente lo cobrado por línea.

### 5.4 Consistencia en colecciones y *lookups*

* En `getPrixerPerformance` se usa `from: 'users'`. Verifique que la colección real sea `users` y no `user`.

### 5.5 Normalización de imágenes (mockups)

* En `getProductPerformance` se maneja `mockUp` objeto o cadena, con *fallback* a `thumbUrl`. Reutilice la misma lógica en `getGlobalTopPerformingItems` para consistencia visual.

### 5.6 Constantes y *helpers*

* Extraer constantes como `DEFAULT_ART_COMMISSION = 0.10` y *helpers* para:

  * Obtener **último estado** global.
  * Normalizar `mockUp` (`string | { mockupImg: string }`).
  * *Type guards* (p. ej., art con `_id`).

### 5.7 Timestamps coherentes

* Definir un `const createdAt = new Date()` y usarlo tanto en `history.timestamp` como en `createdOn` para que coincidan en `createOrder`.

### 5.8 Índices recomendados

Para mejorar *dashboards* y lecturas frecuentes:

```js
// Fechas y ordenación
DB.order.createIndex({ createdOn: -1 });

// Búsquedas por email de cliente
DB.order.createIndex({ 'consumerDetails.basic.email': 1 });

// Rendimiento por vendedor
DB.order.createIndex({ seller: 1, createdOn: -1 });

// Movimientos por destinatario
DB.movements.createIndex({ destinatary: 1, createdOn: -1 });
```

> Use el *namespace* real (`db`) y agregue *partial indexes* si aplican (p. ej., `commissionsProcessed: false`).

### 5.9 *Shape* de los retornos

* Devolver únicamente el **documento** actualizado/insertado (no *wrappers* del *driver*), y homogenizar la forma `{ success, message, result }` en toda la API.

---

## 6) Parches concretos propuestos

### 6.1 `getCustomerAnalytics` (evitar doble conteo)

```ts
// ... mismo pipeline
const customerGroups = await orders.aggregate(pipeline).toArray();
const analytics: CustomerAnalyticsData = {
  newCustomers: { count: 0, totalSales: 0 },
  returningCustomers: { count: 0, totalSales: 0 },
};

customerGroups.forEach((group) => {
  if (group.isNew) {
    analytics.newCustomers.count += 1;
    analytics.newCustomers.totalSales += group.orders.reduce(
      (sum: number, o: any) => sum + o.total, 0
    );
  } else {
    const salesInPeriod = group.orders
      .filter((o: any) => o.createdOn >= startDate && o.createdOn <= endDate)
      .reduce((sum: number, o: any) => sum + o.total, 0);

    // Sólo contar recurrentes que compraron en el período
    if (salesInPeriod > 0) {
      analytics.returningCustomers.count += 1;
      analytics.returningCustomers.totalSales += salesInPeriod;
    }
  }
});
```

### 6.2 `readAllOrders` (filtrar por último estado)

```ts
const fiveMonthsAgo = new Date();
fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

const orders = await order
  .find({
    createdOn: { $gte: fiveMonthsAgo },
    $expr: {
      $ne: [
        { $toString: { $arrayElemAt: [{ $arrayElemAt: ['$status', -1] }, 0] } },
        String(OrderStatus.Canceled)
      ]
    },
  })
  .sort({ createdOn: -1 })
  .toArray();
```

### 6.3 Validación de `ObjectId`

```ts
export const readOrderById = async (id: string): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) return { success: false, message: 'ID inválido' };
    const orders = orderCollection();
    const order = await orders.findOne({ _id: new ObjectId(id) });
    return order ? { success: true, message: 'Orden encontrada.', result: order }
                 : { success: false, message: 'Orden no encontrada.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};
```

### 6.4 `addVoucher` / `updatePaymentMethod` / `updateShippingMethod` (usar `.value`)

```ts
const res = await paymentMethods.findOneAndUpdate(
  { _id: new ObjectId(id) },
  { $set: updateData },
  { returnDocument: 'after' }
);
if (!res.value) return { success: false, message: 'No encontrado' };
return { success: true, message: 'Actualizado', result: res.value };
```

### 6.5 `createOrder` (payload de email consistente)

```ts
const createdAt = new Date();
const docToInsert = {
  ...order,
  consumerDetails: {
    ...order.consumerDetails,
    basic: { ...order.consumerDetails?.basic, id: clientId?.toString() },
  },
  lines: validatedLines,
  totalUnits,
  history: [{ timestamp: createdAt, user: order.seller || order.createdBy, description: 'Pedido creado.' }],
  createdOn: createdAt,
};
const { acknowledged, insertedId } = await orders.insertOne(docToInsert);
if (!acknowledged) return { success: false, message: 'No se pudo crear la orden.' };

const insertedDoc = { ...docToInsert, _id: insertedId };
void sendEmail(insertedDoc); // no bloquear el flujo principal
return { success: true, message: 'Orden creada con éxito.', result: insertedDoc };
```

### 6.6 `updateOrderAndProcessCommissions` (unificar historia de comisiones)

```ts
let processedAnyCommission = false;
for (const line of futureOrderState.lines) {
  // ... validaciones y cálculos
  if (paymentAmount > 0 && prixerUser?.account) {
    await movements.insertOne(commissionMovement, { session });
    await accounts.updateOne(
      { _id: prixerUser.account },
      { $inc: { balance: commissionMovement.value } },
      { session }
    );
    processedAnyCommission = true;
  }
}

if (processedAnyCommission) {
  finalUpdatePayload.$set.commissionsProcessed = true;
  historyEntriesToAdd.push({
    timestamp: new Date(),
    user: adminUsername,
    description: 'Las comisiones de la orden han sido procesadas y liquidadas.',
  });
}
```

### 6.7 Helper para obtener el último estado global

```ts
function getLatestGlobalStatus(order: Order): OrderStatus | undefined {
  const last = order.status?.[order.status.length - 1];
  return last?.[0];
}
```

### 6.8 Normalización de mockups

```ts
function resolveProductImage(p: any): string | undefined {
  const mu = p?.mockUp;
  if (!mu) return p?.thumbUrl;
  if (typeof mu === 'string') return mu;
  if (typeof mu === 'object' && 'mockupImg' in mu) return mu.mockupImg;
  return p?.thumbUrl;
}
```

### 6.9 Constante de comisión por defecto

```ts
const DEFAULT_ART_COMMISSION = 0.10; // 10%
```

---

## 7) Pruebas recomendadas

### 7.1 Unit tests

* **Helpers**: `getLatestGlobalStatus`, `resolveProductImage`.
* **Cómputo de comisiones**: con comisión específica válida, inválida y sin comisión (usa `DEFAULT_ART_COMMISSION`).
* **Analytics**: `getCustomerAnalytics` (nuevo vs recurrente; con/sin compras en el período).

### 7.2 Integration tests

* `createOrder` inserta líneas validadas, `totalUnits`, `history`, y dispara correo (mock).
* `updateOrderAndProcessCommissions`:

  * Auto-finaliza líneas cuando aplica.
  * Inserta movimientos y actualiza cuentas en la **misma transacción**.
  * Marca `commissionsProcessed` una sola vez y agrega **una** entrada en historia.

### 7.3 E2E / contratos

* Serialización de `OrderStatus`/`GlobalPaymentStatus` en API.
* Búsquedas por email y rangos de fecha retornan ordenadas por `createdOn` desc.

---

## 8) Observabilidad y logging

* **Logs estructurados** (JSON) con `orderId`, `adminUsername`, `transitionFrom → transitionTo`, `commissionValue`.
* **Niveles**: `info` para transiciones válidas; `warn` para líneas saltadas; `error` para abortos de transacción.
* **Métricas**: contadores de órdenes finalizadas, comisiones procesadas, *latency* de transacciones, fallos de email.

---

## 9) Checklist de despliegue

* [ ] Crear índices propuestos (con nombre explícito y *background* si aplica).
* [ ] Revisar *lookups* (`from: 'users'`).
* [ ] Ejecutar migración opcional para normalizar `mockUp` si hay heterogeneidad.
* [ ] Activar *feature flags* si desea habilitar auto-finalización de líneas gradualmente.

---

## 10) Hoja de ruta (prioridades)

* **P0 (bugs)**: `.value` en `findOneAndUpdate`, doble conteo recurrentes, filtro de último estado, validación `ObjectId`, historial de comisiones único, email con payload insertado.
* **P1 (diseño)**: relectura post-commit cuando haga falta; fuente de verdad para comisiones; normalización de imágenes; constantes y helpers.
* **P2 (perf/ops)**: índices, logs estructurados, métricas.

---

## 11) Apéndice A – Utilidades sugeridas

```ts
export function latestTuple<T>(arr?: [T, Date][]): [T, Date] | undefined {
  return arr && arr.length ? arr[arr.length - 1] : undefined;
}

export function safeObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function toFixed2(n: number): number {
  return parseFloat(n.toFixed(2));
}
```

---

**Conclusión**: La **v2** es un paso claro hacia un servicio más sólido. Aplicando los parches de este documento y formalizando las políticas de estado/monetario, el módulo ganará en confiabilidad, auditabilidad y rendimiento, reduciendo riesgos de datos inconsistentes y simplificando el mantenimiento futuro.
