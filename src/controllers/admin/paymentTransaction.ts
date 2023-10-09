import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import PaymentTransaction from '../../models/payment-transaction-model'

// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************

const allFiled = [
    "_id",
    "amount",
    "received_amount",
    "commission_charge",
    "status",
    "discount",
    "stripe_request_id",
    "transfer_reference_id",
    "stripe_payload",
    "createdAt",
    "userData.first_name",
    "user_name.last_name",
    "userData.user_name",
    "user_id",
    "userData.profile_photo",
    "vendorData.user_name",
    "vendorData.first_name",
    "vendorData.last_name",
    "vendor_id",
    "vendorData.profile_photo",
    "bidData.currency",
    "bidData.amount",
    "bidData.bidder_note",
    "bidData.validity",
    "bidData.bidder_signature",
    "bidData.service_request_id",
    "bid_id",
    "admin_percentage",
    "vendor_percentage",
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
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText: object = {};
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
                        { _id: new mongoose.Types.ObjectId(filterTextValue) },
                        // { "bidData.service_request_id": new mongoose.Types.ObjectId(filterTextValue) },
                        { "bid_id": new mongoose.Types.ObjectId(filterTextValue) },
                    ],
                }
            }
        }

        const paymentTransactionData: any = await PaymentTransaction.aggregate([
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
                $addFields: {
                    "bidData.service_request_id": {$toString: "$bidData.service_request_id"}
                }
            },
            {
                $project: {
                    ...project,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                }
            },
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
            message: 'Payment Transaction' + process.env.APP_GET_MESSAGE,
            data: paymentTransactionData.length > 0 ? paymentTransactionData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Payment Transaction' + process.env.APP_GET_MESSAGE);
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
