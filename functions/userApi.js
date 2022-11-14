const axios = require("axios");

const getCustomerByEmailAddress = async (email) => {
  const url = `https://halfkg.myshopify.com/admin/api/2022-10/customers/search.json?fields=id,+email,+addresses,+first_name,+last_name,+phone&query=email:${email}`;
  const result = await axios.get(url, {
    headers: {
      "X-Shopify-Access-Token": "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",
    },
  });
  return result?.data?.customers;
};

const createCutomerFromEmail = async (email, firstName, lastName) => {
  const response = await axios.post(
    `https://halfkg.myshopify.com/admin/api/2022-10/customers.json`,
    {
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        verified_email: true,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": "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",
      },
    }
  );
  return response?.data?.customer
};

module.exports = {
  getCustomerByEmailAddress,
  createCutomerFromEmail,
};
