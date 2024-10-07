const Order = require("./orderModel")
const Consumer = require("../consumer/consumerModel")
const PaymentMethod = require("./paymentMethodModel")
const ShippingMethod = require("./shippingMethodModel")
const OrderPayment = require("./orderPaymentModel")
const dotenv = require("dotenv")
dotenv.config()
const emailSender = require("../utils/emailSender")
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Order
const createOrder = async (orderData) => {
  try {
    const newOrder = await new Order(orderData).save()
    return {
      res: { success: true, orderId: newOrder.orderId },
      newOrder: newOrder,
    }
  } catch (e) {
    console.log(e)
    return "Incapaz de crear la orden, intenta de nuevo o consulta a soporte."
  }
}

const sendEmail = async (orderData) => {
  try {
    const templates = {
      newOrder: "d-68b028bb495347059d343137d2517857",
    }
    const destination = orderData.basicData.email
    const message = {
      to: destination,
      from: {
        email: "prixers@prixelart.com",
        name: "Prixelart",
      },
      templateId: "d-68b028bb495347059d343137d2517857",
      dynamic_template_data: {
        name: orderData.basicData.name + " " + orderData.basicData.lastname,
        lastname: orderData.basicData.lastname,
        basicData: orderData.basicData,
        shippingData: orderData.shippingData,
        billingData: orderData.billingData,
        requests: orderData.requests,
        subtotal: Number(orderData.subtotal).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        tax: Number(orderData.tax).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        shippingCost: Number(orderData.shippingCost).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        orderId: orderData.orderId,
        total: Number(orderData.total).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        observations: orderData.observations,
      },
    }
    return emailSender.sendEmail(message)
  } catch (e) {
    return { error: e, success: false }
  }
}

const readOrderById = async (Id) => {
  try {
    let order = await Order.findOne({ orderId: Id })
      .select("-_id -billingData -paymentVoucher -observations -createdBy")
      .exec()
    return order
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

const readOrderByShred = async (Id) => {
  try {
    const orders = await Order.find({ orderId: { $regex: Id, $options: "i" } })
    if (orders.length > 0) {
      return { orders: orders, message: "Pedidos encontrados", success: true }
    } else {
      return {
        orders: null,
        message:
          "No se encontraron pedidos con este criterio, inténtalo de nuevo",
        success: false,
      }
    }
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

const readOrderByUsername = async (username) => {
  return await Order.findOne({ username: username }).exec()
}

const readAllOrders = async () => {
  const currentDate = new Date()
  const fiveMonthsAgo = new Date()
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 5)
  let readedOrder = await Order.find({
    status: { $ne: "Anulado" },
    createdOn: { $gte: fiveMonthsAgo },
  })
    .select("-_id")
    .sort({ createdOn: -1 })
    .exec()

  if (readedOrder) {
    const data = {
      info: "Todas las órdenes disponibles",
      orders: readedOrder,
    }

    return data
  } else {
    const data = {
      info: "No hay órdenes registradas",
      orders: null,
    }
    return data
  }
}

const readAllOrdersv2 = async (start, quantity, filters) => {
  const filterExist = Object.values(filters).some(
    (value) => value !== undefined
  )

  const currentDate = new Date()
  const fiveMonthsAgo = new Date()
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 5)

  let query = {
    status: { $ne: "Anulado" },
    createdOn: { $gte: fiveMonthsAgo },
  }

  if (filters.creationDate) {
    query.createdOn = { ...query.createdOn, $eq: filters.creationDate }
  }
  if (filters.shippingDate) {
    query.shippingDate = filters.shippingDate
  }
  if (filters.client) {
    const nameParts = filters.client.split(" ");
    
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[1];
  
      query.$and = [
        { "basicData.name": { $regex: new RegExp(firstName, "i") } },
        { "basicData.lastname": { $regex: new RegExp(lastName, "i") } },
      ];
    } else {
      query.$or = [
        { "basicData.name": { $regex: new RegExp(nameParts[0], "i") } },
        { "basicData.lastname": { $regex: new RegExp(nameParts[0], "i") } },
      ];
    }
  }
  if (filters.payStatus) {
    if (filters.payStatus === "Pendiente") {
      query.$or = [
        { payStatus: filters.payStatus },
        { payStatus: { $exists: false } },
      ]
    } else {
      query.payStatus = filters.payStatus
    }
  }
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.seller) {
    query["createdBy.username"] = filters.seller
  }

  let readedOrder = await Order.find(query)
    .select("-_id")
    .sort({ createdOn: -1 })
    .skip(Number(start))
    .limit(Number(quantity))
    .exec()

  const totalCount = await Order.countDocuments({
    status: { $ne: "Anulado" },
    createdOn: { $gte: fiveMonthsAgo },
  })

  if (readedOrder) {
    const data = {
      info: "Todas las órdenes disponibles",
      orders: readedOrder,
      length: totalCount,
      aboutFilters: filterExist,
    }

    return data
  } else {
    const data = {
      info: "No hay órdenes registradas",
      orders: null,
    }
    return data
  }
}

const readAllOrdersClients = async () => {
  const currentDate = new Date()
  const fiveMonthsAgo = new Date()
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 5)
  let readedOrder = await Order.find({
    status: { $ne: "Anulado" },
    createdOn: { $gte: fiveMonthsAgo },
  })
    .select("-_id")
    .exec()

  let c = []
  readedOrder.map((order) => {
    let fullname =
      (order.basicData?.firstname || order.basicData?.name) +
      " " +
      order.basicData?.lastname

    if (c.includes(fullname)) {
      return
    } else {
      c.push(fullname)
    }
  })

  c.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  if (c.length > 0) {
    const data = {
      info: "Todos las clientes disponibles",
      clients: c,
    }

    return data
  } else {
    const data = {
      info: "No se encontraron clientes",
      orders: null,
    }
    return data
  }

}

const readOrdersByPrixer = async (prixer) => {
  let orders = await Order.find({ status: "Completada" })
  let readedOrders = []
  orders.map((order) => {
    order.requests?.map((item) => {
      // const isPrixer = await order.basicData.

      if (item.art.prixerUsername === prixer) {
        readedOrders.push(order)
      }
    })
  })
  if (readedOrders) {
    const data = {
      info: "Las órdenes disponibles",
      orders: readedOrders,
    }
    return data
  } else {
    const data = {
      info: "No hay órdenes registradas",
      orders: null,
    }
    return data
  }
}

const readOrdersByEmail = async (data) => {
  let orders = await Order.find({})
  let consumer = await Consumer.find({ prixerId: data.prixerId })
  let filteredOrders = orders.filter(
    (order) => order.basicData && order.basicData.email === data.email
  )
  if (filteredOrders.length > 0) {
    const data = { info: "Las órdenes disponibles", orders: filteredOrders }
    return data
  } else {
    const data = {
      info: "No hay órdenes registradas.",
      orders: [],
    }
    return data
  }
}
const addVoucher = async (id, paymentVoucher) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id })
    toUpdateOrder.paymentVoucher = paymentVoucher
    const updatedOrder = await toUpdateOrder.save()
    if (!updatedOrder) {
      return console.log("Order update error: " + err)
    }

    return updatedOrder
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message: e + "Disculpa. No se pudo agregar el comprobante a esta orden.",
    }
  }
}

const updateOrder = async (id, status) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id })
    toUpdateOrder.status = status
    if (status === "Concretado") {
      toUpdateOrder.completionDate = new Date()
    }
    const updatedOrder = await toUpdateOrder.save()

    if (!updatedOrder) {
      return console.log("Order update error: " + err)
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      }
      return updated
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    }
  }
}

const updateOrderPayStatus = async (id, payStatus) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id })
    toUpdateOrder.payStatus = payStatus
    if (payStatus === "Pagado") {
      toUpdateOrder.payDate = new Date()
    }
    const updatedOrder = await toUpdateOrder.save()

    if (!updatedOrder) {
      return console.log("Order update error: " + err)
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      }
      return updated
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    }
  }
}

const updateSeller = async (id, seller) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id })
    toUpdateOrder.createdBy = seller
    const updatedOrder = await toUpdateOrder.save()

    if (!updatedOrder) {
      return console.log("Order update error: " + err)
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      }
      return updated
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    }
  }
}

const updateItemStatus = async (newStatus, index, order) => {
  try {
    const filter = { orderId: order }
    const update = {
      $set: { [`requests.${index}.product.status`]: newStatus },
    }

    const updatedOrder = await Order.findOneAndUpdate(filter, update, {
      new: true,
    })

    if (!updatedOrder) {
      console.log("Order update error: Failed to update the order")
      return
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      }
      return updated
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    }
  }
}

const addComissions = async (id, comissions) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id })
    delete comissions.adminToken
    if (!toUpdateOrder.comissions) {
      toUpdateOrder.comissions = []
    }
    toUpdateOrder?.comissions.push(comissions)
    const updatedOrder = await toUpdateOrder.save()

    if (!updatedOrder) {
      return console.log("Order update error: " + err)
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      }
      return updated
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    }
  }
}

const deleteOrder = async (orderId) => {
  try {
    await Order.findOneAndDelete({ orderId: orderId })
    return "Orden eliminada exitosamente"
  } catch (error) {
    console.log(error)
    return error
  }
}

//Payment Methods
const createPaymentMethod = async (paymentMethodData) => {
  try {
    const readedPaymentMethodById = await readPaymentMethodById(
      paymentMethodData.id
    )
    const readedPaymentMethodByName = await readPaymentMethodByName(
      paymentMethodData.name
    )

    if (readedPaymentMethodByName || readedPaymentMethodById) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, esta forma de pago ya está registrada.",
      }
    }

    let newPaymentMethod = await new PaymentMethod(paymentMethodData).save()
    return {
      res: { success: true, paymentMethodId: newPaymentMethod._id },
      newPaymentMethod: newPaymentMethod,
    }
  } catch (e) {
    return "Incapaz de crear método de pago, intenta de nuevo o consulta a soporte."
  }
}

const readPaymentMethodById = async (id) => {
  return await PaymentMethod.findOne({ _id: id }).exec()
}
const readPaymentMethodByName = async (name) => {
  return await PaymentMethod.findOne({ name: name }).exec()
}

const readAllPaymentMethods = async (active) => {
  if (active) {
    let readedPaymentMethods = await PaymentMethod.find({
      active: true,
    }).exec()
    return readedPaymentMethods
  } else {
    let readedPaymentMethods = await PaymentMethod.find({}).exec()
    return readedPaymentMethods
  }
}

const updatePaymentMethod = async (paymentMethodData) => {
  try {
    // const readedPaymentMethodByName = await readPaymentMethodByName(
    //   paymentMethodData.name
    // );
    // if (readedPaymentMethodByName) {
    //   return {
    //     success: false,
    //     info: "error_email",
    //     message: "Disculpa, el nombre en la forma de pago ya está registrado.",
    //   };
    // }
    const toUpdatePaymentMethod = await readPaymentMethodById(
      paymentMethodData.id
    )
    await toUpdatePaymentMethod.set(paymentMethodData)
    const updatedPaymentMethod = await toUpdatePaymentMethod.save()
    if (!updatedPaymentMethod) {
      return console.log("Payment method update error: " + err)
    }

    return updatedPaymentMethod
  } catch (e) {
    return {
      success: false,
      message:
        "Disculpa. No se pudo actualizar esta forma de pago, inténtalo de nuevo por favor.",
    }
  }
}

const deletePaymentMethod = async (paymentMethodId) => {
  try {
    await PaymentMethod.findOneAndDelete({ _id: paymentMethodId })
    return "Método de pago eliminado exitosamente"
  } catch (error) {
    console.log(error)
    return error
  }
}

//Shipping method

const createShippingMethod = async (shippingMethodData) => {
  try {
    // const readedShippingMethodById = await readShippingById(
    //   shippingMethodData.id
    // );
    // const readedShippingMethodByName = await readShippingByName(
    //   shippingMethodData.name
    // );
    // if (readedShippingMethodById || readedShippingMethodByName) {
    //   return {
    //     success: false,
    //     info: "error_email",
    //     message: "Disculpa, esta forma de envío ya está registrada.",
    //   };
    // }
    let newShippingMethod = await new ShippingMethod(shippingMethodData).save()
    return {
      res: { success: true, shippingMethodId: newShippingMethod._id },
      newShippingMethod: newShippingMethod,
    }
  } catch (e) {
    console.log(e)
    return "Incapaz de crear forma de envío, intenta de nuevo o consulta a soporte."
  }
}

const readShippingMethodById = async (id) => {
  return await ShippingMethod.findOne({ _id: id }).exec()
}

const readAllShippingMethod = async (active) => {
  if (active) {
    let readedShippingMethods = await ShippingMethod.find({
      active: true,
    }).exec()
    return readedShippingMethods
  } else {
    let readedShippingMethods = await ShippingMethod.find({}).exec()
    if (readedShippingMethods) {
      const data = {
        info: "Todos los métodos de envío disponibles",
        shippingMethods: readedShippingMethods,
      }
      return data
    } else {
      const data = {
        info: "No hay métodos de envío disponibles",
        shippingMethods: null,
      }
      return data
    }
  }
}

const updateShippingMethod = async (shippingMethodData) => {
  try {
    const toUpdateShippingMethod = await readShippingMethodById(
      shippingMethodData.id
    )
    await toUpdateShippingMethod.set(shippingMethodData)
    const updatedShippingMethod = await toUpdateShippingMethod.save()
    if (!updatedShippingMethod) {
      return console.log("Shipping method update error" + err)
    }
    return updatedShippingMethod
  } catch (e) {
    return {
      success: false,
      message:
        "Disculpa. No se pudo actualizar esta forma de envío, inténtalo de nuevo.",
    }
  }
}

const deleteShippingMethod = async (shippingMethodId) => {
  try {
    console.log(shippingMethodId)

    await ShippingMethod.findOneAndDelete({ _id: shippingMethodId })
    return "Método de envío eliminado exitosamente"
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = {
  createOrder,
  addVoucher,
  sendEmail,
  readOrderById,
  readOrderByShred,
  readOrderByUsername,
  readAllOrders,
  readAllOrdersv2,
  readAllOrdersClients,
  readOrdersByPrixer,
  readOrdersByEmail,
  updateOrder,
  updateOrderPayStatus,
  updateSeller,
  updateItemStatus,
  addComissions,
  deleteOrder,
  createPaymentMethod,
  readPaymentMethodById,
  readAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  createShippingMethod,
  readAllShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
}
