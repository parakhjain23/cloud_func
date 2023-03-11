require("dotenv").config();
const axios = require("axios");
const { CREATE_ORDER_URL, RAZORPAY_URL } = require("./constants");

const createOrderAPI = async (payload) => {
  return await axios.post(CREATE_ORDER_URL, payload, {
    headers: {
      "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
    },
  });
};
const fetchCheckoutByCheckoutId = async (checkoutId) => { };

module.exports = { createOrderAPI, fetchCheckoutByCheckoutId };
