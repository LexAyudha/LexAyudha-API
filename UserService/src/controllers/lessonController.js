const HTTPStatus = require('../enums/httpStatus')
const {publishErrorEvent} = require('../../config/eventBroker')
const lessonsModel = require("../models/lessonsModel")

/**
 * 
 * @param {string} userId 
 * @returns success status with all lessons of the user
 * @description - This function retrieves all lessons for a given user by their userId.
 */
exports.getAllLessonsById = async (userId) => {
    try {
        const response = await lessonsModel.find({ userId: userId })

        return { status: HTTPStatus.OK, body: response }
    } catch (error) {
        await publishErrorEvent('getAllLessonsById',error?.message);
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

//Add a new lesson for the user
exports.addNewLesson = async (userId, payload) => {
    try {
        const newLesson = new lessonsModel({ ...payload, userId: userId })
        const response = await newLesson.save()
        return { status: HTTPStatus.CREATED, body: response }
    } catch (error) {
        await publishErrorEvent('addNewLesson',error?.message);
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}

// Update an existing lesson for the user
exports.updateLesson = async (lessonId, userId, payload) => {
    try {
        const response = await lessonsModel.findOneAndUpdate({ _id: lessonId, userId: userId }, payload, { new: true })
        if (response) {
            return { status: HTTPStatus.OK, body: response }
        } else {
            return { status: HTTPStatus.NOT_FOUND, body: { message: "Lesson not found" } }
        }
    } catch (error) {
        await publishErrorEvent('updateLesson',error?.message);
        console.log(error)
        return { status: HTTPStatus.INTERNAL_SERVER_ERROR, body: error }
    }
}


