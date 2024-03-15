import { Parameter, SSM } from '@aws-sdk/client-ssm';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { findParameter, getParameters } from './configHelper';

export interface LordProjectConfig {
	auth: { credentials: string };
	app: {
		stage: string;
	};
	aws: {
		region: string;
	};
	sheetId: string;
}

const credentialProvider = (onAws: boolean) =>
	onAws ? undefined : defaultProvider({ profile: 'investigations' });

export const getConfig = async (): Promise<LordProjectConfig> => {
	const region = 'eu-west-1';
	const stage = 'DEV'; //await getEnvVarOrMetadata('STAGE', 'tags/instance/Stage');
	const ssm = new SSM({
		region,
		credentials: credentialProvider(stage !== 'DEV'),
	});

	const paramPath = `/${stage}/investigations/lords/`;

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

	return {
		auth: { credentials: credentials },
		app: {
			stage,
		},
		aws: {
			region,
		},
		sheetId
	};
};
