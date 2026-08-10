```bash
curl --url 'https://shmooze-worker.jonah-eda.workers.dev/api/partial-lead' \
  -X 'OPTIONS' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'access-control-request-headers: content-type' \
  -H 'access-control-request-method: POST' \
  -H 'origin: https://bestelectronicsway.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://bestelectronicsway.com/' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
```

```bash
curl --url 'https://shmooze-worker.jonah-eda.workers.dev/api/submit-application' \
  -X 'OPTIONS' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'access-control-request-headers: content-type' \
  -H 'access-control-request-method: POST' \
  -H 'origin: https://bestelectronicsway.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://bestelectronicsway.com/' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
```

```bash
curl --url 'https://shmooze-worker.jonah-eda.workers.dev/api/places/verify' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'content-type: application/json' \
  -H 'origin: https://bestelectronicsway.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://bestelectronicsway.com/' \
  -H 'sec-ch-ua: "Chromium";v="151", "Not=A?Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36' \
  --data-raw '{"placeId":"","session":"0656f495-edda-47b5-8de1-72df68e51d43","claimsAtlanta":true,"answers":{"trade":"General Contracting","serviceArea":"Atlanta","leadSource":"Word of mouth / referrals","biggestChallenge":"Not enough leads","wantHelp":"More leads","yearsInBusiness":"lt1"}}'
```