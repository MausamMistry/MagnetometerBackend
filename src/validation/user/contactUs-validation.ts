import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "address": "string",
        // "email":"required|string|email",
        "name":"required|string",
        "mobile_no":"required",
        // "subject":"required|string",
        "message":"required|string",
        // "user_id":"required",
        // "images":"required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}