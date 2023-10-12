import { NextFunction, Request, Response } from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
  
    const validationRule = {
        "bid_id": 'required|string', 
        "card_id":'required|string'
        
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}


export default {
    store,
}