import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { ParliamentQuestions, LoggingLevel } from '../lib/parliament-questions';

const app = new GuRoot();
new ParliamentQuestions(
	app,
	'parliament-questions-CODE',
	{
		stack: 'investigations',
		stage: 'CODE',
		env: { region: 'eu-west-1' },
	},
	LoggingLevel.DEBUG,
);
