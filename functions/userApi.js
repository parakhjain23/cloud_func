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



const retirveAllAddressOfUser = async (userId) => {
  return (await axios.get(`https://halfkg.myshopify.com/admin/api/2022-10/customers/${userId}/addresses.json?limit=1`, shopifyAdminHeader))?.data?.addresses || [];
}

const createDefaultAddressOfUser = async (userId, address) => {
  return (await axios.post(
    `https://halfkg.myshopify.com/admin/api/2022-10/customers/${userId}/addresses.json`,
    { address },
    shopifyAdminHeader

  )).data.customer_address
}

const editDefaultAddress = async (userId, addressId, address) => {
  return (await axios.put(
    `https://halfkg.myshopify.com/admin/api/2022-10/customers/${userId}/addresses/${addressId}.json`,
    { address },
    shopifyAdminHeader

  )).data.customer_address
}


module.exports = {
  getCustomerByEmailAddress,
  createCutomerFromEmail,
  retirveAllAddressOfUser,
  createDefaultAddressOfUser,
  editDefaultAddress
};
