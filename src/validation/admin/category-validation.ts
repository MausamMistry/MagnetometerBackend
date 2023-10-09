import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "name": "required|string|exist:categories,name," + id,
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}