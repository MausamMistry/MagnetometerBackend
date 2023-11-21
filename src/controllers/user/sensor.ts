import { Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import SensorModel from "../../models/sensor-model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ===========================================  sensor Create on sensot Request =====================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const store = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const {
            sensordata,
            devicetoken
        } = req.body;
        
        const sensorData = {
            sensordata: sensordata,
            devicetoken: devicetoken
        }
        const sensorReq: any = await SensorModel.create(sensorData);

        if (!sensorReq) {
            const sendResponse: any = {
                message: process.env.APP_SR_NOT_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        const responseData = {
            message: process.env.APP_SUCCESS_MESSAGE,
            data: sensorReq
        };


        await session.commitTransaction();
        await session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('sensor' + process.env.APP_ERROR_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const getSensorData = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { devicetoken } = req.body;

        const matchStage = {
            $match: { devicetoken: devicetoken }
        };
        const pipeline = [
            matchStage,
        ];

        let sensorData = await SensorModel.aggregate(pipeline).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));
        
        if (!sensorData[0]) {
            const responseData: any = {
                message: "Data not Found with this token",
            };
            return await response.sendError(res, responseData);
        }


        const responseData: any = {
            message: "Sensor Details get successfully",
            data: sensorData[0],
        };
        
        return await response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};


export default {
    store,
    getSensorData
};
