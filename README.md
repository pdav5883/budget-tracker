# budget-tracker

## TODO
- Beautify frontend
	- Button colors
	- Modify viz for budget shown (x of y spent), (X % through budget, Y% through month)
- Change login flow
	- Straight to login if no token
	- Auto refresh and retry if expired idtoken
- Test account for login to dummy table
- Update sync_transactions to ingest Chase CSVs locally
	- use uuid.uuid5(uuid.NAMESPACE_X500, concat(row vals)) for unique id
	- don't worry about double row split across pulls, just take care of double rown in same pull
	- Update sync_transactions rules for category assignment
- Allow sync_transactions from text/email
- Usability Changes
	- Update edit transactions to edit multiple entries with single put request
	- Add new filter option for date
	- Add new filter option for just month
- Write up how to get plaid token info
- Implement checked field in transaction, or remove


## Data Model
Transactions and Target Values are stored in the same table
### Transaction
- id 
- date
- month
- account
- category
- checked
- description
- amount

### Target Value
- id (target_{month}_{category} format)
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

## plaid
- Strip down plaid quickstart frontend to take user to link page and then show access_token after successful login.
- plaid uses cursor string (stored in SSM for implementation) to determine sync transactions. To start fresh, plaid assumes cursor is "", but that can't be stored in SSM so included logic on lambda side to store null in SSM and convert to "" in function

## AWS Backend
- Table is stored in DynamoDB budget-tracker-transactions
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

## Plaid Layer
- Ran into several issues getting plaid importing via lambda layer
- From lambdas create layer dir structure with: mkdir -p plaid-layer/python/lib/python3.8/site-packages
- Create a venv, activate(make sure version matches python3.X above
- pip install plaid_python -t plaid-layer/python/lib/python3.8/site-packages
- cd into site-packages and delete all dirs/files except: nulltype, plaid, plaid_python
	- The reason to do this is that lambda python runtime already has installed packages that conflict with what pip will install from latest. urllib causes issues with ssl and ciphers.
- cd plaid-layer
- zip -r plaid-layer.zip *
- Upload to lambda layer (v3)

