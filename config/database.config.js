import dotenv from 'dotenv'

dotenv.config()

const DatabaseConfig = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  testDatabase: process.env.POSTGRES_DB_TEST
}

export default DatabaseConfig
