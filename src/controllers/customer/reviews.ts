import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import Review from '../../models/review-model'


const getByVendorId = (async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { search, page, vendor_id,per_page } = req.body;
        let perPage: any = per_page == undefined ? 10 : Number(per_page)
        let skipPage: any = (page && page > 0) ? (Number(Number(page - 1)) * Number(perPage)) : 0;

        let filterText: object = {
            vendor_id: new mongoose.Types.ObjectId(vendor_id),
        };

        let countData = await Review.count(filterText);

        const serviceData: any = await Review.aggregate([
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    rating: 1,
                    review: 1,
                    rating_overall: 1,
                    "customerData.user_name": 1,
                    "customerData.profile_photo": 1,
                    "createdAt":1,
                    "reviewDate": {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
        ]);


         let bidServiceData:any = {};
         const sixMonthsAgo = new Date()
         sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        if (serviceData.length > 0) {
            // await Promise.all(serviceData.map(async (item: any) => {
                if (serviceData[0].vendor_id) {

                    let reviewData = await Review.aggregate([
                        {
                            $match: {
                                'vendor_id': serviceData[0].vendor_id,
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
                                'vendor_id': serviceData[0].vendor_id,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 } // for no. of documents count
                            }
                        }
                    ])

                    bidServiceData["rating_calculation"] = reviewData[0]?.rating_overall_data / reviewData[0]?.count
                    bidServiceData["rating_total_count"] = reviewDataCount[0]?.count
                }
        }
        const sendResponse = {
            message: 'Review' + process.env.APP_GET_MESSAGE,
            data: {
                data: (serviceData.length) > 0 ? serviceData : [],
                total: countData,
                totalRating:bidServiceData
            }
        };

        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };

        logger.info('Review' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

export default {
    getByVendorId,
};