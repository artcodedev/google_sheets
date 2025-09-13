import fs from 'fs-extra'

class Logger {

    public static async write(file: string | undefined, message: any): Promise<void> {

        if (file && message) {

            const date = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })

            const mess: string = `[+] ${date} ${message}\n`;
            fs.outputFileSync(file, mess, { flag: 'a+' })
            
        }
    }

}

export default Logger;