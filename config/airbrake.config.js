require('dotenv').config()

const config = {
  host: process.env.AIRBRAKE_HOST,
  projectKey: process.env.AIRBRAKE_KEY,
  projectId: 1,
  environment: process.env.ENVIRONMENT
}

module.exports = config
