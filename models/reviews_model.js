const {
    Schema,
    model
} = require('mongoose');
const cron = require('node-cron');
const { workerModel } = require('./worker_models');
const { workerProfileModel } = require('./worker_profile_model');

const reviewSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },
    name: {
        type: String,
        required: true

    },
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    userImage: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    images: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});

module.exports.reviewModel = model('Review', reviewSchema);

// cron job to udpate users rating
cron.schedule('*/15 * * * *', async () => {
    try {
        // Fetch all reviews for workers
        const reviews = await this.reviewModel.find({});

        // Calculate the new ratings for each worker
        const workerRatings = {};
        reviews.forEach((review) => {
            const { worker, rating } = review;
            if (!(worker in workerRatings)) {
                workerRatings[worker] = [];
            }
            workerRatings[worker].push(rating);
        });

        // Update the workerModel with the new ratings
        for (const workerId of Object.keys(workerRatings)) {
            const ratings = workerRatings[workerId];
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            await workerProfileModel.findOneAndUpdate({ worker: workerId }, { $set: { rating: averageRating, jobs: ratings.length ?? 0 } });
        }

        console.log('Cron job completed successfully.');
    } catch (error) {
        console.error('Error executing cron job:', error);
    }
});