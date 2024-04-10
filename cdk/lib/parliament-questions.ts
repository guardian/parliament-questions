import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { GuardianAwsAccounts } from '@guardian/private-infrastructure-config';
import { Duration } from 'aws-cdk-lib';
import type { App } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

const APP_NAME = 'parliament-questions';

export enum LoggingLevel {
	SILLY,
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
}

export class ParliamentQuestions extends GuStack {
	constructor(
		scope: App,
		id: string,
		props: GuStackProps,
		loggingLevel: number = LoggingLevel.WARN,
	) {
		super(scope, id, props);

		const ssmPrefix = `arn:aws:ssm:${props.env?.region}:${GuardianAwsAccounts.Investigations}:parameter`;
		const ssmPath = `${this.stage}/${this.stack}/${APP_NAME}`;

		const dataBucket = new GuS3Bucket(
			this,
			'ParliamentWrittenQuestionsBucket',
			{
				app: APP_NAME,
				bucketName: `parliament-written-questions-${this.stage.toLowerCase()}`,
			},
		);

		// we only want one dev bucket so only create on CODE
		if (props.stage === 'CODE') {
			new GuS3Bucket(this, 'ParliamentWrittenQuestionsBucketDev', {
				app: APP_NAME,
				bucketName: `parliament-written-questions-dev`,
			});
		}

		const lambda = new GuScheduledLambda(this, APP_NAME, {
			app: APP_NAME,
			runtime: Runtime.NODEJS_20_X,
			fileName: `${APP_NAME}.zip`,
			timeout: Duration.millis(45000),
			environment: {
				Bucket: `${APP_NAME}-dist`,
				Stage: this.stage,
				LoggingLevel: loggingLevel.toString(),
			},
			handler: 'dist/lambda/index.handler',
			rules: [
				{
					schedule: Schedule.cron({ hour: '10', minute: '00' }),
				},
			],
			monitoringConfiguration: {
				noMonitoring: true,
			},
		});

		const getParametersPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['ssm:GetParameter', 'ssm:GetParametersByPath'],
			resources: [`${ssmPrefix}/${ssmPath}/*`],
		});

		lambda.addToRolePolicy(getParametersPolicy);

		lambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:PutObject'],
				resources: [`${dataBucket.bucketArn}/*`],
			}),
		);

		lambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:ListBucket'],
				resources: [`${dataBucket.bucketArn}`],
			}),
		);
	}
}
