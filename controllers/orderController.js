const Order = require('../models/Order');
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

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError(`No order found with ID: ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  res.status(OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
  const { items, tax, shippingFee } = req.body;
  if (!items || items.length < 1) {
    throw new BadRequestError('No items in your cart');
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError('Tax and shipping fee not provided');
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    // check if product exists in DB
    const dbProduct = await Product.findById(item.product);
    if (!dbProduct) {
      throw new NotFoundError(`No product with ID: ${item.product}`);
    }

    // construct a new order item
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    // calc subtotal
    subtotal += item.amount * price;
  }

  // calc total
  const total = tax + shippingFee + subtotal;

  // get client secret (stripe)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  // create order
  const order = Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(CREATED).json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError(`No order found with ID: ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
