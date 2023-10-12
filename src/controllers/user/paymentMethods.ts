import { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import response from "../../helper/responseMiddleware";
import log4js from "log4js";
const logger = log4js.getLogger();
import Card from "../../models/cards-model";
const stripe = require('stripe')(process.env.STRIPE_KEY);
import User from "../../models/user-model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Create/Sotre Payment Method ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const store = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user_id = req.user._id;
        const { id, number, exp_date, cvc } = req.body;
        const expDateArray = exp_date.split("-");
        let cardDataStore: any = {};
        let message: any;
        if (id) {
            cardDataStore = await Card.findOne({ _id: id });
            message = 'Card' + process.env.APP_UPDATE_MESSAGE;
        } else {
            cardDataStore = new Card();
            message = 'Card' + process.env.APP_STORE_MESSAGE;
        }

        const userData: any = await User.findById(user_id).select(
            "_id first_name last_name email stripe_user_id"
        );
        let token = []
        try {
            token = await stripe.tokens.create({
                // card: {
                //     number: '4242424242424242',
                //     exp_month: 12,
                //     exp_year: 2023,
                //     cvc: '314',
                // },
                card: {
                    number: number,
                    exp_month: expDateArray[1],
                    exp_year: expDateArray[0],
                    cvc: cvc,
                },
            });
        }
        catch (err: any) {
            logger.info(process.env.APP_INVALID_CARD_MESSAGE);
            logger.info(err);
            const sendResponse: any = {
                message: process.env.APP_INVALID_CARD_MESSAGE,
            };
            await session.abortTransaction();
            session.endSession();
            return response.sendError(res, sendResponse);
        }
        if (token && userData) {
            try {
                if (userData.stripe_user_id) {

                    const card = await stripe.customers.createSource(
                        userData.stripe_user_id,
                        { source: token.id }
                    );
                    const cardData = await Card.aggregate([
                        {
                            $match: {
                                $and: [{ user_id: new mongoose.Types.ObjectId(user_id) }],
                            },
                        },
                    ]);

                    const checkExits = cardData.some((v, i) => {
                        if (!id) {
                            return v.number === card.number
                        } else if (v._id !== id) {
                            return v.number === card.number
                        } else if (v._id === id) {
                            return false
                        }

                    })

                    if (!checkExits) {

                        // await Card.updateOne({
                        cardDataStore.user_id = new mongoose.Types.ObjectId(user_id);
                        cardDataStore.stripe_payload = JSON.stringify(card);
                        cardDataStore.stripe_card_id = card.id;
                        cardDataStore.card_no = card.id;
                        cardDataStore.source = token.id;
                        cardDataStore.brand = card.brand;
                        cardDataStore.exp_month = card.exp_month;
                        cardDataStore.exp_year = card.exp_year;
                        cardDataStore.funding = card.funding;
                        cardDataStore.last4 = card.last4;
                        cardDataStore.number = number;
                        await cardDataStore.save()
                        // }); 
                    } else {
                        logger.info(process.env.APP_CARD_AL_EXIST_MESSAGE);
                        const sendResponse: any = {
                            message: process.env.APP_CARD_AL_EXIST_MESSAGE,
                        };
                        return response.sendError(res, sendResponse);
                    }
                }
            }
            catch (err: any) {
                const sendResponse: any = {
                    message: err.message,
                };
                logger.info(process.env.APP_CARD_AL_EXIST_MESSAGE);
                logger.info(err);
                return response.sendError(res, sendResponse);
            }
        }
        await session.commitTransaction();
        await session.endSession();
        const responseData = {
            message: message,
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Payment Method Lists =============================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAll = async (req: any, res: Response) => {
    const user = req.user;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cards = await Card.aggregate([
            {
                $match: {
                    $and: [{ user_id: new mongoose.Types.ObjectId(user._id) }],
                },
            },
            {
                $project: {
                    "_id": 1,
                    "user_id": 1,
                    "brand": 1,
                    "exp_month": 1,
                    "exp_year": 1,
                    "funding": 1,
                    "last4": 1,
                    "card_no": 1,
                    "source": 1,
                    "number": 1,
                }
            },
        ]);
        const sendResponse = {
            message: 'Card' + process.env.APP_GET_MESSAGE,
            data: (cards).length > 0 ? cards : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Card' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
// *******************************************************************************************
// ===================================== Delete Record  ======================================
// *******************************************************************************************

const destroy = (async (req: Request, res: Response) => {
    const session: any = await mongoose.startSession();
    session.startTransaction();
    try {
        await Card.deleteMany({ _id: req.query.id, })
        const responseData: any = {
            message: 'Card' + process.env.APP_DELETE_MESSAGE,
            data: {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, responseData);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        }
        logger.info('Card' + process.env.APP_DELETE_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ============================================= Get Payment Method Detail by ID ==========================================
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getCard = async (req: any, res: Response) => {
    const user = req.user;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.query;

        const cards = await Card.aggregate([
            {
                $match: {
                    $and: [
                        { user_id: user._id },
                        { _id: new mongoose.Types.ObjectId(id) },
                    ],
                },
            },
            {
                $project: {
                    "_id": 1,
                    "user_id": 1,
                    "brand": 1,
                    "exp_month": 1,
                    "exp_year": 1,
                    "funding": 1,
                    "last4": 1,
                    "card_no": 1,
                    "source": 1,
                    "number": 1,
                }
            },
        ]);

        const sendResponse = {
            message: 'Card' + process.env.APP_GET_MESSAGE,
            data: (cards).length ? cards[0] : {},
        };
        await session.commitTransaction();
        session.endSession();
        return response.sendSuccess(req, res, sendResponse);
    } catch (err: any) {
        const sendResponse: any = {
            message: err.message,
        };
        logger.info('Card' + process.env.APP_GET_MESSAGE);
        logger.info(err);
        await session.abortTransaction();
        session.endSession();
        return response.sendError(res, sendResponse);
    }
};
export default {
    store,
    destroy,
    getAll,
    getCard,
};
