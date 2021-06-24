require('dotenv').config()

const config = {
  uploadBucket: process.env.UPLOAD_BUCKET,
  archiveBucket: process.env.ARCHIVE_BUCKET
}

module.exports = config
