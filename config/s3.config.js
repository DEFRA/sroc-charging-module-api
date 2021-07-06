import dotenv from 'dotenv'

dotenv.config()

const S3Config = {
  uploadBucket: process.env.UPLOAD_BUCKET,
  archiveBucket: process.env.ARCHIVE_BUCKET
}

export default S3Config
