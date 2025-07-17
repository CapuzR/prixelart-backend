import {
  MongoClient,
  Db,
  Collection,
  FindOneAndUpdateOptions,
  ObjectId,
} from "mongodb"
import {
  Order,
  OrderLine,
  OrderStatus,
  GlobalPaymentStatus,
  PaymentMethod,
  ShippingMethod,
} from "../order/orderModel.ts"
import { getDb } from "../mongo.ts"
import dotenv from 'dotenv';
dotenv.config(); 

// function orderCollection(): Collection<Order> {
//   return getDb().collection<Order>("order")
// }

const MONGODB_URI = process.env.MONGO_URI!

async function runMigration() {
  let client: MongoClient | undefined
  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("🟢 Conectado a MongoDB para la migración.")

    const db: Db = client.db('PrixelartV2'); 
    const orders: Collection<Order> = db.collection<Order>("order");
    const ordersToMigrate = await orders
      .find({
        $or: [
          { commissionsProcessed: { $exists: false } },
          { commissionsProcessed: undefined },
        ],
      })
      .toArray()

    console.log(`🟡 Encontradas ${ordersToMigrate.length} órdenes para migrar.`)

    let modifiedCount = 0
    let alreadyProcessedCount = 0

    for (const orderDoc of ordersToMigrate) {
      const currentOrderStatus =
        orderDoc.status?.[orderDoc.status.length - 1]?.[0]
      const currentPaymentStatus =
        orderDoc.payment?.status?.[orderDoc.payment.status.length - 1]?.[0]

      const shouldHaveCommissionsProcessed =
        currentOrderStatus === OrderStatus.Finished &&
        currentPaymentStatus === GlobalPaymentStatus.Paid

      const newCommissionsProcessedValue = shouldHaveCommissionsProcessed

      if (orderDoc.commissionsProcessed !== newCommissionsProcessedValue) {
        await orders.updateOne(
          { _id: orderDoc._id },
          { $set: { commissionsProcessed: newCommissionsProcessedValue } }
        )
        modifiedCount++
        console.log(
          `   ✅ Orden ${orderDoc._id || orderDoc.number} actualizada: commissionsProcessed = ${newCommissionsProcessedValue}`
        )
      } else {
        alreadyProcessedCount++
        console.log(
          `   ⏭️ Orden ${orderDoc._id || orderDoc.number} ya tiene el valor correcto. No se requiere actualización.`
        )
      }
    }

    console.log(
      `✅ Migración finalizada: ${modifiedCount} órdenes actualizadas, ${alreadyProcessedCount} órdenes ya estaban correctas.`
    )
  } catch (error) {
    console.error("🔴 Error durante la migración:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔵 Conexión a MongoDB cerrada.")
    }
  }
}

runMigration()
