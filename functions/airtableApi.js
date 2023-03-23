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
  return response;
};

const markCouponAsUsedApi = async (couponId, userId, userCoupons) => {
  // var tempArray = userInfo?.user?.Coupons ? userInfo?.user?.Coupons : [];
  var newCoupons = [...userCoupons, couponId];
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
  await axios.post("https://eook2qc3bg2tggy.m.pipedream.net", response);
  return response;
};
module.exports = {
  updateOrderStatusApi,
  markCouponAsUsedApi,
};