import encryptData from './encryptData';

const sendAuthError = (async (res: any, error: any) => {
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": error.error,
        "data": []
    }
    res.status(401).send(dataResponse)
});

const sendError = (async (res: any, error: any) => {
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": error.message,
        "data": {}
    }
    res.status(422).send(dataResponse);
});
const sendValidationError = (async (res: any, error: any) => {
    // var errors = Object.values(error);
    let dataResponse = {
        "code": 422,
        "status": "error",
        "message": 'this field is required',
        "data": error
    }
    res.status(422).send(dataResponse);
});


const sendSuccess = (async (req: any, res: any, data: any) => {
    let dataResponse = {
        "code": 200,
        "status": "success",
        "message": data.message,
        "data": data.data
    }
    let response = await encryptData.EncryptedData(req, res, dataResponse);
    res.status(200).send(response);
});
const sendResponse = (async (res: any, data: any) => {
    let dataResponse = {
        "code": 200,
        "status": "success",
        "message": data.message,
        "data": data.data
    }
    res.status(200).send(dataResponse);
});
const sendInternalError = (async (res: any, data: any) => {
    res.status(500).send(data);
});

const sendCustomResponse = async (res: any, data: any, statusCode: any) => {
    res.status(statusCode).send(data);
}
export default {
    sendResponse,
    sendError,
    sendAuthError,
    sendSuccess,
    sendValidationError,
    sendInternalError,
    sendCustomResponse
}