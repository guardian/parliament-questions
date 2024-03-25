import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';
import { getGoogleClient, appendToSheet } from './sheetExport';
import { getConfig } from './config';
import { getQuestions } from "./questions-api-client";
import { getS3Client, putObject, retrieveDataFromS3 } from './S3';
import { House, Questions } from './types';
import { S3Client } from '@aws-sdk/client-s3';

export const handler = async (
	event?: APIGatewayProxyEvent,
	context?: APIGatewayEventRequestContext,
	callback?: APIGatewayProxyCallback,
): Promise<string> => {
	const config = await getConfig();
	const from = new Date(2024, 2, 19);
	const to = new Date(2024, 2, 19);
	const RETRIEVE_FROM_API = false;
	const s3Client = getS3Client(config.aws.region);

	const houses = Object.keys(House);

	houses.forEach(async (key, index) => {
		const house: House = House[key as keyof typeof House];
		const results = RETRIEVE_FROM_API ? 
			await retrieveDataFromApi(s3Client, config.aws.s3Bucket, house, from, to) : 
			await retrieveDataFromS3(s3Client, config.aws.s3Bucket, house);		
		
		console.log(`final total results for house of ${house} are ${results.totalResults}`);
		await appendToGoogleSheet(results, config.auth.credentials, config.sheetId, house);
	});

	
	return Promise.resolve('completed');
};

const retrieveDataFromApi = async (client: S3Client, bucket: string, house: House, from: Date, to: Date) => {
	const results = await getQuestions(from, to, house);
	await putObject(client, bucket, results, house, from, to);
	return results;
}

const appendToGoogleSheet = async (results: Questions, credentials: string, sheetId: string, house: House) => {
	console.log(`results count: ${results.results.length}`);
	
	const client = await getGoogleClient(credentials);
	await appendToSheet(client, sheetId, results, house);	
}

handler();
