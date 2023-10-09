import { Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import visitReqModel from "../../models/visit-request-model";
import Service from "../../models/service-request-model";
import CommonFunction from "../../helper/commonFunction";
import User from "../../models/user-model";

import UserToken from "../../models/user-token-model";
import Notification from "../../models/notification-model";
import FirebaseFunction from '../../helper/firebase';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Visit Request By Service Req. ID==================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const get = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { search, page, per_page } = req.body;
        let filterTextValue: any = search;
        let perPage: any = per_page == undefined ? 10 : Number(per_page)
        let skipPage: any = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;
        let filterText: object = {}
        let typeName = '';

        if (Number(req.user.type) === 1) {
            filterText = {
                user_id: new mongoose.Types.ObjectId(user_id)
            };
        }
        if (Number(req.user.type) === 2) {
            filterText = {
                vendor_id: new mongoose.Types.ObjectId(user_id)
            };
        }


        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { "serviceRequestData.slug": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.request_id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.status": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.serviceTypeData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.serviceTypeData.name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.assetsFacilityTypesData._id": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "serviceRequestData.assetsFacilityTypesData.name": { $regex: `${filterTextValue}`, $options: "i" } },

                ],
            };
        }

        let countData = await visitReqModel.aggregate([
            {
                $lookup: {
                    from: "service_requests",
                    localField: "bid_id",
                    foreignField: "selected_bid_id",
                    as: "serviceRequestData",
                },
            },

            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            { $group: { _id: "$_id" } },
            { $group: { _id: null, count: { $sum: 1 } } },
        ])
        const serviceData: any = await visitReqModel.aggregate([
            {
                $lookup: {
                    from: "service_requests",
                    localField: "service_request_id",
                    foreignField: "_id",
                    as: "serviceRequestData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "service_types",
                                localField: "service_type_id",
                                foreignField: "_id",
                                as: "serviceTypeData",
                            },
                        },
                        {
                            $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "assets",
                                localField: "assets_id",
                                foreignField: "_id",
                                as: "assetsFacilityTypesData",
                            },
                        },
                        { $unwind: { path: "$assetsFacilityTypesData", preserveNullAndEmptyArrays: true } },

                    ],

                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            {
                $project: {
                    "_id": 1,
                    "updatedAt": 1,
                    "serviceRequestData._id": 1,
                    "serviceRequestData.request_id": 1,
                    "serviceRequestData.status": 1,
                    "serviceRequestData.slug": 1,
                    "serviceRequestData.createdAt": 1,
                    "serviceRequestData.schedule_date": 1,
                    "serviceRequestData.serviceTypeData._id": 1,
                    "serviceRequestData.serviceTypeData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData._id": 1,
                },
            },
            { $sort: { 'updatedAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);
        const sendResponse = {
            message: 'Site Visit' + process.env.APP_GET_MESSAGE,
            data: {
                data: serviceData.length > 0 ? serviceData : [],
                total: countData.length > 0 ? countData[0].count : 0,
            }
        };

        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Site Visit' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};


const gejjjt = async (req: any, res: Response) => {
    try {
        const customer = req.user;
        const { id } = req.params;

        const visitRequest = await visitReqModel.aggregate([
            // {
            //     $match: {
            //         user_id: new mongoose.Types.ObjectId(customer.id),
            //     },
            // },
            {
                $lookup: {
                    from: "service_requests",
                    localField: "bid_id",
                    foreignField: "selected_bid_id",
                    as: "serviceRequestData",
                },
            },

            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },


            {
                $project: {
                    "_id": 1,

                    "serviceRequestData._id": 1,
                    "serviceRequestData.request_id": 1
                }
            },
        ]);

        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length ? visitRequest : {},
        };

        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};


const getByServiceReqId = async (req: any, res: Response) => {
    try {
        const customer = req.user;
        const { id } = req.params;

        const visitRequest = await visitReqModel.aggregate([
            CommonFunction.isActive(),
            {
                $match: {
                    service_request_id: new mongoose.Types.ObjectId(id),
                },
            },
        ]);

        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length ? visitRequest[0] : {},
        };

        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const create = async (req: any, res: Response) => {
    try {
        const vendor = req.user;
        const {
            service_request_id,
            interest,
            your_message,
            justification,
            response_date,
            platform_statement
        } = req.body;

        let visitReqData: any = {};
        let message: any;

        const serviceReq: any = await Service.findById(new mongoose.Types.ObjectId(service_request_id));
        if (serviceReq) {
            const requestFound = await visitReqModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                vendor_id: vendor._id,
                            },
                            {
                                service_request_id: new mongoose.Types.ObjectId(
                                    service_request_id
                                ),
                            },
                        ],
                    },
                },
            ]);

            if (requestFound[0]) {
                const sendResponse: any = {
                    message: process.env.APP_REQ_VISITED_MESSAGE,
                };
                return response.sendError(res, sendResponse);
            }
        } else {
            const sendResponse: any = {
                message: process.env.APP_SR_NOT_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        visitReqData = new visitReqModel();
        message = 'Requested Site Visit' + process.env.APP_STORE_MESSAGE;
        visitReqData.service_request_id = serviceReq._id;
        visitReqData.user_id = serviceReq.user_id;
        visitReqData.vendor_id = vendor._id;
        visitReqData.interest = interest;
        visitReqData.your_message = your_message;
        visitReqData.justification = justification;
        visitReqData.response_date = new Date(response_date);
        visitReqData.platform_statement = platform_statement
        await visitReqData.save();



        if (visitReqData) {
            // start here Push 
            let pushTitle: any = `This SR Id is  ${serviceReq._id} have new Site Visit`;
            let message: any = `Site Visit ${your_message}`;
            let payload: any = visitReqData;
            let userIdNotifiy: any = serviceReq.user_id;

            console.log(serviceReq.user_id)
            await Notification.create({
                user_id: userIdNotifiy,
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            })

            const userNotification = await User.findOne({
                _id: new mongoose.Types.ObjectId(userIdNotifiy)
            });

            let getToken: any = (await UserToken.find({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy),
                firebase_token: { $ne: null }
            })).map(value => value.firebase_token);

            console.log(getToken)
            if (userNotification && userNotification.firebase_is_active) {
                try {
                    let dataStore: any = getToken;
                    let notificationData = {
                        "type": 1,
                        "title": pushTitle,
                        "message": message,
                        "extraData": JSON.stringify(payload),
                        "updatedAt": new Date().toString(),
                    };
                    let fcmData: any = {
                        "subject": pushTitle,
                        "content": message,
                        "data": notificationData,
                        "image": ""
                    };

                    let token: any = dataStore
                    await FirebaseFunction.sendPushNotification(token, fcmData)
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }


        const responseData = {
            message: message,
            data: await visitReqData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Requested Site Visit' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};


const getAllServiceRequest = async (req: any, res: Response) => {
    try {
        const visitRequest = await visitReqModel.aggregate([]);
        const responseData = {
            message: process.env.APP_GET_MESSAGE,
            data: (visitRequest).length > 0 ? visitRequest : {},
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
}

export default {
    getByServiceReqId,
    get,
    create,
    getAllServiceRequest,
};
