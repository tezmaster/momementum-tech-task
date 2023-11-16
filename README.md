# Momementum Tech Task

An important data point for many of the companies we work with is are they currently using a competitor.

One of the companies more specifically wants to know is a company using Drift live chat or Salesforce Live Agent chat.

In the project you'll find a `data` folder which contains homepages of various companies, some use Drift, some use Salesforce Live Agent some have not chat.

There is a draft endpoint here `/chat/find`, please complete the endpoint to return an array of all the companies with a field specifying which chat they are using.

Be aware that depending on how the website has installed Drift or Salesforce Live Agent the details you're looking for could be different.

Feel free to add any packages you need to the project.

# Completed Task

## Known Issues

1. **Company Name Extraction**: The code that scrapes URLs to extract company names may have issues with subdomains and multiple domain endings (e.g., strathcona.vic.edu.au). It may not perfectly extract the name in such cases. It's recommended to update the code responsible for scraping URLs to either remove the subdomain if possible or append/prepend the company name differently.

2. **Handling Redirects**: There is one file with a redirect, and the scraper may not follow the redirect. This could be due to limitations in the usage of Puppeteer. Further investigation or modifications to the code may be needed to handle such cases.

## Getting Started

To run the application, follow these steps:

1. Run `yarn scrape` to process the files. This step extracts chat system data from the company homepages.

2. Once the scraping is complete, run `yarn dev` to start the API.

## Available Endpoints

The API provides the following endpoints:

### 1. `/chat/find`

- **Method**: POST
- **Description**: Returns an array of companies with chat system data.
- **Query Parameters**:
  - `companyName` (optional): Filter by the company name.
  - `hasDrift` (optional): Filter by companies using Drift.
  - `hasSalesForce` (optional): Filter by companies using Salesforce Live Agent.

### 2. `/chat/drift`

- **Method**: POST
- **Description**: Returns an array of companies using Drift as their chat system.

### 3. `/chat/salesForce`

- **Method**: POST
- **Description**: Returns an array of companies using Salesforce Live Agent as their chat system.
