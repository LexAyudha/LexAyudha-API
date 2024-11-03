const userBaseModel = require("../models/userModel")
const HTTPStatus = require('../enums/httpStatus')

exports.getUserByName = async (Name) => {
    try {
        const response = await userBaseModel.findOne({ userName: Name })

        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

//Not working yet - ToBe Fixed
exports.saveUserPreferences = async (email, payload) => {
    try {

        const response = await userBaseModel.findOneAndUpdate(
            { email: email },
            payload,
            { new: true }
        )

        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.deleteUser = async (userName) => {
    try {
        const response = await userBaseModel.findOneAndDelete({ userName: userName })
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {

        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.getUsersByType = async (userType) => {
    try {
        const response = await userBaseModel.find({ userRole: userType })
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.getUser = async(userId) => {
    try {
        const response = await userBaseModel.findById(userId)
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}