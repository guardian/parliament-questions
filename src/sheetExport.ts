import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleCredential, QuestionItem, QuestionValue, Questions, header } from './types';

export const getGoogleClient = async (credentials: string): Promise<JWT> => {
	const creds = GoogleCredential.parse(JSON.parse(credentials));
	
	const client: JWT = new google.auth.JWT(
		creds.client_email,
		undefined,
		creds.private_key,
		['https://www.googleapis.com/auth/spreadsheets'],
	);
	
	try {
		await client.authorize();
		console.log('connected');

		return client;
	} catch (error) {
		console.log('failed to connect', error);
		throw error;
	}
}

const getFirstEmptyCol = async (client: JWT, spreadsheetId: string) => {
	const gsApi = google.sheets({version: 'v4', auth: client});
	const res = await gsApi.spreadsheets.values.get({spreadsheetId, range: 'Data!A:A'});
	const lastRow = res.data.values?.length || 0;
	console.log(`last row in the sheet is ${lastRow}`);
	return lastRow + 1;
}


const appendRow = async (sheetsApi: sheets_v4.Sheets, spreadsheetId: string, row: number, values: string[][]) => {
	const opt = {
		spreadsheetId,
		range: `Data!A${row}`,
		valueInputOption: 'USER_ENTERED',
		resource: { values }
	};

	sheetsApi.spreadsheets.values.append(opt);
}

const makeRow = (questionValue: QuestionValue) => {
	
	const res = header.map(h => {
		if (h in questionValue) {
			//console.log(`the key is: ${h}`);
			return questionValue[h as keyof QuestionValue]?.toString() || '';
		} else {
			return '';
		}		
	});
	return res;
}

const appendRows = async (sheetsApi: sheets_v4.Sheets, spreadsheetId: string, row: number, values: QuestionItem[]) => {
	if (values.length > 0) {			
		const [head, ...tail] = values
		const rowData = makeRow(head.value);
		await appendRow(sheetsApi, spreadsheetId, row, [rowData]);
		
		appendRows(sheetsApi, spreadsheetId, row + 1, tail);
	}
}

export const appendToSheet = async (client: JWT, spreadsheetId: string, values: Questions) => {
	
	const gsApi = google.sheets({version: 'v4', auth: client});
	const firstRow = await getFirstEmptyCol(client, spreadsheetId);	
	let row = firstRow;
	
	if (firstRow === 1) {
		await appendRow(gsApi, spreadsheetId, firstRow, [header]);
		row++;
	}

	console.log(`adding ${values.results.length} questions to sheet at row ${row}`);

	await appendRows(gsApi, spreadsheetId, row, values.results);
}
