// Each worker has 15 slots per day
// Not two slots should be less than 30 minutes apart
// Bookings should be made 3 hours in advance

// Clients should only be able to book slots that are 3 hours in advance
// Clients should not be able to book the same worker more than once a day

const { Schema, model } = require('mongoose');
const { workerProfileModel } = require('./worker_profile_model');
const cron = require('node-cron');

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
    },
    slot: {
        type: Schema.Types.ObjectId,
        ref: 'Timeslot',
        required: true,
        immutable: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job Plan',
        required: true,
        immutable: true
    }
}, {
    timestamps: true
})





module.exports.bookingModel = model('Booking Model', bookingSchema);


//cron job to find total amount earned every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    try {
        // Calculate the total amount earned for each worker
        const totalAmountEarnedPerWorker = await this.bookingModel.aggregate([
            {
                $match: { completed: true, cancelled: false } // Filter completed and non-cancelled bookings
            },
            {
                $group: {
                    _id: '$worker',
                    totalAmount: { $sum: '$basePrice' } // Calculate the sum of basePrice for each worker
                }
            }
        ]);

        // Update the workerModel with the total amount earned
        for (const { _id, totalAmount } of totalAmountEarnedPerWorker) {
            await workerProfileModel.updateOne({ _id }, { $set: { amount_earned: totalAmount } });
        }

        console.log('Cron job completed successfully.');
    } catch (error) {
        console.error('Error executing cron job:', error);
    }
});