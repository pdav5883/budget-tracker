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


def edit_transaction(id_str, attr_dict):
    """
    Example attr_dict = {"category": "Groceries", "amount": "5.1", "checked": True}
    """
    print("Updating id {}".format(id_str))
    print("Setting {}".format(attr_dict))

    alpha = string.ascii_lowercase
    i = 0

    expr = []
    names = {}
    values = {}

    attr_dict_ddb = common.transaction_to_ddb_item(attr_dict)

    for name, value in attr_dict_ddb.items():
        nk = "#" + alpha[i]
        vk = ":" + alpha[i+1]

        expr.append(nk + "=" + vk)
        names[nk] = name
        values[vk] = value

        i += 2

    expr = "set " + ", ".join(expr)

    res = ddb.update_item(TableName=common.TABLE_NAME,
                          Key={"id": {"S": id_str}},
                          UpdateExpression=expr,
                          ExpressionAttributeNames=names,
                          ExpressionAttributeValues=values)


def set_transactions_checked(id_list):
    """
    All ids in list will set checked=True
    """
    print("Updating {} transactions to checked=True".format(len(id_list)))
    for id_str in id_list:
        res = ddb.update_item(TableName=common.TABLE_NAME,
                              Key={"id": {"S": id_str}},
                              UpdateExpression="set #a=:b",
                              ExpressionAttributeNames={"#a": "checked"},
                              ExpressionAttributeValues={":b": {"BOOL": True}})


def lambda_handler(event, context):
    """
    PUT request, params in event["queryStringParameters"] sometimes (python requests),
    event["body"] other times (jquery.ajax) -- so check both

    Only care about status code returned by API to client
    """
    # TODO: eventually change so that request is always in body, and can contain
    #       edits for multiple entries
    if event["queryStringParameters"] is not None:
        params = event["queryStringParameters"]
        
        if id_list in params:
            params["id_list"] = event["multiValueQueryStringParameters"]
    else:
        params = json.loads(event["body"])

    if "id_list" in params:
        set_transactions_checked(params["id_list"])
    else:
        id_str = params.pop("id")
        edit_transaction(id_str, params)

    return {"isBase64Encoded": False,
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"}
            }
   

# Running locally assumes month-category query 
if __name__ == "__main__":
    print("Edit not implemented locally")
