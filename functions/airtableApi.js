const axios = require("axios");
require("dotenv").config();
const airtableHeader = {
  headers: {
    Authorization: process.env.AIRTABLE_API_KEY,
  },
};
const updateOrderStatusApi = async (orderRecordId) => {
  const response = await axios.patch(
    `https://api.airtable.com/v0/appttPmFTvYcBaktb/Orders`,
    {
      records: [
        {
          id: orderRecordId,
          fields: {
            "Financial Status": "paid",
          },
        },
      ],
    },
    airtableHeader
  );
  // await axios.post(
  //   "https://1e49e7c457289c65a8feda3cc72b8ccb.m.pipedream.net",
  //   response
  // );
  return response;
};

const markCouponAsUsedApi = async (couponId, userCoupons, userId) => {
  // await axios.post("https://1e49e7c457289c65a8feda3cc72b8ccb.m.pipedream.net", {
  //   message: "inside coupon function",
  // });
  const properCoupon = JSON.parse(userCoupons);
  var newCoupons = [...properCoupon, couponId];
  // await axios.post(
  //   "https://1e49e7c457289c65a8feda3cc72b8ccb.m.pipedream.net",
  //   newCoupons
  // );
  const response = await axios.patch(
    `https://api.airtable.com/v0/appttPmFTvYcBaktb/Customers`,
    {
      records: [
        {
          id: userId,
          fields: {
            Coupons: newCoupons,
          },
        },
      ],
    },
    airtableHeader
  );
  // await axios.post(
  //   "https://1e49e7c457289c65a8feda3cc72b8ccb.m.pipedream.net",
  //   response
  // );
  return response;
};
module.exports = {
  updateOrderStatusApi,
  markCouponAsUsedApi,
};
