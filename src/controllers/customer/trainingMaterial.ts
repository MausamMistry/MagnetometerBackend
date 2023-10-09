import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import TrainingMaterial from '../../models/training-material-model';
import commonFunction from '../../helper/commonFunction';

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
        const { search, page, per_page,sort_field,sort_direction } = req.query;

        let filterText: object = {};
        let filterTextValue: any = search;
        let perPage: any = per_page == undefined ? 10 : Number(per_page)
        let skipPage: any = (page && Number(page) > 0) ? (Number(Number(page) - 1) * Number(perPage)) : 0;
        let orders: any = {};

        if (sort_field) {
            orders[sort_field as string] = sort_direction == "ascend" ? 1 : -1;
        } else {
            orders = { 'createdAt': -1 };
        }


        if (filterTextValue) {
            filterText = {
                ...filterText,
                $or: [
                    { type: { $regex: `${filterTextValue}`, $options: "i" } },
                    { url: { $regex: `${filterTextValue}`, $options: "i" } },
                    { type: { $regex: `${filterTextValue}`, $options: "i" } },
                    { title: { $regex: `${filterTextValue}`, $options: "i" } },
                    { estimated_maintenance_costs: { $regex: `${filterTextValue}`, $options: "i" } },

                ],
            }
        }

        let countData = await TrainingMaterial.aggregate([
            { $match: filterText },
            commonFunction.isActive(),
            { $group: { _id: null, myCount: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]);
        const trainingMaterialData: any = await TrainingMaterial.aggregate([
            {
                $project: {
                    "_id": 1,
                    "type": 1,
                    "url": 1,
                    "title": 1,
                    "description": 1,
                    "video": 1,
                    "doc": 1,
                    "is_active": 1,
                    "image": 1,
                    "createdAt": 1,
                }
            },
            { $match: filterText },
            commonFunction.isActive(),
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(perPage) },
            { $sort: orders },

        ]);

     

        const sendResponse: any = {
            message: 'Training Material' + process.env.APP_GET_MESSAGE,
            data: {
                data: trainingMaterialData.length > 0 ? trainingMaterialData : [],
                total: countData[0]?.myCount,
            }
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Training Material' + process.env.APP_GET_MESSAGE,);
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
