const { joiOptions } = require("./config/config");
class JoiValidator {
  static validate(joiSchema, paramsToValidate) {
    const { error } = joiSchema.validate(paramsToValidate, joiOptions);
    return error ? error.details[0].message : null;
  }
}

module.exports = { JoiValidator };
