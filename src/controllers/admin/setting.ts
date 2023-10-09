import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import Settings from '../../models/setting-model';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************

const get = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction, status } = req.query;
        let filterText: object = {};
        let filterTextStatus: object = {};
        let filterTextValue: any = search;
        let orders: any = { 'createdAt': -1 };
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage: number = per_page == undefined ? 10 : Number(per_page)

        if (sort_field) {
            orders[sort_field as string] = (sort_direction == 'ascend') ? 1 : -1;
        }
        if (filterTextValue) {
            filterText = {
                $or: [
                    { setting_name: { $regex: `${filterTextValue}`, $options: "i" } },
                    { setting_value: { $regex: `${filterTextValue}`, $options: "i" } },
                ],
            }
        }

        const settingsData: any = await Settings.aggregate([
            {
                $project: {
                    "_id": 1,
                    "setting_name": 1,
                    "setting_value": 1,
                    "createdAt": 1,
                }
            },
            { $match: filterTextStatus },
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
            message: 'Setting' + process.env.APP_GET_MESSAGE,
            data: settingsData.length > 0 ? settingsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Setting' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************

const destroy = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        await Settings.deleteMany({ _id: req.query.id, })
        const responseData: any = {
            message: 'Setting' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Setting' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

// *******************************************************************************************
// =================================== Edit the Record Data ==================================
// *******************************************************************************************

const getData = (async (id: number) => {
    const settingsData: any = await Settings.aggregate([
        { $match: { "_id": new mongoose.Types.ObjectId(id) } },
        {
            $project: {
                "_id": 1,
                "setting_name": 1,
                "setting_value": 1,
                "createdAt": 1,
            }
        },
    ]);
    return settingsData.length > 0 ? settingsData[0] : {};
});

const edit = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: any = req.query.id;
        const responseData: any = {
            message: 'Setting' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Setting' + process.env.APP_EDIT_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

// *******************************************************************************************
// ================================= Change Status of Record =================================
// *******************************************************************************************

const changeStatus = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        // not used this function ?
        let id: number = req.body.id;
        let status: string = req.body.status;
        const settingsData: any = await Settings.findOne({ _id: id });
        // settingsData.is_active = status;
        await settingsData.save();
        const message: string = `Settings status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`
        const responseData: any = {
            message: message,
            data: true,
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************

const store = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        const {
            setting_name,
            setting_value,
        } = req.body;
        let settingsData: any = {}
        let message: any
        if (id) {
            settingsData = await Settings.findOne({ _id: id });
            message = 'Setting' + process.env.APP_UPDATE_MESSAGE;
        } else {
            settingsData = await new Settings();
            message = 'Setting' + process.env.APP_STORE_MESSAGE;
        }
        settingsData.setting_name = setting_name;
        settingsData.setting_value = setting_value;
        await settingsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: message,
            data: await getData(settingsData._id),
        };
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Setting' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

// Export default
export default {
    get,
    store,
    changeStatus,
    edit,
    destroy,
} as const;
