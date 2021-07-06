import dotenv from 'dotenv'

dotenv.config()

const AirbrakeConfig = {
  host: process.env.AIRBRAKE_HOST,
  projectKey: process.env.AIRBRAKE_KEY,
  projectId: 1,
  environment: process.env.ENVIRONMENT
}

export default AirbrakeConfig
