import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';
import { getGoogleClient, appendToSheet } from './sheetExport';
import { getConfig } from './config';
import { getQuestions } from './questions-api-client';
import {
	concatResults,
	getS3Client,
	putObject,
	retrieveDataFromS3,
} from './s3';
import { House, QuestionsQueryStatus, Questions, Month } from './types';
import { S3Client } from '@aws-sdk/client-s3';
import moment, { Moment } from 'moment';

export const handler = async (
	event?: APIGatewayProxyEvent,
	context?: APIGatewayEventRequestContext,
	callback?: APIGatewayProxyCallback,
): Promise<string> => {
	const config = await getConfig();
	const apiFrom = moment().subtract(1, 'days').startOf('day'); // yesterday
	const apiTo = apiFrom;

	// This const is used to toggle between retrieving data from API or S3
	// We need this for when we want to re-create the sheet from the archived data
	const RETRIEVE_FROM_API = false;
	const s3Year = 2024;
	const s3Month = Month.Feb;

	const s3Client = getS3Client(config.aws.region);

	const houses = Object.keys(House);

	console.log(`from date is: `, apiFrom.format('YYYY-MM-DD'));
	console.log(`to date is: `, apiTo.format('YYYY-MM-DD'));

	for (const key of houses) {
		const house: House = House[key as keyof typeof House];
		const results = RETRIEVE_FROM_API
			? await retrieveDataFromApi(
					s3Client,
					config.aws.s3Bucket,
					house,
					apiFrom,
					apiTo,
				)
			: await retrieveDataFromS3(
					s3Client,
					config.aws.s3Bucket,
					house,
					s3Year,
					s3Month,
				);

		console.log(
			`final total results for house of ${house} are ${results.totalResults}`,
		);
		await appendToGoogleSheet(
			results,
			config.auth.credentials,
			config.sheetId,
			house,
			apiFrom,
		);
	}

	return Promise.resolve('completed');
};

const retrieveDataFromApi = async (
	client: S3Client,
	bucket: string,
	house: House,
	from: Moment,
	to: Moment,
) => {
	const questionsPublished = await getQuestions(
		from,
		to,
		house,
		QuestionsQueryStatus.Questions,
	);
	const answeredQuestionsPublished = await getQuestions(
		from,
		to,
		house,
		QuestionsQueryStatus.Answers,
	);
	const results = concatResults(questionsPublished, answeredQuestionsPublished);
	await putObject(client, bucket, results, house, from, to);
	return results;
};

const appendToGoogleSheet = async (
	results: Questions,
	credentials: string,
	sheetId: string,
	house: House,
	date: Moment,
) => {
	console.log(`results count: ${results.results.length}`);

	const year = date.year();

	const client = await getGoogleClient(credentials);
	await appendToSheet(client, sheetId, results, house, year);
};

// handler needs to get called When running locally
// handler();
