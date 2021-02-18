'use strict'

require('dotenv').config()

const config = {
  url: process.env.RULES_SERVICE_URL,
  username: process.env.RULES_SERVICE_USER,
  password: process.env.RULES_SERVICE_PASSWORD,
  httpProxy: process.env.HTTP_PROXY,
  srocMinDate: process.env.SROC_MINIMUM_DATE ? process.env.SROC_MINIMUM_DATE : '01-APR-2021',
  endpoints: {
    cfd: {
      rulesets: {
        presroc: {
          application: process.env.CFD_APP,
          ruleset: process.env.CFD_RULESET
        },
        sroc: {
          application: process.env.CFD_APP,
          ruleset: process.env.CFD_RULESET
        }
      }
    },
    pas: {
      rulesets: {
        presroc: {
          application: process.env.PAS_APP,
          ruleset: process.env.PAS_RULESET
        },
        sroc: {
          application: process.env.PAS_APP,
          ruleset: process.env.PAS_RULESET
        }
      }
    },
    wml: {
      rulesets: {
        presroc: {
          application: process.env.WML_APP,
          ruleset: process.env.WML_RULESET
        },
        sroc: {
          application: process.env.WML_APP,
          ruleset: process.env.WML_RULESET
        }
      }
    },
    wrls: {
      rulesets: {
        presroc: {
          application: process.env.WRLS_APP,
          ruleset: process.env.WRLS_RULESET
        },
        sroc: {
          application: process.env.WRLS_SROC_APP,
          ruleset: process.env.WRLS_SROC_RULESET
        }
      }
    }
  },
  timeout: parseInt(process.env.RULES_SERVICE_TIMEOUT)
}

module.exports = config
