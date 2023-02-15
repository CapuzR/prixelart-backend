// const { result } = require("underscore");
const orderServices = require("./orderService");

//Order
const createOrder = async (req, res) => {
  try {
    const result = await orderServices.createOrder(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const sendEmail = async (req, res) => {
  try {
    const content = req.body;
    const result = await orderServices.sendEmail(content);

    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

const readOrder = async (req, res) => {
  try {
    const readedOrder = await orderServices.readOrderByEmail(req.body);
    res.send(readedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllOrders = async (req, res) => {
  try {
    const readedOrders = await orderServices.readAllOrders();
    res.send(readedOrders);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await orderServices.updateOrder(
      req.params.id,
      req.body.status
    );
    return res.send(updatedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateOrderPayStatus = async (req, res) => {
  try {
    const updatedOrder = await orderServices.updateOrderPayStatus(
      req.params.id,
      req.body.payStatus
    );
    return res.send(updatedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteOrder = async (req, res) => {
  const orderForDelete = await orderServices.deleteOrder(req.params.id);
  data = {
    orderForDelete,
    success: true,
  };
  return res.send(data);
};

//PaymentMethod
const createPaymentMethod = async (req, res) => {
  try {
    const result = await orderServices.createPaymentMethod(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readPaymentMethod = async (req, res) => {
  try {
    const readedPaymentMethod = await orderServices.readPaymentMethodByEmail(
      req.body
    );
    res.send(readedPaymentMethod);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllPaymentMethods = async (req, res) => {
  try {
    const readedPaymentMethods = await orderServices.readAllPaymentMethods();
    res.send(readedPaymentMethods);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllPaymentMethodsV2 = async (req, res) => {
  try {
    const active = true;
    const readedPaymentMethods = await orderServices.readAllPaymentMethods(
      active
    );
    res.send(readedPaymentMethods);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const updatedPaymentMethod = await orderServices.updatePaymentMethod(
      req.body
    );
    return res.send(updatedPaymentMethod);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethodForDelete = await orderServices.deletePaymentMethod(
      req.params.id
    );
    data = {
      paymentMethodForDelete,
      success: true,
    };
    return res.send(data);
  } catch {
    res.status(500).send(err);
    console.log(err);
  }
};
//Shipping method

const createShippingMethod = async (req, res) => {
  try {
    const result = await orderServices.createShippingMethod(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllShippingMethod = async (req, res) => {
  try {
    const readedShippingMethods = await orderServices.readAllShippingMethod();
    res.send(readedShippingMethods);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllShippingMethodV2 = async (req, res) => {
  try {
    const active = true;
    const readedShippingMethods = await orderServices.readAllShippingMethod(
      active
    );
    res.send(readedShippingMethods);
  } catch (err) {
    res.status(500).send(err);
  }
};
const updateShippingMethod = async (req, res) => {
  try {
    const updateShippingMethod = await orderServices.updateShippingMethod(
      req.body
    );
    res.send(updateShippingMethod);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteShippingMethod = async (req, res) => {
  try {
    const shippingMethodForDelete = await orderServices.deleteShippingMethod(
      req.params.id
    );
    data = {
      shippingMethodForDelete,
      success: true,
    };
    return res.send(data);
  } catch {
    res.status(500).send(err);
    console.log(err);
  }
};
//Order
const createOrderPayment = async (req, res) => {
  try {
    const result = await orderServices.createOrderPayment(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readOrderPayment = async (req, res) => {
  try {
    const readedOrderPayment = await orderServices.readOrderPaymentByEmail(
      req.body
    );
    res.send(readedOrderPayment);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllOrderPayments = async (req, res) => {
  try {
    const readedOrderPayments = await orderServices.readAllOrderPayments();
    res.send(readedOrderPayments);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateOrderPayment = async (req, res) => {
  try {
    const updatedOrderPayment = await orderServices.updateOrderPayment(
      req.body
    );
    return res.send(updatedOrderPayment);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  createOrder,
  sendEmail,
  readOrder,
  readAllOrders,
  updateOrder,
  updateOrderPayStatus,
  deleteOrder,
  createPaymentMethod,
  readPaymentMethod,
  readAllPaymentMethods,
  readAllPaymentMethodsV2,
  updatePaymentMethod,
  deletePaymentMethod,
  createShippingMethod,
  readAllShippingMethod,
  readAllShippingMethodV2,
  updateShippingMethod,
  deleteShippingMethod,
  createOrderPayment,
  readOrderPayment,
  readAllOrderPayments,
  updateOrderPayment,
};
