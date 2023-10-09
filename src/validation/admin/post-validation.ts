import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "images": "required",
        // "date_time": "required|string",
        "description": "required|string",
        // "short_description": "required|string",
        "type": "required",
        // "title": "required|exist:posts,title," + id,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}