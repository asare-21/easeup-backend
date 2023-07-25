const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const updateWorkerProfileValidator = (params) => {
  const schema = Joi.object({
    selfie: Joi.string().optional().label("Selfie"),
    ghanaCardDetails: Joi.object({
      gh_card_image_front: Joi.string().required().label("Gh card image front"),
      gh_card_image_back: Joi.string().required().label("Gh card image back"),
      gh_card_to_face: Joi.string().required().label("Gh card to face"),
      ghc_number: Joi.string().required().label("Gh card number"),
      ghc_exp: Joi.string().required().label("Gh card expirary date"),
    }).optional(),
    age_doc: Joi.string().optional().label("Age"),
    proof_skill: Joi.string().optional().label("Proof Skiil"),
    insurance_doc: Joi.string().optional().label("Insurance Doc"),
    address: Joi.object({
      address: Joi.string().required().label("Address"),
      latlng: Joi.array().required().label("Latlng"),
    }).optional(),
    latlng: Joi.array().optional().label("Latlng"),
    gender: Joi.string().optional().label("Gender"),
  })
    .strict()
    .min(1);

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerPhoneValidator = (params) => {
  const schema = Joi.object({
    phone: Joi.string().required().label("Phone"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerPhoneVerifyCodeValidator = (params) => {
  const schema = Joi.object({
    phone: Joi.string().required().label("Phone"),
    code: Joi.string().required().label("Code"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  updateWorkerProfileValidator,
  updateWorkerPhoneValidator,
  updateWorkerPhoneVerifyCodeValidator,
};
