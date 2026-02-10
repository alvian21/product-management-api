"use strict";
const express = require("express");
const userController = require("../controllers/userController");
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

router.post("/create", checkPermission("user.create"), userController.create);
router.get("/", checkPermission("user.read"), userController.findAll);
router.delete(
  "/delete/:id",
  checkPermission("user.delete"),
  userController.delete,
);
router.get("/:id", checkPermission("user.read"), userController.findOne);
router.patch(
  "/update/:id",
  checkPermission("user.update"),
  userController.update,
);
module.exports = router;
