const functions = require("firebase-functions");
const { CREATE_ORDER_URL } = require("./constants");
require("dotenv").config();
const algoliasearch = require("algoliasearch");
const axios = require("axios");
const {
  createOrderPayLoadForPickUp,
  createOrderPayLoadForHomeDilevery,
} = require("./utils");

const { createOrderAPI } = require("./api");
const {
  getCustomerByEmailAddress,
  createCutomerFromEmail,
  updateUserInfoApi,
} = require("./userApi");
const { updateUserAddress } = require("./userController");
const { updateOrderStatusApi, markCouponAsUsedApi } = require("./airtableApi");
let finalArryaToPush = [];
let finalObjectToPush = {};

const client = algoliasearch(
  process.env.APPLICATION_ID,
  process.env.WRITE_API_KEY
);
const index = client.initIndex("AirtableProduct");

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// let obj = {
//   link: "https://halfkg.myshopify.com/admin/api/2022-10/products.json?limit=250",
//   min: Number.MAX_VALUE,
//   max: Number.MIN_VALUE,
//   total_quantity: 0,
//   isNextPage: false,
// };

let obj = {
  sortedLink: `https://api.airtable.com/v0/appttPmFTvYcBaktb/Variants?pageSize=100&${encodeURI(
    "fields[]=Product&fields[]=MRP&fields[]=Quantity&fields[]=Product copy&fields[]=Variant Label&fields[]=Halfkg_Price&fields[]=Images&fields[]=Total amount&fields[]=Weight&fields[]=Weight Unit&fields[]=Total amount&fields[]=variant count&fields[]=Product_Id&fields[]=Vendor&fields[]=min&fields[]=max&fields[]=status&fields[]=body_html&fields[]=product_type&fields[]=tags&fields=BeforeTax"
  )}`,
  link: `https://api.airtable.com/v0/appttPmFTvYcBaktb/Variants?pageSize=100&${encodeURI(
    "fields[]=Product&fields[]=MRP&fields[]=Quantity&fields[]=Product copy&fields[]=Variant Label&fields[]=Halfkg_Price&fields[]=Images&fields[]=Total amount&fields[]=Weight&fields[]=Weight Unit&fields[]=Total amount&fields[]=variant count&fields[]=Product_Id&fields[]=Vendor&fields[]=min&fields[]=max&fields[]=status&fields[]=body_html&fields[]=product_type&fields[]=tags&fields=BeforeTax"
  )}`,
  pageSize: 100,
  offset: null,
  isNextPage: true,
};

// getAndCreateUser
// create user if not exist
exports.getAndCreateUser = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { email, firstName, lastName } = request.body;
    const customers = await getCustomerByEmailAddress(email);
    if (customers?.length > 0) return response.send({ customer: customers[0] });
    const createuserResponse = await createCutomerFromEmail(
      email,
      firstName,
      lastName
    );
    return response.send({ customer: createuserResponse });
  } catch (error) {
    return response.status(500).json({ error });
  }
});

exports.updateOrderStatusToPaid = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { order, payment, payment_link } = request.body;
    await updateOrderStatusApi(order?.entity?.notes?.orderRecordId);
    if (
      order?.entity?.notes?.coupon != null &&
      order?.entity?.notes?.coupon != undefined
    ) {
      await markCouponAsUsedApi(
        order?.entity?.notes?.coupon,
        order?.entity?.notes?.userInfoState
      );
    }
  } catch (error) {
    return response.status(500).json({ error });
  }
});

// updateUserInfo
// update use info
exports.updateUserInfo = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { userInfo } = request.body;
    if (
      userInfo?.id === undefined ||
      userInfo?.id === "" ||
      userInfo?.id === null
    ) {
      throw "Please provide valid id";
    }
    const customerToReturn = await updateUserInfoApi(userInfo);
    response.send({ customer: customerToReturn });
  } catch (error) {
    response.status(500).json({ error });
  }
});

// updateUserAddress
// update use address
exports.createAndUpdateUserAddress = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { userId, address = {} } = request.body;
    const addressToRetuen = await updateUserAddress(userId, address);
    response.json({ address: addressToRetuen });
  } catch (error) {
    response.status(500).json({ error });
  }
});

//clear algolia index then add data to algolia

exports.clearAndFetchDataFromAlgolia = functions.https.onRequest(
  async function (request, response) {
    while (obj.isNextPage) {
      const result = await axios.get(obj.link, {
        headers: {
          Authorization: "Bearer keyLqQESyDbpE8JBa",
        },
      });
      obj.offset = result?.data?.offset;
      if (obj.offset == undefined) {
        obj.isNextPage = false;
        break;
      }
      obj.link = `${obj.sortedLink}&offset=${obj.offset}`;
      result?.data?.records?.map((item) => {
        if (item?.fields["status"] != "draft") {
          if (finalObjectToPush[item?.fields["Product_Id"]] != undefined) {
            finalObjectToPush[item?.fields["Product_Id"]]["variants"]?.push({
              id: item?.id,
              ...item?.fields,
              Quantity:
                item?.fields["Quantity"] && item?.fields["Quantity"] > 0
                  ? item?.fields["Quantity"]
                  : 0,
              URL: item?.fields["URL"] ? item?.fields["URL"] : null,
            });
          } else {
            finalObjectToPush[item?.fields?.Product_Id] = {};
            finalObjectToPush[item?.fields?.Product_Id]["id"] =
              item?.fields["Product_Id"];
            finalObjectToPush[item?.fields?.Product_Id]["title"] =
              item?.fields["Product copy"];
            finalObjectToPush[item?.fields?.Product_Id]["body_html"] =
              item?.fields["body_html"] &&
              item?.fields["body_html"] !== undefined
                ? item?.fields["body_html"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["vendor"] =
              item?.fields["Vendor"] && item?.fields["Vendor"] !== undefined
                ? item?.fields["Vendor"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["product_type"] =
              item?.fields["product_type"] &&
              item?.fields["product_type"] !== undefined
                ? item?.fields["product_type"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["tags"] =
              item?.fields["tags"] && item?.fields["tags"] !== undefined
                ? item?.fields["tags"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["variants"] = [
              {
                id: item?.id,
                ...item?.fields,
                Quantity:
                  item?.fields["Quantity"] && item?.fields["Quantity"] > 0
                    ? item?.fields["Quantity"]
                    : 0,
                URL: item?.fields["URL"] ? item?.fields["URL"] : null,
                BeforeTax: item?.fields["BeforeTax"]
                  ? item?.fields["BeforeTax"]
                  : 0,
              },
            ];
            finalObjectToPush[item?.fields?.Product_Id]["total_quantity"] =
              item?.fields["Quantity"] && item?.fields["Quantity"] > 0
                ? item?.fields["Quantity"]
                : 0;
            finalObjectToPush[item?.fields?.Product_Id]["min"] =
              item?.fields["min"] && item?.fields["min"] !== undefined
                ? item?.fields["min"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["max"] =
              item?.fields["max"] && item?.fields["max"] !== undefined
                ? item?.fields["max"]
                : null;
            finalObjectToPush[item?.fields?.Product_Id]["status"] =
              item?.fields["status"] && item?.fields["status"] !== undefined
                ? item?.fields["status"]
                : null;
            // finalObjectToPush[item?.fields?.Product_Id]['image']=item?.fields['Images (from Product)']
          }
        }
      });
    }
    const objectsToSave = Object.entries(finalObjectToPush).map(
      ([objectID, objectData]) => {
        return { objectID, ...objectData };
      }
    );

    await index.clearObjects();
    await index
      .saveObjects(objectsToSave)
      .then(({ objectIDs }) => {
        console.log();
      })
      .catch((error) => {
        console.log(error);
      });
    response.send("api called---Fetch Data Sccessfully---");
  }
);

// CreateOrder Funtion
exports.createOrder = functions.https.onRequest(async function (
  request,
  response
) {
  const body = request.body;
  var orderPayload = {};
  if (body.pickUp) {
    orderPayload = createOrderPayLoadForPickUp(body.lineItems);
  } else {
    orderPayload = createOrderPayLoadForHomeDilevery(
      body.userInfo,
      body.lineItems
    );
  }
  try {
    // 3. create payload for order

    // 4.  create order
    const data = await createOrderAPI(orderPayload);
    response.send(
      JSON.stringify({ payload: "Order Placed", data, body, orderPayload })
    );
    return;
  } catch (error) {
    response.status(401).json({ error, body, orderPayload, CREATE_ORDER_URL });
  }
});

//order creation at the time of razorpay payment
exports.createOrderForPayment = functions.https.onRequest(async function (
  request,
  response
) {
  const { amount, currency } = request.body;
  try {
    const payload = {
      amount: amount,
      currency: currency,
    };
    const result = await axios.post(
      "https://api.razorpay.com/v1/orders",
      payload,
      {
        headers: {
          Authorization: process.env.RAZOR_PAY_KEY_ID_BASE64,
        },
      }
    );
    response.send(result.data);
    return;
  } catch (error) {
    response.status(401).json({ error });
  }
});

exports.getDeviceLocationFromGoogleApi = functions.https.onRequest(
  async function (request, response) {
    const { latitude, longitude } = request.body;
    try {
      const result = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_KEY}`
      );
      let data = result.data;
      var address = {};
      address.address1 = data?.results[0]?.formatted_address;
      address.zip =
        data?.results[0]?.address_components?.find((obj) =>
          obj.types.includes("postal_code")
        )?.long_name || "";

      address.city =
        data?.results[0]?.address_components?.find((obj) =>
          obj.types.includes("locality")
        )?.long_name || "";

      address.province =
        data?.results[0]?.address_components?.find((obj) =>
          obj.types.includes("administrative_area_level_1")
        )?.long_name || "";

      address.country =
        data?.results[0]?.address_components?.find((obj) =>
          obj.types.includes("country")
        )?.long_name || "";

      response.send(address);
    } catch (error) {
      response.json({ error });
    }
  }
);

exports.getAndCreateUserFromMobile = functions.https.onRequest(
  async (request, response) => {
    try {
      const { MobileNo } = request.body;
      // await axios.post("https://eo9kbk61q6mk7ur.m.pipedream.net",{'demo':MobileNo});
      const getCustomerByPhone = await axios.get(
        `https://halfkg.myshopify.com/admin/api/2022-10/customers/search.json?fields=id,+email,+addresses,+first_name,+last_name,+phone&query=phone:${MobileNo}`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );
      // await axios.post("https://eo9kbk61q6mk7ur.m.pipedream.net",getCustomerByPhone?.data)
      if (getCustomerByPhone?.data?.customers?.length > 0) {
        response.send(getCustomerByPhone?.data?.customers[0]);
      }

      const result = await axios.post(
        "https://halfkg.myshopify.com/admin/api/2022-10/customers.json",
        {
          customer: {
            phone: MobileNo,
            verified_email: true,
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );
      // await axios.post("https://eo9kbk61q6mk7ur.m.pipedream.net",{'new':result?.data})
      response.send(result?.data?.customer);
    } catch (error) {
      console.log(error);
      response.json({ error });
    }
  }
);

exports.verifyMobileNumber = functions.https.onRequest(
  async (request, response) => {
    try {
      const { Token } = request.body;
      const result = await axios.post(
        "https://control.msg91.com/api/v5/widget/verifyAccessToken",
        { authkey: process.env.MSG91_AUTH_KEY, "access-token": Token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      response.send(result?.data);
    } catch (error) {
      response.json({ error });
    }
  }
);

exports.getDraftOrderData = functions.https.onRequest(
  async (request, response) => {
    try {
      const { latestDraftOrderId } = request.body;
      const url = `https://halfkg.myshopify.com/admin/api/2022-10/draft_orders/${latestDraftOrderId}.json?fields=shipping_address,+billing_address,+id,+status,+total_tax,+total_price,+line_items,+created_at`;
      // await axios.post("https://eo4m6r2avsfon5s.m.pipedream.net",url)
      const result = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      });
      // await axios.post("https://eo4m6r2avsfon5s.m.pipedream.net",result?.data)
      response.send(result?.data);
    } catch (error) {
      response.json({ error });
    }
  }
);

exports.createDraftOrder = functions.https.onRequest(
  async (request, response) => {
    try {
      const draft_order = request.body;
      // await axios.post('https://eo4m6r2avsfon5s.m.pipedream.net',draft_order)
      const result = await axios.post(
        "https://halfkg.myshopify.com/admin/api/2022-10/draft_orders.json",
        draft_order,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );
      // await axios.post("https://eo4m6r2avsfon5s.m.pipedream.net",result?.data)
      response.send(result?.data);
    } catch (error) {
      response.json({ error });
    }
  }
);

exports.completeDraftOrder = functions.https.onRequest(
  async (request, response) => {
    try {
      const { draftOrderId } = request.body;
      const URL = `https://halfkg.myshopify.com/admin/api/2022-10/draft_orders/${draftOrderId}/complete.json`;
      var result = await axios.put(
        URL,
        { draftOrderId },
        {
          headers: {
            "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
          },
        }
      );
      response.send(result?.data);
    } catch (error) {
      console.log(error);
      response.json({ error });
    }
  }
);
