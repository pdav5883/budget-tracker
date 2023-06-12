import boto3
import datetime
import common

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

def test_local(local_dir, lat, lon, time_utc, span_hours=24):
    """
    Runs lambda_handler using path as a stand-in for bucket
    """
    event = {"localTestDir": local_dir,
             "queryStringParameters": {"lat": lat,
                                       "lon": lon,
                                       "time_utc": time_utc,
                                       "span_hours": span_hours
                                      }
            }

    res = lambda_handler(event, None)
    print(res)


def add_transaction_ddb(transaction):
    if month not in transaction:
        d = datetime.date.fromisoformat(transaction["date"])
        transaction["month"] = d.strftime("%b") + " " + d.strftime("%y")
    if category not in transaction:
        transaction["category"] = "None"
    if checked not in transaction:
        transaction["checked"] = False



 
def lambda_handler(event, context):
    """
    For GET request, parameters are in event['queryStringParameters']

    {"lat": lat_degrees, "lon": lon_degrees, "time_utc": YYYY-MM-DD HH:MM:SS string, "span_hours": hours to look ahead}

    Returns:
    list of dicts {"name": str, "start/stop/peak_utc": str, "start/stop/peak_az": float, "start/stop/peak_el": float}
    """
    if "localTestDir" in event:
        local_dir = event["localTestDir"]
    else:
        local_dir = None

    lat = float(event["queryStringParameters"]["lat"])
    lon = float(event["queryStringParameters"]["lon"])
    time_utc = event["queryStringParameters"]["time_utc"]
    span_hours = float(event["queryStringParameters"]["span_hours"])

    print("Get visible for lat: {}, lon:{} from time: {} for {} hours".format(lat, lon, time_utc, span_hours))

    lla = np.array([lat, lon, 0])
    sats = read_satellite_data(local_dir)
    ephem = load_ephemeris(local_dir)
    sats_ecef, sunlit = propagate_ecef_sunlit(sats, time_utc, ephem)
    sun_ecef = get_sun_direction_ecef(time_utc, ephem)
    viz = visible_local(list(sats.keys()), sats_ecef, sun_ecef, sunlit, lla)

    print("Found: {}".format(viz))

    return viz



