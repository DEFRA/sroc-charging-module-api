import fs from 'fs'
import path from 'path'

const _readAndParseFixture = (pathPieces) => {
  // __dirname would ordinarily give the current directory if used in a CommonJS Node module. But it's not availabe in an
  // ES6 one. So, we can use this to instead to obtain the current directory. We use the standard variable name for
  // consistency
  const __dirname = path.dirname(new URL(import.meta.url).pathname)

  const fullPath = path.join(__dirname, ...pathPieces)
  const data = fs.readFileSync(fullPath)

  return JSON.parse(data)
}

const calculateCharge = {
  presroc: {
    simple: {
      request: _readAndParseFixture(['calculate_charge', 'presroc', 'simple_request.json']),
      rulesService: _readAndParseFixture(['calculate_charge', 'presroc', 'simple_rules_service.json']),
      response: _readAndParseFixture(['calculate_charge', 'presroc', 'simple_response.json'])
    },
    s126ProrataCredit: {
      request: _readAndParseFixture(['calculate_charge', 'presroc', 's126_prorata_credit_request.json']),
      rulesService: _readAndParseFixture(['calculate_charge', 'presroc', 's126_prorata_credit_rules_service.json']),
      response: _readAndParseFixture(['calculate_charge', 'presroc', 's126_prorata_credit_response.json'])
    },
    sectionAgreementsTrue: {
      request: _readAndParseFixture(['calculate_charge', 'presroc', 'section_agreements_true_request.json']),
      rulesService: _readAndParseFixture(['calculate_charge', 'presroc', 'section_agreements_true_rules_service.json']),
      response: _readAndParseFixture(['calculate_charge', 'presroc', 'section_agreements_true_response.json'])
    }
  }
}

const createTransaction = {
  presroc: {
    simple: _readAndParseFixture(['create_transaction', 'presroc', 'simple.json'])
  }
}

export { calculateCharge, createTransaction }
