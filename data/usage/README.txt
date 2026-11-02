Anonymised product usage export, refreshed on weekday mornings by .github/workflows/usage-export.yml.
daily.csv: last 90 days (links_created, uploads_created, custom_links, distinct_creators, clicks,
clicks_over_1h_after_creation). The 1h column drops previews and creators testing their own link.
summary.json: 28-day rollups, destination hosts and click sources (groups under 3 are folded into "other").
Caveats: distinct_creators counts hashed IPs, so one person on two networks counts twice and your own
uploads are included. Contains no destination URLs, short codes, creator hashes or IPs.
The stats page does not record its own visits, so stats-page usage is not available.
