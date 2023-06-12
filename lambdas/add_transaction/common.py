# constants
__table__ = "budget-tracker-transactions"


def ddb_response_to_transaction(res):
    """
    Convert from DynamoDB dict with types in nested dicts to flat dict
    """
    r = {}

    for k, v in res["Item"].items():
        for vk in v:
            if vk == "N":
                r[k] = float(v[vk])
            else:
                r[k] = v[vk]

    return r
