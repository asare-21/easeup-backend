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

const workerProfileVerificationSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },
    gh_card_image_front: {
        type: String,
        required: false,
        default: ''

    },
    gh_card_image_back: {
        type: String,
        default: '',
        required: false,
    },
    gh_card_to_face: {
        type: String,
        required: false,
        default: ''
    },
    gh_card_verified: {
        type: Boolean,
        default: false,
    },
    gh_card_verified_date: {
        type: Date,
        required: false
    },
    gh_card_verified_by: {
        type: String,
        required: false,
        default: ''
    },
    phone: {
        type: String,
        required: false,
        default: ''
    },
    selfie: {
        type: String,
        required: false,
        default: ''
    },
    selfie_verified: {
        type: Boolean,
        default: false
    },
    age_verfication: {
        type: Boolean,
        default: false,
    },
    age_verification_document: {
        type: String,
        required: false,
        default: ''
    },
    insurance_verified: {
        type: Boolean,
        default: false
    },
    insurance_document: {
        type: String,
        required: false,
        default: ''
    },
    gender: {
        type: String,
        required: false,
        default: ''
    },
    address: {
        type: addressSchema,
        required: false,
        default: {
            address: '',
            latlng: []
        }
    },
    proof_skill: {
        type: String,
        required: false,
        default: ''
    },
    skill_verified: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        required: false,
        default: ''
    },
    ghc_number: {
        type: String,
        default: ''
    },
    ghc_exp: {
        type: String,
        default: ''
    },
});

module.exports.workerProfileVerificationModel = model('WorkerProfileVerification', workerProfileVerificationSchema);
