import { Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import Service from "../../models/service-request-model";
import BidModel from "../../models/bid-request-model";
import User from "../../models/user-model";
import CommonFunction from "../../helper/commonFunction";
import bidRequestAttachmentModel from "../../models/bid-request-attachment-model";
import Card from "../../models/cards-model"
import Review from '../../models/review-model'
import UserToken from "../../models/user-token-model";
import Notification from "../../models/notification-model";
import FirebaseFunction from '../../helper/firebase';
import ServiceReqModel from "../../models/service-request-model";
import ReportRequest from "../../models/report-request.model";
import moment from "moment";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Bid Request List by Service Req ID=================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getByServiceReqId = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { service_request_id, search, page, per_page } = req.body;
        let filterTextValue: any = search;
        const user_id = req.user._id;


        let perPage: number = per_page == undefined ? 10 : Number(per_page)
        let skipPage: any = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;

        let filterText: object = {
            service_request_id: new mongoose.Types.ObjectId(service_request_id),
        };


        let getReportUSer: any = (await ReportRequest.find({
            from_user_id: new mongoose.Types.ObjectId(user_id)
        })).map(value => value.to_user_id);

        if (getReportUSer) {
            filterText = {
                ...filterText,
                $and: [
                    { user_id: { $nin: getReportUSer } },
                    { vendor_id: { $nin: getReportUSer } }
                ],
            };
        }

        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { "status": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "amount": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "delivery_timeframe": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "validity": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "message_field": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "typical_text": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "bidder_note": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "vendorData.first_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "other_conditions": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "vendorData.last_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    { "vendorData.user_name": { $regex: `${filterTextValue}`, $options: "i" } },
                    // { "reviewData.rating_overall": { $regex: `${filterTextValue}`, $options: "i" } },
                ]
            }
        }

        let isActive = { is_active: true }
        let filterData = { ...filterText, ...isActive }

        let countData = await BidModel.count(filterData);
        const serviceData: any = await BidModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            {
                $lookup: {
                    from: "bid_request_files",
                    localField: "_id",
                    foreignField: "bid_request_id",
                    pipeline: [
                        {
                            $match: {
                                type: "1",
                            },
                        },
                    ],
                    as: "bidRequestImagesData",
                },
            },

            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
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
                            $unwind: {
                                path: "$serviceTypeData",
                                preserveNullAndEmptyArrays: true,
                            },
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
                        {
                            $lookup: {
                                from: "priorities",
                                localField: "priority",
                                foreignField: "_id",
                                as: "priorityData",
                            },
                        },
                        {
                            $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true },
                        },

                    ],
                },
            },
            { $unwind: { path: "$serviceRequestData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },

            { $match: filterText },
            // CommonFunction.isActive(),
            {
                $project: {
                    "_id": 1,
                    "vendor_id": 1,
                    "service_request_id": 1,
                    "user_id": 1,
                    "message_field": 1,
                    "typical_text": 1,
                    "amount": 1,
                    "currency": 1,
                    "delivery_timeframe": 1,
                    "validity": 1,
                    "other_conditions": 1,
                    "bidder_note": 1,
                    "bidder_signature": 1,
                    "signature_time": 1,
                    // "is_active": 1,
                    // "status": 1,
                    "status": 1,
                    "createdAt": 1,
                    "vendorData._id": 1,
                    "vendorData.first_name": 1,
                    "vendorData.last_name": 1,
                    "vendorData.user_name": 1,
                    "vendorData.mobile_no": 1,
                    "vendorData.location": 1,
                    "vendorData.profile_photo": 1,
                    "vendorData.company_name": 1,
                    "vendorData.upload_brochure": 1,
                    "serviceRequestData.title": 1,
                    "serviceRequestData.detail": 1,
                    "serviceRequestData.status": 1,
                    "serviceRequestData.priority": 1,
                    "serviceRequestData.location": 1,
                    "serviceRequestData.contact_no": 1,
                    "serviceRequestData.type": 1,
                    "serviceRequestData.schedule_date": 1,
                    "serviceRequestData.serviceTypeData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                    "serviceRequestData.priorityData._id": 1,
                    "serviceRequestData.priorityData.name": 1,
                    "bidRequestImagesData.path": 1,
                    "bidRequestImagesData.bid_request_id": 1,
                    "updatedAt": 1
                },
            },
            {
                $addFields: {
                    rating_calculation: 0.0,
                },
            },
            { $sort: { 'updatedAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: perPage },
        ]);
        let bidServiceData: any = [];

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        if (serviceData.length > 0) {
            await Promise.all(serviceData.map(async (item: any) => {
                if (item.vendorData && item.vendorData._id) {

                    let reviewData = await Review.aggregate([
                        {
                            $match: {
                                'vendor_id': item.vendorData?._id,
                                'createdAt': { $gte: sixMonthsAgo }

                            }
                        },
                        {
                            $group: {
                                _id: null,
                                rating_overall_data: { $sum: "$rating_overall" },
                                count: { $sum: 1 } // for no. of documents count
                            }
                        }
                    ])

                    let reviewDataCount = await Review.aggregate([
                        {
                            $match: {
                                'vendor_id': item.vendorData._id,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 } // for no. of documents count
                            }
                        }
                    ])

                    item["rating_calculation"] = await reviewData[0]?.rating_overall_data / reviewData[0]?.count
                    item["rating_total_count"] = await reviewDataCount[0]?.count
                    await bidServiceData.push(item)
                    return;

                }
            }));
        }

        let bidServiceDataSend = bidServiceData.sort((a: any, b: any) => {
            return b.updatedAt - a.updatedAt;
        });

        const sendResponse = {
            message: 'Bid' + process.env.APP_GET_MESSAGE,
            data: {
                data: bidServiceDataSend.length > 0 ? bidServiceDataSend : [],
                total: countData,
            }
        };

        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Bid' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Detail Bid Request By ID=================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const bidDetailView = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.body;

        const bidReqData = await BidModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "bid_request_files",
                    localField: "_id",
                    foreignField: "bid_request_id",
                    as: "bidRequestImagesData",
                },
            },

            {
                $lookup: {
                    from: "reviews",
                    localField: "vendor_id",
                    foreignField: "vendor_id",
                    as: "review_total",
                    pipeline: [
                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
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
                            $unwind: {
                                path: "$serviceTypeData",
                                preserveNullAndEmptyArrays: true,
                            },
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

            {
                $project: {
                    "createdAt": 1,
                    "amount": 1,
                    "currency": 1,
                    "delivery_timeframe": 1,
                    "validity": 1,
                    "other_conditions": 1,
                    "bidder_note": 1,
                    "bidder_signature": 1,
                    "signature_time": 1,
                    "vendor_id": 1,
                    "vendorData._id": 1,
                    "vendorData.user_name": 1,
                    "vendorData.profile_photo": 1,
                    "vendorData.company_name": 1,
                    "vendorData.mobile_no": 1,
                    "vendorData.location": 1,
                    "vendorData.email": 1,
                    "vendorData.createdAt": 1,
                    "vendorData.upload_brochure": 1,
                    "bidRequestImagesData.path": 1,
                    "bidRequestImagesData.bid_request_id": 1,
                    "bidRequestImagesData.type": 1,
                    "serviceRequestData._id": 1,
                    "serviceRequestData.title": 1,
                    "serviceRequestData.detail": 1,
                    "serviceRequestData.type": 1,
                    "serviceRequestData.schedule_date": 1,
                    "serviceRequestData.serviceTypeData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                    "status": 1,
                    "service_request_id": 1
                }
            }
        ]);

        let totalJob = 0;
        if (bidReqData[0].vendor_id) {
            totalJob = await BidModel.find({ "vendor_id": bidReqData[0].vendor_id, 'status': 3 }).count();
        }
        bidReqData[0]['total_done_sr'] = totalJob;


        let bidServiceData: any = [];
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        if (bidReqData.length > 0) {
            await Promise.all(bidReqData.map(async (item: any) => {
                if (item.vendor_id) {

                    let reviewData = await Review.aggregate([
                        {
                            $match: {
                                'vendor_id': item.vendor_id,
                                'createdAt': { $gte: sixMonthsAgo }

                            }
                        },
                        {
                            $group: {
                                _id: null,
                                rating_overall_data: { $sum: "$rating_overall" },
                                count: { $sum: 1 } // for no. of documents count
                            }
                        }
                    ])

                    let reviewDataCount = await Review.aggregate([
                        {
                            $match: {
                                'vendor_id': item.vendorData._id,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 } // for no. of documents count
                            }
                        }
                    ])

                    item["rating_calculation"] = reviewData[0]?.rating_overall_data / reviewData[0]?.count
                    item["rating_total_count"] = reviewDataCount[0]?.count
                    bidServiceData.push(item)
                    return;

                }
            }))
        }

        const sendResponse = {
            message: 'Bid' + process.env.APP_GET_MESSAGE,
            data: (bidServiceData.length > 0) ? bidServiceData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Bid' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Bid Request Lists By Customer ID=================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getByVendorId = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText: object = {};
        let pageFind = page ? Number(page) - 1 : 0;
        filterText = {
            user_id: new mongoose.Types.ObjectId(user_id),
            is_active: true
        }

        // let getReportUSer: any = (await ReportRequest.find({
        //     from_user_id: new mongoose.Types.ObjectId(user_id)
        // })).map(value => value.to_user_id);

        // if (getReportUSer) {
        //     filterText = {
        //         ...filterText,
        //         $and: [
        //             { user_id: { $nin: getReportUSer } },
        //             { vendor_id: { $nin: getReportUSer } }
        //         ],
        //     };
        // }

        // delete this one 
        const countData = await BidModel.count(filterText);
        const bidReqData = await BidModel.aggregate([
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
                            $unwind: {
                                path: "$serviceTypeData",
                                preserveNullAndEmptyArrays: true,
                            },
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
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    createdAt: 1,
                    vendor_id: 1,
                    service_request_id: 1,
                    message_field: 1,
                    typical_text: 1,
                    amount: 1,
                    currency: 1,
                    delivery_timeframe: 1,
                    validity: 1,
                    other_conditions: 1,
                    bidder_note: 1,
                    bidder_signature: 1,
                    status: 1,
                    // is_active: 1,
                    "serviceRequestData.is_review_by_sp": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                },
            },
            // CommonFunction.isActive(),
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                },
            },

        ]);

        const sendResponse = {
            message: 'Bid' + process.env.APP_GET_MESSAGE,
            data: {
                data: (bidReqData.length) > 0 ? bidReqData : [],
                total: countData,
            }
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Bid' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Accept Bid by Bid Request ID ========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const bidAccept = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const customer = req.user;
        const { id, comments, upload_signature } = req.body;
        const bidData: any = await BidModel.findById(id);

        const cardData = await Card.aggregate([
            {
                $match: {
                    $and: [{ user_id: new mongoose.Types.ObjectId(customer._id) }],
                },
            },
        ]);
        if (cardData.length === 0) {
            const sendResponse: any = {
                message: process.env.APP_ADD_CARD_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        if (!bidData) {
            const sendResponse: any = {
                message: process.env.APP_BID_NOT_FOUND_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        if (Number(bidData.status) === 3) {
            const sendResponse: any = {
                message: process.env.APP_BID_ACCEPTED_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        const service_req: any = await Service.findById(bidData.service_request_id);
        service_req.status = "8"; //8=awarded
        service_req.selected_bid_id = bidData._id;
        service_req.accept_bid_note = comments;
        service_req.upload_signature = upload_signature;
        service_req.awarded_date = new Date().toISOString();
        service_req.save();


        // Selected Bid Change
        bidData.status = 3;
        bidData.save();


        const filter = {
            service_request_id: new mongoose.Types.ObjectId(bidData.service_request_id), $or: [
                { status: '1' },
                { status: { $exists: false } }
            ],
        };
        const update = { status: '5' };
        const options = { multi: true }; // Set multi option to true to update multiple records

        await BidModel.updateMany(filter, update, options);

        const responseData = {
            message: "congratulations bid is approved",
            data: (bidData).length > 0 ? bidData : {},
        };
        if (bidData) {
            // start here Push 
            let pushTitle: any = 'Congratulations, Bid has been successfully approved';
            let message: any = `Congratulations, Bid has been successfully approved with the following details: Request Id: ${service_req.request_id} (SR Id: ${bidData.service_request_id} / Bid Id: ${bidData._id})`;
            // let message: any = service_req.request_id + ' ' + `(SR Id: ${bidData.service_request_id} / Bid Id: ${bidData._id}) ` + ' ' + 'congratulations bid is approved'
            let payload: any = bidData;
            let userIdNotifiy: any = bidData.vendor_id;
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
        await session.commitTransaction();
        await session.endSession();

        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info(process.env.APP_BID_ACCEPTED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Reject Bid by Bid Request ID ========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const bidReject = async (req: any, res: Response) => {
    const customer = req.user;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id, reject_reason_id, reject_note } = req.body;

        const bidData: any = await BidModel.findById(id);
        if (!bidData) {
            const sendResponse: any = {
                message: process.env.APP_BID_NOT_FOUND_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        // if (!bidData.is_active) {
        //     const sendResponse: any = {
        //         message: process.env.APP_BID_ACCEPTED_MESSAGE,
        //     };
        //     return response.sendError(res, sendResponse);
        // }

        const service_req: any = await Service.findById(bidData.service_request_id);

        if (service_req.is_exipred || service_req.isdeleted || service_req.selected_vendor || !customer._id.equals(service_req.user_id)) {
            const sendResponse: any = {
                message: process.env.APP_SR_NOT_FOUND_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        bidData.reject_reason_id = new mongoose.Types.ObjectId(reject_reason_id);
        bidData.reject_note = reject_note;
        bidData.status = 2;
        bidData.save();

        const responseData = {
            message: process.env.APP_BID_REJECTED_MESSAGE,
            data: bidData.length > 0 ? bidData : {},
        };

        if (bidData) {
            // start here Push 
            let pushTitle: any = 'Bid has been Rejected';
            let message: any = `Bid has been Rejected with the following details: Request Id: ${service_req.request_id} (SR Id: ${bidData.service_request_id} / Bid Id: ${bidData._id})`;
            // let message: any = service_req.request_id + ' ' + `(SR Id: ${bidData.service_request_id} / Bid Id: ${bidData._id}) ` + ' ' + 'Bid is Rejected'
            let payload: any = bidData;
            let userIdNotifiy: any = bidData.vendor_id;
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

        await session.commitTransaction();
        await session.endSession();

        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info(process.env.APP_BID_REJECTED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ===========================================  Bid Create on Service Request ID =====================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const store = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const vendor = req.user;
        const {
            id,
            service_request_id,
            currency,
            amount,
            delivery_timeframe,
            validity,
            other_conditions,
            bidder_note,
            message_field,
            bidder_signature,
            typical_text,
            photos,
            document,
            is_rejected,
        } = req.body;
        let bidReqData: any = {};
        let message: any;
        const serviceReq: any = await Service.findById(new mongoose.Types.ObjectId(service_request_id));

        if (serviceReq) {
            // const bidFound = await BidModel.aggregate([
            //     {
            //         $match: {
            //             $and: [
            //                 {
            //                     vendor_id: vendor._id,
            //                 },
            //                 {
            //                     service_request_id: new mongoose.Types.ObjectId(
            //                         service_request_id
            //                     ),
            //                 },
            //             ],
            //         },
            //     },
            // ]);

            // if (bidFound[0]) {
            //     const sendResponse: any = {
            //         message: "Bid Already Created",
            //     };
            //     await session.abortTransaction();
            //     session.endSession();
            //     return response.sendError(res, sendResponse);
            // }

            await BidModel.updateMany({
                vendor_id: vendor._id,
                service_request_id: new mongoose.Types.ObjectId(service_request_id),
            }, {
                is_active: false,
            });

        } else {
            const sendResponse: any = {
                message: process.env.APP_SR_NOT_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }



        console.log("gfd")
        if (id) {
            bidReqData = await BidModel.findOne({ _id: id });
            message = 'Bid' + process.env.APP_UPDATE_MESSAGE;
        } else {
            bidReqData = new BidModel();
            message = 'Bid' + process.env.APP_STORE_MESSAGE;
        }


        bidReqData.vendor_id = new mongoose.Types.ObjectId(vendor._id);
        bidReqData.service_request_id = new mongoose.Types.ObjectId(service_request_id);
        bidReqData.user_id = new mongoose.Types.ObjectId(serviceReq?.user_id);
        bidReqData.message_field = message_field;
        bidReqData.typical_text = typical_text;
        bidReqData.amount = amount;
        bidReqData.currency = currency;
        bidReqData.validity = validity;
        bidReqData.delivery_timeframe = delivery_timeframe;
        bidReqData.other_conditions = other_conditions;
        bidReqData.bidder_signature = bidder_signature;
        bidReqData.signature_time = new Date();
        bidReqData.bidder_note = bidder_note;
        bidReqData.status = (Number(is_rejected) === 1) ? 4 : 1;
        // 1 is true
        // 2 is false
        await bidReqData.save();

        if (photos && bidReqData) {
            photos.map(async function (img: any) {
                const imageData: any = new bidRequestAttachmentModel();
                imageData.bid_request_id = new mongoose.Types.ObjectId(bidReqData._id);
                imageData.path = img;
                imageData.type = 1; // image
                await imageData.save();
            });
        }

        if (document && bidReqData) {
            const imageData: any = new bidRequestAttachmentModel();
            imageData.bid_request_id = new mongoose.Types.ObjectId(bidReqData._id);
            imageData.path = document;
            imageData.type = 2; // document
            await imageData.save();
        }

        const serviceRequestData = await ServiceReqModel.findById(
            new mongoose.Types.ObjectId(service_request_id)
        );

        const responseData = {
            message: message,
            data: bidReqData !== null ? bidReqData : {},
        };


        if (serviceRequestData) {
            // start here Push 
            let pushTitle: any = 'Congratulations, Bid has been successfully created';
            let message: any = `Congratulations, Bid has been successfully created with the following details: Request Id: ${serviceRequestData.request_id} (SR Id: ${serviceRequestData._id} / Bid Id: ${bidReqData._id})`;
            // let message: any = serviceRequestData.request_id + ' ' + `(SR Id: ${serviceRequestData._id} / Bid Id: ${bidReqData._id}) ` + ' ' + 'congratulations bid is Created'
            let payload: any = bidReqData;
            let userIdNotifiy: any = serviceRequestData.user_id;
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
        await session.commitTransaction();
        await session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Bid' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

export default {
    getByServiceReqId,
    bidDetailView,
    getByVendorId,
    bidAccept,
    bidReject,
    store
};
