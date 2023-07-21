const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const updateUserValidator = (params) => {
  const schema = Joi.object({
    gender: Joi.string().optional().label("gender"),
    profile_picture: Joi.string().optional().label("Profile Picture"),
    dob: Joi.string().optional().label("Date of birth"),
    ghanaCardDetails: Joi.object({
      ghanaCardImage: Joi.array().required().label("Ghana card image"),
      ghanaCardNumber: Joi.string().required().label("Ghana card number"),
      ghanaCardExpiry: Joi.string().required().label("Ghana card expiry"),
    })
      .optional()
      .label("Ghana card details"),
    token: Joi.string().optional().label("Token"),
    address: Joi.object({
      address: Joi.string().required().label("Address"),
      latlng: Joi.array().required().label("Latlng"),
    }).optional(),
  })
    .strict()
    .min(1);

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
    email: Joi.string().optional().label("Email"),
    profile_name: Joi.string().optional().label("Profile Name"),
    last_login: Joi.string().optional().label("Last Login"),
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
  updateUserValidator,
  sendCodeValidator,
  verifyCodeValidator,
  createUserValidator,
  updateUserNotificationValidator,
};
