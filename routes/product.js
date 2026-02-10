"use strict";
const express = require("express");
const productController = require("../controllers/productController");
const output = require("../functions/output");
const router = express.Router();

const OAuth2Server = require("oauth2-server");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const oauthModel = require("../functions/oauthModel");

const oauth = new OAuth2Server({
  model: oauthModel,
});

// AUTH MIDDLEWARE
router.use((req, res, next) => {
  const request = new Request(req);
  const response = new Response(res);

  oauth
    .authenticate(request, response)
    .then((token) => {
      req.user = token.user;
      next();
    })
    .catch((err) => {
      return output.print(req, res, {
        code: "ERR_ACCESS",
        data: err.message || "Unauthorized",
      });
    });
});

const checkPermission = require("../functions/checkPermission");

router.post(
  "/create",
  checkPermission("product.create"),
  productController.create,
);
router.get("/", checkPermission("product.read"), productController.findAll);
router.delete(
  "/delete/:id",
  checkPermission("product.delete"),
  productController.delete,
);
router.get("/:id", checkPermission("product.read"), productController.findOne);
router.patch(
  "/update/:id",
  checkPermission("product.update"),
  productController.update,
);
module.exports = router;
