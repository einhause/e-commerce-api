const Review = require('../models/Review');
const Product = require('../models/Product');
const {
  StatusCodes: { OK, CREATED },
} = require('http-status-codes');
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const { userId } = req.user;

  // check if valid product
  const isValidProduct = Product.findById(productId);
  if (!isValidProduct) {
    throw new NotFoundError(`No product with ID: ${productId}`);
  }

  // check if user already submitted review
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: userId,
  });
  if (alreadySubmitted) {
    throw new BadRequestError(
      'You already submitted a review for this product'
    );
  }

  req.body.user = userId;
  const review = await Review.create(req.body);
  res.status(CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price',
  });
  res.status(OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findById(reviewId).populate({
    path: 'product',
    select: 'name company price',
  });

  if (!review) {
    throw new NotFoundError(`No review with ID: ${reviewId}`);
  }

  res.status(OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new NotFoundError(`No review with ID: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res
    .status(OK)
    .json({ msg: `Review with ID: ${reviewId} updated successfully` });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new NotFoundError(`No review with ID: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  await review.remove();

  res
    .status(OK)
    .json({ msg: `Review with ID: ${reviewId} deleted successfully` });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
