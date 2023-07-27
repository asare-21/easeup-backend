// Each worker has 15 slots per day
// Not two slots should be less than 30 minutes apart
// Bookings should be made 3 hours in advance

// Clients should only be able to book slots that are 3 hours in advance
// Clients should not be able to book the same worker more than once a day

const { Schema, model } = require('mongoose')

const bookingSchema = new Schema({
    worker: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        // start time of the slot
        type: Date,
        default: Date.now
    },
    endTime: {
        // end time of the slot
        type: Date,
        default: null
    },
    skills: {
        type: Array,
        required: true
    },
    commitmentFee: {
        type: Number,
        default: 50
    },
    ref: {
        type: String,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    cancelledReason: {
        type: String,
        default: ''
    },
    latlng: {
        type: [Number],
        required: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    started: {
        type: Boolean,
        default: false
    },
    pending: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: true
    },
    workerImage: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    photos: {
        type: Array,
        required: true,
    },
    basePrice: {
        type: Number,
        required: true
    },
    workerPhone: {
        type: String,
        required: true
    },
    clientPhone: {
        type: String,
        required: true
    },
    contactedCustomer: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})





module.exports.bookingModel = model('Booking Model', bookingSchema);