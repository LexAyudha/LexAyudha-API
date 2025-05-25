const recordModel = require("../models/recordModel")
const {publishErrorEvent} = require('../../config/eventBroker')
const HTTPStatus = require('../enums/httpStatus');

exports.saveRecord = async (payload) => {
    try {
        // Validate payload
        if (!payload || !payload.userId) {
            return { 
                status: HTTPStatus.BAD_REQUEST, 
                body: { message: 'Invalid payload: userId is required' } 
            };
        }

        // Create new record
        const response = await recordModel.create(payload);
        
        return { 
            status: HTTPStatus.CREATED, 
            body: response 
        };
        
    } catch (error) {
        await publishErrorEvent('saveRecord', error?.message);
        console.error('Error saving record:', error);
        
        return { 
            status: HTTPStatus.INTERNAL_SERVER_ERROR, 
            body: { 
                message: 'Failed to save record',
                error: error?.message 
            } 
        };
    }
}
 
exports.getRecordsById = async(id) => {
    try {
        // Validate id parameter
        if (!id) {
            return { 
                status: HTTPStatus.BAD_REQUEST, 
                body: { message: 'User ID is required' } 
            };
        }

        // Get records for user
        const records = await recordModel.find({ 
            userId: id 
        }).sort({ date: -1 }); // Sort by date descending

        // Check if records exist
        if (!records || records.length === 0) {
            return { 
                status: HTTPStatus.NOT_FOUND, 
                body: { message: 'No records found for this user' } 
            };
        }

        return { 
            status: HTTPStatus.OK, 
            body: records 
        };

    } catch (error) {
        await publishErrorEvent('getRecordsById', error?.message);
        console.error('Error fetching records:', error);
        
        return { 
            status: HTTPStatus.INTERNAL_SERVER_ERROR, 
            body: { 
                message: 'Failed to fetch user records',
                error: error?.message 
            } 
        };
    }
}