import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        "info": "required",
        "calibration": "required",
        "vibration": "required",
        "settings": "required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}