import { z } from 'zod';

export const SignedUrlResponseBody = z.object({
	presignedS3Url: z.string(),
});

export enum House {
	// Bicameral = 'Bicameral',
	Commons = 'Commons',
	Lords = 'Lords',
}

export enum QuestionsQueryStatus {
	Questions = 'Questions',
	Answers = 'Answers',
}

const Member = z.object({
	id: z.number(),
	name: z.string().nullish(),
	party: z.string().nullish(),
	partyColour: z.string().nullish(),
	partyAbbreviation: z.string().nullish(),
	memberFrom: z.string().nullish(),
	thumbnailUrl: z.string().nullish(),
});

export const QuestionValue = z.object({
	id: z.number(),
	askingMemberId: z.number(),
	askingMember: Member.nullish(),
	house: z.nativeEnum(House),
	memberHasInterest: z.boolean(),
	dateTabled: z.string(),
	dateForAnswer: z.string(),
	uin: z.string().nullish(),
	questionText: z.string().nullish(),
	answeringBodyId: z.number(),
	answeringBodyName: z.string().nullish(),
	dateAnswered: z.string().nullish(),
	answerText: z.string().nullish(),
	isWithdrawn: z.boolean(),
	isNamedDay: z.boolean(),
	groupedQuestions: z.array(z.string()).nullish(),
	answerIsHolding: z.boolean().nullish(),
	answerIsCorrection: z.boolean().nullish(),
	answeringMemberId: z.number().nullish(),
	answeringMember: Member.nullish(),
	correctingMemberId: z.number().nullish(),
	correctingMember: Member.nullish(),
	originalAnswerText: z.string().nullish(),
	comparableAnswerText: z.string().nullish(),
	dateAnswerCorrected: z.string().nullish(),
	dateHoldingAnswer: z.string().nullish(),
	attachmentCount: z.number(),
	heading: z.string().nullish(),
	// attachments: [],
	// groupedQuestionsDates: []
});

export const headers = [
	'id',
	'askingMemberId',
	'askingMember',
	'askingMemberParty',
	'house',
	'memberHasInterest',
	'dateTabled',
	'dateForAnswer',
	'uin',
	'questionText',
	'answeringBodyId',
	'answeringBodyName',
	'dateAnswered',
	'answerText',
	'isWithdrawn',
	'isNamedDay',
	'groupedQuestions',
	'answerIsHolding',
	'answerIsCorrection',
	'answeringMemberId',
	'answeringMember',
	'answeringMemberParty',
	'correctingMemberId',
	'correctingMember',
	'originalAnswerText',
	'comparableAnswerText',
	'dateAnswerCorrected',
	'dateHoldingAnswer',
	'attachmentCount',
	'heading',
];

const Link = z.object({
	rel: z.string().nullish(),
	href: z.string().nullish(),
	method: z.string().nullish(),
});

export type QuestionValue = z.infer<typeof QuestionValue>;

const QuestionItem = z.object({
	value: QuestionValue,
	links: z.array(Link),
});
export type QuestionItem = z.infer<typeof QuestionItem>;

export const Questions = z.object({
	totalResults: z.number(),
	results: z.array(QuestionItem),
});
export type Questions = z.infer<typeof Questions>;

export const ZTokenResponse = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	hd: z.string(),
	prompt: z.string(),
	token_type: z.string(),
	scope: z.string(),
	state: z.optional(z.string()),
	error: z.optional(z.string()),
	error_description: z.optional(z.string()),
	error_uri: z.optional(z.string()),
});

export type ZTokenResponse = z.infer<typeof ZTokenResponse>;

export const ExportRequest = z.object({
	id: z.string(),
	oAuthTokenResponse: ZTokenResponse,
});

export type ExportRequest = z.infer<typeof ExportRequest>;

export const GoogleCredential = z.object({
	type: z.string(),
	project_id: z.string(),
	private_key_id: z.string(),
	private_key: z.string(),
	client_email: z.string(),
	client_id: z.string(),
	auth_uri: z.string(),
	token_uri: z.string(),
	auth_provider_x509_cert_url: z.string(),
	client_x509_cert_url: z.string(),
	universe_domain: z.string(),
});

export type GoogleCredential = z.infer<typeof GoogleCredential>;

export enum Month {
	Jan = 'January',
	Feb = 'February',
	Mar = 'March',
	Apr = 'April',
	May = 'May',
	Jun = 'June',
	Jul = 'July',
	Aug = 'August',
	Sep = 'September',
	Oct = 'October',
	Nov = 'November',
	Dec = 'December',
}
