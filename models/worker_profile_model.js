const {
    Schema,
    model
} = require('mongoose');

const comment = new Schema({
    from: {
        type:String,
        required:true
    },
    comment:{
        type:String,
        required :true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const media = new Schema({
    url: {
        type: String,
        required: false
    },
    image: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    comments:[comment]
});

const workRadius = new Schema({

    latlng: {
        type: [Number],
        required: false
    },
    radius: {
        type: Number,
        required: false
    }
})

const workerProfileSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },
    profile_url: {
        type:String,
        required:true
    },
    bio: {
        type: String,
        default: ''
    },
    name:{
        type: String,
        default:''
    },
    skills: {
        type: [String],
        default: []
    },
    images: {
        type: [media],
        default: []
    },
    rate_hourly: {
        type: Number,
        default: 0
    },
    is_charge_hourly: {
        type: Boolean,
        default: false
    },
    reviews: {
        type: [],
        ref: 'Review',
        default: []
    },
    work_radius: {
        type: workRadius,
        default: {
            latlng:[],
            radius:0
        }
    },
});

module.exports.workerProfileModel = model('WorkerProfile', workerProfileSchema);