const functions = require("firebase-functions");
const { CREATE_ORDER_URL } = require("./constants");
require("dotenv").config();
const algoliasearch = require("algoliasearch");
const axios = require("axios");
const {
  createOrderPayLoadForPickUp,
  createOrderPayLoadForHomeDilevery,
} = require("./utils");

const { createOrderAPI} = require("./api");
const {
  getCustomerByEmailAddress,
  createCutomerFromEmail,
  updateUserInfoApi,
} = require("./userApi");
const { updateUserAddress } = require("./userController");
let finalArryaToPush = [];
const client = algoliasearch(
  process.env.APPLICATION_ID,
  process.env.WRITE_API_KEY
);
const index = client.initIndex("ShopifyProduct");

let obj = {
  link: "https://halfkg.myshopify.com/admin/api/2022-10/products.json?limit=250",
  min: Number.MAX_VALUE,
  max: Number.MIN_VALUE,
  total_quantity: 0,
  isNextPage: false,
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
    const createuserResponse = await createCutomerFromEmail(email, firstName, lastName);
    return response.send({ customer: createuserResponse });
  } catch (error) {
    return response.status(500).json({ error })
  }
});

// updateUserInfo
// update use info
exports.updateUserInfo = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { userInfo } = request.body
    if (userInfo?.id === undefined || userInfo?.id === "" || userInfo?.id === null) {
      throw "Please provide valid id"
    }
    const customerToReturn = await updateUserInfoApi(userInfo)
    response.json({ customer: customerToReturn })
  } catch (error) {
    await axios.post('https://halfkg.free.beeceptor.com/my/api/path', { error })
    response.status(500).json({ error })
  }
});

// updateUserAddress
// update use address
exports.createAndUpdateUserAddress = functions.https.onRequest(async function (
  request,
  response
) {
  try {
    const { userId, address = {} } = request.body
    const addressToRetuen = await updateUserAddress(userId, address)
    response.json({ address: addressToRetuen })
  } catch (error) {
    response.status(500).json({ error })
  }
});

//clear algolia index then add data to algolia
exports.clearAndFetchData = functions.https.onRequest(async function (
  request,
  response
) {
  while (!obj.isNextPage) {
    const result = await axios.get(obj.link, {
      headers: {
        "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
      },
    });
    let arr = result.headers.link.split(",");
    obj.isNextPage = arr.length == 1 && arr[0].includes("previous");
    obj.link = result.headers.link.replace(/[<>]/g, "");

    try {
      var arr1 = result?.data?.products
        ?.filter((prod) => {
          if (prod.status == "active") {
            return true;
          }
          return false;
        })
        .map((prod) => {
          prod.tags = [prod.tags]
          prod.tags = prod?.tags[0].split(",")
          prod?.tags.push(prod?.vendor)
          if (prod?.variants?.length > 1) {
            prod?.variants?.map((variant) => {
              prod.min = obj.min = Math.min(parseInt(variant.price), obj.min);
              prod.max = obj.max = Math.max(parseInt(variant.price), obj.max);
              return prod;
            });
            obj.min = Number.MAX_VALUE;
            obj.max = Number.MIN_VALUE;
          }
          prod?.variants?.map((vari) => {
            if (prod?.images?.length > 0) {
              for (let i = 0; i < prod?.images?.length; i++) {
                if (
                  vari.image_id != null &&
                  prod?.images[i]?.id == vari.image_id
                ) {
                  vari.image = prod?.images[i]?.src;
                  break;
                } else {
                  vari.image = "";
                }
              }
              if (vari.image == "") {
                if (prod?.image != null) {
                  vari.image = prod?.image?.src;
                } else {
                  vari.image = null;
                }
              }
            } else if (prod?.image != null && prod?.image?.src != null) {
              vari.image = prod?.image?.src;
            } else {
              vari.image = null;
            }
          });
          prod.objectID = prod.id;
          return prod;
        });
      finalArryaToPush.push(...arr1);
    } catch (error) {
      console.log(error);
    }
  }
  // clear all data from algolia
  index.clearObjects();

  // // upload all data to algolia
  index
    .saveObjects(finalArryaToPush)
    .then(({ objectIDs }) => {
      console.log();
    })
    .catch((error) => {
      console.log(error);
    });

  functions.logger.info("api calling succcccccfullllllllllllllllll!", {
    structuredData: true,
  });
  response.send("api called---Fetch Data Sccessfully---");
});

exports.shopifyToAlgolia = functions.pubsub.schedule('0 */4 * * *').onRun(async (context) => {
  const current_time = Math.round((new Date()).getTime() / 1000)
  while (!obj.isNextPage) {
    const result = await axios.get(obj.link, {
      headers: {
        "X-Shopify-Access-Token": process.env.X_SHOPIFY_ACCESS_TOKEN,
      },
    });
    let arr = result.headers.link.split(",");
    obj.isNextPage = arr.length == 1 && arr[0].includes("previous");
    obj.link = result.headers.link.replace(/[<>]/g, "");

    try {
      var arr1 = result?.data?.products
        ?.filter((prod) => {
          if (prod.status == "active") {
            return true;
          }
          return false;
        })
        .map((prod) => {
          obj.total_quantity = 0
          //time of update
          prod.updatedAtHour = current_time
          //tags array of collection and brandName(vendor)
          prod.tags = [prod.tags]
          prod.tags = prod?.tags[0].split(",")
          prod?.tags.push(prod?.vendor)

          if (prod?.variants?.length > 1) {
            prod?.variants?.map((variant) => {
              prod.min = obj.min = Math.min(parseInt(variant.price), obj.min);
              prod.max = obj.max = Math.max(parseInt(variant.price), obj.max);
              return prod;
            });
            obj.min = Number.MAX_VALUE;
            obj.max = Number.MIN_VALUE;
          }
          prod?.variants?.map((vari) => {
            obj.total_quantity = obj.total_quantity + vari?.inventory_quantity
            if (prod?.images?.length > 0) {
              for (let i = 0; i < prod?.images?.length; i++) {
                if (
                  vari.image_id != null &&
                  prod?.images[i]?.id == vari.image_id
                ) {
                  vari.image = prod?.images[i]?.src;
                  break;
                } else {
                  vari.image = "";
                }
              }
              if (vari.image == "") {
                if (prod?.image != null) {
                  vari.image = prod?.image?.src;
                } else {
                  vari.image = null;
                }
              }
            } else if (prod?.image != null && prod?.image?.src != null) {
              vari.image = prod?.image?.src;
            } else {
              vari.image = null;
            }
          });
          //total quantity of all variants
          prod.total_quantity = obj.total_quantity
          prod.objectID = prod.id;
          return prod;
        });
      finalArryaToPush.push(...arr1);
    } catch (error) {
      console.log(error);
    }
  }

  // upload all data to algolia
  await index
    .saveObjects(finalArryaToPush)
    .then(({ objectIDs }) => {
      console.log();
    })
    .catch((error) => {
      console.log(error);
    });

  await index.deleteBy({
    numericFilters: [
      `updatedAtHour < ${current_time - 1000}`
    ]
  }).then(() => {
    console.log()
  })
    .catch((error) => {
      console.log(error);
    })
});

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
      "amount": amount,
      "currency": currency
    }
    const result = await axios.post('https://api.razorpay.com/v1/orders', payload, {
      headers: {
        Authorization: process.env.RAZOR_PAY_KEY_ID_BASE64
      }
    })
    response.send(result.data);
    return;
  } catch (error) {
    response.status(401).json({ error });
  }
});
