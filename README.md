# parliament-questions

Parliament-Questions is a tool designed to streamline the extraction of parliament lords/commons questions. Leveraging the [Parliament API](https://questions-statements-api.parliament.uk/), this tool facilitates data extraction, archiving, and spreadsheet integration.

### Key Features:

- Data Extraction: Retrieves questions from the Parliament API.
- Data Archiving: Uploads extracted data to an S3 bucket for archival purposes.
- Spreadsheet Integration: Appends extracted data into a designated spreadsheet for easy access and analysis.

### Usage:

This tool was initially executed manually on a local machine on March 27th, 2024. It extracted all questions asked from January 1st, 2019, until January 27th, 2024. Each question is assigned a unique identifier. Questions that have been answered prior to the extraction date contain the corresponding answer text within the extracted question record. For questions that remain unanswered, new records are generated upon their resolution. Given the potential complexity involved, it may be practical to maintain duplicate records in the sheet (one for when the question is asked and another for when it is answered).

The tool is deployed as a lambda in AWS. It runs every day and extracts questions that were asked or answered yesterday.

## Get started
1. Get Janus creds (for fetching creds from AWS Parameter Store)
2. uncomment the call to handler function in `index.ts`
3. Set the RETRIEVE_FROM_API to true if you want to retrieve data from parliament api, or to false if you want to retrieve data from archived files in S3
4. Make sure you choose the right `from` & `to` dates if you want to retrieve data from parliament api
5. Set the correct s3Year & s3Month if you want to retrieve data from the archived files in S3. s3Month is optional and restricts the S3 retrieval to the month. Without s3Month, S3 retrieval would collect data for all the year indicated through s3Year. 
6. Run the app:

```bash
nvm use
npm run start
```

### Important Note:

Given the 1,000,000 cell limit of Google Spreadsheets, it's essential to consider this limitation while the current sheet is updated with new data. When creating a new sheet, ensure to grant edit access to the email address associated with the Google service account created for app-level authentication ([Service account credentials](https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#service-account-credentials)).
