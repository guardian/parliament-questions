import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { LordProject, LoggingLevel } from '../lib/lord-project';

const app = new GuRoot();
new LordProject(
	app,
	'lord-project-CODE',
	{
		stack: 'investigations',
		stage: 'CODE',
		env: { region: 'eu-west-1' },
	},
	LoggingLevel.DEBUG,
);
