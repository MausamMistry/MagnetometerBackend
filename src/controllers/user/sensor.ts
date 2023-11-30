import { Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import SensorModel from "../../models/sensor-model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ===========================================  sensor Create on sensot Request =====================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const allFiled = [
    "_id",
    "devicetoken",
    "sensordata",
    "address"
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}

getAllFiled();


const getData = (async (devicetoken: any) => {
    const sensorDatas: any = await SensorModel.aggregate([
        { $match: { "devicetoken": devicetoken } },
        { $project: project }
    ]);
    return sensorDatas.length > 0 ? sensorDatas[0] : {};
});


const store = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const {
            sensordata,
            address,
            devicetoken
        } = req.body;

        const sensorData = {
            sensordata: sensordata,
            address: address,
            devicetoken: devicetoken
        }

        if (devicetoken) {

            const data = await getData(devicetoken);
            if (Object.keys(data).length !== 0 && data.constructor === Object) {
                const updateData: any = [];
                data.sensordata.map((key: any) => {
                    updateData.push(key);
                })
                sensordata.map((key: any) => {
                    updateData.push(key);
                })
                
                await SensorModel.findOneAndUpdate({devicetoken: devicetoken}, { $set: { sensordata: updateData, address: address ? address :  data.address }});
                const responseData = {
                    message: process.env.APP_SUCCESS_MESSAGE,
                    data: await getData(devicetoken)
                };

                await session.commitTransaction();
                session.endSession();
                return response.sendSuccess(req, res, responseData);
                
            } else {
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
                session.endSession();
                return response.sendSuccess(req, res, responseData);
            }

            // const responseData: any = {
            //     message: 'Sensor data' + process.env.APP_UPDATE_MESSAGE,
            //     data: await getData(devicetoken),
            // };
            // await session.commitTransaction();
            // session.endSession();
            // return response.sendSuccess(req, res, responseData);

        }

        // await session.commitTransaction();
        // await session.endSession();

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

        // const matchStage = {
        //     $match: { $or: [{ devicetoken: devicetoken }, { address: address }] }
        // };


        const pipeline = [
            matchStage
        ];

        let sensorData = await SensorModel.aggregate(pipeline).exec();
        sensorData = JSON.parse(JSON.stringify(sensorData));

        if (!sensorData[0]) {
            const responseData: any = {
                message: "Data not Found.",
            };
            return await response.sendError(res, responseData);
        }

        const responseData: any = {
            message: "Sensor Details get successfully",
            data: sensorData,
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
