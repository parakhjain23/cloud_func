// import axios from "axios";
const axios = require("axios");
const { CREATE_ORDER_URL, RAZORPAY_URL } = require("./constants");
// import { CREATE_ORDER_URL } from "./constants";

const createOrderAPI = async (payload) => {
  return await axios.post(CREATE_ORDER_URL, payload, {
    headers: {
      "X-Shopify-Access-Token": "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",
    },
  });
};
const fetchCheckoutByCheckoutId = async (checkoutId) => { };

const createOrderForPayment = async (data) => {
  const payload = {
    "amount": data.amount,
    "currency": data.currency
  }
  const response = await axios.post('https://api.razorpay.com/v1/orders', payload, {
    headers: {
      "Authorization": 'Basic cnpwX3Rlc3RfVjdlYUx4YlA5V2s1R1Y6S2VRZUlOaWlTMEJRN2VhbWNjWmxlcjM0'
    }
  })
  // const result = response.json();
  await axios.post('https://eo4zs3am9hd2l7r.m.pipedream.net', response)
  return response;
}
module.exports = { createOrderAPI, fetchCheckoutByCheckoutId, createOrderForPayment };
