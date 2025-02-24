"use strict";

const express = require("express");
const router = express.Router();
const consumerControllers = require("./consumerControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

router.post(
  "/consumer/create",
  //  adminAuthServices.ensureAuthenticated,
  consumerControllers.createConsumer
);
router.post(
  "/consumer/read",
  // adminAuthServices.ensureAuthenticated,
  consumerControllers.readConsumer
);
router.post(
  "/consumer/read-by-query",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.readConsumerByQuery
);

router.post(
  "/consumer/read-by-id",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.readConsumerById
);

router.get(
  "/consumer/read-all",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.readAllConsumers
);

router.post(
  "/consumer/read-prixers",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.readConsumersPrixers
);
router.post(
  "/consumer/update",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.updateConsumer
);

router.delete(
  "/consumer/delete/:id",
  adminAuthServices.ensureAuthenticated,
  consumerControllers.deleteConsumer
);

module.exports = router;
