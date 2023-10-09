import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import User from '../../models/user-model';
import Commission from '../../models/commisstion-history'


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const allFiled = [
    "_id",
    "current_commission",
    "old_commission",
    "commission_sing",
    "createdAt",
    "userData._id",
    "userData.type",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
    "adminData._id",
    "adminData.first_name",
    "adminData.last_name",
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}

getAllFiled();


const store = (async (req: any, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            user_id,
            current_commission,
            old_commission,
            commission_sing
        } = req.body;
        const admin_id = req.admin._id;
        let commissionData: any = {}
        let message: any
        commissionData = await new Commission();
        message =  'Commission' + process.env.APP_STORE_MESSAGE ;

        commissionData.user_id = new mongoose.Types.ObjectId(user_id);
        commissionData.current_commission = current_commission;
        commissionData.old_commission = old_commission;
        commissionData.commission_sing = commission_sing;
        commissionData.admin_id = new mongoose.Types.ObjectId(admin_id);
        await commissionData.save();

        const userData: any = await User.findOne({ _id: user_id });
        userData.current_commission = current_commission;
        userData.commission_sing = commission_sing
        await userData.save();

        await session.commitTransaction();
        await session.endSession();

        const responseData: any = {
            message: message,
            data: {},
        };
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Commission' + process.env.APP_STORE_MESSAGE );
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})




// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************

const getCommissionHistory = (async (req: Request, res: Response) => {
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
                    ],
                }
            }
        }

        const commissionData: any = await Commission.aggregate([
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
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
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
            message: 'Commission' + process.env.APP_GET_MESSAGE,
            data: commissionData.length > 0 ? commissionData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Commission' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})


// Export default
export default {
    getCommissionHistory,
    store
} as const;
