import {
	APIGatewayProxyEvent,
	APIGatewayEventRequestContext,
	APIGatewayProxyCallback,
} from 'aws-lambda';

export const handler = (
	event: APIGatewayProxyEvent,
	context: APIGatewayEventRequestContext,
	callback: APIGatewayProxyCallback,
): Promise<string> => {
	const message = 'Hello World!';
	console.log(message);
	return Promise.resolve(message);
};
