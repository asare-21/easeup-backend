const { Schema, model } = require("mongoose")


const azureCSASchema = new Schema({
    role: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

const AzureCSA = model("AzureCSA", azureCSASchema)

module.exports.AzureCSAModel = AzureCSA