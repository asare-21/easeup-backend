const Joi = require("joi");
const { JoiValidator } = require("../../joi.validator");

const updateWorkerProfileImageValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    selfie: Joi.string().optional().label("Selfie"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerGhImagesValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    gh_card_image_front: Joi.string().required().label("Gh card image front"),
    gh_card_image_back: Joi.string().required().label("Gh card image back"),
    gh_card_to_face: Joi.string().required().label("Gh card to face"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerAgeValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    age_doc: Joi.string().optional().label("Age"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerProofOfSkillValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    proof_skill: Joi.string().required().label("Proof Skiil"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerInsuranceValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    insurance_doc: Joi.string().required().label("Insurance Doc"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerAddressValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    address: Joi.string().required().label("Address"),
    latlng: Joi.string().optional().label("Latlng"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerGenderValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    gender: Joi.string().required().label("Gender"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerPhoneValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    phone: Joi.string().required().label("Phone"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const updateWorkerPhoneVerifyCodeValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    phone: Joi.string().required().label("Phone"),
    code: Joi.string().required().label("Code"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  updateWorkerProfileImageValidator,
  updateWorkerGhImagesValidator,
  updateWorkerAgeValidator,
  updateWorkerProofOfSkillValidator,
  updateWorkerInsuranceValidator,
  updateWorkerAddressValidator,
  updateWorkerGenderValidator,
  updateWorkerPhoneValidator,
  updateWorkerPhoneVerifyCodeValidator,
};

