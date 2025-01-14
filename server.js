const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var session = require("cookie-session");
const dotenv = require("dotenv");
dotenv.config();
var helmet = require("helmet");

const app = express();

const isProduction = process.env.NODE_ENV === "prod";

var allowedOrigins = [
  "http://" + process.env.FRONT_END_URL,
  "https://" + process.env.FRONT_END_URL,
  "http://admin." + process.env.FRONT_END_URL,
  "https://admin." + process.env.FRONT_END_URL,
  "http://prixer." + process.env.FRONT_END_URL,
  "https://prixer." + process.env.FRONT_END_URL,
  "https://www." + process.env.FRONT_END_URL,
  "www." + process.env.FRONT_END_URL,
];
var expiryDate = new Date(Date.now() + 2400 * 60 * 1000); // 1 hour
app.use(
  session({
    name: "session",
    keys: ["key1", "key2"],
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "None",
      domain: isProduction ? ".prixelart.com" : "localhost",
      path: "/",
      maxAge: expiryDate,
      overwrite: true,
    },
  })
);
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use(helmet());

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});
const user = require("./user/userRoutes");
const prixer = require("./prixer/prixerRoutes");
const admin = require("./admin/adminRoutes");
const preferences = require("./preferences/preferencesRoutes");
const art = require("./art/artRoutes");
const product = require("./product/productRoutes");
const consumer = require("./consumer/consumerRoutes");
const order = require("./order/orderRoutes");
const testimonial = require("./testimonials/testimonialRoutes");
const discount = require("./discount/discountRoutes");
const account = require("./account/accountRoutes");
const movements = require("./movements/movementRoutes");
const services = require("./serviceOfPrixers/serviceRoutes");
const images = require("./art/artRoutes");
const organizations = require("./organizations/organizationRoutes");
const surcharge = require("./surcharge/surchargeRoutes");
app.use(cookieParser());

app.use(express.urlencoded({ limit: "1mb", extended: false }));
app.use(express.json({ limit: "1mb" }));

app.use("/", user);
app.use("/", prixer);
app.use("/", admin);
app.use("/", art);
app.use("/", product);
app.use("/", consumer);
app.use("/", order);
app.use("/", preferences);
app.use("/", testimonial);
app.use("/", discount);
app.use("/", account);
app.use("/", movements);
app.use("/", services);
app.use("/", images);
app.use("/", organizations);
app.use("/", surcharge);

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
