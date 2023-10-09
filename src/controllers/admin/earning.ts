import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import MyEarning from '../../models/my-earning-model';
import moment from 'moment';

// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************

const allFiled = [
    "_id",
    "bid_id",
    "card_id",
    "user_id",
    "vendor_id",
    "old_wallet_amount",
    "new_wallet_amount",
    "amount",
    "sp_received_amount",
    "admin_received_amount",
    "status",
    "transfer_reference_id",
    "createdAt",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
    "userData.wallet_amount",
    // "bidData.service_request_id",
    "bidData._id",
    "bidData.currency",
    "bidData.amount",
    "bidData.delivery_timeframe",
    "bidData.validity",
    "bidData.bidder_note",
    "bidData.bidder_signature",
    "bidData.request_id",
    "vendorData.first_name",
    "vendorData.last_name",
    "vendorData.user_name",
    "vendorData.wallet_amount",
    "admin_percentage",
    "vendor_percentage",
    "serviceRequestData.request_id"
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}

getAllFiled();


const get = (async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction, type, from_date, to_date } = req.query;
        let filterText: object = {};
        let filterDate: object = {};
        let filterTextValue: any = search;
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

            filterText = { $or: filterTextField }
            if (mongoose.Types.ObjectId.isValid(filterTextValue)) {
                filterText = {
                    $or: [
                        { _id: { $regex: `${new mongoose.Types.ObjectId(filterTextValue)}`, $options: "i" } },
                    ],
                }
            }
        }
        if (from_date && to_date) {
            filterDate = {
                createdAt: {
                    $gte: new Date(from_date.toString()),
                    $lte: new Date(to_date.toString())
                }
            }
        }


        const totalAdminSum = await MyEarning.aggregate([
            // { $match: { status: "9" } },
            { $match: filterText },
            { $match: filterDate },
            {
                $group: {
                    _id: null,
                    totalReceivedAmount: {
                        $sum: {
                            $toDouble: "$admin_received_amount"
                        }
                    }
                }
            }
        ]);


        const MyEarningData: any = await MyEarning.aggregate([
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
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "bids",
                    localField: "bid_id",
                    foreignField: "_id",
                    as: "bidData",
                },
            },
            { $unwind: { path: "$bidData", preserveNullAndEmptyArrays: true } },

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
                    ...project,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                }
            },

            { $match: filterText },
            { $match: filterDate },
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
        const datas = {
            totalAdminSum: (totalAdminSum[0]) ? Math.round(totalAdminSum[0].totalReceivedAmount) : 0,
            data: MyEarningData.length > 0 ? MyEarningData[0] : {},
        }
        const sendResponse: any = {
            message: 'My Earning' + process.env.APP_GET_MESSAGE,
            data: datas
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('My Earning' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})


// Export default
export default {
    get
} as const;
