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

const PasswordReset = model('PasswordReset', passwordResetSchema);

module.exports.PasswordReset = PasswordReset;