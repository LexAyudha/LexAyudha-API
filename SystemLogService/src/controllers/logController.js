const logModel = require("../models/logModel");
const HttpStatus = require("../enums/httpStatus");
const { logger } = require("../../config/logConfig");
const { publishErrorEvent } = require("../../config/eventBroker");

// Controller for handling log operations
exports.insertLog = async(req,res) => {
  try {
    const logPayload = req?.body;

    const logModel = {
      logType: logPayload?.logType,
      logDescription: logPayload?.logDescription,  
      logDate: new Date()
    }

    const response = await logModel.create(logModel);
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('insertLog',error?.message);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

// Controller to delete a log from the database
exports.deleteLogFromDB = async(req,res) => {
  try {
    const logId = req?.body?.logId;
    const response = await logModel.deleteOne({ _id: logId });
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('deleteLogFromDB',error?.message);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

// Controller to get a specific log by ID
exports.getALog = async(req,res) => {
  try {
    const logId = req?.params?.id;
    const response = await logModel.findById(logId);
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getALog',error?.message);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

// Controller to get all logs from the database
exports.getAllLogsInDB = async(req,res) => {
  try {
    const response = await logModel.find();
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getAllLogsInDB',error?.message);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body:error};
  }
}

// Controller to get logs filtered by a specific condition
exports.getLogsFiltered = async(req,res) => {
  try {
    const filter = req?.body;
    const response = await logModel.find(filter); 
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getLogsFiltered',error?.message);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}