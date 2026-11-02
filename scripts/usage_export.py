"""Export anonymised product usage to data/usage/.

Aggregates only: no destination URLs, short codes, creator hashes or IPs are written.
Env: USAGE_DATABASE_URL (a read-only Postgres connection string for the app database).

Writes:
  data/usage/daily.csv    last 90 days, one row per day
  data/usage/summary.json 28-day rollups (creators, uploads, destination hosts, sources)
"""
import csv
import datetime as dt
import json
import os
import ssl
from urllib.parse import urlparse, unquote

import pg8000.native

OUT_DIR = "data/usage"
MIN_GROUP = 3  # hosts and sources with fewer rows than this are folded into "other"


def connect():
    u = urlparse(os.environ["USAGE_DATABASE_URL"])
    ctx = None if u.hostname in ("localhost", "127.0.0.1") else ssl.create_default_context()
    return pg8000.native.Connection(
        user=unquote(u.username or ""),
        password=unquote(u.password or ""),
        host=u.hostname,
        port=u.port or 5432,
        database=(u.path or "/").lstrip("/"),
        ssl_context=ctx,
    )


def fold(rows):
    """rows: [(label, n)] -> dict with small groups merged into 'other'."""
    out, other = {}, 0
    for label, n in rows:
        if n >= MIN_GROUP and label:
            out[label] = n
        else:
            other += n
    if other:
        out["other"] = other
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    db = connect()

    daily = db.run(
        """
        WITH days AS (
          SELECT d::date AS day
          FROM generate_series(current_date - 89, current_date, interval '1 day') d
        ),
        l AS (
          SELECT created_at::date AS day,
                 count(*) AS links,
                 count(*) FILTER (WHERE content_type IS NOT NULL) AS uploads,
                 count(*) FILTER (WHERE is_custom) AS custom,
                 count(DISTINCT creator_ip_hash) AS creators
          FROM links GROUP BY 1
        ),
        c AS (
          SELECT c.clicked_at::date AS day,
                 count(*) AS clicks,
                 count(*) FILTER (WHERE c.clicked_at > k.created_at + interval '1 hour') AS clicks_after_1h
          FROM clicks c JOIN links k ON k.id = c.link_id GROUP BY 1
        )
        SELECT days.day, coalesce(l.links,0), coalesce(l.uploads,0), coalesce(l.custom,0),
               coalesce(l.creators,0), coalesce(c.clicks,0), coalesce(c.clicks_after_1h,0)
        FROM days LEFT JOIN l USING (day) LEFT JOIN c USING (day)
        ORDER BY days.day
        """
    )
    with open(f"{OUT_DIR}/daily.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "links_created", "uploads_created", "custom_links",
                    "distinct_creators", "clicks", "clicks_over_1h_after_creation"])
        for r in daily:
            w.writerow([r[0].isoformat(), *r[1:]])

    since = "now() - interval '28 days'"
    one = lambda q: db.run(q)[0]

    links_28, uploads_28, creators_28, countries = one(
        f"SELECT count(*), count(*) FILTER (WHERE content_type IS NOT NULL), "
        f"count(DISTINCT creator_ip_hash), count(DISTINCT creator_country) "
        f"FROM links WHERE created_at > {since}"
    )
    repeat_creators = one(
        f"SELECT count(*) FROM (SELECT creator_ip_hash FROM links WHERE created_at > {since} "
        f"AND creator_ip_hash IS NOT NULL GROUP BY 1 HAVING count(*) >= 3) t"
    )[0]
    links_total, clicks_total = one("SELECT count(*), coalesce(sum(click_count),0) FROM links")
    links_with_click = one(
        f"SELECT count(*) FROM links k WHERE k.created_at > {since} AND EXISTS "
        f"(SELECT 1 FROM clicks c WHERE c.link_id = k.id AND c.clicked_at > k.created_at + interval '1 hour')"
    )[0]

    types = db.run(
        f"SELECT content_type, count(*) FROM links WHERE created_at > {since} "
        f"AND content_type IS NOT NULL GROUP BY 1 ORDER BY 2 DESC"
    )
    # destination host only (never the path or query)
    dest = db.run(
        f"SELECT lower(substring(destination_url from '^https?://([^/:?#]+)')), count(*) "
        f"FROM links WHERE created_at > {since} AND content_type IS NULL GROUP BY 1 ORDER BY 2 DESC"
    )
    dest = [(h[4:] if h and h.startswith("www.") else h, n) for h, n in dest]
    merged = {}
    for h, n in dest:
        merged[h] = merged.get(h, 0) + n
    refs = db.run(
        f"SELECT lower(substring(referrer from '^https?://([^/:?#]+)')), count(*) "
        f"FROM clicks WHERE clicked_at > {since} GROUP BY 1 ORDER BY 2 DESC"
    )
    ref_labels = {}
    for h, n in refs:
        h = (h or "direct")
        h = h[4:] if h.startswith("www.") else h
        ref_labels[h] = ref_labels.get(h, 0) + n

    summary = {
        "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "window_days": 28,
        "all_time": {"links": links_total, "clicks": int(clicks_total)},
        "last_28_days": {
            "links_created": links_28,
            "uploads_created": uploads_28,
            "distinct_creators": creators_28,
            "creators_with_3_plus_links": repeat_creators,
            "creator_countries": countries,
            "links_clicked_over_1h_after_creation": links_with_click,
        },
        "uploads_by_content_type": {t or "unknown": n for t, n in types},
        "shortened_destination_hosts": fold(sorted(merged.items(), key=lambda x: -x[1])),
        "click_sources": fold(sorted(ref_labels.items(), key=lambda x: -x[1])),
    }
    with open(f"{OUT_DIR}/summary.json", "w") as f:
        json.dump(summary, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
