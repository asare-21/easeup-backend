const { model, Schema } = require('mongoose')


const timeslotSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking Model',
        default: null
        
    },
    isPast: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports.timeslotModel = model('Timeslot', timeslotSchema)