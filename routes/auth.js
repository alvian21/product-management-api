"use strict";

const express = require("express");
const router = express.Router();
const output = require("../functions/output");
const authController = require("../controllers/authController");

const OAuth2Server = require("oauth2-server");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const oauthModel = require("../functions/oauthModel");

const oauth = new OAuth2Server({
  model: oauthModel,
});

router.post("/signin", authController.signIn);
router.post("/refresh", authController.refreshToken);

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

router.post("/logout", authController.logout);
router.get("/me", authController.me);
router.get("/permission", authController.getPermissionByRole);

module.exports = router;
