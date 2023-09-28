// Each worker has 15 slots per day
// Not two slots should be less than 30 minutes apart
// Bookings should be made 3 hours in advance

// Clients should only be able to book slots that are 3 hours in advance
// Clients should not be able to book the same worker more than once a day

const { Schema, model } = require('mongoose');
const { workerProfileModel } = require('./worker_profile_model');
const cron = require('node-cron');
const admin = require('firebase-admin');
const { log } = require('npmlog');
const { notificationUserModel, notificationWorkerModel } = require('./nofications');
const bookingSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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

//cron job to cancel bookings that past but still have an upcoming status
// // cron job should run every 24 hours
// cron.schedule('0 0 * * *', async () => {
//     try {
//         // Find all bookings that are not cancelled and have a date that is less than today
//         const bookings = await this.bookingModel.find({ cancelled: false, isPaid: true, completed: false, date: { $lt: new Date() } }).populate('worker').populate('client').populate("slot").exec();

//         // Cancel all the bookings
//         for (const booking of bookings) {
//             const updatedBooking = await this.bookingModel.updateOne({ _id: booking._id }, { $set: { cancelled: true, cancelledReason: 'Booking has been cancelled automatically.' } }, { new: true });
//             // send notifications to the client and worker with the reason for cancellation using firebase admin
//             const messageToClient = {
//                 notification: {
//                     title: 'Booking Cancelled',
//                     body: `Your booking with ${booking.worker.name} has been cancelled automatically. This is because the booking date has passed.`
//                 },
//                 data: {
//                     booking: booking._id.toString(),
//                     workerName: booking.worker.name,
//                     type: 'booking_cancelled'
//                 },
//                 token: booking.client.deviceToken
//             };
//             const messageToWorker = {
//                 notification: {
//                     title: 'Booking Cancelled',
//                     body: `Your booking with ${booking.clientName} has been cancelled automatically. This is because the booking date has passed.`
//                 },
//                 data: {
//                     booking: booking._id.toString(),
//                     clientName: booking.clientName,

//                     type: 'booking_cancelled'
//                 },
//                 token: booking.worker.deviceToken
//             };

//             // Send the notifications
//             const userFBNotificationPromise = admin.messaging().send(
//                 messageToClient
//             )
//             const workerFBNotificationPromise = admin.messaging().send(
//                 messageToWorker
//             )
//             // Save to in-app notifications
//             const userNotificationPromise = notificationUserModel.create({
//                 user: booking.client._id,
//                 title: messageToClient.notification.title,
//                 body: messageToClient.notification.body,
//                 type: "booking_cancelled",
//                 booking: booking._id
//             });
//             const workerNotificationPromise = notificationWorkerModel.create({
//                 worker: booking.worker._id,
//                 title: messageToWorker.notification.title,
//                 body: messageToWorker.notification.body,
//                 type: "booking_cancelled",
//                 booking: booking._id
//             });

//             await Promise.all([
//                 workerNotificationPromise,
//                 userNotificationPromise,
//                 userFBNotificationPromise,
//                 workerFBNotificationPromise
//             ])

//         }

//         console.log('Cron job completed successfully.');
//     } catch (error) {
//         console.error('Error executing cron job:', error);
//     }
// });