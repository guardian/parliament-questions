import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';
import { Questions } from './types';
import { getGoogleClient, appendToSheet } from './sheetExport';
import { getConfig } from './config';
import { getQuestions } from "./questions-api-client";

export const handler = async (
	event?: APIGatewayProxyEvent,
	context?: APIGatewayEventRequestContext,
	callback?: APIGatewayProxyCallback,
): Promise<string> => {
	const message = 'Hello World!';
	console.log(message);

	const config = await getConfig();

	const results = await getQuestions(new Date(2024, 2, 14), new Date());

	console.log(`results count: ${results.results.length}`);

	const client = await getGoogleClient(config.auth.credentials);
	await appendToSheet(client, config.sheetId, results);

	return Promise.resolve(message);
};

handler();
