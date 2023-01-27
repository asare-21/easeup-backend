const {
    Schema,
    model
} = require('mongoose');

/**
 *   /// Comment by users on the worker profile's posts
  String? from;
  String? comment;
  String? date;

  Comments({required this.from, required this.comment, required this.date});
 */

const commentSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },
    from: {
        type: String,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },

});

module.exports.commentModel = model('Comment', commentSchema);