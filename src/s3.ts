import {
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { House, Month, Questions } from './types';
import moment, { Moment } from 'moment';
import fs from 'fs';

export const getS3Client = (region: string) => {
	return new S3Client({
		region,
	});
};

// TODO: this function currently accepts a date and extracts
// all the S3 data that falls under the year/month of the given date
// But we need to make sure the data under that month is not too many,
// otherwise, we should split the data. Because otherwise we would
// face stack overflow exception in sheetExport/buildRows due to the recursion
export const retrieveDataFromS3 = async (
	client: S3Client,
	bucket: string,
	folder: House,
	year: number,
	month: Month | undefined = undefined,
): Promise<Questions> => {
	const command = new ListObjectsV2Command({
		Bucket: bucket,
		Prefix: month
			? `${folder}/${year.toString()}/${month}`
			: `${folder}/${year.toString()}`,
	});

	const allS3Keys = await listAllObjects(client, command, []);
	console.log(
		`downloading S3 keys for prefix ${folder}/${year.toString()}/${month} *********`,
	);

	const allS3Objects = await allS3Keys.map(
		async (key) => await getObject(client, bucket, key),
	);

	const [head, ...results] = await Promise.all(allS3Objects);

	if (head) {
		const questions = results.reduce((accumulator, currentValue) => {
			return concatResults(accumulator, currentValue);
		}, head);
		return questions;
	} else {
		throw new Error('No object retrieved from S3 bucket, is bucket empty?');
	}
};

export const concatResults = (
	results: Questions,
	newResults: Questions,
): Questions => {
	const concatResults = results.results.concat(newResults.results);

	return {
		totalResults: results.totalResults + newResults.totalResults,
		results: concatResults,
	};
};

const getObject = async (client: S3Client, bucket: string, key: string) => {
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	try {
		const data = await client.send(command);
		const body = await data.Body?.transformToString();
		if (body) {
			return Questions.parse(JSON.parse(body));
		} else {
			throw new Error(`S3 result for key ${key} was undefined`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : '';
		console.error(
			`Failed to get object ${key} from S3 bucket - ${errorMessage}`,
		);
		throw error;
	}
};

const listAllObjects = async (
	client: S3Client,
	command: ListObjectsV2Command,
	contents: string[],
): Promise<string[]> => {
	try {
		const { Contents, IsTruncated, NextContinuationToken } =
			await client.send(command);
		if (Contents) {
			const contentsList: string[] = Contents.map((c) => {
				const key = c.Key;
				if (key) {
					return key;
				} else {
					throw new Error(
						`retrieved key from ${command.input.Bucket} has no value`,
					);
				}
			});
			const newContents = contents.concat(contentsList);
			if (IsTruncated) {
				command.input.ContinuationToken = NextContinuationToken;
				return listAllObjects(client, command, newContents);
			} else {
				return newContents;
			}
		} else {
			return [];
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : '';
		console.error(`Failed to list all objects in S3 bucket - ${errorMessage}`);
		throw error;
	}
};

export const putObject = async (
	client: S3Client,
	bucket: string,
	questions: Questions,
	house: House,
	from: Moment,
	to: Moment,
) => {
	const json = JSON.stringify(questions, null, 2);
	const fileName = `${house.toString()}/${from.year()}/${from.format('MMMM')}/${from.format('YYYY-MM-DD')}_${to.format('YYYY-MM-DD')}.json`;
	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: fileName,
		Body: json,
	});

	try {
		await client.send(command);
		console.log(
			`Successfully stored questions json file ${fileName} in S3 bucket ${bucket}`,
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : '';
		console.log(
			`Failed to store questions file ${fileName} in S3 bucket ${bucket} - ${errorMessage}`,
		);
		throw error;
	}
};

export const writeQuestionsToFile = (
	questions: Questions,
	from: Date,
	to: Date,
) => {
	try {
		const json = JSON.stringify(questions, null, 2);
		const fileName = `src/output/${moment(from).format('YYYY-MM-DD')}_${moment(to).format('YYYY-MM-DD')}.json`;
		console.log(`writing to file ${fileName}`);
		fs.writeFileSync(fileName, json);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : '';
		console.log(`Failed to write the questions json into file ${errorMessage}`);
		throw error;
	}
};
