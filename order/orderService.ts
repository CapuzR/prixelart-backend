import { Order, OrderLine, OrderStatus, PaymentMethod, ShippingMethod } from "./orderModel.ts";
import { sendEmail as sendEmailUtil } from "../utils/emailSender.ts";
import sgMail from "@sendgrid/mail";
import { Collection, FindOneAndUpdateOptions, ObjectId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";
import { User } from "../user/userModel.ts";
import { readByUsername } from "../prixer/prixerServices.ts";
import { getVariantPrice } from "../product/productServices.ts";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Order Service

function orderCollection(): Collection<Order> {
  return getDb().collection<Order>("order");
}
function paymentMethodCollection(): Collection<PaymentMethod> {
  return getDb().collection<PaymentMethod>("paymentMethod");
}

function shippingMethodCollection(): Collection<ShippingMethod> {
  return getDb().collection<ShippingMethod>("shippingMethod");
}

export const createOrder = async (order: Order, isPrixer?: boolean, prixerUsername?: string): Promise<PrixResponse> => {
  try {
    // 1) If this is a Prixer order, verify the user exists

    let prixerUser: User | null = null;
    if (isPrixer) {
      if (!prixerUsername) {
        return { success: false, message: 'Se requiere un nombre de usuario Prixer.' };
      }
      const prixerResp = await readByUsername(prixerUsername);
      if (!prixerResp.success || !prixerResp.result) {
        return { success: false, message: 'Usuario Prixer no encontrado.' };
      }
      prixerUser = prixerResp.result as User;
    }

    // 2) Validate & correct each line
    const validatedLines: OrderLine[] = await Promise.all(
      order.lines.map(async (line) => {
        // 1) productId from the product object
        const productId = line.item.product._id!.toString();

        // 2) find the variant whose attributes match your selection[]
        const sel = line.item.product.selection ?? [];
        const variant = line.item.product.variants?.find((v) =>
          v.attributes.length === sel.length &&
          v.attributes.every(attr =>
            sel.some(s => s.name === attr.name && s.value === attr.value)
          )
        );
        if (!variant || !variant._id) {
          throw new Error(
            `No pude resolver variante para el producto ${productId} usando la selección ${JSON.stringify(sel)}`
          );
        }
        const variantId = variant._id;

        // 3) fetch the latest price
        const priceResp = await getVariantPrice(
          variantId,
          productId,
          prixerUser,
          isPrixer
        );
        if (!priceResp.success || !Array.isArray(priceResp.result)) {
          throw new Error(
            `Error al obtener precio para ${productId}/${variantId}: ${priceResp.message}`
          );
        }
        const [, finalPrice] = priceResp.result;

        // 4) overwrite pricePerUnit & recalc subtotal
        line.pricePerUnit = Number(finalPrice);
        line.discount = 0; // or your 10% logic
        line.subtotal = parseFloat(
          (line.quantity * Number(finalPrice) - (line.discount ?? 0)).toFixed(2)
        );

        // 5) set initial status
        line.status = [[OrderStatus.Pending, new Date()]];

        return line;
      })
    );

    // 3) (Optional) Recalculate order totals
    const totalUnits = validatedLines.reduce((sum, l) => sum + l.quantity, 0);
    const subTotal = parseFloat(
      validatedLines
        .reduce((sum, l) => sum + l.subtotal, 0)
        .toFixed(2)
    );

    // 4) Insert into MongoDB
    const orders = orderCollection();
    const { acknowledged, insertedId } = await orders.insertOne({
      ...order,
      lines: validatedLines,
      totalUnits,
      subTotal,
      createdOn: new Date(),
    });

    if (!acknowledged) {
      return { success: false, message: 'No se pudo crear la orden.' };
    }

    return {
      success: true,
      message: 'Orden creada con éxito.',
      result: { ...order, _id: insertedId },
    };
  } catch (e: any) {
    console.error('createOrder error:', e);
    return {
      success: false,
      message: `Error al crear la orden: ${e.message || e}`,
    };
  }
};

export const sendEmail = async (orderData: any): Promise<PrixResponse> => {
  try {
    const msg = {
      to: orderData.basicData.email,
      from: { email: "prixers@prixelart.com", name: "Prixelart" },
      templateId: "d-68b028bb495347059d343137d2517857",
      dynamic_template_data: { ...orderData },
    };
    const res = await sendEmailUtil(msg);
    return { ...res, message: "Correo enviado exitosamente." };
  } catch (e) {
    return { success: false, message: "Error enviando correo." };
  }
};

export const readOrderById = async (id: string): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const order = await orders.findOne({ _id: new ObjectId(id) });
    return order
      ? { success: true, message: "Orden encontrada.", result: order }
      : { success: false, message: "Orden no encontrada." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readAllOrders = async (): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const fiveMonthsAgo = new Date(); fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    const orders = await order.find({ "status.name": { $ne: "Anulado" }, createdOn: { $gte: fiveMonthsAgo } })
      .sort({ createdOn: -1 }).toArray();
    return orders.length
      ? { success: true, message: "Todas las órdenes disponibles.", result: orders }
      : { success: false, message: "No hay órdenes registradas." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readOrdersByEmail = async (data: { prixerId: string; email: string; }): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const orders = await order.find({ "consumerDetails.basic.email": data.email }).toArray();
    return orders.length
      ? { success: true, message: "Órdenes encontradas", result: orders }
      : { success: false, message: "No hay órdenes registradas." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const addVoucher = async (id: string, voucherUrl: string): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const updatedOrder = await order.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { "payment.method.voucher": voucherUrl } },
      { returnDocument: "after" },
    );
    return updatedOrder
      ? { success: true, message: "Comprobante agregado.", result: updatedOrder }
      : { success: false, message: "Orden no encontrada." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const updateOrder = async (id: string, update: Partial<Order>): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const updatedOrder = await order.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return updatedOrder
      ? { success: true, message: "Órden actualizada con éxito", result: updatedOrder }
      : { success: false, message: "Orden no encontrada." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const deleteOrder = async (orderId: string): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const { deletedCount } = await order.deleteOne({ orderId });
    return deletedCount
      ? { success: true, message: "Orden eliminada exitosamente" }
      : { success: false, message: "Orden no encontrada" };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export interface TopPerformingItemData {
  id: string; // Product or Art ID
  name: string;
  quantity: number;
  revenue: number;
  imageUrl?: string;
}

export interface GlobalDashboardStatsData { // Renamed from SellerDashboardStatsData for clarity
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  unitsSold: number;
  orderStatusCounts: Record<string, number>;
}

export const readAllOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();

    const orders = await collection.find({
      createdOn: {
        $gte: startDate,
        $lte: endDate,
      }
    }).sort({ createdOn: -1 }).toArray();

    return {
      success: true,
      message: "All orders retrieved successfully.",
      result: orders as unknown as Order[]
    };
  } catch (e) {
    console.error("Error in readAllOrdersByDateRange:", e);
    return { success: false, message: `Error fetching all orders: ${e instanceof Error ? e.message : String(e)}` };
  }
};

/**
 * Reads orders for a specific seller within a given date range.
 */
export const calculateGlobalDashboardStats = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();
    // No seller filter in matchQuery for global stats
    const matchQuery = {
      createdOn: {
        $gte: startDate,
        $lte: endDate,
      }
    };

    const statsPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null, // Grouping all documents together
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          totalUnits: { $sum: "$totalUnits" }
        }
      },
      {
        $project: {
          _id: 0,
          totalSales: { $ifNull: ["$totalSales", 0] },
          totalOrders: { $ifNull: ["$totalOrders", 0] },
          totalUnits: { $ifNull: ["$totalUnits", 0] },
          averageOrderValue: {
            $cond: { if: { $gt: ["$totalOrders", 0] }, then: { $divide: ["$totalSales", "$totalOrders"] }, else: 0 }
          }
        }
      }
    ];
    const statsResult = await collection.aggregate(statsPipeline).toArray();
    const mainStats = statsResult[0] || { totalSales: 0, totalOrders: 0, totalUnits: 0, averageOrderValue: 0 };

    // For Order Status Counts, fetch all relevant orders and process
    const ordersForStatusCount = await collection.find(matchQuery).project({ lines: 1 }).toArray() as unknown as Pick<Order, 'lines'>[];
    const orderStatusCounts: Record<string, number> = {};

    Object.values(OrderStatus).filter(value => typeof value === 'string').forEach(statusName => {
      orderStatusCounts[statusName as string] = 0;
    });

    ordersForStatusCount.forEach(order => {
      (order.lines || []).forEach(line => {
        if (line.status && line.status.length > 0) {
          const latestStatusTuple = line.status[line.status.length - 1];
          const statusEnum = latestStatusTuple[0];
          const statusName = OrderStatus[statusEnum as OrderStatus];
          if (statusName) {
            orderStatusCounts[statusName] = (orderStatusCounts[statusName] || 0) + 1;
          }
        }
      });
    });

    const dashboardData: GlobalDashboardStatsData = {
      totalSales: mainStats.totalSales,
      totalOrders: mainStats.totalOrders,
      averageOrderValue: mainStats.averageOrderValue,
      unitsSold: mainStats.totalUnits,
      orderStatusCounts
    };

    return { success: true, message: "Global dashboard stats calculated.", result: dashboardData };

  } catch (e) {
    console.error("Error in calculateGlobalDashboardStats:", e);
    return { success: false, message: `Error calculating global stats: ${e instanceof Error ? e.message : String(e)}` };
  }
};

/**
 * Gets GLOBAL top performing items within a given date range.
 */
export const getGlobalTopPerformingItems = async (
  startDate: Date,
  endDate: Date,
  limit: number = 5
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();
    // No seller filter in the $match stage for global top items
    const pipeline = [
      {
        $match: {
          createdOn: {
            $gte: startDate,
            $lte: endDate,
          }
        }
      },
      { $unwind: "$lines" },
      { $match: { "lines.item.product._id": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$lines.item.product._id",
          name: { $first: "$lines.item.product.name" },
          imageUrl: { $first: "$lines.item.product.mockUp" },
          quantity: { $sum: "$lines.quantity" },
          revenue: { $sum: "$lines.subtotal" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: { $ifNull: ["$name", "Unknown Product"] },
          imageUrl: "$imageUrl",
          quantity: { $ifNull: ["$quantity", 0] },
          revenue: { $ifNull: ["$revenue", 0] },
        }
      }
    ];

    const topItems = await collection.aggregate(pipeline).toArray();

    return {
      success: true,
      message: "Global top performing items retrieved.",
      result: topItems as unknown as TopPerformingItemData[]
    };
  } catch (e) {
    console.error("Error in getGlobalTopPerformingItems:", e);
    return { success: false, message: `Error fetching global top items: ${e instanceof Error ? e.message : String(e)}` };
  }
};

// Payment Methods

export const createPaymentMethod = async (paymentMethodData: PaymentMethod): Promise<PrixResponse> => {
  try {
    const paymentMethods = paymentMethodCollection();
    const methodToInsert = {
      ...paymentMethodData,
      active: paymentMethodData.active !== undefined ? paymentMethodData.active : true,
      createdOn: new Date()
    };

    const { acknowledged, insertedId } = await paymentMethods.insertOne(methodToInsert);

    if (acknowledged) {
      return {
        success: true,
        message: "Método de pago creado con éxito.",
        result: { ...methodToInsert, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el método de pago." };
  } catch (e: any) {
    console.error("Error creating payment method:", e);
    return { success: false, message: `Error al crear método de pago: ${e.message || e}` };
  }
};

export const readPaymentMethodById = async (id: string): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const pm = await payment.findOne({ _id: new ObjectId(id) });
    return pm ? { success: true, message: "Método encontrado.", result: pm }
      : { success: false, message: "Método no encontrado." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readAllPaymentMethods = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const list = await payment.find().toArray();
    return list.length
      ? { success: true, message: "Métodos disponibles.", result: list }
      : { success: false, message: "No hay métodos registrados." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readAllActivePaymentMethods = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const filter = active ? { active: true } : {};
    const list = await payment.find(filter).toArray();
    return list.length
      ? { success: true, message: "Métodos disponibles.", result: list }
      : { success: false, message: "No hay métodos registrados." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const updatePaymentMethod = async (id: string, updateData: Partial<PaymentMethod>): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "ID de método de pago inválido." };
    }

    delete (updateData as any)._id;
    delete (updateData as any).createdOn;

    const paymentMethods = paymentMethodCollection();
    const options: FindOneAndUpdateOptions = {
      returnDocument: "after"
    };

    const result = await paymentMethods.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      options
    );

    return result
      ? { success: true, message: "Método de pago actualizado con éxito.", result: result }
      : { success: false, message: "Método de pago no encontrado para actualizar." };
  } catch (e: any) {
    console.error("Error updating payment method:", e);
    if (e.code === 11000 && updateData.name) {
      return { success: false, message: `Error: Ya existe otro método de pago con el nombre '${updateData.name}'.` };
    }
    return { success: false, message: `Error al actualizar el método de pago: ${e.message || e}` };
  }
};

export const deletePaymentMethod = async (id: string): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "ID de método de pago inválido." };
    }
    const paymentMethods = paymentMethodCollection();
    const { deletedCount } = await paymentMethods.deleteOne({ _id: new ObjectId(id) });

    return deletedCount && deletedCount > 0
      ? { success: true, message: "Método de pago eliminado exitosamente." }
      : { success: false, message: "Método de pago no encontrado o ya eliminado." };
  } catch (e: any) {
    console.error("Error deleting payment method:", e);
    return { success: false, message: `Error al eliminar el método de pago: ${e.message || e}` };
  }
};


// Shipping Methods

export const createShippingMethod = async (shippingMethodData: ShippingMethod): Promise<PrixResponse> => {
  try {
    const shippingMethods = shippingMethodCollection();
    const methodToInsert = {
      ...shippingMethodData,
      active: shippingMethodData.active !== undefined ? shippingMethodData.active : true,
      createdOn: new Date()
    };

    const { acknowledged, insertedId } = await shippingMethods.insertOne(methodToInsert);

    if (acknowledged) {
      return {
        success: true,
        message: "Método de envío creado con éxito.",
        result: { ...methodToInsert, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el método de envío." };
  } catch (e: any) {
    console.error("Error creating shipping method:", e);
    return { success: false, message: `Error al crear método de envío: ${e.message || e}` };
  }
};

export const readShippingMethodById = async (id: string): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const sm = await shipping.findOne({ _id: new ObjectId(id) });
    return sm ? { success: true, message: "Método encontrado.", result: sm }
      : { success: false, message: "Método no encontrado." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readAllShippingMethod = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const list = await shipping.find().toArray();
    return list.length
      ? { success: true, message: "Métodos disponibles.", result: list }
      : { success: false, message: "No hay métodos registrados." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const readAllActiveShippingMethod = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const filter = active ? { active: true } : {};
    const list = await shipping.find(filter).toArray();
    return list.length
      ? { success: true, message: "Métodos disponibles.", result: list }
      : { success: false, message: "No hay métodos registrados." };
  } catch (e) { return { success: false, message: `Error: ${e}` }; }
};

export const updateShippingMethod = async (id: string, updateData: Partial<ShippingMethod>): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "ID de método de envío inválido." };
    }

    delete (updateData as any)._id;
    delete (updateData as any).createdOn;

    const shippingMethods = shippingMethodCollection();
    const options: FindOneAndUpdateOptions = {
      returnDocument: "after"
    };

    const result = await shippingMethods.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      options
    );

    return result
      ? { success: true, message: "Método de envío actualizado con éxito.", result: result }
      : { success: false, message: "Método de envío no encontrado para actualizar." };
  } catch (e: any) {
    console.error("Error updating shipping method:", e);
    if (e.code === 11000 && updateData.name) {
      return { success: false, message: `Error: Ya existe otro método de envío con el nombre '${updateData.name}'.` };
    }
    return { success: false, message: `Error al actualizar el método de envío: ${e.message || e}` };
  }
};

export const deleteShippingMethod = async (id: string): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: "ID de método de envío inválido." };
    }
    const shippingMethods = shippingMethodCollection();
    const { deletedCount } = await shippingMethods.deleteOne({ _id: new ObjectId(id) });

    return deletedCount && deletedCount > 0
      ? { success: true, message: "Método de envío eliminado exitosamente." }
      : { success: false, message: "Método de envío no encontrado o ya eliminado." };
  } catch (e: any) {
    console.error("Error deleting shipping method:", e);
    return { success: false, message: `Error al eliminar el método de envío: ${e.message || e}` };
  }
};