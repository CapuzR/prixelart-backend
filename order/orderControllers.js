const orderServices = require("./orderService");
const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
dotenv.config();

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});
//Order
const createOrder = async (req, res) => {
  try {
    const orderData = {
      orderId: req.body.orderId,
      orderType: req.body.orderType,
      createdOn: req.body.createdOn,
      createdBy: req.body.createdBy,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      total: req.body.total,
      basicData: req.body.basicData,
      shippingData: req.body.shippingData,
      billingData: req.body.billingData,
      requests: req.body.requests,
      status: req.body.status,
      observations: req.body.observations,
    };
    const result = await orderServices.createOrder(orderData);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
    console.log("err", err);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      req.body.Id = nanoid(7);
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "desktopThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + req.body.Id + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(1300, null).webp({ quality: 80 }));
        },
      },
    ],
  }),
});

const addVoucher = async (req, res) => {
  try {
    const updatedOrder = await orderServices.addVoucher(
      req.params.id,
      req.file.transforms[0].location
    );
    return res.send(updatedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};
addVoucher;

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
    const readedOrders = await orderServices.readAllOrders(req.body.adminToken);
    res.send(readedOrders);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readOrdersByPrixer = async (req, res) => {
  try {
    const prixer = req.body.prixer;
    const readedOrders = await orderServices.readOrdersByPrixer(prixer);
    res.send(readedOrders);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await orderServices.updateOrder(
      req.body.adminToken,
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
      req.body.adminToken,
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
  upload,
  addVoucher,
  sendEmail,
  readOrder,
  readAllOrders,
  readOrdersByPrixer,
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
