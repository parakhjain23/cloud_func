const { default: axios } = require("axios");
const { retirveAllAddressOfUser, createDefaultAddressOfUser, editDefaultAddress } = require("./userApi");

async function updateUserAddress(userId, addressPayload = {}) {
    var addressToReturn = {}

    if (addressPayload?.id === undefined || addressPayload?.id === '' || addressPayload?.id === null) {
        //retrive all address of user by user id
        const userAddresses = await retirveAllAddressOfUser(userId)
        if (userAddresses.length === 0) {
            // create address
            addressToReturn = await createDefaultAddressOfUser(userId, addressPayload)
        } else {
            var addressToEdit = userAddresses.find(userAddresse => userAddresse.default)
            addressToReturn = await editDefaultAddress(userId, addressToEdit.id, addressPayload);
        }
    } else {
        // address will constain adderss id and idit it
        addressToReturn = await editDefaultAddress(userId, addressPayload.id, addressPayload);
    }
    // return return new address to update client
    return addressToReturn
}

module.exports = {
    updateUserAddress
}