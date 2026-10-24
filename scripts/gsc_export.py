"""Export the last 28 days of Search Console data to data/gsc/latest.csv.

Env: GSC_SERVICE_ACCOUNT_JSON (key contents), GSC_SITE_URL (e.g. sc-domain:squish.to).
"""
import csv
import datetime as dt
import json
import os
import sys

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
OUT = "data/gsc/latest.csv"


def main():
    info = json.loads(os.environ["GSC_SERVICE_ACCOUNT_JSON"])
    site = os.environ["GSC_SITE_URL"]
    creds = service_account.Credentials.from_service_account_info(info, scopes=[SCOPE])
    session = AuthorizedSession(creds)

    # Search Console data lags by about 2-3 days
    end = dt.date.today() - dt.timedelta(days=3)
    start = end - dt.timedelta(days=27)
    url = f"https://www.googleapis.com/webmasters/v3/sites/{site.replace('/', '%2F').replace(':', '%3A')}/searchAnalytics/query"

    rows, start_row = [], 0
    while True:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": ["query", "page"],
            "rowLimit": 25000,
            "startRow": start_row,
        }
        resp = session.post(url, json=body)
        if resp.status_code != 200:
            sys.exit(f"Search Console API error {resp.status_code}: {resp.text}")
        batch = resp.json().get("rows", [])
        rows.extend(batch)
        if len(batch) < 25000:
            break
        start_row += 25000

    with open(OUT, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["query", "page", "clicks", "impressions", "ctr", "position"])
        for r in sorted(rows, key=lambda r: -r["impressions"]):
            q, p = r["keys"]
            w.writerow([q, p, r["clicks"], r["impressions"], round(r["ctr"], 4), round(r["position"], 1)])

    with open("data/gsc/README.txt", "w") as f:
        f.write(f"Search Console export. Range: {start} to {end}. Generated: {dt.date.today()}.\n"
                "Columns: query, page, clicks, impressions, ctr, position. Sorted by impressions.\n")
    print(f"Wrote {len(rows)} rows for {start} to {end}")


if __name__ == "__main__":
    main()
