require('dotenv').config()

const config = {
  url: process.env.RULES_SERVICE_URL,
  username: process.env.RULES_SERVICE_USER,
  password: process.env.RULES_SERVICE_PASSWORD,
  endpoints: {
    cfd: {
      application: process.env.CFD_APP,
      ruleset: process.env.CFD_RULESET
    },
    pas: {
      application: process.env.PAS_APP,
      ruleset: process.env.PAS_RULESET
    },
    wml: {
      application: process.env.WML_APP,
      ruleset: process.env.WML_RULESET
    },
    wrls: {
      application: process.env.WRLS_APP,
      ruleset: process.env.WRLS_RULESET
    },
    srocWrls: {
      application: process.env.SROC_WRLS_APP,
      ruleset: process.env.SROC_WRLS_RULESET
    }
  }
}

module.exports = config
