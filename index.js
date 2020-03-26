const rp = require('request-promise')
const retries = process.env.RETRIES || 3
const delay = process.env.RETRY_DELAY || 1000
const timeout = process.env.TIMEOUT || 1000

const requestRetry = (options, retries) => {
  return new Promise((resolve, reject) => {
    const retry = (options, n) => {
      return rp(options)
        .then(response => {
          if (response.body.error) {
            if (n === 1) {
              reject(response)
            } else {
              setTimeout(() => {
                retries--
                retry(options, retries)
              }, delay)
            }
          } else {
            return resolve(response)
          }
        })
        .catch(error => {
          if (n === 1) {
            reject(error)
          } else {
            setTimeout(() => {
              retries--
              retry(options, retries)
            }, delay)
          }
        })
    }
    return retry(options, retries)
  })
}


const convertFromTicker = (ticker, coinid, callback) => {
  if (coinid.length !== 0)
    return callback(coinid.toLowerCase())

  requestRetry({
    url: 'https://api.coinpaprika.com/v1/coins',
    json: true,
    timeout,
    resolveWithFullResponse: true
  }, retries)
    .then(response => {
      let coin = response.body.sort((a, b) => (a.rank > b.rank) ? 1 : -1)
                              .find(x => x.symbol.toLowerCase() === ticker.toLowerCase())
      if (typeof coin === 'undefined')
        return callback('undefined')
      return callback(coin.id.toLowerCase())
    })
    .catch(error => {
      return callback('')
    })
}

const createRequest = (input, callback) => {
  const symbol = input.data.from || input.data.coin
  convertFromTicker(symbol, input.data.coinid || '', (coin) => {
    const url = `https://api.coinpaprika.com/v1/tickers/${coin}`
    const market = input.data.to || input.data.market || 'USD'

    const queryObj = {
      quotes: market.toUpperCase()
    }

    const options = {
      url: url,
      qs: queryObj,
      json: true,
      timeout,
      resolveWithFullResponse: true
    }
    requestRetry(options, retries)
      .then(response => {
        const result = response.body.quotes[market.toUpperCase()].price
        response.body.result = result
        callback(response.statusCode, {
          jobRunID: input.id,
          data: response.body,
          result,
          statusCode: response.statusCode
        })
      })
      .catch(error => {
        callback(error.statusCode, {
          jobRunID: input.id,
          status: 'errored',
          error,
          statusCode: error.statusCode
        })
      })
  })
}

exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

module.exports.createRequest = createRequest
