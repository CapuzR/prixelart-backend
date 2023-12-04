const orderServices = require("./orderService");
const movementServices = require("../movements/movementServices");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const { createConsumer } = require("../consumer/consumerService");
const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
dotenv.config();
const Order = require("./orderModel");
const excelJS = require("exceljs");

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});
//Order
const createOrder = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createOrder) {
      const orderData = {
        orderId: req.body.orderId,
        orderType: req.body.orderType,
        createdOn: req.body.createdOn,
        createdBy: req.body.createdBy,
        dollarValue: req.body.dollarValue,
        subtotal: req.body.subtotal,
        tax: req.body.tax,
        total: req.body.total,
        basicData: req.body.basicData,
        shippingData: req.body.shippingData,
        billingData: req.body.billingData,
        requests: req.body.requests,
        status: req.body.status,
        observations: req.body.observations,
        consumer: req.body.consumerId,
      };

      const order = await orderServices.createOrder(orderData);
      if (
        order.res.success &&
        req.body.billingData?.orderPaymentMethod === "Balance Prixer"
      ) {
        const mov = {
          _id: nanoid(),
          createdOn: new Date(),
          createdBy: `${checkPermissions.admin.firstname} ${checkPermissions.admin.lastname}`,
          date: new Date(),
          destinatary: req.body.billingData.destinatary,
          description: `Pago de la orden #${req.body.orderId}`,
          type: "Retiro",
          value: req.body.total,
        };

        const payment = await movementServices.createMovement(mov);

        const adjust = await movementServices.updateBalance(mov);

        if (payment.success === true && adjust) {
          const updatedOrder = await orderServices.updateOrderPayStatus(
            orderData.orderId,
            "Pagado"
          );
        }
        await res.send({ order, payment, adjust });
      } else {
        await res.send(order);
      }
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const createOrder4Client = async (req, res) => {
  try {
    // Crear u obtener cliente
    const createClient = await createConsumer(req.body.consumerData);

    // Crear Pedido
    const createOrder = await orderServices.createOrder(req.body.input);

    const response = {
      consumer: createClient,
      order: createOrder,
    };
    if (
      createOrder.res.success &&
      req.body.input.billingData?.orderPaymentMethod === "Balance Prixer"
    ) {
      // Cobro de Prixer Balance (leer Prixer, crear movimiento, actualizar Balance)

      const mov = {
        _id: nanoid(),
        createdOn: new Date(),
        createdBy: "Prixelart Page",
        date: new Date(),
        destinatary: req.body.input.billingData.destinatary,
        description: `Pago de la orden #${req.body.input.orderId}`,
        type: "Retiro",
        value: req.body.input.total,
      };
      const payment = await movementServices.createMovement(mov);
      response.payment = payment;

      const adjust = await movementServices.updateBalance(mov);
      response.adjust = adjust;

      if (payment.success === true && adjust.success === true) {
        const updatedOrder = await orderServices.updateOrderPayStatus(
          orderData.orderId,
          "Pagado"
        );
        response.update = updatedOrder;
      }
    }
    res.send(response);
  } catch (err) {
    res.status(500).send(err);
    console.log("error: ", err);
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
    const readedOrder = await orderServices.readOrderById(req.body.order);
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

const readOrdersByEmail = async (req, res) => {
  try {
    const readedOrders = await orderServices.readOrdersByEmail(req.body.email);
    res.send(readedOrders);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updateOrder = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.orderStatus) {
      const updatedOrder = await orderServices.updateOrder(
        req.params.id,
        req.body.status
      );
      return res.send(updatedOrder);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateOrderPayStatus = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.detailPay) {
      const updatedOrder = await orderServices.updateOrderPayStatus(
        req.params.id,
        req.body.payStatus
      );
      return res.send(updatedOrder);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateSeller = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.area === "Master") {
      const updatedOrder = await orderServices.updateSeller(
        req.params.id,
        req.body.seller
      );
      return res.send(updatedOrder);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateItemStatus = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.orderStatus) {
      const updatedOrder = await orderServices.updateItemStatus(
        req.body.status,
        req.body.index,
        req.body.order
      );
      return res.send(updatedOrder);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    res.status(500).send(err);
  }
};
const deleteOrder = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.area === "Master") {
      const orderForDelete = await orderServices.deleteOrder(req.params.id);
      data = {
        orderForDelete,
        success: true,
      };
      return res.send(data);
    } else {
      npm;
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

//PaymentMethod
const createPaymentMethod = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createPaymentMethod) {
      const result = await orderServices.createPaymentMethod(req.body);
      res.send(result);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
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
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createPaymentMethod) {
      const updatedPaymentMethod = await orderServices.updatePaymentMethod(
        req.body
      );
      return res.send(updatedPaymentMethod);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.deletePaymentMethod) {
      const paymentMethodForDelete = await orderServices.deletePaymentMethod(
        req.params.id
      );
      data = {
        paymentMethodForDelete,
        success: true,
      };
      return res.send(data);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch {
    res.status(500).send(err);
    console.log(err);
  }
};

//Shipping method
const createShippingMethod = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createShippingMethod) {
      const result = await orderServices.createShippingMethod(req.body);
      res.send(result);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
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
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createShippingMethod) {
      const updateShippingMethod = await orderServices.updateShippingMethod(
        req.body
      );
      res.send(updateShippingMethod);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteShippingMethod = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.deleteShippingMethod) {
      const shippingMethodForDelete = await orderServices.deleteShippingMethod(
        req.params.id
      );
      data = {
        shippingMethodForDelete,
        success: true,
      };
      return res.send(data);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch {
    res.status(500).send(err);
    console.log(err);
  }
};

module.exports = {
  createOrder,
  createOrder4Client,
  upload,
  addVoucher,
  sendEmail,
  readOrder,
  readAllOrders,
  readOrdersByPrixer,
  readOrdersByEmail,
  updateOrder,
  updateOrderPayStatus,
  updateSeller,
  updateItemStatus,
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
};
