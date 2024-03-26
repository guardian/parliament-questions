import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';
import { getGoogleClient, appendToSheet } from './sheetExport';
import { getConfig } from './config';
import { getQuestions } from "./questions-api-client";
import { concatResults, getS3Client, putObject, retrieveDataFromS3 } from './s3';
import { House, QuestionsQueryStatus, Questions } from './types';
import { S3Client } from '@aws-sdk/client-s3';
import moment, { Moment } from 'moment';

export const handler = async (
	event?: APIGatewayProxyEvent,
	context?: APIGatewayEventRequestContext,
	callback?: APIGatewayProxyCallback,
): Promise<string> => {
	const config = await getConfig();
	// const from = moment(new Date(2024, 2, 19));
	// const to = moment(new Date(2024, 2, 19));
	const from = moment().subtract(1, 'days').startOf('day'); // yesterday
	const to = from;
	console.log(`date is: `, from.format('YYYY-MM-DD'));
	const RETRIEVE_FROM_API = true;
	const s3Client = getS3Client(config.aws.region);

	const houses = Object.keys(House);

	for (const key of houses) {
		const house: House = House[key as keyof typeof House];
		const results = RETRIEVE_FROM_API ? 
			await retrieveDataFromApi(s3Client, config.aws.s3Bucket, house, from, to) : 
			await retrieveDataFromS3(s3Client, config.aws.s3Bucket, house);		
		
		console.log(`final total results for house of ${house} are ${results.totalResults}`);
		await appendToGoogleSheet(results, config.auth.credentials, config.sheetId, house, from);
	}
	
	return Promise.resolve('completed');
};

const retrieveDataFromApi = async (client: S3Client, bucket: string, house: House, from: Moment, to: Moment) => {
	const questionsPublished = await getQuestions(from, to, house, QuestionsQueryStatus.Questions);
	const answeredQuestionsPublished = await getQuestions(from, to, house, QuestionsQueryStatus.Answers);
	const results = concatResults(questionsPublished, answeredQuestionsPublished);
	await putObject(client, bucket, results, house, from, to);
	return results;
}

const appendToGoogleSheet = async (results: Questions, credentials: string, sheetId: string, house: House, date: Moment) => {
	console.log(`results count: ${results.results.length}`);

	const year = date.year();
	
	const client = await getGoogleClient(credentials);
	await appendToSheet(client, sheetId, results, house, year);	
}