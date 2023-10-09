import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
    if (req.body.id) {
        id = req.body.id
    }
    const validationRule = {
        "type": "required|string",
        "url": "string",
        "title": "required|string|exist:training_materials,title," + id,
        "description": "required|string",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}