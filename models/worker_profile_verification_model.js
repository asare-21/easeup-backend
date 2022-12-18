const {
    Schema,
    model
} = require('mongoose');


const workerProfileVerificationSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    gh_card_no: {
        type: String,
        default: ''
    },
    gh_card_image_front: {
        type: String,
        required: true
    },
    gh_card_image_back: {
        type: String,
        required: true
    },
    gh_card_verified: {
        type: Boolean,
        default: false,

    },
    gh_card_verified_date: {
        type: Date,
        required: true
    },
    gh_card_issue_date: {
        type: Date,
        required: true
    },
    gh_card_expiry_date: {
        type: Date,
        required: true
    },
    gh_card_issue_place: {
        type: String,
        required: true
    },
    gh_card_sex: {
        type: String,
        required: true
    },
    gh_card_dob: {
        type: Date,
        required: true
    },
    gh_card_name: {
        type: String,
        required: true
    },
    gh_card_nationality: {
        type: String,
        required: true
    },
    gh_card_height: {
        type: String,
        required: true
    },
    police_report_doc: {
        type: String,
        required: true
    },
    police_report_verified: {
        type: Boolean,
        default: false
    },
    selfie: {
        type: String,
        required: true
    },
    selfie_verified: {
        type: Boolean,
        default: false
    },
});

module.exports = model('WorkerProfileVerification', workerProfileVerificationSchema);
