# Chainlink CoinPaprika External Adapter

External adapter for use on Google Cloud Platform or AWS Lambda. Zip and upload, then use trigger URL as bridge endpoint.

## Input Params

- `coin`: The coin to query (required, may use ticker or name)
- `market`: The currency to convert the coin to (required)

## Output Format

```
{
 "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
 "data": {
  "id": "eth-ethereum",
  "name": "Ethereum",
  "symbol": "ETH",
  "rank": 2,
  "circulating_supply": 109469522,
  "total_supply": 109469556,
  "max_supply": 0,
  "beta_value": 1.04048,
  "last_updated": "2020-01-28T21:56:03Z",
  "quotes": {
   "USD": {
    "price": 173.00001891,
    "volume_24h": 8256159044.3763,
    "volume_24h_change_24h": 2.54,
    "market_cap": 18938229376,
    "market_cap_change_24h": 0.93,
    "percent_change_1h": 0.27,
    "percent_change_12h": 1.04,
    "percent_change_24h": 0.92,
    "percent_change_7d": 2.18,
    "percent_change_30d": 27.49,
    "percent_change_1y": 64.2,
    "ath_price": 1432.88,
    "ath_date": "2018-01-13T21:04:00Z",
    "percent_from_price_ath": -87.93
   }
  },
  "result": 173.00001891
 },
 "result": 173.00001891,
 "statusCode": 200
}
```

## Install

```bash
yarn install
```

## Test

```bash
yarn test
```

## Create the zip

```bash
zip -r cl-coinpaprika.zip .
```

## Run with Docker

```bash
docker build . -t coinpaprika-adapter
docker run -d \
    -p 8080:8080 \
    -e EA_PORT=8080 \
    coinpaprika-adapter
```

## Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `cl-coinpaprika.zip` file
- Handler should remain index.handler
- Save


## Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `cl-coinpaprika.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
