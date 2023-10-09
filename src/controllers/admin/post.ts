import { Request, Response } from 'express';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import Post from '../../models/post-model';
import PostComment from '../../models/post-comment-model';
import PostImage from '../../models/post-image-model';
import User from "../../models/user-model";
import UserToken from "../../models/user-token-model";
import Notification from "../../models/notification-model";
import CommonFunction from "../../helper/commonFunction";
import FirebaseFunction from '../../helper/firebase';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// *******************************************************************************************
// =========================== Get Data With Pagination And Filter ===========================
// *******************************************************************************************


const allFiledComment = [
    "_id",
    "admin_id",
    "vendor_id",
    "user_id",
    "post_id",
    "type",
    "comment",
    "customerData.first_name",
    "adminData.first_name",
    "vendorData.first_name",
    "customerData.last_name",
    "adminData.last_name",
    "vendorData.last_name",
    "customerData.profile_photo",
    "adminData.profile_photo",
    "vendorData.profile_photo",
    "createdAt",
]
let projectComment: any = {}

const getAllFiledComment = async () => {
    await allFiledComment.map(function async(item: any) {
        projectComment[item] = 1;
    })
}

getAllFiledComment();



const allFiled = [
    "_id",
    // "date_time",
    "admin_id",
    "vendor_id",
    "user_id",
    "type",
    // "title",
    // "slug",
    // "short_description",
    "description",
    // "service_provider_name",
    "is_active",
    "postImageData",
    "createdAt",
]
let project: any = {}

const getAllFiled = async () => {
    await allFiled.map(function async(item: any) {
        project[item] = 1;
    })
}

getAllFiled();


const getComment = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { search, per_page, page, sort_field, sort_direction } = req.query;
        let filterTextValue: any = search;
        let post_ids: any = req.query.post_id;
        let orders: any = {};
        let pageFind = page ? (Number(page) - 1) : 0;
        let perPage: number = per_page == undefined ? 10 : Number(per_page)
        let filterText: object = {};
        if (sort_field) {
            orders[sort_field as string] = sort_direction == "ascend" ? 1 : -1;
        } else {
            orders = { 'createdAt': -1 };
        }

        if (filterTextValue) {
            let filterTextField: any = []
            await projectComment.map(function async(filed: any) {
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
        const postData: any = await PostComment.aggregate([
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
                $lookup:
                {
                    from: 'users',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendorData'
                }
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: 'admins',
                    localField: 'admin_id',
                    foreignField: '_id',
                    as: 'adminData'
                }
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $project: projectComment },
            {
                $match: {
                    $and: [
                        { post_id: new mongoose.Types.ObjectId(post_ids) },
                        filterText
                    ]
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
            message: 'Post' + process.env.APP_GET_MESSAGE,
            data: postData.length > 0 ? postData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Post' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})
const get = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {

        const { search, per_page, page, sort_field, sort_direction } = req.query;
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

        const postData: any = await Post.aggregate([
            { $project: project },
            {
                $lookup:
                {
                    from: 'post_images',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'postImageData'
                }
            },
            // { $unwind: { path: "$postImageData", preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendorData'
                }
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: 'admins',
                    localField: 'admin_id',
                    foreignField: '_id',
                    as: 'adminData'
                }
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
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
            message: 'Post' + process.env.APP_GET_MESSAGE,
            data: postData.length > 0 ? postData[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Post' + process.env.APP_GET_MESSAGE);
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
        const postData: any = await Post.findOne({ _id: req.query.id })
        await Post.deleteMany({ _id: req.query.id, })
        const responseData = {
            message: 'Post' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };

        if (postData) {
            // start here Push 
            let pushTitle: any = 'Post record has been deleted Successfully';
            let message: any = postData.title + 'has been deleted Successfully'
            let payload: any = postData;
            let userIdNotifiy: any = postData.vendor_id;

            await Notification.create({
                user_id: userIdNotifiy,
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            })

            const userNotification = await User.findOne({
                _id: new mongoose.Types.ObjectId(userIdNotifiy)
            });

            let getToken: any = (await UserToken.find({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy),
                firebase_token: { $ne: null }
            })).map(value => value.firebase_token);

            if (userNotification && userNotification.firebase_is_active) {
                try {
                    let dataStore: any = getToken;
                    let notificationData = {
                        "type": 1,
                        "title": pushTitle,
                        "message": message,
                        "extraData": JSON.stringify(payload),
                        "updatedAt": new Date().toString(),
                    };
                    let fcmData: any = {
                        "subject": pushTitle,
                        "content": message,
                        "data": notificationData,
                        "image": ""
                    };

                    let token: any = dataStore

                    await FirebaseFunction.sendPushNotification(token, fcmData)
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Post' + process.env.APP_DELETE_MESSAGE);
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
    const postData: any = await Post.aggregate([
        { $match: { "_id": new mongoose.Types.ObjectId(id) } },
        {
            $lookup:
            {
                from: 'post_images',
                localField: '_id',
                foreignField: 'post_id',
                as: 'postImageData'
            }
        },
        { $project: project },
    ]);
    return postData.length > 0 ? postData[0] : {};
});

const edit = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let id: any = req.query.id;
        const responseData: any = {
            message: 'Post' + process.env.APP_EDIT_GET_MESSAGE,
            data: await getData(id),
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Post' + process.env.APP_EDIT_GET_MESSAGE);
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

        let id: number = req.body.id;
        let status: string = req.body.status;
        const postData: any = await Post.findOne({ _id: id });
        postData.is_active = status;
        await postData.save();
        const message: string = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`
        const responseData: any = {
            message: message,
            data: true,
        };

        if (postData) {
            // start here Push 
            let pushTitle: any = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`;
            let message: any = `Post status ${(status === "true") ? 'Approved' : 'Rejected'} successfully`
            let payload: any = postData;
            let userIdNotifiy: any = postData.vendor_id;
            await Notification.create({
                user_id: userIdNotifiy,
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            })

            const userNotification = await User.findOne({
                _id: new mongoose.Types.ObjectId(userIdNotifiy)
            });

            let getToken: any = (await UserToken.find({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy),
                firebase_token: { $ne: null }
            })).map(value => value.firebase_token);

            if (userNotification && userNotification.firebase_is_active) {
                try {
                    let dataStore: any = getToken;
                    let notificationData = {
                        "type": 1,
                        "title": pushTitle,
                        "message": message,
                        "extraData": JSON.stringify(payload),
                        "updatedAt": new Date().toString(),
                    };
                    let fcmData: any = {
                        "subject": pushTitle,
                        "content": message,
                        "data": notificationData,
                        "image": ""
                    };

                    let token: any = dataStore

                    await FirebaseFunction.sendPushNotification(token, fcmData)
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }
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
            images,
            // service_provider_name,
            // date_time,
            description,
            // short_description,
            // title,
            type,
            admin_id,
            vendor_id,
            user_id,
        } = req.body;
        let postData: any = {}
        let message: any
        if (id) {
            postData = await Post.findOne({ _id: id });
            message = 'Post' + process.env.APP_UPDATE_MESSAGE;
        } else {
            postData = await new Post();
            message = 'Post' + process.env.APP_STORE_MESSAGE;
        }
        // postData.image = image;
        // postData.service_provider_name = service_provider_name;
        // postData.date_time = date_time;
        postData.description = description;
        // postData.short_description = short_description;
        // postData.title = title;
        // postData.slug = await CommonFunction.titleToSlug(title);
        postData.type = type;

        if (Number(type) === 1 && admin_id) {
            postData.admin_id = new mongoose.Types.ObjectId(admin_id);
        }
        if (Number(type) === 2 && vendor_id) {
            postData.vendor_id = new mongoose.Types.ObjectId(vendor_id);
        }
        if (Number(type) === 3 && user_id) {
            postData.user_id = new mongoose.Types.ObjectId(user_id);
        }
        await postData.save();

        if (images) {
            await PostImage.deleteMany({ post_id: new mongoose.Types.ObjectId(id), })

            images.map(async (img: any, i: any) => {
                let postImageData: any = await new PostImage();
                postImageData.post_id = new mongoose.Types.ObjectId(postData._id);
                postImageData.image = images[i];
                await postImageData.save();
            })
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: message,
            data: await getData(postData._id),
        };
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Post' + process.env.APP_STORE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})


const deletePostComment = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        await PostComment.deleteMany({ _id: req.query.id, })
        const responseData = {
            message: 'Comment Post' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Comment Post' + process.env.APP_DELETE_MESSAGE);
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
    getComment,
    destroy,
    deletePostComment,
} as const;
