import fs from 'fs-extra'

class Reader {
    
    public static async read() {
        try {

            return await fs.readJson('./Data/data.json');
        }
        catch (e: any) {

            return false
        }
    }

    public static async write(data: object) {
        try {

            await fs.writeJson('./Data/data.json', data);

            return true;
        }
        catch (e: any) {
            console.log(e)
            return false
        }
    }
}

export default Reader;

