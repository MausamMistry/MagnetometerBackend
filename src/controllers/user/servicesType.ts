import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import ServiceType from '../../models/service-type-model';
import CommonFunction from '../../helper/commonFunction';

const allFiled = [
    "_id",
    "name",
    "icon",
    "description",
    "is_active",
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}
getAllFiled();

const getlist = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let orders: any = {'createdAt': -1 };
   
        const serviceTypeData: any = await ServiceType.aggregate([
            { $project: project },
            { $sort: orders },
            CommonFunction.isActive(),
           
        ]);
        const sendResponse: any = {
            message: 'Service Type' + process.env.APP_GET_MESSAGE,
            data: serviceTypeData.length > 0 ? serviceTypeData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Service Type' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

export default {
 getlist
};