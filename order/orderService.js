const Order = require("./orderModel");
const PaymentMethod = require("./paymentMethodModel");
const ShippingMethod = require("./shippingMethodModel");
const OrderPayment = require("./orderPaymentModel");
const dotenv = require("dotenv");
dotenv.config();
const emailSender = require("../utils/emailSender");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require("jsonwebtoken");
const adminRoleModel = require("../admin/adminRoleModel");

const { response } = require("express");

//Order
const createOrder = async (orderData) => {
  try {
    const newOrder = await new Order(orderData).save();
    return {
      res: { success: true, orderId: newOrder.orderId },
      newOrder: newOrder,
    };
  } catch (e) {
    console.log(e);
    return "Incapaz de crear la orden, intenta de nuevo o consulta a soporte.";
  }
};

const sendEmail = async (orderData) => {
  try {
    const templates = {
      newOrder: "d-68b028bb495347059d343137d2517857",
    };
    const destination = orderData.basicData.email;
    const message = {
      to: destination,
      // to: "lizard232010@hotmail.com",
      from: {
        email: "prixers@prixelart.com",
        name: "Prixelart",
      },
      templateId: "d-68b028bb495347059d343137d2517857",
      //  templates["newOrder"],
      dynamic_template_data: {
        name:
          orderData.basicData.firstname + " " + orderData.basicData.lastname,
        lastname: orderData.basicData.lastname,
        basicData: orderData.basicData,
        shippingData: orderData.shippingData,
        billingData: orderData.billingData,
        requests: orderData.requests,
        subtotal: orderData.subtotal.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        tax: orderData.tax.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        shippingCost: orderData.shippingCost.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        orderId: orderData.orderId,
        total: orderData.total.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        }),
        observations: orderData.observations,
      },
    };
    return emailSender.sendEmail(message);
  } catch (e) {
    // console.log(e);
    res.status(500).send(e);
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
      orders: ordersv2,
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

const readOrdersByPrixer = async (prixer) => {
  let orders = await Order.find({ status: "Completada" });
  let readedOrders = [];
  orders.map((order) => {
    order.requests?.map((item) => {
      // const isPrixer = await order.basicData.

      if (item.art.prixerUsername === prixer) {
        readedOrders.push(order);
      }
    });
  });
  if (readedOrders) {
    const data = {
      info: "Las órdenes disponibles",
      orders: readedOrders,
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

const addVoucher = async (id, paymentVoucher) => {
  try {
    const toUpdateOrder = await Order.findOne({ orderId: id });
    toUpdateOrder.paymentVoucher = paymentVoucher;
    const updatedOrder = await toUpdateOrder.save();
    if (!updatedOrder) {
      return console.log("Order update error: " + err);
    }

    return updatedOrder;
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: e + "Disculpa. No se pudo agregar el comprobante a esta orden.",
    };
  }
};

const updateOrder = async (adminToken, id, status) => {
  try {
    let check;
    jwt.verify(adminToken, process.env.JWT_SECRET, async (err, decoded) => {
      let result = await adminRoleModel.findOne({
        area: decoded.area,
      });
      check = result;
      if (err) {
        return res.status(500).send({
          auth: false,
          message: "Falló autenticación de token.",
        });
      } else if (decoded) {
        check = result;

        if (check && check.detailOrder) {
          const toUpdateOrder = await Order.findOne({ orderId: id });
          toUpdateOrder.status = status;
          const updatedOrder = await toUpdateOrder.save();

          if (!updatedOrder) {
            return console.log("Order update error: " + err);
          } else {
            const updated = {
              auth: true,
              message: "Órden actualizada con éxito",
              order: updatedOrder,
            };
            return updated;
          }
        } else {
          const updateOrder = {
            auth: false,
            message: "No tienes autorización para realizar esta acción.",
          };
          return updateOrder;
        }
      }
    });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    };
  }
};

const updateOrderPayStatus = async (adminToken, id, payStatus) => {
  try {
    let check;

    jwt.verify(adminToken, process.env.JWT_SECRET, async (err, decoded) => {
      let result = await adminRoleModel.findOne({
        area: decoded.area,
      });
      check = result;
      if (err) {
        return res.status(500).send({
          auth: false,
          message: "Falló autenticación de token.",
        });
      } else if (decoded) {
        check = result;

        if (check && check.detailPay) {
          const toUpdateOrder = await Order.findOne({ orderId: id });
          toUpdateOrder.payStatus = payStatus;
          const updatedOrder = await toUpdateOrder.save();

          if (!updatedOrder) {
            return console.log("Order update error: " + err);
          } else {
            const updated = {
              auth: true,
              message: "Órden actualizada con éxito",
              order: updatedOrder,
            };
            return updated;
          }
        } else {
          const updateOrder = {
            auth: false,
            message: "No tienes autorización para realizar esta acción.",
          };
          return updateOrder;
        }
      }
    });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
    };
  }
};

const updateSeller = async (adminToken, id, seller) => {
  try {
    // jwt.verify(adminToken, process.env.JWT_SECRET, async (err, decoded) => {
    //   let result = await adminRoleModel.findOne({
    //     area: decoded.area,
    //   });
    //   if (err) {
    //     return res.status(500).send({
    //       auth: false,
    //       message: "Falló autenticación de token.",
    //     });
    //   } else if (decoded) {
    //     if (result.area === "Master") {
    const toUpdateOrder = await Order.findOne({ orderId: id });
    toUpdateOrder.createdBy = seller;
    const updatedOrder = await toUpdateOrder.save();

    if (!updatedOrder) {
      return console.log("Order update error: " + err);
    } else {
      const updated = {
        auth: true,
        message: "Órden actualizada con éxito",
        order: updatedOrder,
      };
      return updated;
    }
    // } else {
    //   const updateOrder = {
    //     auth: false,
    //     message: "No tienes autorización para realizar esta acción.",
    //   };
    //   return updateOrder;
    // }
    // }
    // });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar esta orden, inténtalo de nuevo por favor.",
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
      return console.log("Payment method update error: " + err);
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

const deletePaymentMethod = async (paymentMethodId) => {
  try {
    await PaymentMethod.findOneAndDelete({ _id: paymentMethodId });
    return "Método de pago eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

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
    let newShippingMethod = await new ShippingMethod(shippingMethodData).save();
    return {
      res: { success: true, shippingMethodId: newShippingMethod._id },
      newShippingMethod: newShippingMethod,
    };
  } catch (e) {
    console.log(e);
    return "Incapaz de crear forma de envío, intenta de nuevo o consulta a soporte.";
  }
};

const readShippingMethodById = async (id) => {
  return await ShippingMethod.findOne({ _id: id }).exec();
};

const readAllShippingMethod = async (active) => {
  if (active) {
    let readedShippingMethods = await ShippingMethod.find({
      active: true,
    }).exec();
    return readedShippingMethods;
  } else {
    let readedShippingMethods = await ShippingMethod.find({}).exec();
    if (readedShippingMethods) {
      const data = {
        info: "Todos los métodos de envío disponibles",
        shippingMethods: readedShippingMethods,
      };
      return data;
    } else {
      const data = {
        info: "No hay métodos de envío disponibles",
        shippingMethods: null,
      };
      return data;
    }
  }
};

const updateShippingMethod = async (shippingMethodData) => {
  try {
    const toUpdateShippingMethod = await readShippingMethodById(
      shippingMethodData.id
    );
    await toUpdateShippingMethod.set(shippingMethodData);
    const updatedShippingMethod = await toUpdateShippingMethod.save();
    if (!updatedShippingMethod) {
      return console.log("Shipping method update error" + err);
    }
    return updatedShippingMethod;
  } catch (e) {
    return {
      success: false,
      message:
        "Disculpa. No se pudo actualizar esta forma de envío, inténtalo de nuevo.",
    };
  }
};

const deleteShippingMethod = async (shippingMethodId) => {
  try {
    console.log(shippingMethodId);

    await ShippingMethod.findOneAndDelete({ _id: shippingMethodId });
    return "Método de envío eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
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
  addVoucher,
  sendEmail,
  readOrderByEmail,
  readOrderByUsername,
  readAllOrders,
  readOrdersByPrixer,
  updateOrder,
  updateOrderPayStatus,
  updateSeller,
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
  createOrderPayment,
  readOrderPaymentByEmail,
  readOrderPaymentByUsername,
  readAllOrderPayments,
  updateOrderPayment,
};
