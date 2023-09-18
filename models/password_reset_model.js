const { Schema, model } = require('mongoose');


const passwordResetSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentCode: {
        type: String,
        required: true,
    },
    oldCodes: {
        type: Array,
        default: [],
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const passwordResetWorkerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true,
    },
    currentCode: {
        type: String,
        required: true,
    },
    oldCodes: {
        type: Array,
        default: [],
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const PasswordReset = model('PasswordReset', passwordResetSchema);
const WorkerPasswordReset = model('WorkerPasswordReset', passwordResetWorkerSchema);

module.exports.PasswordReset = PasswordReset;
module.exports.WorkerPasswordReset = PasswordReset;