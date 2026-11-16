import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JWT } from 'google-auth-library';
import { getGoogleClient } from './sheetExport';
import { House, Questions } from './types';

const credentials = {
	type: 'service_account',
	project_id: 'test-project',
	private_key_id: 'test-key-id',
	private_key: 'test-key',
	client_email: 'test@example.com',
	client_id: 'test-client',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://example.com/cert',
	universe_domain: 'googleapis.com',
};

test('Google authentication preserves service account options', async (t) => {
	const authorize = t.mock.method(JWT.prototype, 'authorize', async () => ({}));
	const client = await getGoogleClient(JSON.stringify(credentials));

	assert.equal(client.email, credentials.client_email);
	assert.equal(client.key, credentials.private_key);
	assert.deepEqual(client.scopes, [
		'https://www.googleapis.com/auth/spreadsheets',
	]);
	assert.equal(authorize.mock.callCount(), 1);
});

test('Google authentication propagates authorization failures', async (t) => {
	const error = new Error('Authorization failed');
	t.mock.method(JWT.prototype, 'authorize', async () => {
		throw error;
	});

	await assert.rejects(getGoogleClient(JSON.stringify(credentials)), error);
});

test('question schemas preserve enum, nullable, and optional fields', () => {
	for (const house of Object.values(House)) {
		const value = {
			id: 1,
			askingMemberId: 2,
			house,
			memberHasInterest: false,
			dateTabled: '2026-11-15',
			dateForAnswer: '2026-11-16',
			answeringBodyId: 3,
			isWithdrawn: false,
			isNamedDay: false,
			attachmentCount: 0,
			answerText: null,
		};
		const questions = {
			totalResults: 1,
			results: [{ value, links: [] }],
		};

		assert.deepEqual(Questions.parse(questions), questions);
		assert.equal(
			Questions.safeParse({
				...questions,
				results: [{ value: { ...value, house: 'Invalid' }, links: [] }],
			}).success,
			false,
		);
	}
});
