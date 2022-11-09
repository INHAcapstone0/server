const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const logger = require('../winston');

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }
  // logger.error(err)
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg:err.message })
}

module.exports = errorHandlerMiddleware
