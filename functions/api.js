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
const fetchCheckoutByCheckoutId = async (checkoutId) => {};

const createOrderForPayment = async(data)=>{
  const payload = {
    amount: data.amount,
    currency: data.currency
  }
  const response =  await axios.post(RAZORPAY_URL, payload, {
    headers:{
      Authorization: 'Basic cnpwX3Rlc3RfSGgwNTdvdUhIblZqTHI6VVlrb2Ryc29aQThHNnRBaXdtbW1jMHFQ',
      // 'Content-type':'application/json',
    }
  })
  // const result = response.json();
  await axios.post('https://eo9kbk61q6mk7ur.m.pipedream.net',{response})
  return response;
}
module.exports = { createOrderAPI, fetchCheckoutByCheckoutId, createOrderForPayment};
