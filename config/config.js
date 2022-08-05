require('dotenv').config();
const env=process.env;

const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: env.MYSQL_DIALECT || "mysql",
  port: env.MYSQL_PORT
};

const production = {
  use_env_variable: env.URI,
  "dialect": "mysql"
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
