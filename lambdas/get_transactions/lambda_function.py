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


def get_transaction_by_id(id_str):
    res = ddb.get_item(TableName=common.TABLE_NAME, Key={"id": {"S": id_str}})

    if "Item" in res:
        return common.ddb_item_to_transaction(res["Item"])
    else:
        return None


def query_transactions_month_category(month, category=None):
    """
    query on month-category-index global index
    """
    if category is None:
        query_expr = "#M = :m"
        attr_names = {"#M": "month"}
        attr_values = {":m": {"S": month}}
    else:
        query_expr = "#M = :m AND #C = :c"
        attr_names = {"#M": "month", "#C": "category"}
        attr_values = {":m": {"S": month}, ":c": {"S": category}}

    res = ddb.query(TableName=common.TABLE_NAME, IndexName=common.INDEX_NAME,
                    KeyConditionExpression=query_expr,
                    ExpressionAttributeNames=attr_names,
                    ExpressionAttributeValues=attr_values)

    return [common.ddb_item_to_transaction(ite) for ite in res["Items"]]


    
"""
Won't work because there is not an index over everything, but might be useful in scan
def query_transactions(attr_dict):
   
    attr_dict keys are attributes to query, values are equality values for attributes

    attribute type is inferred by value

   
    letters = string.ascii_lowercase
    i = 0

    query_expr_list = []
    attr_names = {}
    attr_values = {}

    for k, v in attr_dicts.items():
        query_expr_list.append("#" + letters[i] + " = :" + letters[i+1])
        attr_names["#" + letters[i]] = k
        attr_values[":" + letters[i+1]] = {common.ddb_type(v): v}

        i += 2

    query_expr = " AND ".join(query_expr_list)

    res = ddb.query(TableName=common.TABLE_NAME,
"""


def lambda_handler(event, context):
    """
    GET request, list of transactions in event['body']

    Due to lambda proxy integration with REST API, must include specific response format
    """
    params = event["queryStringParameters"]
    query_type = params["type"]
    
    if query_type == "id":
        status = 200
        body = json.dumps(get_transaction_by_id(params["id"]))
    elif query_type == "month-category":
        month = params["month"]
        category = params["category"] if "category" in params else None
        status = 200
        body = json.dumps(query_transactions_month_category(month, category))
    else:
        status = 400
        body = "Illegal query type {}".format(query_type)

    resp = {"isBase64Encoded": False,
            "statusCode": status,
            "headers": {"Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET"},
            "body": body}

    return resp
   

# Running locally assumes month-category query 
if __name__ == "__main__":
    month = sys.argv[1]
    category = sys.argv[2] if len(sys.argv) > 2 else None

    t = query_transactions_month_category(month, category)

    print("Found {} transactions".format(len(t)))

    for t_ in t:
        print(t_)

