const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      required: [true, 'Please provide a title'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [300, 'A review comment cannot exceed 300 characters'],
      required: [true, 'Please provide a comment for your review'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// Think composite keys in SQL
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  // console.log(result);
  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.averageRating || 0,
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', async function () {
  await this.constructor.calculateAvgRating(this.product);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAvgRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
