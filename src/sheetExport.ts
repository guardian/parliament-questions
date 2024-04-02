import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleCredential, House, QuestionItem, QuestionValue, Questions, headers } from './types';

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
		console.log('connected to google');

		return client;
	} catch (error) {
		console.log('failed to connect to google', error);
		throw error;
	}
}

const getFirstEmptyRow = async (client: JWT, spreadsheetId: string, tabName: string, ) => {
	const gsApi = google.sheets({version: 'v4', auth: client});
	const res = await gsApi.spreadsheets.values.get({spreadsheetId, range: `${tabName}!A:A`});
	const lastRow = res.data.values?.length || 0;
	console.log(`last row in the sheet is ${lastRow}`);
	return lastRow + 1;
}


const appendRow = async (sheetsApi: sheets_v4.Sheets, spreadsheetId: string, tabName: string, row: number, values: string[][]) => {
	const opt = {
		spreadsheetId,
		range: `${tabName}!A${row}`,
		valueInputOption: 'USER_ENTERED',
		resource: { values }
	};

	sheetsApi.spreadsheets.values.append(opt);
}

const makeRow = (questionValue: QuestionValue, headers: string[]) => {
	const res = headers.map(h => {
		if (h === 'askingMember') {
			return questionValue.askingMember?.name?.toString() || '';
		}
		if (h === 'askingMemberParty') {
			return questionValue.askingMember?.party?.toString() || '';
		}
		if (h === 'answeringMember') {
			return questionValue.answeringMember?.name?.toString() || '';
		}
		if (h === 'answeringMemberParty') {
			return questionValue.answeringMember?.party?.toString() || '';
		}
		if (h === 'correctingMember') {
			return questionValue.correctingMember?.name?.toString() || '';
		}
		if (h in questionValue) {			
			return questionValue[h as keyof QuestionValue]?.toString() || '';
		} else {
			return '';
		}		
	});

	return res;
}

const buildRows = (values: QuestionItem[], headers: string[], results: string[][]): string[][] => {
	if (values.length > 0) {			
		const [head, ...tail] = values;
		if (head) {
			const rowData = makeRow(head.value, headers);
			results.push(rowData);
			
			return buildRows(tail, headers, results);
		} else {
			return results;
		}
	} else {
		return results;
	}
}

export const appendToSheet = async (client: JWT, spreadsheetId: string, values: Questions, house: House, year: number) => {
	const tabName = `${year.toString()}-${house.toString()}`;
	console.log(`tab name is ${tabName}`);
	const gsApi = google.sheets({version: 'v4', auth: client});
	const firstRow = await getFirstEmptyRow(client, spreadsheetId, tabName);	
	const firstRowHeader = headers();

	console.log(`adding ${values.results.length} questions to sheet at row ${firstRow}`);

	const initialRowsData = firstRow === 1 ? [firstRowHeader] : [];
	const rows = buildRows(values.results, firstRowHeader, initialRowsData);
	
	await appendRow(gsApi, spreadsheetId, tabName, firstRow, rows);
}
