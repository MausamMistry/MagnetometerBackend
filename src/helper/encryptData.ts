import crypto from 'crypto';

const algorithm =process.env.algorithm;
const SecuritykeyEnc = process.env.SecuritykeyEnc;
const initVectorEnc =  process.env.initVectorEnc;


const encryptedDataResponse = (async (data:any) => {
    if(algorithm && initVectorEnc && SecuritykeyEnc){
        
        const cipher = crypto.createCipheriv(algorithm,SecuritykeyEnc,initVectorEnc);
        const message = JSON.stringify(data);
        let encryptedData = cipher.update(message, "utf-8", "base64");
        encryptedData += cipher.final("base64");
        const mac = crypto.createHmac('sha256', SecuritykeyEnc)
            .update(Buffer.from(Buffer.from(initVectorEnc).toString("base64") + encryptedData, "utf-8").toString())
            .digest('hex');
        var response = {
            'mac': mac,
            'value': encryptedData
        }
        return response;
    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const EncryptedData = (async (req :any, res:any, data:any) => {
    if (req.headers.env) {
        if (req.headers.env == 'jm_developer') {
            return data;
        } else {
            return await encryptedDataResponse(data);
        }
    } else {
        return await encryptedDataResponse(data);
    }
});

export default {
    EncryptedData
}