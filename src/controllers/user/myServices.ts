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
    "notes",
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
        let vendor_id: any = req.user._id;
        let service_type_all: any = [];
        if (req.query.vendor_id) {
            vendor_id = req.query.vendor_id
        }
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
            if (servicesData[0] && servicesData[0].services) {
                service_type_all = await ServiceType.aggregate([
                    { $match: { "_id": { '$in': servicesData[0].services } } },
                    CommonFunction.isActive(),
                    {
                        $project: {
                            _id: 1,
                            is_active: 1,
                            name: 1,
                            icon: 1,
                            description: 1
                        },
                    },
                ]);
            }
            if (servicesData[0]) {
                servicesData[0]['service_type_all'] = service_type_all;
            }
            const sendResponse: any = {
                message: 'My Services' + process.env.APP_GET_MESSAGE,
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
        logger.info('My Services' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})

const store = (async (req: any, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        let vendor_id: number = req.user._id;
        const {
            description,
            services,
            // vendor_id
        } = req.body;
        let myServicesData: any = {}
        let message: any
        if (id) {
            myServicesData = await MyServices.findOne({ _id: id });
            message = 'My Services' + process.env.APP_UPDATE_MESSAGE;
        } else {
            myServicesData = await new MyServices();
            const myServicesCheck = await MyServices.findOne({ vendor_id: new mongoose.Types.ObjectId(vendor_id) })
            message = 'My Services' + process.env.APP_STORE_MESSAGE;
            if (myServicesCheck && !id) {
                const sendResponse: any = {
                    message: process.env.APP_ADD_SR_TO_SP_MESSAGE,
                }
                logger.info(process.env.APP_ADD_SR_TO_SP_MESSAGE);
                await session.abortTransaction();
                session.endSession();
                return response.sendError(res, sendResponse);
            }
        }
        myServicesData.vendor_id = new mongoose.Types.ObjectId(vendor_id);
        myServicesData.description = description;
        myServicesData.services = services;
        await myServicesData.save();
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
        logger.info('My Services' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})


const addUpdateOurServiceNotes = (async (req: any, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        let vendor_id: number = req.user._id;
        const {
            notes
            // vendor_id
        } = req.body;
        let myServicesData: any = {}
        let message: any
        if (id) {
            message = 'Our Service Notes' + process.env.APP_UPDATE_MESSAGE;
            await MyServices.findByIdAndUpdate(id, { notes: notes })
        } else {
            myServicesData = await new MyServices();
            const myServicesCheck = await MyServices.findOne({ vendor_id: new mongoose.Types.ObjectId(vendor_id) })
            message = 'Our Service Notes' + process.env.APP_STORE_MESSAGE;
            if (myServicesCheck && !id) {
                const sendResponse: any = {
                    message: process.env.APP_ADD_SR_TO_SP_MESSAGE,
                }
                await session.abortTransaction();
                session.endSession();
                return response.sendError(res, sendResponse);
            } else {
                myServicesData.vendor_id = new mongoose.Types.ObjectId(vendor_id);
                myServicesData.notes = notes;
                await myServicesData.save();
            }
        }
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
        logger.info('Our Service Notes' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

export default {
    store,
    get,
    addUpdateOurServiceNotes,
};