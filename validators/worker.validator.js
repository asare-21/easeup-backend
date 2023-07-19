const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const createWorkerValidator = (params) => {
  const schema = Joi.object({
    email: Joi.string().required().label("Email"),
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().label("Password"),
    name: Joi.string().required().label("Name"),
    token: Joi.string().required().label("Token"),
    last_login: Joi.string().required().label("Last Login"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const loginWorkerValidator = (params) => {
  const schema = Joi.object({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};


const updateWorkerLocationValidator = (params) => {
  const schema = Joi.object({
    updates: Joi.string().required().label("Updates"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerTokenValidator = (params) => {
  const schema = Joi.object({
    token: Joi.string().optional().label("Token"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerGhcValidator = (params) => {
  const schema = Joi.object({
    user_id: Joi.string().required().label("UserId"),
    ghc: Joi.string().optional().label("Ghc"),
    ghc_n: Joi.string().optional().label("Ghc_n"),
    ghc_exp: Joi.string().optional().label("Ghc_exp"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateUserNotificationsValidator = (params) => {
  const schema = Joi.object({
    id: Joi.string().required().label("Id"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  createWorkerValidator,
  updateWorkerLocationValidator,
  updateWorkerTokenValidator,
  updateWorkerGhcValidator,
  updateUserNotificationsValidator,
  loginWorkerValidator
};
