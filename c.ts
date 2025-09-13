import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';

// Замените на путь к вашему файлу credentials.json
const CREDENTIALS_PATH = path.join(__dirname, 'service_account.json');

// Замените на ID вашей таблицы
const SPREADSHEET_ID = '1kYsM0-krmpoBOxv6nzbFYywMKUBInpBTs638PA4OHKk';

async function appendToColumnC(data: string[]): Promise<void> {
  try {
    // 1. Аутентификация
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Преобразование массива строк в формат, требуемый API
    const values = data.map(item => [item]);

    // 2. Добавление данных
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, // Здесь исправлена опечатка
      range: 'C:C',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    });

    console.log('Данные успешно добавлены:', response.data.updates?.updatedCells);
    
  } catch (error) {
    console.error('Ошибка при добавлении данных в Google Sheets:', error);
  }
}

// Пример использования функции для добавления новых данных в столбец C
appendToColumnC(['Новые данные 1', 'Новые данные 2', 'Новые данные 3'])
  .then(() => {
    console.log('Операция завершена.');
  });