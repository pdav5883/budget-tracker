# constants
TABLE_NAME = "budget-tracker-transactions"
INDEX_NAME = "month-category-index"


def ddb_item_to_transaction(ite):
    """
    Convert from DynamoDB dict with types in nested dicts to flat dict
    """
    t = {}

    for k, v in ite.items():
        for vk in v:
            if vk == "N":
                t[k] = float(v[vk])
            else:
                t[k] = v[vk]

    return t


def transaction_to_ddb_item(transaction):
    ite = {}

    for k, v in transaction.items():
        t = ddb_type(v)
        val = v if t == "BOOL" else str(v) # bool is the only type not passed as a string in boto3
        ite[k] = {ddb_type(v): val}
        
        return ite


def ddb_type(value):
    """
    Return the boto3 ddb type required for add and query
    """
    if type(value) in (float, int):
        return "N"
    elif type(value) is str:
        return "S"
    elif type(value) is bool:
        return "BOOL"
    else: # in case numeric value has been JSON.stringify'd upstream
        try:
            float(value)
            return "N"
        except:
            raise TypeError("Value {} has unrecognized type {}".format(value, type(value)))

