import randomString from 'randomstring';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
// Errors
const errors = {
    validation: 'JSON-web-token validation failed.',
} as const;
// Constants
const secret = process.env.JWT_SECRET || randomString.generate(100);
const options = { expiresIn: process.env.JWT_EXP };
// Types
type TDecoded = string | JwtPayload | undefined;
function sign(data: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
        jsonwebtoken.sign(data, secret, options, (err: any, token: any) => {
            err ? reject(err) : resolve(token || '');
        });
    });
}
function decode(jwt: string): Promise<TDecoded> {
    return new Promise((res, rej) => {
        jsonwebtoken.verify(jwt, secret, (err: any, decoded: any) => {
            return err ? rej(errors.validation) : res(decoded);
        });
    });
}
// Export default
export default {
    sign,
    decode,
};