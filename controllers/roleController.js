const async = require("async");
const roleModel = require("../models").Role;
const output = require("../functions/output.js");
const { Op } = require("sequelize");

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
                alias: {
                  [Op.like]: `%${req.query.search}%`,
                },
              },
            ],
          };
        }

        roleModel
          .findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
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
