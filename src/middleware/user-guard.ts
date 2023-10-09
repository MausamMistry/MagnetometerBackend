import { Request, Response, NextFunction } from "express";
import jwtUtil from "../helper/jwt";
import response from "../helper/responseMiddleware";
import mongoose from "mongoose";
import UserToken from "../models/user-token-model";
import User from "../models/user-model";

// Constants
/**
 * Middleware to verify if user is an Customer.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function authUser(req: Request, res: Response, next: NextFunction) {
    try {
        // Get json-web-token
        const jwt = req.headers["authorization"];
        if (!jwt) {
            const sendResponse: any = {
                error: "unauthorized",
            };
            return response.sendAuthError(res, sendResponse);
        } else {
            const token = jwt.split(" ")[1];
            // Make sure user is authorized
            const clientData: any = await jwtUtil.decode(token);
            if (!!clientData) {
                //@ts-ignore
                let gettoken: any = await UserToken.findOne({
                    user_id: new mongoose.Types.ObjectId(clientData.user_id),
                    token: token,
                });

                const user: any = await User.findById(
                    clientData.user_id
                ).select("_id first_name last_name email type");
                //@ts-ignore
                req.user = user;
                if (gettoken) {
                    next();
                } else {
                    const sendResponse: any = {
                        error: "unauthorized",
                    };
                    return response.sendAuthError(res, sendResponse);
                }
            } else {
                const sendResponse: any = {
                    error: "unauthorized",
                };
                return response.sendAuthError(res, sendResponse);
            }
        }
    } catch (err) {
        const sendResponse: any = {
            error: "unauthorized",
        };
        return response.sendAuthError(res, sendResponse);
    }
}
