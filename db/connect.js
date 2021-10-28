const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose
    .connect(url)
    .then(() => {
      console.log('CONNECTED TO MONGODB');
    })
    .catch((err) => console.error(err));
};

module.exports = connectDB;
