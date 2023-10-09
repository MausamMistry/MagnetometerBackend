import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import MyServices from '../../models/my-services-model'
import ServiceType from '../../models/service-type-model'
import CommonFunction from "../../helper/commonFunction";

const allFiled = [
    "_id",
    "description",
    "services",
    "is_active",
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}
getAllFiled();


const get = (async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        let vendor_id = req.query.vendor_id

        if (vendor_id) {
            const servicesData: any = await MyServices.aggregate([

                { $match: { "vendor_id": new mongoose.Types.ObjectId(vendor_id) } },
                {
                    $project: {
                        ...project,
                    }
                },
                { $sort: { 'createdAt': -1 } },
            ]);
            let service_type_all: any = [];
            if (servicesData && servicesData[0]?.services) {
                service_type_all = await ServiceType.aggregate([
                    { $match: { "_id": { '$in': servicesData[0].services } } },
                    CommonFunction.isActive(),
                    {
                        $project: {
                            _id: 1,
                            is_active: 1,
                            name: 1,
                            icon: 1,
                        },
                    },
                ]);
            }
            if (service_type_all.length > 0) {

                servicesData[0]['service_type_all'] = service_type_all;
            }

            const sendResponse: any = {
                message: 'My Service' + process.env.APP_GET_MESSAGE,
                data: servicesData.length > 0 ? servicesData[0] : [],
            };
            await session.commitTransaction();
            session.endSession();
            return response.sendSuccess(req, res, sendResponse);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('My Service' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

export default {
    get,
};