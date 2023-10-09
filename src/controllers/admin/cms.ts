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
    try {
        const data: any = await Cms.find();
        let fees_map: any = {};
        fees_map = await new Map(data.map((values: any) => [
            values.key, values.value
        ]));
        let feesMapArray: any = await Object.fromEntries(fees_map.entries());

        const sendResponse: any = {
            data: feesMapArray ? feesMapArray : {},
            message: 'CMS' + process.env.APP_GET_MESSAGE,
        }
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
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
            about_us,
            who_we_are,
            terms_condition,
            privacy_policy,
            our_services,
            mission,
            brochure,
            vision,
            get_our_mobile_app,
            training_matirial
        } = req.body;
        await Cms.updateOne({ key: 'about_us' }, { $set: { value: about_us } });
        await Cms.updateOne({ key: 'who_we_are' }, { $set: { value: who_we_are } });
        await Cms.updateOne({ key: 'terms_condition' }, { $set: { value: terms_condition } });
        await Cms.updateOne({ key: 'privacy_policy' }, { $set: { value: privacy_policy } });
        await Cms.updateOne({ key: 'our_services' }, { $set: { value: our_services } });
        await Cms.updateOne({ key: 'vision' }, { $set: { value: vision } });
        await Cms.updateOne({ key: 'mission' }, { $set: { value: mission } });
        await Cms.updateOne({ key: 'brochure' }, { $set: { value: brochure } });
        await Cms.updateOne({ key: 'get_our_mobile_app' }, { $set: { value: get_our_mobile_app } });
        await Cms.updateOne({ key: 'training_matirial' }, { $set: { value: training_matirial } });

        await session.commitTransaction();
        await session.endSession();
        const sendResponse: any = {
            message: 'CMS' + process.env.APP_UPDATE_MESSAGE
        };
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('CMS' + process.env.APP_UPDATE_MESSAGE);
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
