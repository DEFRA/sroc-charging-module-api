'use strict'

require('dotenv').config()

const config = {
  upload: {
    service: process.env.UPLOAD_BUCKET,
    options: {
      region: process.env.UPLOAD_REGION,
      accessKeyId: process.env.UPLOAD_ACCESS_KEY,
      secretAccessKey: process.env.UPLOAD_SECRET_KEY
    }
  },
  archive: {
    service: process.env.ARCHIVE_BUCKET,
    options: {
      region: process.env.ARCHIVE_REGION,
      accessKeyId: process.env.ARCHIVE_ACCESS_KEY,
      secretAccessKey: process.env.ARCHIVE_SECRET_KEY
    }
  }
}

module.exports = config
