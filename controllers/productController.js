const path = require('path');
const Product = require('../models/Product');
const { NotFoundError, BadRequestError } = require('../errors');
const {
  StatusCodes: { CREATED, OK },
} = require('http-status-codes');

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findById(productId).populate('reviews');

  if (!product) {
    throw new NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError(`No product with ID: ${productId}`);
  }

  await product.remove();

  res.status(OK).json({ msg: `Product with ID: ${productId} removed.` });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError('No file uploaded.');
  }

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please upload an image (.jpg, .jpeg, or .png)');
  }

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError(`Upload cannot exceed 1MB`);
  }

  const uploadPath = path.join(
    __dirname,
    `../public/uploads/${productImage.name}`
  );
  await productImage.mv(uploadPath);

  res.status(OK).json({ src: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
