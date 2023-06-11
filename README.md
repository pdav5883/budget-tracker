# budget-tracker
- Strip down quickstart frontend to take user to link page and then show access_token after successful login.
- Store access_token in AWS, which lambda can look at to build transaction query
- Store transactions in S3

## Data Model
- id 
- date
- month
- account
- category
- checked
- description
- amount

PK: ID
GSI: PK: month, SK: category

Query: ID
Query: all of category X in month Y
Query: all in month Y
Scan: all checked=False
Scan: all in date range Z
Scan: all in account
Scan: description contains


## Edits
- Add transaction
- Delete transaction
- Change description
- Change month
- Change category
- Split transaction into multiple

## Workflow
- Lambda pulls transactions
- Attempts to categorize based on rules, otherwise sets category to "None", always checked=False, sets month based on date
- Writes new transactions into DB
