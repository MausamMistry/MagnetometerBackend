import { Request, Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import ReportRequest from "../../models/report-request.model";


const allFiled = [
    "from_user_id",
    "to_user_id",
    "is_active",
    "from_user.user_name",
    "to_user.user_name",
    "createdAt",
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
                    ],
                }
            }
        }
        const contactUsData: any = await ReportRequest.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "from_user_id",
                    foreignField: "_id",
                    as: "from_user",
                },
            },
            {
                $unwind: { path: "$from_user", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to_user_id",
                    foreignField: "_id",
                    as: "to_user",
                },
            },
            {
                $unwind: { path: "$to_user", preserveNullAndEmptyArrays: true },
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
            message: 'Report Request' + process.env.APP_GET_MESSAGE,
            data: (contactUsData).length > 0 ? contactUsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Report Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

const editStatus = (async (req: Request, res: Response) => {

    const session: any = await mongoose.startSession();
    session.startTransaction();

    const { id, status } = req.body
    const ids = new mongoose.Types.ObjectId(id);
    ReportRequest.findByIdAndUpdate(ids, { is_active: status },
        function (err: any) {
            if (err) {
                const sendResponse: any = {
                    message: err.message,
                }
                logger.info(err);
                session.endSession();
                return response.sendError(res, sendResponse);
            }
            else {
                const responseData: any = {
                    message: 'Report Request' + process.env.APP_UPDATE_MESSAGE,
                    data: {},
                };
                return response.sendSuccess(req, res, responseData);
            }
        });

})


// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************

const destroy = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        await ReportRequest.deleteMany({ _id: req.query.id, })
        const responseData: any = {
            message: 'Report Request' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info("Report Request destroy");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

// Export default
export default {
    get,
    editStatus,
    destroy
};
