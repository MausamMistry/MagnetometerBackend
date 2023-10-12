import { NextFunction, Request, Response } from "express";
import validator from "../validate_";

const completed = async (req: Request, res: Response, next: NextFunction) => {
    const ValidationRule = {
        "service_request_id": "required",
    };
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
};

export default {
    completed,
};
