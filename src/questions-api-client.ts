import { Moment } from "moment";
import { House, QuestionsQueryStatus, Questions } from "./types";

const getQueryParams = (from: Moment, to: Moment, skip: number, house: House, questionStatus: QuestionsQueryStatus) => {
    const take = '50';
    const fromStr = from.format('YYYY-MM-DD');
    const toStr = to.format('YYYY-MM-DD');
    const queryParams = questionStatus === QuestionsQueryStatus.Questions ?
            new URLSearchParams({
                tabledWhenFrom: fromStr,
                tabledWhenTo: toStr,
                take,
                skip: skip.toString(),
                house,
                expandMember: 'true'
            }) : 
            new URLSearchParams({
                answeredWhenFrom: fromStr,
                answeredWhenTo: toStr,
                take,
                skip: skip.toString(),
                house,
                expandMember: 'true'
            });

    return queryParams;
}

export const getQuestions = async (from: Moment, to: Moment, house: House, questionStatus: QuestionsQueryStatus, results: Questions | undefined = undefined): Promise<Questions> => {
    const url =
    `https://questions-statements-api.parliament.uk/api/writtenquestions/questions?`;

    const skip = results?.results.length || 0;
    const queryParams = getQueryParams(from, to, skip, house, questionStatus);
    console.log('query params: ');
    console.log(queryParams);

    const request = new Request(url + queryParams.toString());

    console.log(`retrieving data from ${from} to ${to}`);
    console.log(request.url);
    const response = await fetch(request);
    console.log(`fetch completed`);
    const body = Questions.safeParse(await response.json());
    if (body.success) {
        const data = body.data;
        console.log(`data retrieved with ${data.results.length} questions`);
        const newResults = getResults(results, data);
        
        console.log(`results so far: ${newResults.results.length}`);
        if (newResults.results.length >= newResults.totalResults) {
            return newResults;
        }
        return getQuestions(from, to, house, questionStatus, newResults);
    } else {
        throw new Error(`failed in fetching questions ${body.error.message}`);        
    }
}


export const getResults = (results: Questions | undefined, newResults: Questions): Questions => {
    if (results) {
        const concatResults = results.results.concat(newResults.results);

        if (results.totalResults !== newResults.totalResults) {
            throw new Error(`total results don't match in subsequent api calls`);
        }

        return {
            totalResults: results.totalResults,
            results: concatResults
        }
    } else {
        return newResults;
    }
}