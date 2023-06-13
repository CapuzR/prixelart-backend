const orderServices = require("./orderService");
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

const downloadOrders = async (req, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pedidos");
  const path = "/Users/Usuario/Downloads";
  worksheet.columns = [
    { header: "status", key: "status", width: 20 },
    { header: "Fecha de solicitud", key: "createdOn", width: 10 },
    { header: "Nombre del cliente", key: "basicData", width: 20 },
    { header: "Fecha de entrega", key: "", width: 10 },
    { header: "certificado", key: "", width: 15 },
    { header: "Prixer", key: "prixer", width: 15 },
    { header: "Arte", key: "art", width: 20 },
    { header: "Producto", key: "product", width: 20 },
    { header: "Atributo", key: "attribute", width: 10 },
    { header: "Cantidad", key: "quantity", width: 5 },
    { header: "Observación", key: "observations", width: 10 },
    { header: "Vendedor", key: "createdBy", width: 15 },
    { header: "Método de entrega", key: "shippingData", width: 15 },
    // { header: "Fecha de pago", key: "payDate", width: 10 },
    // { header: "Mes", key: "month", width: 10 },
    { header: "Validación del pago", key: "payStatus", width: 10 },
    { header: "Costo unitario", key: "price", width: 10 },
  ];
  let readedOrder = await Order.find({}).select("-_id").exec();

  readedOrder.map((order, i) => {
    const v2 = {
      status: order?.status,
      createdOn: order.createdOn,
      basicData: order.basicData?.firstname + " " + order.basicData?.lastname,
      // Fecha de entrega
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

    // let billingData = " ";

    // if (order.billingData?.orderPaymentMethod) {
    //   let d1 = billingData.concat(order.billingData?.orderPaymentMethod);
    //   billingData = d1;
    // }
    // if (order.billingData?.name) {
    //   let d2 = billingData.concat(" ", order.billingData?.name);
    //   billingData = d2;
    // }
    // if (order.billingData?.lastname) {
    //   let d3 = billingData.concat(" ", order.billingData?.lastname);
    //   billingData = d3;
    // }
    // if (order.billingData?.ci) {
    //   let d4 = billingData.concat(" ", order.billingData?.ci);
    //   billingData = d4;
    // }
    // if (order.billingData?.company) {
    //   let d5 = billingData.concat(" ", order.billingData?.company);
    //   billingData = d5;
    // }
    // if (order.billingData?.phone) {
    //   let d6 = billingData.concat(" ", order.billingData?.phone);
    //   billingData = d6;
    // }
    // if (order.billingData?.address) {
    //   let d7 = billingData.concat(" ", order.billingData?.address);
    //   billingData = d7;
    // }

    let prixer = " ";
    let art = " ";
    let product = " ";
    let attributes = " ";
    let quantity = " ";
    let price = " ";
    order.requests.map((item) => {
      prixer = prixer.concat(item.art.prixerUsername, " ");

      art = art.concat(item.art.title, " ");

      product = product.concat(item.product.name, " ");

      attributes = attributes.concat(item.product.selection);
      if (
        item.product.selection?.attributes &&
        item.product.selection?.attributes[1]?.value
      ) {
        attributes = attributes.concat(
          item.product.selection?.attributes[0]?.value,
          " ",
          item.product.selection?.attributes[1]?.value
        );
      } else if (
        item.product.selection?.attributes &&
        item.product.selection?.attributes[0]?.value
      ) {
        attributes = attributes.concat(
          item.product.selection.attributes[0].value
        );
      }

      quantity = item.quantity;
      if (
        item.product.publicEquation !== undefined &&
        item.product.publicEquation !== ""
      ) {
        price = item.product.publicEquation;
      } else if (
        item.product.prixerEquation !== undefined &&
        item.product.prixerEquation !== ""
      ) {
        price = item.product.prixerEquation;
      } else price = item.product.publicPrice.from;
    });
    setTimeout(() => {
      v2.prixer = prixer;
      v2.art = art;
      v2.product = product;
      v2.attributes = attributes;
      v2.quantity = quantity;
      v2.price = price;
      v2.shippingData = shippingData;
      // v2.billingData = billingData;
      worksheet.addRow(v2);
    }, 100);
  });
  setTimeout(() => {
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = { style: "thin" };
    });

    try {
      const data = workbook.xlsx.writeFile(`${path}/Pedidos.xlsx`).then(() => {
        res.send({
          status: "success",
          message: "Archivo descargado exitosamente.",
          path: `Users/Usuario/Descargas/Pedidos.xlsx`,
        });
      });
    } catch (err) {
      console.log(err);
      res.send({ status: "error", message: "Algo salió mal." });
    }
  }, 200);
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
  downloadOrders,
};
