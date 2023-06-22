import boto3
import sys
import json
import datetime
import budget_tracker_common as common

ddb = boto3.client("dynamodb")

REQUIRED_FIELDS = ("id", "date", "account", "description", "amount")

"""
Transaction model
- id
- date
- month
- account
- category
- checked
- description
- amount

"""


def bulk_add_ddb(transactions):
    """
    Add multiple transactions at once
    """
    success = 0
    failure = 0

    for t in transactions:
        if add_transaction_ddb(t):
            success += 1
        else:
            failure += 1

    print("Transactions added: {} success, {} failure".format(success, failure))


def add_transaction_ddb(transaction):
    """
    Return True if transaction is added to table

    Transaction must have all REQUIRED_FIELDS
    """
    for rf in REQUIRED_FIELDS:
        if rf not in transaction:
            print("Add failed: transaction does not have field {}".format(rf))
            return False
    
    if "month" not in transaction:
        d = datetime.date.fromisoformat(transaction["date"])
        transaction["month"] = d.strftime("%b") + " " + d.strftime("%y")
    if "category" not in transaction:
        transaction["category"] = "None"
    if "checked" not in transaction:
        transaction["checked"] = False

    ite = common.transaction_to_ddb_item(transaction)
    
    try:
        res = ddb.put_item(TableName=common.TABLE_NAME,
                           Item=ite,
                           ConditionExpression="attribute_not_exists(id)")
    except ddb.exceptions.ConditionalCheckFailedException as e:
        print("Add failed: id already exists {}".format(transaction["id"]))
        return False

    return True


def lambda_handler(event, context):
    """
    Can receive trigger from API gateway or SNS topic. Input is json list of transactions to add
    - API POST request: parse event['body']
    - SNS topic: parse event['Records'][i]['Sns']['Message']
    """
    if "body" in event:
        transactions = json.loads(event["body"])
    elif "Records" in event:
        transactions = []
        for msg in event["Records"]:
            transactions.extend(json.loads(msg["Sns"]["Message"]))
    else:
        print("ERROR: unknown trigger event format")
        print(event)

    bulk_add_ddb(transactions)
   

# Running locally assumes arg1 is path to json with list of transactions
if __name__ == "__main__":
    print("Adding transactions at {}".format(sys.argv[1]))

    with open(sys.argv[1], "r") as fptr:
        transactions = json.load(fptr)

    bulk_add_ddb(transactions)

