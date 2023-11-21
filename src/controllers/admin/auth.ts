import { Request, Response } from 'express';
import jwt from '../../helper/jwt';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import response from '../../helper/responseMiddleware';
import log4js from "log4js";
const logger = log4js.getLogger();
import Admin from '../../models/admin-model';
import AdminToken from '../../models/admin-token-model';
import User from '../../models/user-model';
// import Category from '../../models/category-model';
// import Post from '../../models/post-model';
import OtpModel from "../../models/otp-model";
import CommonFunction from "../../helper/commonFunction";
import MyEarning from "../../models/my-earning-model";
import ServiceRequest from "../../models/service-request-model";
import moment from 'moment';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Over Here Include Library =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getDataSR = (async (filterText: any) => {
    let serviceRequestData = await ServiceRequest.aggregate([
        { $match: filterText },
        {
            $project: {
                "_id": 1,
                "status": 1,
                "is_active": 1,
                createdAtFormatted: {
                    $dateToString: { format: "%m/%Y", date: "$createdAt" },
                },
            }
        },
        { $group: { _id: null, count: { $sum: 1 } } }
    ])

    return serviceRequestData.length > 0 ? serviceRequestData[0]?.count : 0;
});
const dashboard = (async (req: Request, res: Response) => {
    try {

        const totalAdminSum = await MyEarning.aggregate([
            // { $match: { status: "9" } },
            {
                $group: {
                    _id: null,
                    totalReceivedAmount: {
                        $sum: {
                            $toDouble: "$admin_received_amount"
                        }
                    }
                }
            }
        ]);
        const totalSum = await MyEarning.aggregate([
            {
                $group: {
                    _id: null,
                    totalReceivedAmount: {
                        $sum: {
                            $toDouble: "$admin_received_amount"
                        }
                    }
                }
            }
        ]);

        let monthArray: any = [];
        let dataSRArray: any = [];
        const today = new Date();
        for (let i = 0; i < 6; i++) {
            let date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            let obj = {
                month_text: moment(date).startOf('month').format('MMMM YYYY'),
                month_digit: moment(date).startOf('month').format('MM/YYYY'),
                start_date: moment(date).startOf('month').format('YYYY-MM-DD'),
                end_date: moment(date).endOf('month').format('YYYY-MM-DD'),
            };
            monthArray.push(obj);
        }
        let checkingLoop = await monthArray.map(async (item: any, i: any) => {
            let obj = {
                initiated: await getDataSR({
                    "status": "0",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                bids_received: await getDataSR({
                    "status": "2",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                awarded: await getDataSR({
                    "status": "8",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                completed: await getDataSR({
                    "status": "5",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                closed: await getDataSR({
                    "status": "4",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                disputed: await getDataSR({
                    "status": "6",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                expired: await getDataSR({
                    "status": "7",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                cancelled: await getDataSR({
                    "status": "9",
                    'is_active': true,
                    "createdAt": {
                        '$gte': new Date(item.start_date.toString()),
                        '$lte': new Date(item.end_date.toString())
                    }
                }),
                month_text: item.month_text,
                month_digit: item.month_digit,
                inedx: i + 1,
            };
            await dataSRArray.push(obj);
        })

        const data: any = {
            activeServiceProvider: await User.find({ "type": 2, 'is_active': true }).count(),
            activeCustomer: await User.find({ "type": 1, 'is_active': true }).count(),
            allServiceProvider: await User.find({ "type": 2 }).count(),
            allCustomer: await User.find({ "type": 1 }).count(),
            currentMonthErning: (totalAdminSum[0]) ? Math.round(totalAdminSum[0].totalReceivedAmount) : 0,
            currentMonthErningTotal: (totalSum[0]) ? Math.round(totalSum[0].totalReceivedAmount) : 0,
            serviceRequestInitiated: await ServiceRequest.find({ "status": 2, 'is_active': true }).count(),
            serviceRequestOngoing: await ServiceRequest.find({ "status": 8 }).count(),
            serviceRequestCompleted: await ServiceRequest.find({ "status": 5, 'is_active': true }).count(),
            serviceRequestDisputed: await ServiceRequest.find({ "status": 6, 'is_active': true }).count(),
            serviceRequestClosed: await ServiceRequest.find({ "status": 4, 'is_active': true }).count(),
            serviceRequestExpired: await ServiceRequest.find({ "status": 7, 'is_active': true }).count(),
            serviceRequestCancelled: await ServiceRequest.find({ "status": 9 }).count(),
            monthlyActivity: await dataSRArray,

        }
        const sendResponse: any = {
            data: data ? data : {},
            message: 'Dashboard' + process.env.APP_GET_MESSAGE,
        }
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Dashboard' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})


const adminsDataGet = (async (id: any) => {
    const adminData: any = await Admin.findById(id).select("_id first_name last_name email role_id profile_photo")
    return adminData;
})
const login = (async (req: Request, res: Response) => {

    try {
        const { email, password, firebase_token } = req.body;
        const adminData: any = await Admin.findOne({
            email,
            deleted_by: null
        });
        if (adminData) {
            if (!adminData.password) {
                const sendResponse: any = {
                    message: process.env.APP_INVALID_PASSWORD_MESSAGE,
                }
                return response.sendError(res, sendResponse);
            }
            const ispasswordmatch: any = await bcrypt.compare(password, adminData.password);
            if (!ispasswordmatch) {
                const sendResponse: any = {
                    message: process.env.APP_INVALID_PASSWORD_MESSAGE,
                }
                return response.sendError(res, sendResponse);
            } else {
                const token: any = await jwt.sign({
                    email: email,
                    mobilenumber: adminData.mobile,
                    admin_id: adminData._id?.toString()
                });
                if (adminData && adminData._id) {
                    await AdminToken.create({
                        token: token,
                        firebase_token: firebase_token,
                        admin_id: adminData._id,
                    });
                }
                const sendData: any = await adminsDataGet(adminData._id);
                let AdminsData = sendData.toJSON();
                AdminsData['access_token'] = token;
                const sendResponse: any = {
                    data: AdminsData ? AdminsData : {},
                    message: process.env.APP_LOGGED_MESSAGE,
                }
                return response.sendSuccess(req, res, sendResponse);
            }
        } else {
            const sendResponse: any = {
                message: process.env.APP_EMAIL_PASSWROD_INCORRECT_MESSAGE,
            }
            return response.sendError(res, sendResponse);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(process.env.APP_EMAIL_PASSWROD_INCORRECT_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }

})

const changePassword = (async (req: Request, res: Response) => {
    try {
        const { old_password, password } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData: any = await Admin.findOne({
            _id: new mongoose.Types.ObjectId(admin_id)
        });
        if (adminData) {
            const isComparePassword: any = await bcrypt.compare(old_password, adminData.password);
            if (isComparePassword) {
                const passwordhash: any = await bcrypt.hash(password, Number(10));
                await Admin.findByIdAndUpdate(new mongoose.Types.ObjectId(admin_id), {
                    password: passwordhash,
                    updated_by: adminData.first_name,
                    updated_on: new Date()
                }, {
                    new: true
                })
                const sendResponse: any = {
                    message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
                }
                return response.sendSuccess(req, res, sendResponse);
            } else {
                const sendResponse: any = {
                    message: process.env.APP_INVALID_PASSWORD_MESSAGE,
                }
                return response.sendError(res, sendResponse);
            }
        } else {
            const sendResponse: any = {
                message: process.env.APP_ADMIN_NOT_FOUND_MESSAGE,
            }
            return response.sendError(res, sendResponse);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(process.env.APP_ADMIN_NOT_FOUND_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})

const getProfile = (async (req: Request, res: Response) => {
    
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const adminData: any = await Admin.findOne({
            _id: new mongoose.Types.ObjectId(admin_id)
        });
        const sendResponse: any = {
            data: adminData,
            message: process.env.APP_PROFILE_GET_MESSAGE,
        }

        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(process.env.APP_PROFILE_GET_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})

const updateProfile = (async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, profile_photo, mobile_no } = req.body;
        // @ts-ignore
        const admin_id = req?.admin?._id;
        await Admin.findByIdAndUpdate(admin_id, {
            profile_photo: profile_photo,
            first_name: first_name,
            last_name: last_name,
            email: email,
            mobile_no: mobile_no
        });
        const adminData: any = await Admin.findOne({
            _id: new mongoose.Types.ObjectId(admin_id)
        });
        const sendResponse: any = {
            data: adminData,
            message: process.env.APP_PROFILE_UPDATE_MESSAGE,
        }
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(process.env.APP_PROFILE_UPDATE_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})

const logout = (async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const admin_id = req?.admin?._id;
        const token = req.headers['authorization']?.split(" ")[1];

        let getToken: any = await AdminToken.findOne({
            admin_id: new mongoose.Types.ObjectId(admin_id),
            token: token
        });

        if (getToken) {
            await AdminToken.deleteOne(new mongoose.Types.ObjectId(getToken._id.toString()), {
                is_active: false
            });
            const sendResponse: any = {
                message: process.env.APP_LOGOUT_MESSAGE,
            }
            return response.sendSuccess(req, res, sendResponse);
        } else {
            const sendResponse: any = {
                message: process.env.APP_INVALID_TOKEN_MESSAGE,
            }
            return response.sendError(res, sendResponse);
        }
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info(process.env.APP_INVALID_TOKEN_MESSAGE);
        logger.info(err);
        return response.sendError(res, sendResponse);
    }
})

const forgetPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const admin: any = await Admin.findOne({ email: email });

        if (!admin) {
            const sendResponse: any = {
                message: process.env.APP_ADMIN_NOT_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //four digit otp

        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);

        const token = await jwt.sign({
            email: email,
            admin_id: admin._id,
            expiry: expiry,
        });


        await OtpModel.create([
            {
                otp: otp,
                token: token,
                admin_id: admin._id,
                is_active: true,
                expiry: expiry,
            },
        ]);


        logger.info("token");
        logger.info(token);

        try {
            let to: any = admin.email;
            let subject: any = process.env.APP_NAME + ' Reset Password Link';
            let template: any = 'forget-code-admin'
            let sendEmailTemplatedata: any = {
                name: admin.first_name + admin.last_name,
                token: token,
                app_name: process.env.APP_NAME,
                reset_button: process.env.ADMIN_LINK + 'reset-password/' + token,
            }

            let datta: any = {
                to: to,
                subject: subject,
                template: template,
                sendEmailTemplatedata: sendEmailTemplatedata
            }

            await CommonFunction.sendEmailTemplate(datta)
        } catch (err) {
            logger.info(process.env.APP_ADMIN_NOT_MESSAGE);
            logger.info(err);
        }

        // Email Services write down
        const sendResponse: any = {
            message: process.env.APP_LINK_SEND_MESSAGE,
        };

        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        return response.sendError(res, sendResponse);
    }
};

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { password, confirm_password, token } = req.body

        if (!token) {
            const sendResponse: any = {
                message: process.env.APP_INVALID_TOKEN_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }

        const clientData: any = await jwt.decode(token);

        const expired = new Date(clientData.expiry) <= new Date();
        if (expired) {
            const sendResponse: any = {
                message: process.env.APP_INVALID_OTP_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        const passwordHash = await bcrypt.hash(password, Number(10));

        await Admin.findByIdAndUpdate(clientData.admin_id, {
            password: passwordHash,
        });

        const sendResponse: any = {
            message: process.env.APP_PASSWROD_CHANGED_MESSAGE,
            data: {}
        };

        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        return response.sendError(res, sendResponse);
    }
};



// Export default
export default {
    login,
    changePassword,
    getProfile,
    dashboard,
    updateProfile,
    forgetPassword,
    resetPassword,
    logout
};
