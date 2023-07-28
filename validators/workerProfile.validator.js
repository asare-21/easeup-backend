const Joi = require("joi");
const { JoiValidator } = require("../joi.validator");

const profileCommentsValidator = (params) => {
  const schema = Joi.object({
    comment: Joi.string().required().label("Comment"),
    image: Joi.string().required().label("Image"),
    from: Joi.string().required().label("From"),
    postId: Joi.string().required().label("PostId"),
    name: Joi.string().required().label("Name"),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const updateWorkerProfileDetails = (params) => {
  const schema = Joi.object({
    charge: Joi.number().optional().label("Charge"),
    skills: Joi.array().optional().label("Skiils"),
    ig: Joi.string().optional().label("IG"),
    twitter: Joi.string().optional().label("Twitter"),
    bio: Joi.string().optional().label("Bio"),
  }).strict().min(1);

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profilePortfolioUpdateValidator = (params) => {
  const schema = Joi.object({
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
    radius: Joi.object({
      latlng: Joi.array().required().label("Lat lng"),
      radius: Joi.number().required().label("Raduis"),
    }).required(),
  }).strict();

  const joiValidationResult = JoiValidator.validate(schema, params);

  if (joiValidationResult) {
    return { status: 400, msg: joiValidationResult };
  }

  return { status: 200, msg: "success" };
};

const profileBookingStatusUpdateValidator = (params) => {
  const schema = Joi.object({
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
    workerId: Joi.string().required().label("worker"),
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
    photos: Joi.array().optional().label("Photos"),
    clientName: Joi.string().required().label("ClientName"),
    basePrice: Joi.number().optional().label("Base Price"),
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
    date: Joi.date().iso().optional().label("Date"),
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
  updateWorkerProfileDetails,
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
