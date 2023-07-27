const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const updateImageValidator = (params) => {
  const schema = Joi.object({
    profile_picture: Joi.string().optional().label("Profile Picture"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};
const loginUserValidator = (params) => {
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

const updateAddressValidator = (params) => {
  const schema = Joi.object({
    address: Joi.string().optional().label("Address"),
    latlng: Joi.array().optional().label("Latlng"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateGenderValidator = (params) => {
  const schema = Joi.object({
    gender: Joi.string().optional().label("Gender"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateTokenValidator = (params) => {
  const schema = Joi.object({
    token: Joi.string().optional().label("Token"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updatePhoneValidator = (params) => {
  const schema = Joi.object({
    phone: Joi.string().optional().label("Phone"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateGhcValidator = (params) => {
  const schema = Joi.object({
    ghc: Joi.array().optional().label("Phone"),
    ghc_n: Joi.string().optional().label("Ghc number"),
    ghc_exp: Joi.string().optional().label("Ghc exp"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateUserValidator = (params) => {
  const schema = Joi.object({
    gender: Joi.string().optional().label("gender"),
    dob: Joi.string().optional().label("dob"),
    phone: Joi.string().optional().label("Phone"),
    address: Joi.string().optional().label("Address"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const sendCodeValidator = (params) => {
  const schema = Joi.object({
    phone: Joi.string().optional().label("Phone"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const verifyCodeValidator = (params) => {
  const schema = Joi.object({
    phone: Joi.string().optional().label("Phone"),
    code: Joi.string().optional().label("Code"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const createUserValidator = (params) => {
  const schema = Joi.object({
    email: Joi.string().required().label("Email"),
    profile_name: Joi.string().required().label("Profile Name"),
    last_login: Joi.string().optional().label("Last Login"),
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().label("Password"),
    token: Joi.string().optional().label("Token"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateUserNotificationValidator = (params) => {
  const schema = Joi.object({
    id: Joi.string().optional().label("Id"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  updateImageValidator,
  updateAddressValidator,
  updateGenderValidator,
  updateTokenValidator,
  updatePhoneValidator,
  updateGhcValidator,
  updateUserValidator,
  sendCodeValidator,
  verifyCodeValidator,
  createUserValidator,
  loginUserValidator,
  updateUserNotificationValidator,
};
