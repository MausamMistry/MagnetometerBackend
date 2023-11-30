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

const get = (async (req: any, res: Response) => {    
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { per_page, page, sort_field, sort_direction, type } = req.query;
        let filterText: object = {
            type: type,
        };
        let filter: any = req.query.search;
        filter = filter ? filter.replace(" 91", "") : "";
        filter = filter ? filter.replace("%", "") : "";

        let filterTextValue: any = filter;
        let orders: any = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage: number = per_page == undefined ? 10 : Number(per_page)
        if (sort_field) {
            orders[sort_field as string] = sort_direction == "ascend" ? 1 : -1;
        } else {
            orders = { 'createdAt': -1 };
        }

        if (filterTextValue) {
            let filterTextField: any = []
            await allFiled.map(function async(filed: any) {
                let filedData = {
                    [filed]: {
                        $regex: `${filterTextValue}`, $options: "i"
                    }
                }
                filterTextField.push(filedData);
            })

            filterText = {
                ...filterText,
                $or: filterTextField
            };
        }

        const sensorData: any = await SensorModel.aggregate([
            {
                $addFields: {
                    "_id": { $toString: "$_id" }
                }
            },
            { $project: project },
            { $match: filterText },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: 'createdAt' }],
                    docs: [{ $addFields: { _id: '$_id' } }],
                },
            },
            { $unwind: '$total' },
            {
                $project: {
                    docs: {
                        $slice: ['$docs', perPage * pageFind, {
                            $ifNull: [perPage, '$total.createdAt']
                        }]
                    },
                    total: '$total.createdAt',
                    limit: { $literal: perPage },
                    page: { $literal: (pageFind + 1) },
                    pages: { $ceil: { $divide: ['$total.createdAt', perPage] } },
                },
            },
        ]);

        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: sensorData.length > 0 ? sensorData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Sensor' + ' ' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

const destroy = (async (req: any, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    const { devicetoken } = req.body;
    try {
        await SensorModel.deleteMany({ devicetoken: devicetoken, })
        const responseData: any = {
            message: 'Sensor' + ' ' + process.env.APP_DELETE_MESSAGE,
            data: [],
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Sensor' + ' ' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})


export default {
    store,
    getSensorData,
    get,
    destroy
};
