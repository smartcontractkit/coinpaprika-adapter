const request = require('request')
const _ = require('lodash')

const convertFromTicker = (ticker, callback) => {
  request({
    url: 'https://api.coinpaprika.com/v1/coins',
    json: true
  }, (error, response, body) => {
    if (error || response.statusCode >= 400) {
      return callback('')
    } else {
      let coin = body.find(x => x.symbol.toLowerCase() === ticker.toLowerCase())
      if (typeof coin === 'undefined')
        return callback('undefined')
      return callback(coin.id.toLowerCase())
    }
  })
}

const createRequest = (input, callback) => {
  convertFromTicker(input.data.coin, (coin) => {
    const url = `https://api.coinpaprika.com/v1/tickers/${coin}`
    const market = input.data.market || 'USD'

    const queryObj = {
      quotes: market.toUpperCase()
    }

    const options = {
      url: url,
      qs: queryObj,
      json: true
    }
    request(options, (error, response, body) => {
      if (error || response.statusCode >= 400 || body.error) {
        callback(response.statusCode, {
          jobRunID: input.id,
          status: 'errored',
          error: body,
          errorMessage: body.error,
          statusCode: response.statusCode
        })
      } else {
        const result = body.quotes[market.toUpperCase()].price
        body.result = result
        callback(response.statusCode, {
          jobRunID: input.id,
          data: body,
          result: result || '',
          statusCode: response.statusCode
        })
      }
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
