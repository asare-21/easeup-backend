const Joi = require("joi");
const { JoiValidator } = require("../../joi.validator");

const workerProfileCommentsValidator = (params) => {
  const schema = Joi.object({
    comment: Joi.string().required().label("Comment"),
    image: Joi.string().required().label("Image"),
    from: Joi.string().required().label("From"),
    post: Joi.string().required().label("Post"),
    name: Joi.string().required().label("Name"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileChargeValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    charge: Joi.string().required().label("Charge"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileSkillsUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    skills: Joi.string().required().label("Skiils"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileBioUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    bio: Joi.string().required().label("Bio"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileIGUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    ig: Joi.string().required().label("IG"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileTwitterUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    twitter: Joi.string().required().label("Twitter"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfilePortfolioUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    media: Joi.string().required().label("Media"),
    description: Joi.string().required().label("Description"),
    thumbnail: Joi.string().optional().label("Thumbnail"),
    image: Joi.string().optional().label("image"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileWorkRadiusUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    radius: Joi.number().required().label("Raduis"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileBookingStatusUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Ref"),
    client: Joi.string().optional().label("Client"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerProfileReceieveWorkerReviewValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("worker"),
    user: Joi.string().optional().label("User"),
    rating: Joi.number().optional().label("Rating"),
    review: Joi.string().optional().label("review"),
    userImage: Joi.string().optional().label("User Image"),
    name: Joi.string().optional().label("Name"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerAvailableSlotsValidator = (params) => {
  const schema = Joi.object({
    workers: Joi.array().required().label("Workers"),
    day: Joi.string().optional().label("Day"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerBookSlotValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().required().label("Client"),
    skills: Joi.string().optional().label("Skills"),
    name: Joi.string().required().label("name"),
    fee: Joi.string().optional().label("fee"),
    latlng: Joi.number().required().label("latlng"),
    image: Joi.string().optional().label("Image"),
    workerImage: Joi.string().required().label("Worker Image"),
    day: Joi.string().string().label("Day"),
    photos: Joi.string().optional().label("Photos"),
    clientName: Joi.string().required().label("ClientName"),
    basePrice: Joi.string().optional().label("Base Price"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerRefundPaymentValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    reason: Joi.string().optional().label("Reason"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerUpdateLocationValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().optional().label("Client"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

const workerUpdateDateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().optional().label("Client"),
    date: Joi.string().iso().optional().label("Date"),
    day: Joi.string().iso().optional().label("Day"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return joiValidationResult;
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  workerProfileCommentsValidator,
  workerProfileChargeValidator,
  workerProfileSkillsUpdateValidator,
  workerProfileBioUpdateValidator,
  workerProfileIGUpdateValidator,
  workerProfileTwitterUpdateValidator,
  workerProfilePortfolioUpdateValidator,
  workerProfileWorkRadiusUpdateValidator,
  workerProfileBookingStatusUpdateValidator,
  workerProfileBookingStatusUpdateValidator,
  workerProfileReceieveWorkerReviewValidator,
  workerAvailableSlotsValidator,
  workerBookSlotValidator,
  workerRefundPaymentValidator,
  workerUpdateLocationValidator,
  workerUpdateDateValidator,
};
