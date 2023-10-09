import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "setting_name": "required|string|exist:settings,setting_name," + id,
        "setting_value": "required|string",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}