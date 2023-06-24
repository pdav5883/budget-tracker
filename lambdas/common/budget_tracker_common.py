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
        val = to_bool(v) if t == "BOOL" else str(v) # bool is the only type not passed as a string in boto3
        ite[k] = {t: val}
        
    return ite


def ddb_type(value):
    """
    Return the boto3 ddb type required for add and query
    """
    if is_bool(value):
        return "BOOL"
    elif is_float(value):
        return "N"
    else:
        return "S"


def is_float(value):
    if type(value) in (float, int):
        return True
    try:
        float(value)
        return True
    except:
        return False


true_values = (True, "True", "true", "T", "t")
false_values = (False, "False", "false", "F", "f")

def is_bool(value):
    if value in true_values or value in false_values:
        return True
    else:
        return False


def to_bool(value):
    if value in true_values:
        return True
    elif value in false_values:
        return False
    else:
        raise NameError("name {} not boolean".format(value))

