import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ParliamentQuestions } from './parliament-questions';

describe('The ParliamentQuestions stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new ParliamentQuestions(app, 'ParliamentQuestions', {
			stack: 'investigations',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
