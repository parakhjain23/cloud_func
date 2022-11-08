// import axios from "axios";
const axios = require("axios");
const { CREATE_ORDER_URL } = require("./constants");
// import { CREATE_ORDER_URL } from "./constants";

const createOrderAPI = async (payload) => {
  return await axios.post(CREATE_ORDER_URL, payload, {
    headers: {
      "X-Shopify-Access-Token": "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",
    },
  });
};
const fetchCheckoutByCheckoutId = async (checkoutId) => {};

module.exports = { createOrderAPI, fetchCheckoutByCheckoutId };
