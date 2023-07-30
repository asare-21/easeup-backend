const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const profileCommentsValidator = (params) => {
  const schema = Joi.object({
    comment: Joi.string().required().label("Comment"),
    image: Joi.string().required().label("Image"),
    from: Joi.string().required().label("From"),
    post: Joi.string().required().label("Post"),
    name: Joi.string().required().label("Name"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileChargeValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    charge: Joi.number().required().label("Charge"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileSkillsUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    skills: Joi.array().required().label("Skiils"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileBioUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    bio: Joi.string().required().label("Bio"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileIGUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    ig: Joi.string().required().label("IG"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileTwitterUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    twitter: Joi.string().required().label("Twitter"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profilePortfolioUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    media: Joi.array().required().label("Media"),
    description: Joi.string().required().label("Description"),
    thumbnail: Joi.string().optional().label("Thumbnail"),
    image: Joi.boolean().optional().label("image"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileWorkRadiusUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    radius: Joi.number().required().label("Raduis"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileBookingStatusUpdateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Ref"),
    client: Joi.string().optional().label("Client"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileReceieveWorkerReviewValidator = (params) => {
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
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const availableSlotsValidator = (params) => {
  const schema = Joi.object({
    workers: Joi.array().required().label("Workers"),
    day: Joi.string().optional().label("Day"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const bookSlotValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().required().label("Client"),
    skills: Joi.array().optional().label("Skills"),
    name: Joi.string().required().label("name"),
    fee: Joi.number().optional().label("fee"),
    latlng: Joi.array().required().label("latlng"),
    image: Joi.string().optional().label("Image"),
    workerImage: Joi.string().required().label("Worker Image"),
    day: Joi.string().required().label("Day"),
    date: Joi.string().required().label("Date"),
    end: Joi.string().required().label("End"),
    photos: Joi.array().optional().label("Photos"),
    clientName: Joi.string().required().label("ClientName"),
    basePrice: Joi.number().optional().label("Base Price"),
    ref: Joi.string().required().label("Ref"),
    slot: Joi.string().required().label("Slot id"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const refundPaymentValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    reason: Joi.string().optional().label("Reason"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateLocationValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().optional().label("Client"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateDateValidator = (params) => {
  const schema = Joi.object({
    worker: Joi.string().required().label("Worker"),
    client: Joi.string().optional().label("Client"),
    date: Joi.string().iso().optional().label("Date"),
    day: Joi.string().iso().optional().label("Day"),
    ref: Joi.string().optional().label("Ref"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

module.exports = {
  profileCommentsValidator,
  profileChargeValidator,
  profileSkillsUpdateValidator,
  profileBioUpdateValidator,
  profileIGUpdateValidator,
  profileTwitterUpdateValidator,
  profilePortfolioUpdateValidator,
  profileWorkRadiusUpdateValidator,
  profileBookingStatusUpdateValidator,
  profileBookingStatusUpdateValidator,
  profileReceieveWorkerReviewValidator,
  availableSlotsValidator,
  bookSlotValidator,
  refundPaymentValidator,
  updateLocationValidator,
  updateDateValidator,
};
