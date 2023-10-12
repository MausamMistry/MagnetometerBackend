import {NextFunction, Request, Response} from "express"
import validator from "../validate_";

const store = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "location": "required",
        "type":"required",
        "service_type_id":'required',
        "asset_id":'required',
        "detail":'required',
        // "photos":'required',
        "contact_no":'required',
        "priority":'required',
        "schedule_date": [{ "required_if": ['type', "2"] }]
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const RateToSp = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
        "workmanship":"required",
        "materials":"required",
        "timeframe":"required",
        "behavior":"required",
        "rating":"required",
        "review":"required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const closeRequest = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
        "reason":"required",
        "note":"required"
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const getBySlug =  async (req: Request, res: Response, next: NextFunction)=>{
    const ValidationRule = {
        "slug": "required",
    }
    validator.validatorUtilWithCallbackQuery(ValidationRule, {}, req, res, next);
}

const getByServiceReqId =  async (req: Request, res: Response, next: NextFunction)=>{
    const ValidationRule = {
        "service_request_id": "required",
    }
    validator.validatorUtilWithCallback(ValidationRule, {}, req, res, next);
}

const raiseDisputeValidation = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
        "category":"required",
        "root_cause":"required",
        "damages":"required",
        "action":"required"
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const updateDispute = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "id":"required",
        "status":'required'
        // "update":"required"
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const complishmentReportValidation = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
        "user_id":"required",
        "completion_date":"required",
        "note":"required",
        "issue":"required",
        "customer_note":"required",
        // "photo":"required",
        // "document":"required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const completed = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
        "status":"required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}

const disputeConatctAdmin = async (req: Request, res: Response, next: NextFunction) => {
    let id: any = 0;
	if (req.body.id) {
		id = req.body.id
	}
    const validationRule = {
        "service_request_id":"required",
    }
    validator.validatorUtilWithCallback(validationRule, {}, req, res, next);
}


export default {
    store,
    RateToSp,
    closeRequest,
    getBySlug,
    getByServiceReqId,
    raiseDisputeValidation,
    updateDispute,
    complishmentReportValidation,
    completed,
    disputeConatctAdmin
}