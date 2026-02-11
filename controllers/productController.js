const async = require("async");
const productModel = require("../models").Product;
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const { Op } = require("sequelize");

exports.create = (req, res) => {
  async.waterfall(
    [
      function checkMissingKey(callback) {
        let missingKeys = [];
        missingKeys = missingKey({
          sku: req.body.sku,
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
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

      function checkSku(index, callback) {
        productModel
          .findOne({
            where: { sku: req.body.sku },
            paranoid: false,
          })
          .then((user) => {
            if (user) {
              return callback({
                code: "ERR_DUPLICATE",
                data: {
                  message: "SKU already exists",
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
        productModel
          .create({
            sku: req.body.sku,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            createdBy: req.user.id,
          })
          .then((res) => {
            if (res) {
              return callback(null, {
                code: "OK",
                data: res,
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
                name: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
              {
                sku: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
              {
                description: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
            ],
          };
        }

        productModel
          .findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            paranoid: true,
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
        productModel
          .findOne({ where: { id: req.params.id }, paranoid: true })
          .then(function (product) {
            if (product) {
              return callback({
                code: "OK",
                data: product,
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "Product not found",
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
          sku: req.body.sku,
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
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

      function checkProduct(index, callback) {
        productModel
          .findOne({ where: { id: req.params.id } })
          .then(function (product) {
            if (!product) {
              return callback({
                code: "NOT_FOUND",
                data: "Product not found",
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

      function checkSku(index, callback) {
        productModel
          .findOne({
            where: { sku: req.body.sku, id: { [Op.ne]: req.params.id } },
            paranoid: false,
          })
          .then((user) => {
            if (user) {
              return callback({
                code: "ERR_DUPLICATE",
                data: {
                  message: "SKU already exists",
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
        productModel
          .update(
            {
              sku: req.body.sku,
              name: req.body.name,
              description: req.body.description,
              price: req.body.price,
              stock: req.body.stock,
              isActive: req.body.isActive,
            },
            { where: { id: req.params.id } },
          )
          .then((res) => {
            if (res[0] === 1) {
              return callback(null, {
                code: "OK",
                data: "Product has been updated",
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "Product not found or no changes made",
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
        productModel
          .destroy({ where: { id: req.params.id } })
          .then(function (result) {
            if (result) {
              return callback({
                code: "OK",
                data: "Product has been deleted",
              });
            } else {
              return callback({
                code: "NOT_FOUND",
                data: "Product not found",
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
