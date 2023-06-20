# constants
TABLE_NAME = "budget-tracker-transactions"


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
        if type(v) in (float, int):
            ite[k] = {"N": str(v)}
        elif type(v) is str:
            ite[k] = {"S": v}
        elif type(v) is bool:
            ite[k] = {"BOOL": v}
        elif v == "amount": # in case transaction is JSON.stringify'd upstream
            ite[k] = {"N": str(v)}
        else:
            raise TypeError("Key {}, Value {} has type {}".format(k, v, type(v)))

    return ite

