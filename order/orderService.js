const Order = require("./orderModel");
const PaymentMethod = require("./paymentMethodModel");
const OrderPayment = require("./orderPaymentModel");
const dotenv = require("dotenv");
dotenv.config();
const emailSender = require("../utils/emailSender");

//Order
const createOrder = async (orderData) => {
  try {
    // const readedOrderByEmail = await readOrderByEmail(orderData);
    // const readedOrderByUsername = await readOrderByUsername(orderData.username);
    // if(readedOrderByUsername) {
    //     return {
    //         success: false,
    //         info: 'error_username',
    //         message: 'Disculpa, el nombre de usuario ya está registrado.'
    //     };
    // }

    // if(readedOrderByEmail){
    //     return {
    //         success: false,
    //         info: 'error_email',
    //         message: 'Disculpa, el correo del usuario ya está registrado.'
    //     };
    // }

    let newOrder = await new Order(orderData).save();

    const templates = {
      "order sent": "d-3e9eb5951e4b4aabb58bbc5bcc9acc40",
    };
    const message = {
      to: "iamwar2070@gmail.com",
      // dhenriquez@prixelart.com,
      // ventas.prixelart@gmail.com,
      // ventas2.prixelart@gmail.com
      from: {
        email: "prixers@prixelart.com",
        name: "Prixelart",
      },
      templateId: templates["order sent"],
      dynamic_template_data: {
        firstname: orderData.firstname,
        lastname: orderData.lastname,
        requests: orderData.requests,
        requestDate: orderData.createdOn,
        total: orderData.total,
        paymentMethod: orderData.orderPaymentMethod,
      },
    };
    return {
      res: { success: true },
      Order: newOrder,
      email: emailSender.sendEmail(message),
    };
  } catch (e) {
    console.log(e);
    return "Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.";
  }
};

const readOrderByEmail = async (orderData) => {
  return await Order.findOne({ email: orderData.email }).select("-_id").exec();
};
const readOrderByUsername = async (username) => {
  return await Order.findOne({ username: username }).exec();
};

const readAllOrders = async () => {
  let readedOrder = await Order.find({}).select("-_id").exec();
  let ordersv2 = readedOrder.sort(function (a, b) {
    if (a.createdOn < b.createdOn) {
      return 1;
    }
    if (a.createdOn > b.createdOn) {
      return -1;
    }
    return 0;
  });
  if (readedOrder) {
    const data = {
      info: "Todas las órdenes disponibles",
      orders: readedOrder,
    };

    return data;
  } else {
    const data = {
      info: "No hay órdenes registradas",
      orders: null,
    };
    return data;
  }
};

const updateOrder = async (id, status) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id });
    toUpdateOrder.status = status;
    const updatedOrder = await toUpdateOrder.save();
    if (!updatedOrder) {
      return console.log("Order update error: " + err);
    }

    return updatedOrder;
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.",
    };
  }
};

const deleteOrder = async (orderId) => {
  try {
    await Order.findOneAndDelete({ orderId: orderId });
    return "Orden eliminada exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

//Payment Methods
const createPaymentMethod = async (paymentMethodData) => {
  try {
    const readedPaymentMethodById = await readPaymentMethodById(
      paymentMethodData.id
    );
    const readedPaymentMethodByName = await readPaymentMethodByName(
      paymentMethodData.name
    );

    if (readedPaymentMethodByName) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, esta forma de pago ya está registrada.",
      };
    }

    if (readedPaymentMethodById) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, esta forma de pago ya está registrada.",
      };
    }
    let newPaymentMethod = await new PaymentMethod(paymentMethodData).save();
    return {
      res: { success: true, paymentMethodId: newPaymentMethod._id },
      newPaymentMethod: newPaymentMethod,
    };
  } catch (e) {
    return "Incapaz de crear método de pago, intenta de nuevo o consulta a soporte.";
  }
};

const readPaymentMethodById = async (id) => {
  return await PaymentMethod.findOne({ _id: id }).exec();
};
const readPaymentMethodByName = async (name) => {
  return await PaymentMethod.findOne({ name: name }).exec();
};

const readAllPaymentMethods = async (active) => {
  if (active) {
    let readedPaymentMethods = await PaymentMethod.find({
      active: true,
    }).exec();
    return readedPaymentMethods;
  } else {
    let readedPaymentMethods = await PaymentMethod.find({}).exec();
    return readedPaymentMethods;
  }
};

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
    );
    await toUpdatePaymentMethod.set(paymentMethodData);
    const updatedPaymentMethod = await toUpdatePaymentMethod.save();
    if (!updatedPaymentMethod) {
      return console.log("Order update error: " + err);
    }

    return updatedPaymentMethod;
  } catch (e) {
    return {
      success: false,
      message:
        "Disculpa. No se pudo actualizar esta forma de pago, inténtalo de nuevo por favor.",
    };
  }
};

//Order Payment
const createOrderPayment = async (orderPaymentData) => {
  try {
    const readedOrderPaymentByEmail = await readOrderPaymentByEmail(
      orderPaymentData
    );
    const readedOrderPaymentByUsername = await readOrderPaymentByUsername(
      orderPaymentData.username
    );
    if (readedOrderPaymentByUsername) {
      return {
        success: false,
        info: "error_username",
        message: "Disculpa, el nombre de usuario ya está registrado.",
      };
    }

    if (readedOrderPaymentByEmail) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, el correo del usuario ya está registrado.",
      };
    }
    let newOrderPayment = await new Order(orderPaymentData).save();
    return {
      res: { success: true, orderPaymentId: newOrderPayment._id },
      newOrderPayment: newOrderPayment,
    };
  } catch (e) {
    return "Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.";
  }
};

const readOrderPaymentByEmail = async (orderPaymentData) => {
  return await OrderPayment.findOne({ email: orderPaymentData.email })
    .select("-_id")
    .exec();
};
const readOrderPaymentByUsername = async (username) => {
  return await OrderPayment.findOne({ username: username }).exec();
};

const readAllOrderPayments = async () => {
  let readedOrderPayments = await OrderPayment.find({}).select("-_id").exec();
  if (readedOrder) {
    return readedOrderPayments;
  }
  return false;
};

const updateOrderPayment = async (orderPaymentData) => {
  try {
    const toUpdateOrderPayment = await OrderPayment.findOne({
      email: orderPaymentData.email,
    });
    await toUpdateOrderPayment.set(orderPaymentData);
    const updatedOrderPayment = await toUpdateOrderPayment.save();
    if (!updatedOrderPayment) {
      return console.log("Order update error: " + err);
    }

    return updatedOrderPayment;
  } catch (e) {
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.",
    };
  }
};

module.exports = {
  createOrder,
  readOrderByEmail,
  readOrderByUsername,
  readAllOrders,
  updateOrder,
  deleteOrder,
  createPaymentMethod,
  readPaymentMethodById,
  readAllPaymentMethods,
  updatePaymentMethod,
  createOrderPayment,
  readOrderPaymentByEmail,
  readOrderPaymentByUsername,
  readAllOrderPayments,
  updateOrderPayment,
};
