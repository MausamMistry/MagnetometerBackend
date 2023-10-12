import { Request, Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import ReportRequest from "../../models/report-request.model";


// ***************************************report user and provide****************************************************

const store = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            from_user_id, to_user_id
        } = req.body;

        let reportUserData: any = await new ReportRequest();
        reportUserData.from_user_id = new mongoose.Types.ObjectId(from_user_id);
        reportUserData.to_user_id = new mongoose.Types.ObjectId(to_user_id);

        await reportUserData.save();

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: 'Report Request' + process.env.APP_STORE_MESSAGE,
            data: {},
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Report Request' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};




// Export default
export default {
    store
};
