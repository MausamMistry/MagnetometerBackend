import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import Cms from '../../models/cms-model';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************
const get = (async (req: Request, res: Response) => {
    console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
    
    try {
        const data: any = await Cms.find();
        let fees_map: any = {};
        fees_map = await new Map(data.map((values: any) => [
            values.key, values.value
        ]));
        let feesMapArray: any = await Object.fromEntries(fees_map.entries());
        console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
        
        const sendResponse: any = {
            data: feesMapArray ? feesMapArray : {},
            message: 'CMS' + ' ' + process.env.APP_GET_MESSAGE,
        }
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
        console.log("process.env.APP_GET_MESSAGE", process.env.APP_GET_MESSAGE);
        
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('CMS' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})


// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************

const store = (async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            settings,
            info,
            vibration,
            calibration,
        } = req.body;
        await Cms.updateOne({ key: 'SETTINGS' }, { $set: { value: settings } });
        await Cms.updateOne({ key: 'INFO' }, { $set: { value: info } });
        await Cms.updateOne({ key: 'VIBRATION' }, { $set: { value: vibration } });
        await Cms.updateOne({ key: 'CALIBRATION' }, { $set: { value: calibration } });

        
        const sendResponse: any = {
            status: 200,
            message: 'CMS' + ' ' + process.env.APP_UPDATE_MESSAGE
        };
        await session.commitTransaction();
        await session.endSession();
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('CMS' + ' ' + process.env.APP_UPDATE_MESSAGE);
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
};
