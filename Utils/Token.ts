

import jsonwebtoken, { type JwtPayload } from "jsonwebtoken";

export class Token {

    /*
    *** Token sign
    */
    public static async sign(object: any, key: string, exp: number): Promise<string> {

        return jsonwebtoken.sign( object, key, { expiresIn: exp} );
    }

    /*
    *** Token verify
    */
    public static async verify(token: string, key: string): Promise<boolean> {
        try {

            const varify: string | JwtPayload = jsonwebtoken.verify(token, key);
            return varify ? true : false;

        } catch (e) {
            return false
        }
    }

    /*
    *** Parse token
    */
    public static async parseJWT(token: string): Promise<string> {

        try {

            const base64Payload: string = token.split('.')[1];

            const payload: Buffer = Buffer.from(base64Payload, 'base64');

            return JSON.parse(payload.toString()).uid;
        }
        catch (e) {
            return ''
        }

    }
}