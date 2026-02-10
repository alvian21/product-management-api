const OAuth2Server = require("oauth2-server");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const oauthModel = require("../functions/oauthModel");
const missingKey = require("../functions/missingKey");

const oauth = new OAuth2Server({
  model: oauthModel,
  accessTokenLifetime: 60 * 60,
  allowBearerTokensInQueryString: true,
});

const models = require("../models");
const roleModel = models.Role;
const permissionModel = models.Permission;
const output = require("../functions/output.js");
const async = require("async");

exports.token = (req, res) => {
  const contentType = req.header("content-type");
  if (contentType && contentType.includes("application/json")) {
    req.headers["content-type"] = "application/x-www-form-urlencoded";
  }

  let missingKeys = [];
  if (req.body.grant_type === "refresh_token") {
    missingKeys = missingKey({
      refresh_token: req.body.refresh_token,
      client_id: req.body.client_id,
      client_secret: req.body.client_secret,
    });
  } else {
    missingKeys = missingKey({
      username: req.body.username,
      password: req.body.password,
      grant_type: req.body.grant_type,
      client_id: req.body.client_id,
      client_secret: req.body.client_secret,
    });
  }

  if (missingKeys.length > 0) {
    return output.print(req, res, {
      code: "MISSING_KEY",
      data: {
        missingKeys,
      },
    });
  }

  const request = new Request(req);
  const response = new Response(res);

  oauth
    .token(request, response)
    .then((token) => {
      return output.print(req, res, {
        code: "OK",
        data: {
          access_token: token.accessToken,
          token_type: "Bearer",
          expires_in: Math.floor(
            (token.accessTokenExpiresAt - new Date()) / 1000,
          ),
          refresh_token: token.refreshToken,
        },
      });
    })
    .catch((err) => {
      console.error("OAuth2 Token Error:", err);

      return output.print(req, res, {
        code: "UNAUTHORIZED",
        data: err.message || "Invalid credentials",
      });
    });
};

exports.signIn = (req, res) => {
  req.body.grant_type = "password";
  return exports.token(req, res);
};

exports.refreshToken = (req, res) => {
  req.body.grant_type = "refresh_token";
  return exports.token(req, res);
};

exports.logout = (req, res) => {
  return output.print(req, res, {
    code: "OK",
    data: { message: "Logout successful" },
  });
};

exports.me = (req, res) => {
  const user = { ...req.user };
  delete user.password;

  return output.print(req, res, {
    code: "OK",
    data: user,
  });
};

exports.getPermissionByRole = (req, res) => {
  async.waterfall(
    [
      function getPermission(callback) {
        permissionModel
          .findAll({
            include: [
              {
                model: roleModel,
                where: { id: req.user.roleId },
                attributes: [],
                through: { attributes: [] },
              },
            ],
          })
          .then((permissions) => {
            callback(null, permissions);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },
    ],
    (err, result) => {
      if (err) {
        return output.print(req, res, err);
      }
      return output.print(req, res, {
        code: "OK",
        data: result,
      });
    },
  );
};
