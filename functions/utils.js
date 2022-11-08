const createOrderPayLoadForPickUp = (lineItems) => {
  return {
    draft_order: {
      line_items: lineItems,
      financial_status: "pending",
    },
  };
};

const createOrderPayLoadForHomeDilevery = (userInfo, lineItems) => {
  return {
    order: {
      line_items: lineItems,
      customer: {
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        email: userInfo.email,
      },
      billing_address: {
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        address1: userInfo.address1,
        phone: userInfo.phone,
        city: userInfo.city,
        province: userInfo.state,
        country: userInfo.country,
        zip: userInfo.zip,
      },
      shipping_address: {
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        address1: userInfo.address1,
        phone: userInfo.phone,
        city: userInfo.city,
        province: userInfo.state,
        country: userInfo.country,
        zip: userInfo.zip,
      },
      email: userInfo.email,
      financial_status: "pending",
      notify_customer: true,
      send_fulfillment_receipt: true,
    },
  };
};

const createLineItemsFromCheckoutLineItems = () => {};

module.exports = {
  createLineItemsFromCheckoutLineItems,
  createOrderPayLoadForHomeDilevery,
  createOrderPayLoadForPickUp,
};
