import { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import Card from "../../models/cards-model";
const stripe = require('stripe')(process.env.STRIPE_KEY);
import User from "../../models/user-model";
import BidModel from "../../models/bid-request-model";
import PaymentTransaction from "../../models/payment-transaction-model";
import MyEarning from "../../models/my-earning-model";
const { v4: uuidv4 } = require('uuid');
import Notification from "../../models/notification-model";
import UserToken from "../../models/user-token-model";
import FirebaseFunction from '../../helper/firebase';
import CommonFunction from "../../helper/commonFunction";
import ServiceRequest from "../../models/service-request-model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Create/Sotre Payment Method ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const store = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bid_id, card_id } = req.body;

        const bidData: any = await BidModel.findById(bid_id);
        if (!bidData) {
            const sendResponse: any = {
                message: process.env.APP_BID_NOT_FOUND_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        // if (!bidData.is_active) {
        //     const sendResponse: any = {
        //         message: process.env.APP_BID_EXPIRED_MESSAGE,
        //     };
        //     return response.sendError(res, sendResponse);
        // }
        const userData: any = await User.findById(bidData.user_id);
        const cardData: any = await Card.findById(card_id);
        if (!cardData) {
            const sendResponse: any = {
                message: process.env.APP_ADD_CARD_MESSAGE,
            };
            return response.sendError(res, sendResponse);
        }
        let amount = bidData.amount;
        // let amount = '1';

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(parseFloat(amount) * 100),
            currency: "INR",
            description: "the Bid Id is " + bidData._id + " have received the Payment.",
            customer: userData.stripe_user_id,
            payment_method: cardData.stripe_card_id,
            confirm: true,
            payment_method_types: ['card'],
        });

        let transfer_reference_id = uuidv4()


        const amountreceiveduserData: any = await User.findOne({ _id: bidData.vendor_id });
        let newAmount = parseFloat(amountreceiveduserData.wallet_amount) + parseFloat(amount);

        let received_amount = ((parseFloat(amount) * parseFloat(amountreceiveduserData.current_commission)) / 100);
        // let sp_received_amount: any = ((parseFloat(amount) * parseFloat(amountreceiveduserData.current_commission)) / 100);
        let sp_received_amount: any = ((parseFloat(amount) - 1.3));
        // let admin_received_amount = ((parseFloat(amount)) - (parseFloat(sp_received_amount)));
        let admin_received_amount = 5;
        // let admin_received_amount = 1.3;

        let status = await CommonFunction.stripePaymentIntentStatus(paymentIntent.status)
        await PaymentTransaction.create({
            user_id: new mongoose.Types.ObjectId(userData._id),
            bid_id: new mongoose.Types.ObjectId(bidData._id),
            card_id: new mongoose.Types.ObjectId(cardData._id),
            vendor_id: new mongoose.Types.ObjectId(bidData.vendor_id),
            amount: amount,
            received_amount: received_amount,
            commission_charge: 0,
            service_charge: 0,
            status: status,
            discount: 0,
            stripe_payload: JSON.stringify(paymentIntent),
            stripe_request_id: paymentIntent.id,
            transfer_reference_id: transfer_reference_id,
            admin_percentage: (100 - (amountreceiveduserData.current_commission)),
            vendor_percentage: amountreceiveduserData.current_commission,
        });

        await MyEarning.create({
            vendor_id: new mongoose.Types.ObjectId(bidData.vendor_id),
            user_id: new mongoose.Types.ObjectId(userData._id),
            bid_id: new mongoose.Types.ObjectId(bidData._id),
            card_id: new mongoose.Types.ObjectId(cardData._id),
            sp_received_amount: sp_received_amount,
            amount: amount,
            admin_received_amount: admin_received_amount,
            old_wallet_amount: amountreceiveduserData.wallet_amount,
            new_wallet_amount: newAmount,
            status: status,
            transfer_reference_id: transfer_reference_id,
            admin_percentage: (100 - (amountreceiveduserData.current_commission)),
            vendor_percentage: amountreceiveduserData.current_commission,
        });
        amountreceiveduserData.wallet_amount = newAmount;
        await amountreceiveduserData.save();

        const srData: any = await ServiceRequest.findOne({ _id: bidData.service_request_id });
        srData.is_payment_done = true;
        await srData.save();


        if (amountreceiveduserData) {
            // start here Push            
            try {

                let today = new Date();
                let year = today.getFullYear();
                let mes = today.getMonth() + 1;
                let dia = today.getDate();
                let todayDate = dia + "-" + mes + "-" + year;
                let message_from = process.env.APP_NAME + ': $' + amount + ' debited on ' + todayDate + ' New Balance : ' + amountreceiveduserData.wallet_amount;

                let pushTitle: any = 'transaction made';
                let message: any = message_from;
                let payload: any = amountreceiveduserData;

                await Notification.create({
                    user_id: amountreceiveduserData._id,
                    title: pushTitle,
                    message: message,
                    payload: JSON.stringify(payload),
                })


                const userNotification = await User.findOne({
                    _id: new mongoose.Types.ObjectId(amountreceiveduserData._id)
                });

                let getToken: any = (await UserToken.find({
                    user_id: new mongoose.Types.ObjectId(amountreceiveduserData._id),
                    firebase_token: { $ne: null }
                })).map(value => value.firebase_token);

                if (userNotification && userNotification.firebase_is_active) {
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
            }
            catch (err) {
                logger.info("sendPushNotification");
                logger.info(err);
            }
        }

        await session.commitTransaction();
        await session.endSession();

        const responseData = {
            message: process.env.APP_PM_DONE_MESSAGE,
            data: {},
        };

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


export default {
    store,
};
