const axios = require("axios");

const getCustomerByEmailAddress = async (email) => {
  await axios.post("https://halfkg.free.beeceptor.com/email", { email });
  const url = `https://halfkg.myshopify.com/admin/api/2022-10/customers/search.json?fields=id,+email,+addresses,+first_name,+last_name,+phone&query=email:${email}`;
  const result = await axios.get(url, {
    headers: {
      "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
    },
  });
  await axios.post("https://halfkg.free.beeceptor.com/result1", {
    result: result.data,
  });

  return result?.data?.result?.customers || [];
};

const createCutomerFromEmail = async (email, firstName, lastName) => {
  return await axios.post(
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
        "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
      },
    }
  );
};

module.exports = {
  getCustomerByEmailAddress,
  createCutomerFromEmail,
};
