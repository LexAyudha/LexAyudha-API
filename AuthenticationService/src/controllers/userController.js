/**
 * @description - All the user related CRUD operations are happening here
 */

const userModel = require("../models/userModel");
const HttpStatus = require("../enums/httpStatus");

/**
 * 
 * @param {*} userData 
 * @returns {Object} - Returns the status and body of the response
 * @description - This function creates a new user in the database.
 */
exports.createUser = async (userData) => {
  try {
    const response = await userModel.create(userData);
    
    return { status: HttpStatus.CREATED, body: response };
  } catch (error) {
    await publishErrorEvent("createUser", error?.message);
    console.log(
      "Internal server error at createUser(). More details : " + error
    );
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
};

//get all users
exports.getUserByName = async (userData) => {
  try {
    const response = await userModel.findOne({ userName: userData });
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent("getUserByName", error?.message);
    console.log(
      "Internal server error at getUserByName(). More details : " + error
    );
    return { status: HttpStatus.NOT_FOUND, body: error };
  }
};

//get user by field
exports.getUserByField = async (userData) => {
  try {
    const response = await userModel.find( userData );

    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent("getUserByField", error?.message);
    console.log(
      "Internal server error at getUserByName(). More details : " + error
    );
    return { status: HttpStatus.NOT_FOUND, body: error };
  }
};