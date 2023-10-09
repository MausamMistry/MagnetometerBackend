import crypto from 'crypto';

const algorithm = process.env.algorithm;
const securitykeyDec = process.env.SecuritykeyDec;
const initVectorDec = process.env.initVectorDec;


const DecryptedDataResponse = (async (req: any, res: any, next: any) => {
    if (algorithm && initVectorDec && securitykeyDec) {
        const decipher = crypto.createDecipheriv(algorithm, securitykeyDec, initVectorDec);
        let encryptedData;
        if (req.body.value) {
            encryptedData = req.body.value;
            let decryptedData = decipher.update(encryptedData, "base64", "utf-8");
            decryptedData += decipher.final("utf8");
            req.body = JSON.parse(decryptedData);
        }
        next();
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DecryptedData = (async (req: any, res: any, next: any) => {
    if (req.headers.env) {
        if (req.headers.env == 'jm_developer') {
            next();
        } else {
            return DecryptedDataResponse(req, res, next);
        }
    } else {
        return DecryptedDataResponse(req, res, next);
    }

});

export default {
    DecryptedData,
}   