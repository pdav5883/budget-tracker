# budget-tracker
- Strip down quickstart frontend to take user to link page and then show access_token after successful login.
- Store access_token in AWS, which lambda can look at do plaid sync
- Store transactions in DynamoDB

## TODO
- Function in sync_transactions to pull Amex from plaid
- Deploy sync_transactions to BudgetSyncTransactions
- Create CloudWatch event to run BudgetSyncTransactions for Amex on schedule
- Update sync_transactions to ingest Chase CSVs locally
- Update sync_transactions rules for category assignment
- Store budget value in DB
- Frontend
	- landing page shows X month spending vs budget for category (default to current month, groceries)
	- history page with past X  months spending vs budget for category (default 6 months, groceries)
	- click into budget, see all transactions in category, month combo
	- see all transactions by
		- month 
		- category
		- date range
- Update edit transactions to edit multiple entries with single put request
- Change transaction category to select from text input

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

## AWS Backend
- API gateway budget-tracker
	- add (POST) (BudgetAddTransaction lambda)
	- query (GET) (BudgetQueryTransactions lambda)
	- edit (PUT) (BudgetEditTransaction lambda)
	- delete (DELETE) (BudgetDeleteTransaction lambda)
- API implementation:
	- User pool in AWS Cognito is Authorizer to API Gateway {budget-tracker}/{stage}/{add/query/edit/delete}
	- User logs in to Cognito via SDK, gets tokens, sends idtoken with API request
	- API gateway authenticates user, if successful sends on to lambda
	- All API resources use lambda proxy integration
		- For CORS, enable CORS for API resource OPTIONS, then add CORS origin header to lambda response
		- Add gateway response headers for 4XX and 5XX by adding method under Gateway Response
		- TODO: add authorization for OPTIONS method
- Sync implementation
	- BudgetSyncPlaid lambda runs on schedule with CloudWatch event (can also run locally with json file)
	- Publishes to budget-tracker-add-topic (max 10 transactions at a time)
	- Triggers BudgetAddTransaction lambda
	- Adds transactions to DynamoDB budget-tracker-transactions table
