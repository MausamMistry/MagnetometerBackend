import {NextFunction, Request, Response} from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}

    const validationRule = {
        "email": "required|string|exist:contact_us,email," + id,
        "first_name": "required|string",
        "last_name": "required|string",
        "message": "required|string",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

export default {
    store,
}