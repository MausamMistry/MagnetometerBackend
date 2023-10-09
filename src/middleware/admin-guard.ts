import { Request, Response, NextFunction } from 'express';
import jwtUtil from '../helper/jwt';
import response from '../helper/responseMiddleware';
import mongoose from 'mongoose';
import AdminToken from '../models/admin-token-model';
import Admin from '../models/admin-model';

// Constants
/**
 * Middleware to verify if user is an admin.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function authAdmin(req: Request, res: Response, next: NextFunction) {
    try {

        // Get json-web-token
        const jwt = req.headers['authorization'];
        if (!jwt) {
            const sendResponse: any = {
                error: 'unauthorized',
            }
            return response.sendAuthError(res, sendResponse)
        }
        else {
            const token = jwt.split(" ")[1];
            // Make sure user is authorized
            const clientData: any = await jwtUtil.decode(token);
            if (!!clientData) {
                //@ts-ignore
                // req.user = clientData;

                let gettoken: any = await AdminToken.findOne({
                    admin_id: new mongoose.Types.ObjectId(clientData.admin_id),
                    token: token
                });

                const admin: any = await Admin.findById(clientData.admin_id).select("_id first_name last_name email")
                //@ts-ignore
                req.admin = admin;
                if (gettoken) {
                    next();
                } else {
                    const sendResponse: any = {
                        error: 'unauthorized',
                    }
                    return response.sendAuthError(res, sendResponse)
                }
            } else {
                const sendResponse: any = {
                    error: 'unauthorized',
                }
                return response.sendAuthError(res, sendResponse)
            }
        }

    } catch (err) {
        const sendResponse: any = {
            error: 'unauthorized',
        }
        return response.sendAuthError(res, sendResponse)
    }
};