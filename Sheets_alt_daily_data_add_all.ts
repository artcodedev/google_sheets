import { Console } from "./Utils/Console";
import { Fetch } from "./Utils/Fetch";
import Logger from "./Utils/Logger";
import { Token } from "./Utils/Token";
import * as path from 'path';

import { google, sheets_v4 } from 'googleapis';

type RowData = (string | number)[];

interface Data {
    createdAt: string
    paymentStatus: string,
    processingStatus: string
    incrementId: string,
    amount: number
    siteUrl: string
    countryPath: string
    country_name: string
    startDate: string
    vehiclePeriod: string
    plateNumber: string
    vehicleType: string
}

class Sheets_alt_daily_data {

    private priceMap = {
        'austria': {
            25.9: 9.3, 32.9: 12.4, 58.9: 31.1, 169.9: 103.8,
            12.9: 3.7, 15.9: 4.9, 29.9: 12.4, 69.9: 41.5
        },
        'swiss': {
            59.9: 42.0
        },
        'hungary': {
            12.9: 6.7, 18.9: 8.3, 26.9: 13.4, 219: 163.0,
            27.9: 13.2, 31.9: 16.5, 43.9: 26.8, 189.9: 148,
            33.9: 18.9, 38.9: 24.8, 54.9: 37.9, 269.9: 210
        },
        'czech': {
            31.9: 11.8, 44.9: 18.8, 149.9: 99.8,
            21.9: 4.1, 26.9: 5.7, 32.9: 9.4, 109.9: 49.9,
            18.9: 2.1, 22.9: 2.9, 79.9: 25.9
        },
        'slovenia': {
            21.9: 8.0, 59: 32.0, 199: 58.7,
            28.9: 16.0, 54.9: 32.0, 159: 117,
            49: 32, 83: 64.1, 295: 235
        },
        'romania': {
            7.9: 3.5, 8.9: 6.0, 11.9: 9.5, 39.9: 28.0, 13.9: 4,
            23.9: 16.0, 29.9: 32.0, 359.9: 320.0,
            69.9: 56.0, 599.9: 560.0
        },
        'bulgaria': {
            21.9: 7.67, 32.9: 15.34, 45.9: 27.61, 69.9: 49.6
        },
        'slovakia': {
            16.9: 8.1, 22.9: 10.8, 29.9: 17.0, 82.9: 90.0
        }
    };

    private CREDENTIALS_PATH: string = path.join(process.cwd(), 'service_account.json');
    private ID_TABLE: string = 'test';
    private RAGNE: string = 'Автоматический приход данных';

    private async delay(time: number): Promise<void> {
        return new Promise(function (resolve) {
            setTimeout(resolve, time)
        });
    }

    private async auth(): Promise<sheets_v4.Sheets> {
        const auth = new google.auth.GoogleAuth({
            keyFile: this.CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return google.sheets({ version: 'v4', auth });
    }

    private async formatDate(dateString: string): Promise<string> {
        const parts = dateString.split('-');
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        return `${day}.${month}.${year}`;
    }

    private async getPricePay(price: number, county: string, type: string): Promise<number> {

        if (county === 'romania') {
            if (price === 39.9) return type === "Bus > 23 Seats" ? 28 : 50;

            if (price === 13.9) return type === "Bus > 23 Seats" ? 7 : 4;

        }

        if (county === 'hungary') {
            if (price === 27.9) return type === 'Car <3.5 tons' ? 13.2 : 13.5;
        }

        if (county === 'czech') {
            if (price === 25.9) return type === 'Standard fuel' ? 8.6 : 4.5;
        }

        const countyPrices = this.priceMap[county as keyof typeof this.priceMap];
        if (countyPrices) {
            const value = countyPrices[price as keyof typeof countyPrices];
            if (value !== undefined) {
                return value;
            }
        }

        return 0;
    }

    private async makeArray(data: Data[]): Promise<string[][]> {
        const comparisonDate = new Date('2025-08-01T00:00:00.000Z');

        const filteredData = data.filter(item => {
            const targetDate = new Date(item.createdAt);
            return targetDate > comparisonDate;
        });

        const n_data: string[][] = await Promise.all(
            filteredData.map(async item => {
                const countrySymbol = item.countryPath.charAt(0).toUpperCase() + item.countryPath.slice(1);
                const formattedDate = await this.formatDate(item.createdAt.split('T')[0]);
                const formattedStartDate = await this.formatDate(item.startDate);
                const pricePay = await this.getPricePay(item.amount, item.countryPath, item.vehicleType);

                return [
                    formattedDate,
                    item.createdAt.split('T')[1].split('.')[0],
                    item.incrementId,
                    '-',
                    item.processingStatus,
                    '-',
                    '-',
                    '-',
                    '-',
                    item.siteUrl.replace('https://', ''),
                    countrySymbol,
                    item.country_name,
                    item.plateNumber,
                    item.vehiclePeriod,
                    formattedStartDate,
                    item.amount.toString(),
                    pricePay.toString(),
                ];
            })
        );

        return n_data;
    }

    private async getGoogleSheetData(): Promise<string[][]> {
        try {

            const sheets = await this.auth();
            const dataSheets = await sheets.spreadsheets.values.get({
                spreadsheetId: this.ID_TABLE,
                range: `${this.RAGNE}!A3:Y`,
            });

            return dataSheets.data.values || [];
        }
        catch (e: any) {
            console.log(e)
            return []
        }
    }

    private async makeSetData(array: string[][], array1: string[][]): Promise<string[][]> {

        const mergedArray = [...array];

        const existingIds = new Set(array1.map(item => item[1]));

        for (const item of array1) {

            if (!existingIds.has(item[1])) mergedArray.push(item);

        }
        return mergedArray;

    }

    private async makeSetNoDuplicates(array: string[][]): Promise<string[][]> {

        const mergedMap = new Map<string, string[]>();

        for (const item of array) {
            mergedMap.set(item[1], item);
        }

        return Array.from(mergedMap.values());
    }

    private async formatArrayForMerge(arr: any[][]): Promise<any[][]> {
        const data = arr.map(row => {
            if (row.length > 16) {
                row[15] = parseFloat(row[15] as string);
                row[16] = row[4] === 'нет оплаты' ? 0 : parseFloat(row[16] as string);
            }
            return row;
        });

        return [...data].sort((a, b) => {
            const dateA = this.parseDate(a[0]);
            const dateB = this.parseDate(b[0]);
            if (dateA > dateB) {
                return 1;
            }
            if (dateA < dateB) {
                return -1;
            }
            return 0;
        });
    };

    private parseDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split('.').map(Number);
        return new Date(year, month - 1, day);
    };

    private async makeDate(domain: string): Promise<void> {
        try {

            const token = await Token.sign({}, 'secret', 9999);

            const data = await Fetch.request(`https://${domain}/api/get_data`, { token: token });

            if (data) {

                const last_leads: Data[] = data.orders;

                Console.log('[+] Make data array');
                const makeDataArray: string[][] = await this.makeArray(last_leads);

                Console.log('[+] Get google sheet data')
                const getGoogleSheetData: string[][] = await this.getGoogleSheetData();

                Console.log('[+] Make new set with arrays');

                const makeSetData: string[][] = await this.makeSetData(makeDataArray, getGoogleSheetData);

                Console.log('[+] Delete  duplicates');
                const makeSetNoDuplicates: string[][] = await this.makeSetNoDuplicates(makeSetData);

                Console.log('[+] Format array for merge');
                const makeSetData_format = await this.formatArrayForMerge(makeSetNoDuplicates);

                const batchSize = 900;
                const totalRecords = makeSetData_format.length;
                const numberOfBatches = Math.ceil(totalRecords / batchSize);

                Console.log('[+] Append in google sheets')
                for (let i = 0; i < numberOfBatches; i++) {
                    const sheets = await this.auth();

                    const start = i * batchSize;
                    const end = Math.min(start + batchSize, totalRecords);
                    const currentBatch = makeSetData_format.slice(start, end);

                    const batchUpdateData = currentBatch.map((row, index) => {
                        const rowIndex = start + index + 2;

                        return {
                            range: `${this.RAGNE}!A${rowIndex}:S${rowIndex}`,
                            values: [row]
                        };
                    });

                    await sheets.spreadsheets.values.batchUpdate({
                        spreadsheetId: this.ID_TABLE,
                        requestBody: {
                            data: batchUpdateData,
                            valueInputOption: 'USER_ENTERED'
                        }
                    });

                }

            } else Console.warning('Can not get data')

        }
        catch (e: any) {

            console.log(e)
            await Logger.write('./Logs/log.txt', e.toString());
        }
    }


    public async start(): Promise<void> {
        try {

            while (true) {

                Console.log('[+] Start new step');

                await this.makeDate('buy-colosseum.store')

                Console.log('[+] Wait');

                await this.delay(5000);

            }

        }
        catch (e: any) {
            console.log(e)
            await Logger.write('./Logs/log.txt', e.toString());

        }
    }

}

new Sheets_alt_daily_data().start();