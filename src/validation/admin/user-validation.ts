import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "email": "required|string|email|exist:users,email," + id,
        "first_name": "required|string",
        "last_name": "required|string",
        "user_name": "required|string|exist:users,user_name," + id,
        "mobile_no": "required|string|exist:users,mobile_no," + id,
        // password: "required|string",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const changePasswordValidation  = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        user_id: "required",
        password: "required|string|min:6",
       
        // password: "required|string",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
    changePasswordValidation
}