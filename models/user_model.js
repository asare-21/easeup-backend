const {
    Schema,
    model
} = require('mongoose');

const addressSchema = new Schema({
    address: {
        type: String,
        default: ''
    },
    latlng: {
        type: Array,
        default: []
    }
})

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },

  profile_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: addressSchema,
    default: {},
  },
  code: {
    type: String,
    default: "",
  },
  email_verified: {
    type: Boolean,
    default: true,
  },
  date_joined: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    required: true,
  },
  profile_picture: {
    type: String,
    default: "",
  },
  dob: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    default: "",
  },
  rooms: {
    type: [String],
    default: [],
  },
  ghc_number: {
    type: String,
    default: "",
  },
  ghc_exp: {
    type: String,
    default: "",
  },
  ghc_image: {
    type: Array,
    default: [], // shoild contains the front and back image and image of the worker holding the card to face
  },
  googleId: {
    type: String,
    default: "",
  },
  facebookId: {
    type: String,
    default: "",
  },
  twitterId: {
    type: String,
    default: "",
  },
  displayName: {
    type: String,
    default: "",
  },
});

module.exports.userModel = model('User', userSchema);