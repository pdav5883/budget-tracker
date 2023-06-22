import boto3
import sys
import json
import datetime

sns = boto3.client("sns")
topic_arn = "arn:aws:sns:us-east-1:014374244911:budget-tracker-add-topic"

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


def sync_amex(raw_transactions):
    """
    List of amex plaid dicts, build SNS message
    """
    transactions = []

    for rt in raw_transactions:
        t = {"id": rt["transaction_id"],
                "date": rt["authorized_date"].strftime("%Y-%m-%d"),
                "account": "Amex 1008",
                "checked": False,
                "description": rt["name"],
                "amount": rt["amount"]}

        t["category"] = guess_category(t)

        transactions.append(t)

    publish_sns(transactions)


def guess_category(transaction):
    if transaction["description"].startswith("Harris") or \
    transaction["description"].startswith("Whole") or \
    transaction["description"].startswith("Trader"):
        return "Groceries"
    else:
        return "None"


def publish_sns(transactions):
    """
    Only publish MAX_PER_SNS at a time
    """
    block = []

    for t in transactions:
        block.append(t)

        if len(block) >= MAX_PER_SNS:
            print("Adding {} transactions".format(len(block)))
            sns.publish(TopicArn=topic_arn, Message=json.dumps(block))
            block = []

    if len(block):
        print("Adding {} transactions".format(len(block)))
        sns.publish(TopicArn=topic_arn, Message=json.dumps(block))


def lambda_handler(event, context):
    """
    CloudWatch trigger to sync plaid transactions and push to DB
    """
    print(event)
    print("______NOT YET IMPLEMENTED________")
   

# Running locally assumes arg1 is type of file to sync, arg2 is file path
if __name__ == "__main__":
    print("Adding raw transactions of type {} at {}".format(sys.argv[1], sys.argv[2]))

    if sys.argv[1] == "amex":
        with open(sys.argv[2], "r") as fptr:
            # original load is a list of stringified dicts
            traw_str = json.load(fptr)

        raw_transactions = []

        for t in traw_str:
            raw_transactions.append(eval(t)) ## !!! This is not the right way to do this

        sync_amex(raw_transactions)


