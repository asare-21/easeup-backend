const Joi = require("joi");
const { JoiValidator } = require("../../joi.validator");

const createWorkerValidator = (params) => {
  const schema = Joi.object({
    email: Joi.string().optional().label("Email"),
    profile_name: Joi.string().optional().label("Profile Name"),
    last_login: Joi.string().optional().label("Last login"),
    worker: Joi.string().required().label("Worker"),
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
    worker: Joi.string().required().label("Worker"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerTokenValidator = (params) => {
  const schema = Joi.object({
    user_id: Joi.string().required().label("UserId"),
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
};
