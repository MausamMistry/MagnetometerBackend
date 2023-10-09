import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import ContactUs from '../../models/contactus-model';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************



const allFiled = [
    "_id",
    "email",
    "name",
    "location",
    "mobile_no",
    "images",
    "user_id",
    "message",
    "is_active",
    "userData._id",
    "userData.type",
    "userData.first_name",
    "userData.last_name",
    "userData.user_name",
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
        const { search, per_page, page, sort_field, sort_direction, type } = req.query;
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

        if (type) {

            filterText = {
                ...filterText,
                "userData.type": type,
            };
        }

        const contactUsData: any = await ContactUs.aggregate([

            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             type: type,
                    //         }
                    //     },
                    //     {
                    //         $project: {
                    //             type: "1",
                    //         },
                    //     },
                    // ],
                    as: "userData",
                },
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "_id": { $toString: "$_id" }
                }
            },
            {
                $project: {
                    ...project,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                }
            },
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
            message: 'Contact Us' + process.env.APP_GET_MESSAGE,
            data: contactUsData.length > 0 ? contactUsData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Contact Us' + process.env.APP_GET_MESSAGE);
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await ContactUs.deleteMany({ _id: req.query.id, })
        const responseData: any = {
            message: 'Contact Us' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Contact Us' + process.env.APP_DELETE_MESSAGE,);
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
    const contactUsData: any = await ContactUs.aggregate([
        { $match: { "_id": new mongoose.Types.ObjectId(id) } },
        { $project: project },
    ]);
    return contactUsData.length > 0 ? contactUsData[0] : {};
});

const edit = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: any = req.query.id;
        const responseData: any = {
            message: 'Contact Us' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Contact Us' + process.env.APP_EDIT_GET_MESSAGE);
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        let status: string = req.body.status;
        const contactUsData: any = await ContactUs.findOne({ _id: id });
        contactUsData.is_active = status;
        await contactUsData.save();
        const message: string = `ContactUs status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        const {
            email,
            first_name,
            last_name,
            user_id,
            messages,
        } = req.body;
        let contactUsData: any = {}
        let message: any
        if (id) {
            contactUsData = await ContactUs.findOne({ _id: id });
            message = 'Contact Us' + process.env.APP_UPDATE_MESSAGE;
        } else {
            contactUsData = await new ContactUs();
            message = 'Contact Us' + process.env.APP_STORE_MESSAGE;
        }
        contactUsData.email = email;
        contactUsData.first_name = first_name;
        contactUsData.last_name = last_name;
        contactUsData.message = messages;
        contactUsData.user_id = new mongoose.Types.ObjectId(user_id);
        await contactUsData.save();
        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: message,
            data: await getData(contactUsData._id),
        };
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Contact Us' + process.env.APP_STORE_MESSAGE);
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
