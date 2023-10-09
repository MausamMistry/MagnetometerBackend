import { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import Service from "../../models/service-request-model";
import BidModel from "../../models/bid-request-model";
import Review from '../../models/review-model'

const getByServiceReqId = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // const {  } = req.params;
        const { search, per_page, page, sort_field, sort_direction,service_request_id } = req.query;

        let filterText: object = {};
        let filterTextValue: any = search;
        let orders: any = { createdAt: -1 };
        let pageFind = page ? Number(page) - 1 : 0;
        let perPage: number = per_page == undefined ? 10 : Number(per_page);

        if (sort_field) {
            orders[sort_field as string] = sort_direction == "ascend" ? 1 : -1;
        }

        const bidReqData = await BidModel.aggregate([
            {
                $match: {
                    service_request_id: new mongoose.Types.ObjectId(service_request_id),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: "createdAt" }],
                    bidRequests: [{ $addFields: { _id: "$_id" } }],
                },
            },
            { $unwind: "$total" },
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
            {
                $project: {
                    bidRequests: {
                        $slice: [
                            "$bidRequests",
                            perPage * pageFind,
                            {
                                $ifNull: [perPage, "$total.createdAt"],
                            },
                        ],
                    },
                    total: "$total.createdAt",
                    limit: { $literal: perPage },
                    page: { $literal: pageFind + 1 },
                    pages: { $ceil: { $divide: ["$total.createdAt", perPage] } },
                    "vendorData.user_name": 1,
                    "vendorData.profile_photo": 1,
                },
            },
        ]);

        const sendResponse = {
            message: 'Bid Request' + process.env.APP_GET_MESSAGE,
            data: bidReqData.length > 0 ?bidReqData[0]:{},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info('Bid Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const bidDetailView = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.query;

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
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "bid_request_files",
                    localField: "_id",
                    foreignField: "bid_request_id",
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             type: "1",
                    //         },
                    //     },
                    // ],
                    as: "bidRequestImagesData",
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
                    "is_active":1,
                    "createdAt": 1,
                    "amount": 1,
                    "currency": 1,
                    "delivery_timeframe": 1,
                    "validity": 1,
                    "other_conditions": 1,
                    "bidder_note": 1,
                    "bidder_signature": 1,
                    "signature_time":1,
                    "vendor_id": 1,
                    "vendorData.user_name": 1,
                    "vendorData.profile_photo": 1,
                    "vendorData.createdAt": 1,
                    "vendorData.company_name": 1,
                    "userData.user_name":1,
                    "bidRequestImagesData.path": 1,
                    "bidRequestImagesData.bid_request_id": 1,
                    "serviceRequestData.serviceTypeData.name": 1,
                    "serviceRequestData.assetsFacilityTypesData.name": 1,
                }
            }
        ]);

        let totalJob = 0;
        if (bidReqData[0].vendor_id) {
            totalJob = await BidModel.find({ "vendor_id": bidReqData[0].vendor_id, 'is_selected': 1 }).count();
        }
        bidReqData[0]['total_done_sr'] = totalJob;

       
        let bidServiceData:any = [];
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
                                'vendor_id': item.vendor_id,
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
            message:'Bid Request' + process.env.APP_GET_MESSAGE,
            data: (bidServiceData.length > 0) ? bidServiceData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Bid Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};


export default {
    getByServiceReqId,
    bidDetailView,
};
