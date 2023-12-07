import response from "../../helper/responseMiddleware";
import fs from "fs";
import aws from "../../helper/aws";
import jwt from "../../helper/jwt";
import mongoose from "mongoose";
import { Request, Response } from "express";
import Category from "../../models/category-model";
import ContactUs from "../../models/contactus-model";
import Admin from "../../models/admin-model";
import User from "../../models/user-model";
import Chat from "../../models/chat-model";
import Post from "../../models/post-model";
import PostLike from "../../models/post-like-model";
import PostComment from "../../models/post-comment-model";
import { nonReSizeImage, reSizeImage } from "../../helper/sizeImage";
import Cms from "../../models/cms-model";
import Faq from "../../models/faq-model";
import ServiceType from "../../models/service-type-model";
import AssetFaclity from '../../models/asset-model'
import CancelReason from '../../models/cancel-reason-model';
import CategoriesDispute from '../../models/categories-dispute-model';
import AssetsCategory from "../../models/assets-category-model"
import AssetsUses from '../../models/assets-uses-model';
import AssetStructureType from '../../models/assets-structure-type-model';
import AssetFacadeType from '../../models/assets-facade-type-model'
import PostImage from '../../models/post-image-model';
import SocialMedia from '../../models/social-media-model';
import Suggestions from '../../models/suggestions-model'
import Priority from '../../models/priority-model'
import OurContactUs from '../../models/our-contact-us-model';

import UserToken from "../../models/user-token-model";
import AdminToken from "../../models/admin-token-model";
import OtpModel from "../../models/otp-model";
import Notification from "../../models/notification-model";
import CommonFunction from "../../helper/commonFunction";
import FirebaseFunction from '../../helper/firebase';
import ServiceRequest from "../../models/service-request-model";
import DisputeModel from "../../models/dispute-model";
import commonFunction from "../../helper/commonFunction";
import WhyMaintenanceModel from "../../models/why-maintenance-model";
import postLikeModel from "../../models/post-like-model";

const log4js = require("log4js");
const logger = log4js.getLogger();

const otpVerification = async (req: any, res: any) => {
    try {
        const { otp, token } = req.body;
        if (!token) {
            const sendResponse: any = {
                message: process.env.APP_TOKEN_INVALID,
            };
            return response.sendAuthError(res, sendResponse);
        }
        const clientData: any = await jwt.decode(token);
        const getOtp: any = await OtpModel.findOne({
            // user_id: new mongoose.Types.ObjectId(clientData.user_id),
            token: token,
        });
        const matchOtp: any = getOtp.otp == otp;
        if (!matchOtp) {
            const sendResponse: any = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
                data: {},
            };
            return response.sendError(res, sendResponse);
        }
        const expired: any = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse: any = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
                data: {},
            };
            return response.sendError(res, sendResponse);
        }

        const passwordResetToken: any = await jwt.sign({
            otp: otp,
            user_id: clientData.user_id,
            mobile_no: clientData.mobile_no,
        });
        await OtpModel.findByIdAndDelete(getOtp._id);
        const sendResponse: any = {
            token: passwordResetToken,
            message: process.env.APP_OTP_VERIFY,
            data: {}
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: process.env.APP_OTP_EXPIREd,
        };
        return response.sendError(res, sendResponse);
    }
};

const uploadFiles = async (req: any, res: any) => {
    try {
        const imagePath = req.files[0].path;
        const blob = fs.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;

        if (imagePath && blob) {
            let imageName = "file/" + Date.now() + originalFile;
            const uploadedImageData: any = await aws.uploadFileToS3(imageName, blob);

            fs.unlinkSync(req.files[0].path);
            const responseData: any = {
                data: {
                    url: uploadedImageData.Location,
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };

            return response.sendResponse(res, responseData);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const uploadVideo = async (req: any, res: any) => {
    try {
        const imagePath = req.files[0].path;
        const type: number = req.query.type;
        const blob = fs.readFileSync(imagePath);
        const originalFile = req.files[0].originalname;
        if (imagePath && blob) {
            let imageName = "admin/" + Date.now() + originalFile;
            if (Number(type) === 11) {
                imageName = "chat/video/" + Date.now() + originalFile;
            }
            if (Number(type) === 12) {
                imageName = "chat/audio/" + Date.now() + originalFile;
            }
            const uploadedImageData: any = await aws.uploadFileToS3(imageName, blob);
            fs.unlinkSync(req.files[0].path);

            const responseData: any = {
                data: {
                    image_url: uploadedImageData.Location,
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };

            return response.sendResponse(res, responseData);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const uploadImage = async (req: any, res: any) => {
    try {
        const imagePath = req.files[0].path;
        const blob = fs.readFileSync(imagePath);
        
        if (imagePath && blob) {
            if(req.files[0]) {
                req.files[0].path = 'http://103.154.184.187:5006/' + req.files[0].path;
            }

            const responseData: any = {
                data: {
                    image_url: "http://103.154.184.187:5006/" + imagePath
                },
                message: process.env.APP_UPLOAD_FILE_MESSAGE,
            };
            return response.sendResponse(res, responseData);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const uploadImageMulti = async (req: any, res: any) => {
    try {
        let imgData: any = []
        req.files.map(async (val: any, i: number) => {
            const imagePath = req.files[i].path;
            const type: number = req.query.type;
            const blob = fs.readFileSync(imagePath);
            const originalFile = req.files[i].originalname;

            if (imagePath && blob) {
                let imageName = "admin/" + Date.now() + originalFile;
                if (Number(type) === 1) {
                    imageName = "admin/" + Date.now() + originalFile;
                }
                if (Number(type) === 2) {
                    imageName = "chat/" + Date.now() + originalFile;
                }
                if (Number(type) === 3) {
                    imageName = "customer/" + Date.now() + originalFile;
                }
                if (Number(type) === 4) {
                    imageName = "vendor/" + Date.now() + originalFile;
                }
                if (Number(type) === 5) {
                    imageName = "contact_us/" + Date.now() + originalFile;
                }
                if (Number(type) === 6) {
                    imageName = "service_request/" + Date.now() + originalFile;
                }
                if (Number(type) === 7) {
                    imageName = "bid_signature/" + Date.now() + originalFile;
                }
                if (Number(type) === 8) {
                    imageName = "our_services/" + Date.now() + originalFile;
                }
                if (Number(type) === 9) {
                    imageName = "social_icon/" + Date.now() + originalFile;
                }
                if (Number(type) === 13) {
                    imageName = "why_maintenance_master/" + Date.now() + originalFile;
                }
                // const uploadedImageData: any = await aws.uploadImageToS3(imageName, blob);

                // let comparessedImageData: any = await reSizeImage(blob, 400, 400);
                // if (Number(type) === 7 || Number(type) === 2) {
                let comparessedImageData: any = await nonReSizeImage(blob);
                // }
                const uploadedImageData: any = await aws.uploadImageToS3(
                    imageName,
                    comparessedImageData
                );
                imgData.push(uploadedImageData.Location)
                fs.unlinkSync(req.files[i].path);
            }

            if (imgData.length === req.files.length) {
                const responseData: any = {
                    data: imgData,
                    message: process.env.APP_UPLOAD_FILE_MESSAGE
                };

                return response.sendResponse(res, responseData);
            }
        })


    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_UPLOAD_FILE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const getCategory = async (req: any, res: any) => {
    try {
        const categoryData: any = await Category.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    parent_id: 1,
                    name: 1,
                },
            },
        ]);

        const sendResponse: any = {
            message: 'Category' + process.env.APP_GET_MESSAGE,
            data: categoryData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Category' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const GetActiveAdmin = async (req: any, res: any) => {
    try {
        const adminData: any = await Admin.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);

        const sendResponse: any = {
            message: 'Active Admin' + process.env.APP_GET_MESSAGE,
            data: adminData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Active Admin' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const GetActiveVendor = async (req: any, res: any) => {
    try {
        const vendorData: any = await User.aggregate([
            CommonFunction.isActive(),

            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);

        const sendResponse: any = {
            message: 'SR Active' + process.env.APP_GET_MESSAGE,
            data: vendorData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('SR Active' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const GetActiveCustomer = async (req: any, res: any) => {
    try {
        const customerData: any = await User.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    user_name: 1,
                    mobile_no: 1,
                    email: 1,
                    profile_photo: 1,
                    location: 1,
                    is_active: 1,
                },
            },
        ]);

        const sendResponse: any = {
            message: 'Customer Active' + process.env.APP_GET_MESSAGE,
            data: customerData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Customer Active' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const getServiceType = async (req: any, res: any) => {
    try {
        const serviceTypeData: any = await ServiceType.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    is_active: 1,
                    name: 1,
                },
            },
            { $sort: { 'name': 1 } },
        ]);

        const sendResponse: any = {
            message: 'Service Type' + process.env.APP_GET_MESSAGE,
            data: serviceTypeData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Service Type' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const getAssets = async (req: any, res: any) => {
    try {

        const assetsData: any = await AssetFaclity.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
            { $sort: { 'name': 1 } },
        ]);
        const sendResponse: any = {
            message: 'Asset' + process.env.APP_GET_MESSAGE,
            data: assetsData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Asset' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};



// *******************************************************************************************
// ================================= Store Record In Database =================================
// *******************************************************************************************

const getChat = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type, search } = req.body;
        let filterText: object = {};
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        if (search) {
            filterText = {
                ...filterText,
                $or: [
                    { "customerData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "customerData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "vendorData.last_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.first_name": { $regex: `${search}`, $options: "i" } },
                    { "adminData.last_name": { $regex: `${search}`, $options: "i" } },
                ],
            };
        }


        const ChatStatus: any = await Chat.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            { $match: filterText },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    room_id: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                },
            },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_CHAt_JOINED_MESSAGE,
            data: ChatStatus,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const storeContactUs = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { email, name, mobile_no, message, user_id, images, location, subject } =
            req.body;
        let contactUsData: any = await new ContactUs();
        contactUsData.email = email;
        contactUsData.name = name;
        contactUsData.mobile_no = mobile_no;
        contactUsData.location = location;
        contactUsData.subject = subject;
        contactUsData.message = message;
        if (user_id) {
            contactUsData.user_id = new mongoose.Types.ObjectId(user_id);
        }
        contactUsData.images = JSON.stringify(images);

        await contactUsData.save();

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_THANK_YOU_MESSAGE,
            data: {},
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_THANK_YOU_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const storeChat = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type } = req.body;
        let filterText: object = {};
        // type
        // 1 admin and vendor chat
        // 2 admin and customer chat
        // 3 customer and customer chat
        // 4 customer and vendor chat
        if (Number(type) === 1) {
            filterText = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            filterText = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3) {
            filterText = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 4) {
            filterText = {
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        const chatFindData: any = await Chat.findOne(filterText).count();
        if (chatFindData <= 0) {
            const storeChatData = await new Chat();

            if (admin_id) {
                storeChatData.admin_id = new mongoose.Types.ObjectId(admin_id);
            }
            if (user_id) {
                storeChatData.user_id = new mongoose.Types.ObjectId(user_id);
            }
            if (vendor_id) {
                storeChatData.vendor_id = new mongoose.Types.ObjectId(vendor_id);
            }
            storeChatData.type = type;
            storeChatData.room_id = await CommonFunction.makeIdString(15);
            await storeChatData.save();
        }

        const chatData: any = await Chat.findOne(filterText);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_CHAt_JOINED_MESSAGE,
            data: chatData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_CHAt_JOINED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const storePostComment = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, user_id, type, comment, post_id,page,per_page } =
            req.body;
        let userData: any = {};
        userData = {
            type: type,
            comment: comment,
            post_id: new mongoose.Types.ObjectId(post_id),
        };

        if (Number(type) === 1) {
            userData = {
                ...userData,
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2) {
            userData = {
                ...userData,
                vendor_id: new mongoose.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 3) {
            userData = {
                ...userData,
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        
        }

        const postLikeData: any = await PostComment.create(userData);
        const postData: any = await Post.findOne({ _id: post_id })
        if (postLikeData) {
            // start here Push 
            let pushTitle: any = process.env.APP_COMMENT_MESSAGE;
            let message: any = postData._id + process.env.APP_COMMENT_MESSAGE
            let payload: any = postLikeData;
            let userIdNotifiy: any = Number(type) === 1 ? admin_id : Number(type) === 2 ? user_id : Number(type) === 3 ? user_id : '';

            console.log('userIdNotifiy',userIdNotifiy)
            console.log('pushTitle',pushTitle)
            console.log('message',message)


            await Notification.create({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy),
                title: pushTitle,
                message: message,
                payload: JSON.stringify(payload),
            })

            const userNotification = await User.findOne({
                _id: new mongoose.Types.ObjectId(userIdNotifiy)
            });

            let getTokens: any = (await UserToken.find({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy)
            }))
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
                    console.log('yrrrrr',token)
                        await FirebaseFunction.sendPushNotification(token, fcmData)
                }
                catch (err) {
                    logger.info("sendPushNotification");
                    logger.info(err);
                }
            }
        }

        const getComments:any = await getCommentData({ post_id:post_id,per_page:per_page,page:page })

        await session.commitTransaction();
        await session.endSession();

        const responseData: any = {
            message: process.env.APP_COMMENT_ADD_MESSAGE,
            // commentsData: getComments,
            data: getComments
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info(process.env.APP_CHAt_JOINED_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const getCommentData = async(props:any)=>{
    const {post_id,per_page,page} = props
    let perPage: number = per_page == undefined ? 10 : Number(per_page)
    let skipPage: any = (page && page > 0) ? (Number(Number(page)) * Number(perPage)) : 0;
   
    const postCommentData: any = await PostComment.aggregate([
        {
            $match: {
                post_id: new mongoose.Types.ObjectId(post_id),
                is_active: true
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "customerData",
            },
        },
        { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendorData",
            },
        },
        { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "admins",
                localField: "admin_id",
                foreignField: "_id",
                as: "adminData",
            },
        },
        { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                admin_id: 1,
                vendor_id: 1,
                user_id: 1,
                type: 1,
                comment: 1,
                "customerData.first_name": 1,
                "adminData.first_name": 1,
                "vendorData.first_name": 1,
                "vendorData.user_name": 1,
                "customerData.last_name": 1,
                "adminData.last_name": 1,
                "adminData.user_name": 1,
                "vendorData.last_name": 1,
                "customerData.profile_photo": 1,
                "customerData.user_name": 1,
                "adminData.profile_photo": 1,
                "vendorData.profile_photo": 1,
                createdAt: 1,
            },
        },
        { $sort: { 'createdAt': -1 } },
        { $skip: parseInt(skipPage) },
        { $limit: perPage },
    ]);
    return postCommentData
}


const storePostLike = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, user_id, type, post_id } = req.body;
        let userData: any = {};
        let userName = ''

        userData = {
            type: type,
            post_id: new mongoose.Types.ObjectId(post_id),
        };

        if (Number(type) === 1 && admin_id) {
            userData = {
                ...userData,
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2 && vendor_id) {
            userData = {
                ...userData,
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
            };
        }
        if (Number(type) === 3 && user_id) {
            userData = {
                ...userData,
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        let message: any = "";
        const postLikeData: any = await PostLike.findOne(userData);
        if (postLikeData) {
            await postLikeData.delete();
            message = process.env.APP_POST_UNLIKE;
        } else {
            await PostLike.create(userData);
            message = process.env.APP_POST_LIKE;
        }

        if (!postLikeData && Number(type) === 1) {
            const adminData = await Admin.findById(admin_id)
            userName = adminData?.first_name + ' ' + adminData?.last_name

        } else if (!postLikeData && Number(type) === 2 || Number(type) === 3) {
            const user = Number(type) === 2 ? vendor_id : user_id
            const userData = await User.findById(user)
            userName = userData?.first_name + ' ' + userData?.last_name
        }

        const postData: any = await Post.findOne({ _id: post_id })
        if (postData && !postLikeData) {
            // start here Push 
            let pushTitle: any = "Your"+ process.env.APP_POST_LIKE;
            let message: any = userName + " " + "like your Post";
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

        const totalLikePost = await postLikeModel.count({ post_id: new mongoose.Types.ObjectId(post_id) })


        await session.commitTransaction();
        await session.endSession();

        const responseData: any = {
            message: message,
            data: { count: totalLikePost },
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("store chat Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const getPostComment = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { post_id, page, per_page } = req.body;
        let perPage: number = per_page == undefined ? 10 : Number(per_page)
        let skipPage: any = (page && page > 0) ? (Number(Number(page)) * Number(perPage)) : 0;
       
        const postCommentData: any = await PostComment.aggregate([
            {
                $match: {
                    post_id: new mongoose.Types.ObjectId(post_id),
                    is_active: true
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    comment: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "vendorData.user_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "adminData.user_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "customerData.user_name": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    createdAt: 1,
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $skip: parseInt(skipPage) },
            { $limit: perPage },
        ]);

        const count = await PostComment.count({
            post_id: new mongoose.Types.ObjectId(post_id),
            is_active: true
        })

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_GET_POST_COMMENT,
            data: { data: postCommentData, total: count },
            total: count,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get Post Comment");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const getPostDetail = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.body;

        const postData: any = await Post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    pipeline: [
                        // {
                        //     $match: filterText
                        // },
                        {
                            $project: {
                                is_like: "1",
                            },
                        },
                    ],
                    as: "postLikes",
                },
            },
            { $unwind: { path: "$postLikes", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    is_like: { $ifNull: ["$postLikes.is_like", "0"] },
                },
            },

            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },

                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },

            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    is_like: 1,
                    "postLikes._id": 1,
                    "postLikes.is_like": 1,
                    postImageData: 1,
                    "postTotalLike": 1,
                },
            },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData[0],
            }
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const getPost = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, type, user_id, search, page } = req.body;
        let skipPage: any = (page && page > 0) ? (Number(Number(page)) * Number(req.body.per_page)) : 0;

        // const user_id:any =req.query.id;
        let filterText: object = { is_active: true };
        if (Number(type) === 1 && admin_id) {
            filterText = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (Number(type) === 2 && vendor_id) {
            filterText = {
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
            };
        }
        // if (!vendor_id || !admin_id) {
        //     filterText = { is_active: true }
        // }
        // if (Number(type) === 3) {
        //     filterText = {
        //         user_id: new mongoose.Types.ObjectId(user_id),
        //     };
        // }
        let countData = await Post.count(filterText);

        const postData: any = await Post.aggregate([
            { $sort: { 'createdAt': -1 } },
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            // { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            // { $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            // { $unwind: { path: "$adminData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            // {
            //     $lookup: {
            //         from: "post_likes",
            //         localField: "_id",
            //         foreignField: "post_id",
            //         pipeline: [
            //             {
            //                 $match: filterText
            //             },
            //             {
            //                 $project: {
            //                     is_like: "1",
            //                 },
            //             },
            //         ],
            //         as: "postLikes",
            //     },
            // },
            // { $unwind: { path: "$postLikes", preserveNullAndEmptyArrays: true } },
            // {
            //     $addFields: {
            //         is_like: { $ifNull: ["$postLikes.is_like", "0"] },
            //     },
            // },

            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },

                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },

            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalComment",
                    pipeline: [
                        // {
                        //     $match: {
                        //         vendor_id: new mongoose.Types.ObjectId(user_id),
                        //     },
                        // },
                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$postTotalComment", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalComment.count", "0"] },
                },
            },

            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postComments",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $limit: parseInt("2") },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "commentCustomerData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentCustomerData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "commentVendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentVendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "admins",
                                localField: "admin_id",
                                foreignField: "_id",
                                as: "commentAdminData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentAdminData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            // { $unwind: { path: "$postComments", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    // title: 1,
                    // slug: 1,
                    // short_description: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    // is_like: 1,
                    // "postLikes._id": 1,
                    // "postLikes.is_like": 1,
                    "postComments._id": 1,
                    "postComments.admin_id": 1,
                    "postComments.vendor_id": 1,
                    "postComments.user_id": 1,
                    "postComments.type": 1,
                    "postComments.comment": 1,
                    "postComments.commentCustomerData.first_name": 1,
                    "postComments.commentCustomerData.profile_photo": 1,
                    "postComments.commentCustomerData.last_name": 1,
                    "postComments.commentAdminData.first_name": 1,
                    "postComments.commentAdminData.last_name": 1,
                    "postComments.commentAdminData.profile_photo": 1,
                    "postComments.commentVendorData.first_name": 1,
                    "postComments.commentVendorData.last_name": 1,
                    "postComments.commentVendorData.profile_photo": 1,
                    postImageData: 1,
                    "postTotalLike": 1,
                    "postTotalComment": 1,
                },
            },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(req.body.per_page) },
            // { $sort: { 'createdAt': -1 } },
        ]);


        let filterTextLike: object = { is_active: true };


        if (admin_id && admin_id !== null) {
            filterTextLike = {
                admin_id: new mongoose.Types.ObjectId(admin_id),
            };
        }
        if (vendor_id && vendor_id !== null) {
            filterTextLike = {
                vendor_id: new mongoose.Types.ObjectId(vendor_id),
            };
        }

        if (user_id && user_id !== null) {
            filterTextLike = {
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        const checkisLogin: any = admin_id || user_id || vendor_id
        let getpostData: any = [];
        if (postData.length > 0) {
            await Promise.all(postData.map(async (item: any) => {
                if (item._id) {

                    let postLikeData = await PostLike.aggregate([
                        {
                            $match: filterTextLike
                        },
                        {
                            $match: { "post_id": new mongoose.Types.ObjectId(item._id) }
                        },
                        {
                            $project: {
                                _id: 1,
                                post_id: 1,
                                vendor_id: 1
                            }
                        }
                    ])

                    if (checkisLogin && checkisLogin !== null && checkisLogin !== '') {
                        item["is_like"] = postLikeData[0]?._id ? 1 : 0
                    } else {
                        item["is_like"] = 0
                    }
                    getpostData.push(item)
                    return;

                }
            }))
        }


        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData.length > 0 ? postData : [],
                total: countData,
            }
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const getCheckIsLikePost = async (req: any, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { post_id, type, user_id } = req.query;
        let userData: any = {};
        userData = {
            type: type,
            post_id: new mongoose.Types.ObjectId(post_id),
        };

        if (Number(type) === 2) {
            userData = {
                ...userData,
                vendor_id: new mongoose.Types.ObjectId(user_id),
            };
        }
        if (Number(type) === 3) {
            userData = {
                ...userData,
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        const postLikeData: any = await PostLike.findOne(userData);
        await session.commitTransaction();
        await session.endSession();

        const responseData: any = {
            message: process.env.APP_GET_POST_LIKE,
            data: postLikeData ? 1 : 0,
        };
        return response.sendSuccess(req, res, responseData);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("like get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
}

const storePost = (async (req: Request, res: Response) => {
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
            vendor_id,
        } = req.body;
        let postData: any = {}
        let message: any
        if (id) {
            postData = await Post.findOne({ _id: id });
            message = process.env.APP_POST_UPDATED;
        } else {
            postData = await new Post();
            message = process.env.APP_POST_ADDED;
        }
        // postData.image = image;
        // postData.service_provider_name = service_provider_name;
        // postData.date_time = date_time;
        postData.description = description;
        // postData.short_description = short_description;
        // postData.title = title;
        // postData.slug = await CommonFunction.titleToSlug(title);
        postData.type = type;
        postData.is_active = false


        if (Number(type) === 2 && vendor_id) {
            postData.vendor_id = new mongoose.Types.ObjectId(vendor_id);
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


        if (postData) {
            // start here Push 
            let pushTitle: any = process.env.APP_STORY_UPLOADED;
            let message: any = process.env.APP_STORY_UPLOADED
            let payload: any = postData;
            let userIdNotifiy: any = vendor_id;

            await Notification.create({
                user_id: new mongoose.Types.ObjectId(userIdNotifiy),
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

        if (postData) {
            // start here Push 
            let pushTitle: any = process.env.APP_NEW_STORY_AVAILABLE;
            let message: any = description.substring(0, 20)
            let payload: any = postData;
            let userIdNotifiy: any = vendor_id;

            let getToken: any = (await AdminToken.find()).map(value => value.firebase_token);

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
        logger.info("store Post Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})
const getRecentPost = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {


        const postData: any = await Post.aggregate([
            commonFunction.isActive(),
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    title: 1,
                    slug: 1,
                    short_description: 1,
                    description: 1,
                    image: 1,
                    service_provider_name: 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    postImageData: 1,
                },
            },
            { $sort: { 'createdAt': -1 } },
            { $limit: parseInt("10") },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_GET_MESSAGE,
            data: postData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

// function replaceMulti(haystack: any, needle: any, replacement: any) {
//     return haystack.split(needle).join(replacement);
// }

const getCms = async (req: Request, res: Response) => {
    
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        
        // let slug: any = req.query.slug || "";
        // slug = slug.replace(
        //     /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|/gi,
        //     ""
        // );
        // slug = replaceMulti(slug, '-', '_')
        // const cmsData: any = await Cms.aggregate([{ $match: { key: slug } }]);
        const cmsData: any = await Cms.find({});
        
        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: 'Cms' + ' ' + process.env.APP_GET_MESSAGE,
            data: cmsData,
        };

        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const getPriority = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const priorityData: any = await Priority.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    is_active: 1,
                },
            },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_PRIORITY_GET,
            data: priorityData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const getFaq = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const faqData: any = await Faq.aggregate([
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    is_active: 1,
                },
            },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_FAQ_GET,
            data: faqData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
const getCancelReason = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const resonData: any = await CancelReason.aggregate([
            {
                $project: {
                    _id: 1,
                    reson: 1,
                    is_active: 1,
                },
            },
        ]);

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_FAQ_GET,
            data: resonData,
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get Faq ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};


const getCategoriesDispute = async (req: any, res: any) => {

    try {
        const categoryDisputeData: any = await CategoriesDispute.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: categoryDisputeData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get Dispute category");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

//get my assets category
const getAssetsCategory = async (req: any, res: any) => {

    try {
        const assetsCategoryData: any = await AssetsCategory.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsCategoryData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets category");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

// get asset uses
const getUses = async (req: any, res: any) => {

    try {
        const assetsUsesData: any = await AssetsUses.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsUsesData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

// get structure type
const getStructureType = async (req: any, res: any) => {

    try {
        const assetsStructureTypeData: any = await AssetStructureType.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsStructureTypeData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const getFacadeType = async (req: any, res: any) => {

    try {
        const assetsFacadeTypeData: any = await AssetFacadeType.aggregate([
            CommonFunction.isActive(),
            {
                $project: {
                    _id: 1,
                    name: 1,
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: assetsFacadeTypeData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};

const getSocialMedia = async (req: any, res: any) => {

    try {
        const socialMediaData: any = await SocialMedia.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    value: 1
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: socialMediaData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};
const getWhyMaintenance = async (req: any, res: any) => {

    try {
        const WhyMaintenanceData: any = await WhyMaintenanceModel.aggregate([
            {
                $project: {
                    _id: 1,
                    field_name: 1,
                    icon: 1,
                    field_value: 1
                },
            },
        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: WhyMaintenanceData,
        };
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("get assets uses");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
};


const storeSuggestion = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            // email,
            // name,
            // mobile_no,
            message,
            user_id,
            images,
            location,
            subject } = req.body;


        let suggestionData: any = await new Suggestions();
        // suggestionData.email = email;
        // suggestionData.name = name;
        // suggestionData.mobile_no = mobile_no;
        suggestionData.location = location;
        suggestionData.subject = subject;
        suggestionData.message = message;
        if (user_id) {
            suggestionData.user_id = new mongoose.Types.ObjectId(user_id);
        }
        suggestionData.images = JSON.stringify(images);

        await suggestionData.save();

        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_SUGGESTION_ADDED,
            data: {},
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("store Suggestion Data");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const titleCase = (str: string) => {
    return str.replace(/\w\S*/g, (t) => { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase() });
}

const checkDataField = async (req: Request, res: Response) => {

    try {
        const { field, filed_value } = req.body;
        const userData: any = await User.aggregate([
            {
                $match: {
                    [field]: filed_value,
                    is_verified: true
                }
            },
            {
                $project: {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "user_name": 1,
                    "mobile_no": 1,
                    "email": 1,
                    "type": 1
                }
            },
        ]);

        console.log(userData)
        let stringRep: any = field;
        let values = stringRep.replace('_', ' ');

        const str2 = titleCase(values);

        if (userData.length === 0) {
            const sendResponse: any = {
                data: {},
                message: 'This ' + str2 + ' is available',
            };
            return response.sendSuccess(req, res, sendResponse);
        } else {
            const sendResponse: any = {
                message: 'This ' + str2 + ' is already registered ',
            };
            return response.sendError(res, sendResponse);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("field Checking api ");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }

};
const getOurContactUs = (async (req: Request, res: Response) => {
    try {
        const data: any = await OurContactUs.find();
        let fees_map: any = {};
        fees_map = await new Map(data.map((values: any) => [
            values.key, values.value
        ]));
        let feesMapArray: any = await Object.fromEntries(fees_map.entries());
        const socialMediaData: any = await SocialMedia.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    value: 1
                },
            },
        ]);
        if (socialMediaData.length > 0) {
            feesMapArray['social_media'] = socialMediaData
        } else {
            feesMapArray['social_media'] = []
        }

        const sendResponse: any = {
            data: feesMapArray,
            message: process.env.APP_OUR_CONTACT_US_GET,
        }
        return response.sendSuccess(req, res, sendResponse);

    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info("Our Contact Us get");
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})

const getOurServices = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        let orders: any = { 'createdAt': -1 };

        const serviceTypeData: any = await ServiceType.aggregate([

            {
                $project: {
                    "_id": 1,
                    "name": 1,
                    "icon": 1,
                    "description": 1,
                    "is_active": 1
                }
            },

            { $sort: orders },
            CommonFunction.isActive(),

        ]);
        const sendResponse: any = {
            message: process.env.APP_GET_MESSAGE,
            data: serviceTypeData.length > 0 ? serviceTypeData : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info("ServiceType Data get");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }

})


const getDisputeDetails = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const { id } = req.query
        let ServiceReq: any = await ServiceRequest.findById(
            new mongoose.Types.ObjectId(id)
        );

        if (!ServiceReq) {
            throw new Error(process.env.APP_SR_NOT_FOUND);
        }

        //   if (!ServiceReq.vendor_id.equals(vendor._id)) {
        //     throw new Error("Service Request not Found");
        //   }

        if (ServiceReq.status != "6") //6=disputed
        {
            throw new Error(process.env.APP_SR_NO_ANY_DISPUTE);
        }


        let filterText: object = {
            _id: new mongoose.Types.ObjectId(ServiceReq.dispute_id)
        };

        const result: any = await DisputeModel.aggregate([
            { $match: filterText },
            {
                $lookup: {
                    from: "categories_disputes",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDisputeData",
                },
            },
            {
                $unwind: { path: "$categoryDisputeData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 1,
                    category: 1,
                    createdAt: 1,
                    damages: 1,
                    document: 1,
                    photo: 1,
                    root_cause: 1,
                    status: 1,
                    add_response: 1,
                    update: 1,
                    action: 1,
                    "categoryDisputeData.name": 1,
                },
            },
        ])

        const sendResponse = {
            message: process.env.APP_GET_MESSAGE,
            data: result.length > 0 ? result[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("Get Disput Detail Report");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

const updateDispute = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { update, id, document, photo, add_response, status } = req.body;
        const serviceReq = await ServiceRequest.find({ dispute_id: new mongoose.Types.ObjectId(id) })
        await DisputeModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id), {
            update: (update) ?? update,
            add_response: (add_response) ?? add_response,
            // update: update,
            status: (status) ?? status,
            document: document,
            photo: photo
        }
        );

        if (serviceReq[0] && status && Number(status) === 2) {
            await ServiceRequest.findByIdAndUpdate(serviceReq[0]._id, { status: '8' })
        }

        const sendResponse = {
            message: process.env.APP_DISPUTE_UPDATED,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    }

    catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("Dispute Update on Service Request");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
}


const getPostMobile = async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        const { admin_id, vendor_id, type, user_id, search, page, per_page } = req.body;
        // let skipPage: any = (page && page > 0) ? (Number(Number(page)) * Number(req.body.per_page)) : 0;
        let skipPage: any = (page && page > 0) ? (Number(Number(page - 1)) * Number(per_page)) : 0;

        // const user_id:any =req.query.id;
        let filterText: object = { is_active: true };
        // if (Number(type) === 1 && admin_id) {
        //     filterText = {
        //         admin_id: new mongoose.Types.ObjectId(admin_id),
        //     };
        // }
        // if (Number(type) === 2 && vendor_id) {
        //     filterText = {
        //         $or: [
        //             { "vendor_id": new mongoose.Types.ObjectId(vendor_id) },
        //             { "admin_id": { $exists: true } }
        //         ]
        //     }
        // }

        let countData = await Post.count(filterText);

        const postData: any = await Post.aggregate([
            { $sort: { 'createdAt': -1 } },
            { $match: filterText },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "_id",
                    as: "vendorData",
                },
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "_id",
                    as: "adminData",
                },
            },
            {
                $lookup: {
                    from: "post_images",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postImageData",
                },
            },

            {
                $lookup: {
                    from: "post_likes",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalLike",
                    pipeline: [

                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$postTotalLike", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalLike.count", "0"] },
                },
            },

            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postTotalComment",
                    pipeline: [

                        {
                            "$facet": {
                                "counts": [
                                    {
                                        $count: "numDocs"
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind": "$counts"
                        },
                        {
                            "$addFields": {
                                "doc.numCount": "$counts.numDocs",
                            }
                        },
                        {
                            "$project": {
                                counts: 0
                            }
                        }
                    ]
                },
            },
            { $unwind: { path: "$postTotalComment", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    count: { $ifNull: ["$postTotalComment.count", "0"] },
                },
            },
            {
                $lookup: {
                    from: "post_comments",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postComments",
                    pipeline: [
                        { $sort: { 'createdAt': -1 } },
                        { $limit: parseInt("2") },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "commentCustomerData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentCustomerData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "vendor_id",
                                foreignField: "_id",
                                as: "commentVendorData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentVendorData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "admins",
                                localField: "admin_id",
                                foreignField: "_id",
                                as: "commentAdminData",
                            },
                        },
                        {
                            $unwind: {
                                path: "$commentAdminData",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    admin_id: 1,
                    vendor_id: 1,
                    user_id: 1,
                    type: 1,
                    // title: 1,
                    // slug: 1,
                    // short_description: 1,
                    description: 1,
                    image: 1,
                    "customerData.first_name": 1,
                    "adminData.first_name": 1,
                    "vendorData.first_name": 1,
                    "customerData.last_name": 1,
                    "adminData.last_name": 1,
                    "vendorData.last_name": 1,
                    "customerData.profile_photo": 1,
                    "adminData.profile_photo": 1,
                    "vendorData.profile_photo": 1,
                    is_active: 1,
                    createdAt: 1,
                    createdAtFormatted: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
                    },
                    // is_like: 1,
                    // "postLikes._id": 1,
                    // "postLikes.is_like": 1,
                    // "postComments._id": 1,
                    // "postComments.admin_id": 1,
                    // "postComments.vendor_id": 1,
                    // "postComments.user_id": 1,
                    // "postComments.type": 1,
                    // "postComments.comment": 1,
                    // "postComments.commentCustomerData.first_name": 1,
                    // "postComments.commentCustomerData.last_name": 1,
                    // "postComments.commentAdminData.first_name": 1,
                    // "postComments.commentAdminData.last_name": 1,
                    // "postComments.commentVendorData.first_name": 1,
                    // "postComments.commentVendorData.last_name": 1,

                    "postComments._id": 1,
                    "postComments.admin_id": 1,
                    "postComments.vendor_id": 1,
                    "postComments.user_id": 1,
                    "postComments.type": 1,
                    "postComments.comment": 1,
                    "postComments.commentCustomerData.first_name": 1,
                    "postComments.commentCustomerData.profile_photo": 1,
                    "postComments.commentCustomerData.last_name": 1,
                    "postComments.commentAdminData.first_name": 1,
                    "postComments.commentAdminData.last_name": 1,
                    "postComments.commentAdminData.profile_photo": 1,
                    "postComments.commentVendorData.first_name": 1,
                    "postComments.commentVendorData.last_name": 1,
                    "postComments.commentVendorData.profile_photo": 1,


                    postImageData: 1,
                    "postTotalLike": 1,
                    "postTotalComment": 1,
                },
            },
            { $skip: parseInt(skipPage) },
            { $limit: parseInt(req.body.per_page) },
            // { $sort: { 'createdAt': -1 } },
        ]);


        let filterTextLike: object = { is_active: true };


        // if (admin_id && admin_id !== null) {
        if (Number(type) === 1) {
            filterTextLike = {
                admin_id: new mongoose.Types.ObjectId(user_id),
            };
        }
        // if (vendor_id && vendor_id !== null) {
        if (Number(type) === 2) {
            filterTextLike = {
                vendor_id: new mongoose.Types.ObjectId(user_id),
            };
        }

        // if (user_id && user_id !== null) {
        if (Number(type) === 1) {
            filterTextLike = {
                user_id: new mongoose.Types.ObjectId(user_id),
            };
        }
        const checkisLogin: any = user_id
        let getpostData: any = [];
        if (postData.length > 0) {
            await Promise.all(postData.map(async (item: any) => {
                if (item._id) {

                    let postLikeData = await PostLike.aggregate([
                        {
                            $match: filterTextLike
                        },
                        {
                            $match: { "post_id": new mongoose.Types.ObjectId(item._id) }
                        },
                        {
                            $project: {
                                _id: 1,
                                post_id: 1,
                                vendor_id: 1
                            }
                        }
                    ])
                    if (checkisLogin && checkisLogin !== null && checkisLogin !== '') {
                        item["is_like"] = postLikeData[0]?._id ? 1 : 0
                    } else {
                        item["is_like"] = 0
                    }
                    getpostData.push(item)
                    return;

                }
            }))
        }


        await session.commitTransaction();
        await session.endSession();
        const responseData: any = {
            message: process.env.APP_GET_MESSAGE,
            data: {
                data: postData.length > 0 ? postData : [],
                total: countData,
            }
        };
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("getPost ");
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};

export default {
    uploadFiles,
    uploadImage,
    uploadVideo,
    getCategory,
    getServiceType,
    getAssets,
    GetActiveAdmin,
    GetActiveVendor,
    GetActiveCustomer,
    storeChat,
    storePostLike,
    storePostComment,
    getCheckIsLikePost,
    getChat,
    getPost,
    getRecentPost,
    getPostComment,
    storeContactUs,
    getCms,
    getFaq,
    getPostDetail,
    getCancelReason,
    otpVerification,
    getCategoriesDispute,
    getAssetsCategory,
    getUses,
    getStructureType,
    storePost,
    getFacadeType,
    getSocialMedia,
    getWhyMaintenance,
    storeSuggestion,
    checkDataField,
    getPriority,
    uploadImageMulti,
    getOurContactUs,
    getOurServices,
    getDisputeDetails,
    updateDispute,
    getPostMobile
};
