import boto3
import sys
import json
import string
import datetime
import budget_tracker_common as common

ddb = boto3.client("dynamodb")


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


def delete_transaction(id_str):
    print("Deleting id {}".format(id_str))

    res = ddb.delete_item(TableName=common.TABLE_NAME,
                          Key={"id": {"S": id_str}})


def lambda_handler(event, context):
    """
    - API DELETE request params in event["queryStringParameters"]
    - SNS topic: parse event["Records"][i]["Sns"]["Message"]
    
    Only care about status code returned by API to client
    """
    if "queryStringParameters" in event:
        print("Deleting from API trigger")
        id_str = event["queryStringParameters"]["id"]
        delete_transaction(id_str)

    elif "Records" in event:
        print("Deleting from SNS trigger")
        transactions = []
        for msg in event["Records"]:
            transactions.extend(json.loads(msg["Sns"]["Message"]))

        for t in transactions:
            delete_transaction(t["id"])

    else:
        print("ERROR: unknown trigger event format")
        print("Lambda Event:")
        print(event)

    return {"statusCode": 200}
   

if __name__ == "__main__":
    print("Edit not implemented locally")
