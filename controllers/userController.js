const async = require("async");
const userModel = require("../models").User;
const roleModel = require("../models").Role;
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

exports.create = (req, res) => {
  async.waterfall(
    [
      function checkMissingKey(callback) {
        let missingKeys = [];
        missingKeys = missingKey({
          fullName: req.body.fullName,
          email: req.body.email,
          password: req.body.password,
          roleId: req.body.roleId,
        });

        if (missingKeys.length !== 0) {
          return callback({
            code: "MISSING_KEY",
            data: {
              missingKeys,
            },
          });
        }
        callback(null, true);
      },

      function checkRole(index, callback) {
        roleModel
          .findOne({
            where: { id: req.body.roleId },
          })
          .then((role) => {
            if (!role) {
              return callback({
                code: "DATA_NOT_FOUND",
                data: {
                  message: "Role not found",
                },
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function checkEmail(index, callback) {
        userModel
          .findOne({
            where: { email: req.body.email },
            paranoid: false,
          })
          .then((user) => {
            if (user) {
              return callback({
                code: "ERR_DUPLICATE",
                data: {
                  message: "Email already exists",
                },
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function insert(index, callback) {
        const passwordHash = bcrypt.hashSync(req.body.password, 10);
        userModel
          .create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: passwordHash,
            roleId: req.body.roleId,
            isActive:
              req.body.isActive !== undefined ? req.body.isActive : true,
          })
          .then((res) => {
            const user = res.get({ plain: true });
            delete user.password;

            if (res) {
              return callback(null, {
                code: "OK",
                data: user,
              });
            }
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
      return output.print(req, res, result);
    },
  );
};

exports.findAll = (req, res) => {
  async.waterfall(
    [
      function viewdata(callback) {
        let whereClause = {};
        let limit = parseInt(req.query.take) || 10;
        let offset = parseInt(req.query.skip) || 0;

        if (req.query.search && req.query.search.trim().length > 0) {
          whereClause = {
            [Op.or]: [
              {
                fullName: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
              {
                email: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
            ],
          };
        }

        userModel
          .findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            attributes: { exclude: ["password"] },
          })
          .then(function (result) {
            return callback({
              code: "OK",
              data: {
                rows: result.rows,
                count: result.count,
              },
            });
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
      return output.print(req, res, result);
    },
  );
};

exports.findOne = (req, res) => {
  async.waterfall(
    [
      function viewEdit(callback) {
        userModel
          .findOne({
            where: { id: req.params.id },
            attributes: { exclude: ["password"] },
          })
          .then(function (user) {
            if (user) {
              return callback({
                code: "OK",
                data: user,
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "User not found",
              });
            }
          })
          .catch((err) => {
            return output.print(req, res, {
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
      return output.print(req, res, result);
    },
  );
};

exports.update = (req, res) => {
  async.waterfall(
    [
      function checkMissingKey(callback) {
        let missingKeys = [];
        missingKeys = missingKey({
          fullName: req.body.fullName,
          email: req.body.email,
          roleId: req.body.roleId,
        });

        if (missingKeys.length !== 0) {
          return callback({
            code: "MISSING_KEY",
            data: {
              missingKeys,
            },
          });
        }
        callback(null, true);
      },

      function checkUser(index, callback) {
        userModel
          .findOne({
            where: { id: req.params.id },
          })
          .then(function (user) {
            if (!user) {
              return callback({
                code: "NOT_FOUND",
                data: "User not found",
              });
            }

            callback(null, true);
          })
          .catch((err) => {
            return output.print(req, res, {
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function checkRole(index, callback) {
        roleModel
          .findOne({
            where: { id: req.body.roleId },
          })
          .then((role) => {
            if (!role) {
              return callback({
                code: "DATA_NOT_FOUND",
                data: {
                  message: "Role not found",
                },
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },
      function checkEmail(index, callback) {
        userModel
          .findOne({
            where: { id: { [Op.ne]: req.params.id }, email: req.body.email },
            paranoid: false,
          })
          .then((user) => {
            if (user) {
              return callback({
                code: "ERR_DUPLICATE",
                data: {
                  message: "Email already exists",
                },
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function update(index, callback) {
        let updateData = {
          fullName: req.body.fullName,
          roleId: req.body.roleId,
          isActive: req.body.isActive,
        };

        if (req.body.password) {
          updateData.password = bcrypt.hashSync(req.body.password, 10);
        }

        Object.keys(updateData).forEach(
          (key) => updateData[key] === undefined && delete updateData[key],
        );

        userModel
          .update(updateData, { where: { id: req.params.id } })
          .then((res) => {
            if (res[0] === 1) {
              return callback(null, {
                code: "OK",
                data: "User has been updated",
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "User not found or no changes made",
              });
            }
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
      return output.print(req, res, result);
    },
  );
};

exports.delete = (req, res) => {
  async.waterfall(
    [
      function deleteData(callback) {
        userModel
          .destroy({ where: { id: req.params.id } })
          .then(function (result) {
            if (result) {
              return callback({
                code: "OK",
                data: "User has been deleted",
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "User not found",
              });
            }
          })
          .catch((err) => {
            return output.print(req, res, {
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
      return output.print(req, res, result);
    },
  );
};
