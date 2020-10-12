require('dotenv').config()

const config = {
  environment: process.env.ENVIRONMENT,
  adminClientId: process.env.ADMIN_CLIENT_ID
}

module.exports = config
