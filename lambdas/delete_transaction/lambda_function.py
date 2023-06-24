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
    DELETE request, params in event["queryStringParameters"]

    Only care about status code returned by API to client
    """
    id_str = event["queryStringParameters"]["id"]

    delete_transaction(id_str)

    return {"statusCode": 200}
   

# Running locally assumes month-category query 
if __name__ == "__main__":
    print("Edit not implemented locally")
