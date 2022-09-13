const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
let helmet = require("helmet");

const app = express();

var allowedOrigins = [
  "http://" + process.env.FRONT_END_URL,
  "https://" + process.env.FRONT_END_URL,
];
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
// app.use(cors());

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
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", user);
app.use("/", prixer);
app.use("/", admin);
app.use("/", art);
app.use("/", product);
app.use("/", consumer);
app.use("/", order);
app.use("/", preferences);
app.use("/", testimonial);

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
