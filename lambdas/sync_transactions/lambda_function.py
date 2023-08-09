import boto3
import sys
import json
import datetime

import plaid
from plaid.api import plaid_api
from plaid.model.transactions_sync_request import TransactionsSyncRequest

sns = boto3.client("sns")
ssm =  boto3.client("ssm")
add_topic_arn = "arn:aws:sns:us-east-1:014374244911:budget-tracker-add-topic"
delete_topic_arn = "arn:aws:sns:us-east-1:014374244911:budget-tracker-delete-topic"
MAX_PER_SNS = 10

"""
Transaction model
- id (req)
- date (req)
- month
- account (req)
- category
- checked
- description (req)
- amount (req)

"""


def sync_amex(raw_add_transactions, raw_delete_transactions=list()):
    """
    List of amex plaid dicts, build SNS message
    """
    add_transactions = []

    for rt in raw_add_transactions:
        t = {"id": rt["transaction_id"],
                "date": rt["authorized_date"].strftime("%Y-%m-%d"),
                "account": "Amex 1008",
                "checked": False,
                "description": rt["name"],
                "amount": rt["amount"]}

        t["category"] = guess_category(t)

        add_transactions.append(t)

    delete_transactions = [{"id": rt["transaction_id"]} for rt in raw_delete_transactions]
    
    publish_sns(add_transactions, delete_transactions)


def guess_category(transaction):
    if transaction["description"].startswith("Harris") or \
    transaction["description"].startswith("Whole") or \
    transaction["description"].startswith("Trader"):
        return "Groceries"
    else:
        return "None"


def publish_sns(add_transactions, delete_transactions):
    """
    Only publish MAX_PER_SNS at a time
    """
    print("Publishing SNS to add {} transactions with id:".format(len(add_transactions)))
    add_blocks = create_sns_blocks(add_transactions)
    
    # need to do this for lambda logging -- if you try to write them all on one line its too much
    for ab in add_blocks:
        print([t["id"] for t in ab])

    print("Publishing SNS to delete {} transactions with id:".format(len(delete_transactions)))
    delete_blocks = create_sns_blocks(delete_transactions)
    for db in delete_blocks:
        print([t["id"] for t in db])
    

    for add_block in add_blocks:
        sns.publish(TopicArn=add_topic_arn, Message=json.dumps(add_block))
    
    for delete_block in delete_blocks:
        sns.publish(TopicArn=delete_topic_arn, Message=json.dumps(delete_block))


def create_sns_blocks(transactions):
    blocks = []
    block = []
    for t in transactions:
        block.append(t)

        if len(block) >= MAX_PER_SNS:
            blocks.append(block)
            block = []

    if len(block):
        blocks.append(block)

    return blocks


def get_plaid_amex():
    """
    Use the Plaid API with parameters stored in AWS SSM
    """
    plaid_client_id = ssm.get_parameter(Name="plaid-client-id")["Parameter"]["Value"]
    plaid_secret = ssm.get_parameter(Name="plaid-secret-dev")["Parameter"]["Value"]
    plaid_access = ssm.get_parameter(Name="plaid-access-token-amex-dev")["Parameter"]["Value"]
    next_cursor = ssm.get_parameter(Name="plaid-next-cursor-amex-dev")["Parameter"]["Value"]

    # necessary because SSM does not allow empty string as value, but plaid assumes that
    # empty string is the initial cursor for account
    if next_cursor == "null":
        next_cursor = ""

    print("Configuring Plaid API access")
    host = plaid.Environment.Development
    configuration = plaid.Configuration(
            host=host,
            api_key={
                'clientId': plaid_client_id,
                'secret': plaid_secret,
                'plaidVersion': '2020-09-14'
                }
            )
    
    api_client = plaid.ApiClient(configuration)
    client = plaid_api.PlaidApi(api_client)

    cursor = next_cursor
    has_more = True
    
    added = []
    modified = []
    removed = []
    
    while has_more:
        request = TransactionsSyncRequest(access_token=plaid_access, cursor=cursor)
        response = client.transactions_sync(request)

        added.extend(response["added"])
        modified.extend(response["modified"])
        removed.extend(response["removed"])
        
        has_more = response["has_more"]
        cursor = response["next_cursor"]
        
    print("Plaid Amex sync complete:  {} additions, {} modifications, {} removals".format(len(added), len(modified), len(removed)))
    print("Ignoring modifications")
    
    print("Updating plaid cursor from")
    print(next_cursor)
    print("to")
    print(cursor)
    res = ssm.put_parameter(Name="plaid-next-cursor-amex-dev", Value=cursor, Overwrite=True)

    return added, removed


def lambda_handler(event, context):
    """
    CloudWatch trigger to sync plaid transactions and push to DB via SNS messages
    event is set to whatever fixed input is (e.g. amex-plaid)
    """
    if event == "amex-plaid":
        print("Synchronizing plaid Amex transactions with budget-tracker DB")
        raw_add, raw_delete = get_plaid_amex()
        sync_amex(raw_add, raw_delete)

    else:
        print("ERROR: Trigger event not recognized")
        print("event:")
        print(event)
   

# Running locally assumes arg1 is type of file to sync, arg2 is file path
if __name__ == "__main__":
    print("Adding raw transactions of type {}".format(sys.argv[1]))

    if sys.argv[1] == "amex-local":
        with open(sys.argv[2], "r") as fptr:
            # original load is a list of stringified dicts
            traw_str = json.load(fptr)

        raw_transactions = []

        for t in traw_str:
            raw_transactions.append(eval(t)) ## !!! This is not the right way to do this

        sync_amex(raw_transactions)

    elif sys.argv[1] == "amex-plaid":
        raw_add, raw_delete = get_plaid_amex()
