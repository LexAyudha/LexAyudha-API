const userBaseModel = require("../models/userModel")
const HTTPStatus = require('../enums/httpStatus')
const badgesModel = require("../models/badgesModel")
const trainingModel = require("../models/trainingModel")
const billingModel = require("../models/billingModel")
const subsModel = require("../models/subscriptionModel")

exports.getUserByName = async (Name) => {
    try {
        const response = await userBaseModel.findOne({ userName: Name })

        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}
exports.getUserByField = async (userField) => {
    try {
        const response = await userBaseModel.find(userField)
        
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}
//Not working yet - ToBe Fixed
exports.saveUserPreferences = async (userId, payload) => {
    try {

        const response = await userBaseModel.findOneAndUpdate(
            { _id: userId },
            payload,
            { new: true }
        )

        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.hardDeleteUser = async (userId) => {
    try {
        const response = await userBaseModel.findOneAndDelete({ _id: userId })
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {

        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.softDeleteUser = async (userId) => {
    try {
        const response = await userBaseModel.findOneAndUpdate(
            { _id: userId },
            {isActive: false},
            { new: true }
        )

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

exports.getBadge = async(badgeIDList) => {
    try {
        const badges = await badgesModel.find({ _id: { $in: badgeIDList } })
        return { status: HTTPStatus.OK, body: badges }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.getTrainingSession = async(userId) => {
    try {
        const sessionRes = await trainingModel.find({ userId: userId })
        return { status: HTTPStatus.OK, body: sessionRes}
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.getSubscriptionDetails = async(subId) => {
    try {
        // Call subscription service to get subscription details
        const subscriptionRes = await subsModel.findById(subId)
        return { status: HTTPStatus.OK, body: subscriptionRes }
        
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.getBillingHistory = async(userId) => {
    try {
        // Call billing service to get billing history
        const billingRes = await billingModel.find({ userId: userId })
        return { status: HTTPStatus.OK, body: billingRes }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.updateProfileImagePath = async(userId, downloadURL) => {
    try {
        const response = await userBaseModel.findOneAndUpdate(
            { _id: userId },
            { proPic: downloadURL },
            { new: true }
        )
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

exports.updateCoverImagePath = async(userId, downloadURL) => {
    try {
        const response = await userBaseModel.findOneAndUpdate(
            { _id: userId },
            { coverPic: downloadURL },
            { new: true }
        )
        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}


