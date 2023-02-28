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

    post: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

});

module.exports.commentModel = model('Comment', commentSchema);