import moment from "moment";
import { House, Questions } from "./types";

export const getQuestions = async (from: Date, to: Date, house: House, results: Questions | undefined = undefined): Promise<Questions> => {
    const take = '10';
    const fromStr = moment(from).format('YYYY-MM-DD');
    const toStr = moment(to).format('YYYY-MM-DD');

    const url =
    `https://questions-statements-api.parliament.uk/api/writtenquestions/questions?`;


    const queryParams = new URLSearchParams({
        tabledWhenFrom: fromStr,
        tabledWhenTo: toStr,
        take,
        skip: results?.results.length.toString() || '0',
        house,
        expandMember: 'true'
    });

    const request = new Request(url + queryParams.toString());

    console.log(`retrieving data from ${fromStr} to ${toStr}`);
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
        return getQuestions(from, to, house, newResults);
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