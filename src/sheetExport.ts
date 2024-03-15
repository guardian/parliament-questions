import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleCredential } from './types';

export const exportSheet = async (credentials: string, spreadsheetId: string) => {
	const creds = GoogleCredential.parse(JSON.parse(credentials));
	
	const client: JWT = new google.auth.JWT(
		creds.client_email,
		undefined,
		creds.private_key,
		['https://www.googleapis.com/auth/spreadsheets'],
	);
	client.authorize((err, token) => {
		if (err) {
			console.log('failed to connect', err);
		}

		console.log('connected');
		gsrun(client);
	});

	const gsrun = async (cl: JWT) => {
		const gsApi = google.sheets({version: 'v4', auth: cl});
		const opt = {
			spreadsheetId,
			range: 'Data!A1:B3'
		};

		const result = await gsApi.spreadsheets.values.get(opt);
		const values = result.data.values;
		if (values) {
			values.map(a => {
				a.push(`${a[0]}-${a[1]}`);
				return a;
			});

			const putOpt = {
				spreadsheetId,
				range: 'Data!E2',
				valueInputOption: 'USER_ENTERED',
				resource: { values }
			};
	
			gsApi.spreadsheets.values.update(putOpt);
		}
		console.log(values);
	}

	console.log('This is test: ');
};
