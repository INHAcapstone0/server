require('dotenv').config();
const env=process.env;

const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: env.MYSQL_DIALECT || "mysql",
  port: env.MYSQL_PORT,
  uri: env.URI
};

const production = {
  username: env.MYSQL_USERNAMET_PRODUCTION,
  password: env.MYSQL_PASSWORDT_PRODUCTION,
  database: env.MYSQL_DATABASET_PRODUCTION,
  host: env.MYSQL_HOSTT_PRODUCTION,
  dialect: env.MYSQL_DIALECT||"mysql",
  port: env.MYSQL_PORT || 3306,
  uri: env.URI
};

const test = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: env.MYSQL_DIALECT || "mysql",
  port: env.MYSQL_PORT 
};

module.exports = { development, production, test };
