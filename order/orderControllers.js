const orderServices = require("./orderService");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const nanoid = require("nanoid");
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
    if (checkPermissions.createOrder) {
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
      const result = await orderServices.createOrder(orderData);
      res.send(result);
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
    console.log(e);
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

const updateOrder = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.orderStatus) {
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
    if (checkPermissions.detailPay) {
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
    if (checkPermissions.area === "Master") {
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
    if (checkPermissions.orderStatus) {
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
    if (checkPermissions.area === "Master") {
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
    if (checkPermissions.createPaymentMethod) {
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
    if (checkPermissions.createPaymentMethod) {
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
    if (checkPermissions.deletePaymentMethod) {
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
    if (checkPermissions.createShippingMethod) {
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
    if (checkPermissions.createShippingMethod) {
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
    if (checkPermissions.deleteShippingMethod) {
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

const downloadOrders = async (req, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pedidos");
  const path = "/Users/Usuario/Downloads/Pedidos.xlsx";
  worksheet.columns = [
    { header: "status", key: "status", width: 20 },
    { header: "Fecha de solicitud", key: "createdOn", width: 10 },
    { header: "Nombre del cliente", key: "basicData", width: 24 },
    { header: "Fecha de entrega", key: "shippingDate", width: 10 },
    { header: "certificado", key: "", width: 10 },
    { header: "Prixer", key: "prixer", width: 18 },
    { header: "Arte", key: "art", width: 24 },
    { header: "Producto", key: "product", width: 20 },
    { header: "Atributo", key: "attribute", width: 20 },
    { header: "Cantidad", key: "quantity", width: 5 },
    { header: "Observación", key: "observations", width: 18 },
    { header: "Vendedor", key: "createdBy", width: 20 },
    { header: "Método de entrega", key: "shippingData", width: 15 },
    { header: "Validación del pago", key: "payStatus", width: 10 },
    { header: "Costo unitario", key: "price", width: 10 },
  ];
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  let readedOrder = await Order.find({}).select("-_id").exec();

  readedOrder.map((order, i) => {
    const v2 = {
      status: order?.status,
      createdOn: order.createdOn,
      basicData: order.basicData?.firstname + " " + order.basicData?.lastname,
      shippingDate: "",
      // Certificado
      prixer: "",
      art: "",
      product: "",
      attributes: "",
      quantity: "",
      observations: order?.observations,
      createdBy: order.createdBy?.username,
      shippingData: "",
      payDate: "",
      month: "",
      payStatus: order.payStatus,
      price: "",
    };

    let shippingData = " ";
    if (order.shippingData?.shippingMethod !== undefined) {
      shippingData = shippingData.concat(
        order.shippingData?.shippingMethod?.name
      );
    }
    let shippingDate;
    if (order.shippingData?.shippingDate !== undefined) {
      shippingDate = order.shippingData?.shippingDate;
    }
    let prixer = "";
    let art = "";
    let product = "";
    let attributes = "";
    let quantity = "";
    let price = "";
    order.requests.map((item) => {
      prixer = prixer.concat(item.art.prixerUsername, ". ");

      art = art.concat(item.art.title, ". ");

      product = product.concat(item.product.name, ". ");

      if (
        item.product.selection?.attributes &&
        item.product.selection?.attributes[1]?.value
      ) {
        attributes = attributes.concat(
          item.product.selection?.attributes[0]?.value,
          ", ",
          item.product.selection?.attributes[1]?.value,
          ". "
        );
      } else if (
        item.product.selection?.attributes &&
        item.product.selection?.attributes[0]?.value
      ) {
        attributes = attributes.concat(
          item.product.selection.attributes[0].value,
          ". "
        );
      }

      quantity = quantity.concat(item.quantity, "| ");
      if (
        item.product.publicEquation !== undefined &&
        item.product.publicEquation !== ""
      ) {
        price = price.concat("$", item.product.publicEquation, "| ");
      } else if (
        item.product.prixerEquation !== undefined &&
        item.product.prixerEquation !== ""
      ) {
        price = item.product.prixerEquation;
      } else price = price.concat("$", item.product.publicPrice.from, "| ");
    });
    setTimeout(() => {
      v2.prixer = prixer;
      v2.art = art;
      v2.product = product;
      v2.attributes = attributes;
      v2.quantity = quantity;
      v2.price = price;
      v2.shippingData = shippingData;
      v2.shippingDate = shippingDate;
      worksheet.addRow(v2).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    }, 100);
  });
  setTimeout(async () => {
    await workbook.xlsx.writeFile(path);

    try {
      res.send({
        status: "success",
        message: "Archivo descargado exitosamente.",
        path: `/Users/Usuario/Downloads/Pedidos.xlsx`,
      });
    } catch (err) {
      console.log(err);
      res.send({ status: "error", message: "Algo salió mal." });
    }
  }, 200);
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
  downloadOrders,
};
