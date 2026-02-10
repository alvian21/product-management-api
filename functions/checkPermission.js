const models = require("../models");
const output = require("./output");

module.exports = (permissionAlias) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return output.print(req, res, {
          code: "ERR_ACCESS",
          data: "User not authenticated or role not found",
        });
      }

      const permission = await models.Permission.findOne({
        where: { alias: permissionAlias },
        include: [
          {
            model: models.Role,
            where: { id: req.user.roleId },
            through: { attributes: [] },
            required: true,
          },
        ],
      });

      if (permission) {
        return next();
      } else {
        return output.print(req, res, {
          code: "ERR_ACCESS",
          data: "You do not have permission to perform this action",
        });
      }
    } catch (err) {
      console.error("Check Permission Error:", err);
      return output.print(req, res, {
        code: "ERR_DATABASE",
        data: err.message,
      });
    }
  };
};
