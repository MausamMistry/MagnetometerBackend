import { Request, Response } from "express";
import mongoose from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import ServiceRequest from "../../models/service-request-model";
import CommonFunction from "../../helper/commonFunction";
import serviceRequestImageModel from "../../models/service-request-image-model";
import DisputeModel from "../../models/dispute-model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************


const allFiled = [
    "customerData.first_name",
    "customerData.last_name",
    "customerData.profile_photo",
    "serviceRequestDocumentData.type",
    "serviceRequestDocumentData.path",
    "serviceRequestImagesData.type",
    "serviceRequestImagesData.path",
    "serviceTypeData._id",
    "serviceTypeData.name",
    "assetsData.name",
    "assetsData.type",
    "assetsData.url",
    "priorityData.name",
    "srBidsData._id",
    "srBidsData.amount",
    "srBidsData.workingSPData._id",
    "srBidsData.workingSPData.first_name",
    "srBidsData.workingSPData.last_name",
    "srBidsData.workingSPData.user_name",
    "srBidsData.workingSPData.profile_photo",

    "_id",
    "selected_bid_id",
    "user_id",
    "service_type_id",
    "assets_id",
    "dispute_id",
    "bid_id",
    "is_admin_connect",
    "admin_comment",
    "complishment_report",
    "title",
    "location",
    "detail",
    "contact_no",
    "priority",
    "schedule_date",
    "type",
    "request_id",
    "close_reason",
    "close_note",
    "is_deleted",
    "is_exipred",
    "selected_vendor",
    "bid_price",
    "complishment_report_date",
    "status",
    "is_active",
    "createdAt",
    "updatedAt",
    "slug"
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}

getAllFiled();



const get = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterText: object = {};
        let filterTextValue: any = search;
        let assets_id: any = req.query.assets_id;
        let priority: any = req.query.priority;
        let service_type_id: any = req.query.service_type_id;
        let status: any = req.query.status;
        const select_user_id: any = (req.query.user_id) ?? req.query.user_id;
        let orders: any = {};
        let filterTextId: object = {}

        let pageFind = page ? Number(page) - 1 : 0;
        let perPage: number = per_page == undefined ? 10 : Number(per_page);
        if (select_user_id && select_user_id !== 'undefined' || select_user_id !== undefined) {
            filterText = {
                user_id: new mongoose.Types.ObjectId(select_user_id)
            }
        }
        if (assets_id && service_type_id) {
            filterTextId = {
                ...filterTextId,
                $and: [{ assets_id: { $in: [new mongoose.Types.ObjectId(assets_id)] } },
                { service_type_id: { $in: [new mongoose.Types.ObjectId(service_type_id)] } }]
            };
        }

        if (service_type_id && !assets_id) {
            filterTextId = {
                ...filterTextId,
                $or: [{ service_type_id: { $in: [new mongoose.Types.ObjectId(service_type_id)] } }]
            };
        }

        if (!service_type_id && assets_id) {
            filterTextId = {
                ...filterTextId,
                $or: [{ assets_id: { $in: [new mongoose.Types.ObjectId(assets_id)] } }]
            };
        }

        if (priority) {
            filterText = {
                ...filterText,
                $or: [{ priority: { $in: [new mongoose.Types.ObjectId(priority)] } }]
            };
        }
        if (status) {
            filterText = {
                ...filterText,
                $or: [{ status: { $in: [status] } }]
            };
        }
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
            // if (mongoose.Types.ObjectId.isValid(filterTextValue)) {
            //     filterText = {
            //         $or: [
            //             { _id: new mongoose.Types.ObjectId(filterTextValue) },
            //         ],
            //     }
            // }
        }

        const serviceData: any = await ServiceRequest.aggregate([

            {
                $lookup:
                {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'customerData'
                }
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "service_request_files",
                    localField: "_id",
                    foreignField: "service_request_id",
                    pipeline: [
                        {
                            $match: {
                                type: "1"
                            }
                        },
                    ],
                    as: "serviceRequestImagesData",
                },
            },
            {
                $lookup: {
                    from: "service_request_files",
                    localField: "_id",
                    foreignField: "service_request_id",
                    pipeline: [
                        {
                            $match: {
                                type: "2"
                            }
                        },
                    ],
                    as: "serviceRequestDocumentData",
                },
            },
            {
                $lookup:
                {
                    from: 'service_types',
                    localField: 'service_type_id',
                    foreignField: '_id',
                    as: 'serviceTypeData'
                }
            },
            { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: 'assets',
                    localField: 'assets_id',
                    foreignField: '_id',
                    as: 'assetsData'
                }
            },
            { $unwind: { path: "$assetsData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "priorities",
                    localField: "priority",
                    foreignField: "_id",
                    as: "priorityData",
                },
            },
            {
                $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "bids",
                    localField: "selected_bid_id",
                    foreignField: "_id",
                    as: "srBidsData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "workingSPData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$workingSPData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },

                    ],
                },
            },
            { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },
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
                    updatedAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$updatedAt" },

                    }
                },
            },
            { $match: filterText },
            { $match: filterTextId },
            { $sort: orders },
            {
                $facet: {
                    total: [{ $count: "createdAt" }],
                    docs: [{ $addFields: { _id: "$_id" } }],
                },
            },
            { $unwind: "$total" },
            {
                $project: {
                    docs: {
                        $slice: [
                            "$docs",
                            perPage * pageFind,
                            {
                                $ifNull: [perPage, "$total.createdAt"],
                            },
                        ],
                    },
                    total: "$total.createdAt",
                    limit: { $literal: perPage },
                    page: { $literal: pageFind + 1 },
                    pages: { $ceil: { $divide: ["$total.createdAt", perPage] } },
                },
            },
        ]);
        const sendResponse: any = {
            message: 'Service Request' + process.env.APP_GET_MESSAGE,
            data: serviceData.length > 0 ? serviceData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************

const destroy = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        await ServiceRequest.deleteMany({ _id: req.query.id });
        const responseData: any = {
            message: 'Service Request' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

// *******************************************************************************************
// =================================== Edit the Record Data ==================================
// *******************************************************************************************

const getData = async (id: number) => {
    const serviceData: any = await ServiceRequest.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $lookup:
            {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'customerData'
            }
        },
        { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "1"
                        }
                    },
                ],
                as: "serviceRequestImagesData",
            },
        },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "2"
                        }
                    },
                ],
                as: "serviceRequestDocumentData",
            },
        },
        {
            $lookup:
            {
                from: 'service_types',
                localField: 'service_type_id',
                foreignField: '_id',
                as: 'serviceTypeData'
            }
        },
        { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
        {
            $lookup:
            {
                from: 'assets',
                localField: 'assets_id',
                foreignField: '_id',
                as: 'assetsData'
            }
        },
        { $unwind: { path: "$assetsData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "bids",
                localField: "selected_bid_id",
                foreignField: "_id",
                as: "srBidsData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "workingSPData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$workingSPData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                ],
            },
        },
        { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },
        { $project: project },
        {
            $project: {

            },
        },
    ]);
    return serviceData.length > 0 ? serviceData[0] : {};
};

const edit = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: any = req.query.id;
        const responseData: any = {
            message: 'Service Request' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_EDIT_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

// *******************************************************************************************
// ================================= Change Status of Record =================================
// *******************************************************************************************

const changeStatus = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        let status: string = req.body.status;
        const serviceData: any = await ServiceRequest.findOne({ _id: id });
        serviceData.is_active = status;
        await serviceData.save();
        const message: string = `Service Request status ${status === "true" ? "Approved" : "Rejected"
            } successfully`;
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
        };
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const closeByAdmin = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        const serviceData: any = await ServiceRequest.findOne({ _id: id });
        serviceData.status = 10;
        serviceData.admin_comment = req.body.admin_comment;
        if (serviceData.dispute_id) {
            await DisputeModel.findByIdAndUpdate(
                new mongoose.Types.ObjectId(serviceData.dispute_id), {
                status: 2
            });

        }
        await serviceData.save();
        const message: string = `Service Request Closed successfully`;
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
        };
        logger.info(err.message);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************

const store = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: number = req.body.id;
        const {
            user_id,
            service_type_id,
            asset_id,
            title,
            location,
            type,
            detail,
            photos,
            document,
            contact_no,
            priority,
            schedule_date,
        } = req.body;

        let serviceData: any = {};
        let message: any;
        if (id) {
            serviceData = await ServiceRequest.findOne({ _id: id });
            message = 'Service Request' + process.env.APP_UPDATE_MESSAGE;
        } else {
            serviceData = await new ServiceRequest();
            message = 'Service Request' + process.env.APP_STORE_MESSAGE;
        }

        serviceData.user_id = new mongoose.Types.ObjectId(user_id);
        serviceData.service_type_id = new mongoose.Types.ObjectId(service_type_id);
        serviceData.assets_id = new mongoose.Types.ObjectId(asset_id);
        serviceData.title = title;
        serviceData.location = location;
        serviceData.detail = detail;
        serviceData.contact_no = contact_no;
        serviceData.priority = new mongoose.Types.ObjectId(priority);
        serviceData.type = type;
        serviceData.status = 2;
        serviceData.slug = await CommonFunction.titleToSlug(title);
        serviceData.request_id = await CommonFunction.makeIdString(15);;
        serviceData.schedule_date = (Number(type) === 2) ? schedule_date : '';
        await serviceData.save();
        if (photos) {
            photos.map(async function (img: any) {
                const imageData: any = new serviceRequestImageModel();
                imageData.service_request_id = serviceData._id;
                imageData.path = img;
                imageData.type = 1 // image
                await imageData.save();
            })
        }

        if (document) {
            const imageData: any = new serviceRequestImageModel();
            imageData.service_request_id = serviceData._id;
            imageData.path = document;
            imageData.type = 2  // document
            await imageData.save();
        }

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: message,
            data: await getData(serviceData._id),
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Service Request' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

// Export default
export default {
    get,
    store,
    changeStatus,
    edit,
    destroy,
    closeByAdmin,
} as const;
