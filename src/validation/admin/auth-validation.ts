import {NextFunction, Request, Response} from "express"
import validator from "../validate_";


const login = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        "email": "required|string|email",
        "password": "required|string"
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}


const changePassword = async (req: Request,res: Response,next: NextFunction) =>{
    const validationRule = {
        "oldpassword": "required|string",
        "password": "required|string|min:6|confirmed",
        "password_confirmation": "required|string|min:6"
    }
    validator.validatorUtilWithCallback(validationRule,{},req,res,next);
}

const emailValidation = async (req: Request, res: Response, next: NextFunction) => {
    const validationRule = {
        "email": "required|string|email", 
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
	const validationRule = {
		password: "required|string|min:6",
	};
	validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
};



export default {
    login,
    changePassword,
    emailValidation,
    resetPassword,
}