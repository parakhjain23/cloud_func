const { default: axios } = require("axios");
const { ADMIN_API_KEY } = require("./constants");

const getCustomerByEmailAddress = async (email) => {
  const url =
    "https://halfkg.myshopify.com/admin/api/2022-10/customers/search.json?fields=id,+email,+addresses,+first_name,+last_name,+phone&query=email:garg.sid6665@gmail.com";

  axios.post("https://halfkg.free.beeceptor.com/url", { url, email });

  return await fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
    },
  });
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
