/**
 * @description - All the user related CRUD operations are happening here
 */

const authModel = require("../models/authModel");
const HttpStatus = require("../enums/httpStatus");

exports.createUser = async (userData) => {
  try {
    const response = await authModel.create(userData);
    return { status: HttpStatus.CREATED, body: response };
  } catch (error) {
    console.log(
      "Internal server error at createUser(). More details : " + error
    );
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
};

exports.getUserByName = async (userData) => {
  try {
    const response = await authModel.findOne({ userName: userData });
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    console.log(
      "Internal server error at getUserByName(). More details : " + error
    );
    return { status: HttpStatus.NOT_FOUND, body: error };
  }
};
