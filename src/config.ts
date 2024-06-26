import { Parameter, SSM } from '@aws-sdk/client-ssm';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { findParameter, getParameters } from './configHelper';

export interface ParliamentQuestionConfig {
	auth: { credentials: string };
	app: {
		stage: string;
	};
	aws: {
		region: string;
		s3Bucket: string;
	};
	sheetId: string;
}

const credentialProvider = (onAws: boolean) =>
	onAws ? undefined : defaultProvider({ profile: 'investigations' });

export const getConfig = async (): Promise<ParliamentQuestionConfig> => {
	const region = 'eu-west-1';
	const stage = process.env['STAGE'] || 'DEV';
	const ssm = new SSM({
		region,
		credentials: credentialProvider(stage !== 'DEV'),
	});

	const paramPath = `/${stage}/investigations/parliament-questions/`;

	const parameters = await getParameters(paramPath, ssm);
	const parameterNames = parameters.map((param: Parameter) => {
		return param.Name;
	});

	console.log(`Parameters fetched: ${parameterNames.join(', ')}`);
	console.log('************');

	const credentials = findParameter(
		parameters,
		paramPath,
		'google/service-account-credentials',
	);

	const sheetId = findParameter(parameters, paramPath, 'google/sheet-id');

	const s3Bucket = findParameter(parameters, paramPath, 'aws/s3-bucket');

	return {
		auth: { credentials: credentials },
		app: {
			stage,
		},
		aws: {
			region,
			s3Bucket,
		},
		sheetId,
	};
};
