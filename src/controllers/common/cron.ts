const fs = require("fs");
const moment = require("moment");
// const spawn = require("child_process").spawn;
const nodemailer = require("nodemailer");
const path = require("path");
const log4js = require("log4js");
const logger = log4js.getLogger();
import AdminToken from "../../models/admin-token-model";
import UserToken from "../../models/user-token-model";
import ServiceRequest from "../../models/service-request-model";
import commonFunction from "../../helper/commonFunction";
import FirebaseFunction from '../../helper/firebase';
import mongoose from "mongoose";
import User from "../../models/user-model";
import Notification from "../../models/notification-model";
import BidModel from "../../models/bid-request-model";



var backup = require('mongodb-backup');
const { exec } = require('child_process');

const archiver = require('archiver');
const dbBackup = async () => {
    try {
        await backup({
            uri: 'mongodb+srv://juhi:GyfK4mJ7b6vIRxC5@cluster0.2b6leht.mongodb.net/live-maintenance-master',
            root: __dirname,
            collections: ['admins'], // save this collection only
            tar: 'dump.tar', // save backup into this tar file
            callback: function (err: any) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('finish');
                }
            }
        });
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("dbBackup");
        logger.info(sendResponse);
    }
};
const destroyToken = async () => {
    try {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        await AdminToken.deleteMany({
            createdAt: { $lte: date },
        });
        await UserToken.deleteMany({
            createdAt: { $lte: date },
        });

        return;
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("destroyToken");
        logger.info(sendResponse);
    }
};
const removeLogger = async () => {
    try {
        var uploadsDir = __dirname + "/logger";
        fs.rmdir(uploadsDir, { recursive: true }, (err: any) => {
            if (err) {
                throw err;
            }
            console.log(`${uploadsDir} is deleted!`);
        });

        return;
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info("removeLogger");
        logger.info(sendResponse);
    }
};
const serviceComplete = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() + 10));
        const ServiceData = await ServiceRequest.find({
            complishment_report: { $exists: true },
            status: "rewarded",
            complishment_report_date: {
                $gte: new Date(dateValue.setUTCHours(0o0, 0o0, 0o0)),
                $lte: new Date(dateValue.setUTCHours(23, 59, 59, 999)),
            },
        });

        ServiceData.map(async function (service) {
            await ServiceRequest.findByIdAndUpdate(service._id, {
                status: "completed",
            });
        });

    } catch (err: any) {
        console.log(err.message);
    }
};
const autoCancelledAfter12Month = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 365));
        const ServiceData = await ServiceRequest.find({
            "status": 8,
            "createdAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        await Promise.all(ServiceData.map(async function (serviceItem) {
            await ServiceRequest.findByIdAndUpdate(serviceItem._id, {
                status: 9,
            });

            const bidData = await BidModel.findById(serviceItem.selected_bid_id)

            if (serviceItem && bidData) {
                let pushTitle: any = 'The service request not do any event';
                let message: any = `Service Request is Cancel (Request Id: ${serviceItem.request_id})`;
                let payload: any = serviceItem;

                await Notification.create({
                    user_id: [serviceItem?.user_id, bidData.vendor_id],
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                })
                const userNotification = await User.findOne({
                    _id: new mongoose.Types.ObjectId(serviceItem.user_id)
                });
                let getTokenCustomer: any = (await UserToken.find({
                    user_id: new mongoose.Types.ObjectId(serviceItem.user_id),
                    firebase_token: { $ne: null }
                })).map(value => value.firebase_token);


                let getTokenVendor: any = (await UserToken.find({
                    user_id: new mongoose.Types.ObjectId(bidData.vendor_id)
                })).map(value => value.firebase_token);
                let getToken: any = getTokenCustomer.concat(getTokenVendor);
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
        }));
    } catch (err: any) {
        console.log(err.message);
    }
};
const serviceAutoClose = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 15));
        const ServiceData = await ServiceRequest.find({
            "status": 2,
            "createdAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        ServiceData.map(async function (serviceItem) {
            await ServiceRequest.findByIdAndUpdate(serviceItem._id, {
                status: 4,
            });
        });

    } catch (err: any) {
        console.log(err.message);
    }
};

const serviceAutoCancelAfter30Day = async () => {
    try {
        const date = new Date();
        const dateValue = new Date(date.setDate(date.getDate() - 30));
        const ServiceData = await ServiceRequest.find({
            "status": 6,
            "updatedAt": {
                '$lte': new Date(dateValue.toString())
            }
        });
        ServiceData.map(async function (serviceItem) {
            await ServiceRequest.findByIdAndUpdate(serviceItem._id, {
                status: 9,
            });
        });

    } catch (err: any) {
        console.log(err.message);
    }
};

const BidModalUpdate = async () => {
    try {
        // Update the createdAt field for all records in the BidModal schema
        await BidModel.updateMany({}, { $set: { validity: "2023/05/31" } });

        console.log('All records updated successfully!');
    } catch (error) {
        console.error('Error updating records:', error);
    }
};

const databaseBackup = async () => {
    const mongodbUri = process.env.MONGO_URI;
    const backupPath = `${process.cwd() + '/src/database/'}`;
    const currentDate = moment().format("MM-DD-YYYY--HH-mm-ss-a")
    const backupFile = `backup-${currentDate}.zip`;
    const cmd = `mongodump --uri=${mongodbUri} --out=${backupPath} && zip -r ${backupFile} ${backupPath}`;

    exec(cmd, async (error: any) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    })
    try {
        const output = fs.createWriteStream(backupPath + backupFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // compression level
        });
        archive.directory(backupPath + 'live-maintenance-master', false);
        await sendEmailDatabase(backupFile, backupPath)
        output.on('close', async () => {
            console.log('Zip file created successfully!');
        });
        archive.pipe(output);
        archive.finalize();
    } catch (error: any) {
        console.log('errrr', error)
    }
}

const sendEmailDatabase = async (backupFiles: any, backupPaths: any) => {
    let backupFile: any = backupFiles
    let backupPath: any = backupPaths
    let template: any = 'database'
    let sendData: any = {
        to: 'maintenance.master.app@gmail.com',
        subject: 'database backup',
        template: template,
        sendEmailTemplatedata: {
            app_name: process.env.APP_NAME,
            attachment: backupPath + backupFile,
            filename: "Database"
        },
        attachments:
        {
            filename: backupFile,
            path: backupPath + backupFile,
        }
    }
    await commonFunction.sendEmailTemplate(sendData)
}



const randomDataUpdate = async () => {
    try {
        // const ServiceData = await BidModel.find({
        //     // validity: "Invalid date"
        // });

        // // console.log(ServiceData)
        // ServiceData.map(async function (serviceItem) {
        //     await BidModel.updateOne({ _id: serviceItem._id }, { $set: { is_active: true } });

        //     //     await BidModel.findByIdAndUpdate(serviceItem._id, {
        //     //         validity: '2023/05/31',
        //     //     });
        // });
        // console.log("done sr date ")

    } catch (err: any) {
        console.log(err.message);
    }
};


export default {
    destroyToken,
    removeLogger,
    dbBackup,
    serviceAutoClose,
    serviceComplete,
    autoCancelledAfter12Month,
    databaseBackup,
    sendEmailDatabase,
    randomDataUpdate,
    BidModalUpdate,
    serviceAutoCancelAfter30Day
};
