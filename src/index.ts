import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';
import { Questions } from './types';
import { exportSheet } from './sheetExport';
import { getConfig } from './config';

export const handler = async (
	event?: APIGatewayProxyEvent,
	context?: APIGatewayEventRequestContext,
	callback?: APIGatewayProxyCallback,
): Promise<string> => {
	const message = 'Hello World!';
	console.log(message);

	const config = await getConfig();

	const url =
		'https://questions-statements-api.parliament.uk/api/writtenquestions/questions?tabledWhenFrom=2023-01-01';

	// const request = new Request(url);

	// const response = await fetch(request);

	// const body = Questions.safeParse(await response.json());
	// if (body.success) {
	// 	console.log(body.data);
	// } else {
	// 	console.log(body.error.message);
	// }

	//console.log(result);

	await exportSheet(config.auth.credentials, config.sheetId);

	return Promise.resolve(message);
};

handler();
