# Changelog

## [v0.10.1](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.10.1) (2021-06-02)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.10.0...v0.10.1)

**Implemented enhancements:**

- Add delete licence services to controller [\#451](https://github.com/DEFRA/sroc-charging-module-api/pull/451) ([StuAA78](https://github.com/StuAA78))
- Refactor bill run editable and add patchable [\#449](https://github.com/DEFRA/sroc-charging-module-api/pull/449) ([Cruikshanks](https://github.com/Cruikshanks))
- Develop initial DeleteLicenceService [\#446](https://github.com/DEFRA/sroc-charging-module-api/pull/446) ([StuAA78](https://github.com/StuAA78))
- Create ValidateBillRunLicenceService [\#445](https://github.com/DEFRA/sroc-charging-module-api/pull/445) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix minimum charge being calculated at wrong level [\#450](https://github.com/DEFRA/sroc-charging-module-api/pull/450) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix Client ID unique constraint for rebilling [\#448](https://github.com/DEFRA/sroc-charging-module-api/pull/448) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Bump nock from 13.0.11 to 13.1.0 [\#447](https://github.com/DEFRA/sroc-charging-module-api/pull/447) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.10.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.10.0) (2021-05-27)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.9.0...v0.10.0)

**Implemented enhancements:**

- Delete licence create initial endpoint [\#444](https://github.com/DEFRA/sroc-charging-module-api/pull/444) ([StuAA78](https://github.com/StuAA78))
- Develop Request Licence plugin [\#442](https://github.com/DEFRA/sroc-charging-module-api/pull/442) ([StuAA78](https://github.com/StuAA78))
- Add filtered routes service [\#440](https://github.com/DEFRA/sroc-charging-module-api/pull/440) ([Cruikshanks](https://github.com/Cruikshanks))
- Use admin send transaction file service in endpoint [\#435](https://github.com/DEFRA/sroc-charging-module-api/pull/435) ([StuAA78](https://github.com/StuAA78))
- Create AdminSendTransactionFileService [\#434](https://github.com/DEFRA/sroc-charging-module-api/pull/434) ([StuAA78](https://github.com/StuAA78))
- Create BoomNotifier [\#433](https://github.com/DEFRA/sroc-charging-module-api/pull/433) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix generated bill run status after add trans. [\#443](https://github.com/DEFRA/sroc-charging-module-api/pull/443) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix missing admin auth scope on bill run /send [\#439](https://github.com/DEFRA/sroc-charging-module-api/pull/439) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix defects in customer data validation [\#437](https://github.com/DEFRA/sroc-charging-module-api/pull/437) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Bump @aws-sdk/client-s3 from 3.16.0 to 3.17.0 [\#441](https://github.com/DEFRA/sroc-charging-module-api/pull/441) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove rebilling endpoint feature flag [\#436](https://github.com/DEFRA/sroc-charging-module-api/pull/436) ([StuAA78](https://github.com/StuAA78))

## [v0.9.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.9.0) (2021-05-18)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.8.1...v0.9.0)

**Implemented enhancements:**

- Add nuke-db npm script [\#430](https://github.com/DEFRA/sroc-charging-module-api/pull/430) ([Cruikshanks](https://github.com/Cruikshanks))
- Revised Admin Send Transaction File endpoint [\#429](https://github.com/DEFRA/sroc-charging-module-api/pull/429) ([StuAA78](https://github.com/StuAA78))
- Include pending changes in SendCustomerFileService [\#425](https://github.com/DEFRA/sroc-charging-module-api/pull/425) ([Cruikshanks](https://github.com/Cruikshanks))
- Add rebilling fields to View Bill Run Invoice query [\#424](https://github.com/DEFRA/sroc-charging-module-api/pull/424) ([StuAA78](https://github.com/StuAA78))
- Add rebilling fields to View Bill Run query [\#423](https://github.com/DEFRA/sroc-charging-module-api/pull/423) ([StuAA78](https://github.com/StuAA78))
- Add rebilling info to ViewInvoicePresenter [\#422](https://github.com/DEFRA/sroc-charging-module-api/pull/422) ([StuAA78](https://github.com/StuAA78))
- Add rebilling info to view bill run response [\#421](https://github.com/DEFRA/sroc-charging-module-api/pull/421) ([StuAA78](https://github.com/StuAA78))
- Add support to seed test authorised system [\#420](https://github.com/DEFRA/sroc-charging-module-api/pull/420) ([Cruikshanks](https://github.com/Cruikshanks))
- Prevent duplicate billing [\#418](https://github.com/DEFRA/sroc-charging-module-api/pull/418) ([StuAA78](https://github.com/StuAA78))
- Exclude rebilling invoices from deminimis and minimum charge calculation [\#417](https://github.com/DEFRA/sroc-charging-module-api/pull/417) ([StuAA78](https://github.com/StuAA78))
- Rebilling error handling [\#415](https://github.com/DEFRA/sroc-charging-module-api/pull/415) ([StuAA78](https://github.com/StuAA78))
- Add db reset package.json script [\#414](https://github.com/DEFRA/sroc-charging-module-api/pull/414) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Invoice Rebilling Controller [\#408](https://github.com/DEFRA/sroc-charging-module-api/pull/408) ([StuAA78](https://github.com/StuAA78))
- Add rebilling validation for cancel invoices [\#407](https://github.com/DEFRA/sroc-charging-module-api/pull/407) ([StuAA78](https://github.com/StuAA78))
- Create Invoice Rebilling Service [\#406](https://github.com/DEFRA/sroc-charging-module-api/pull/406) ([StuAA78](https://github.com/StuAA78))
- Create Invoice Rebilling Create Licence Service [\#403](https://github.com/DEFRA/sroc-charging-module-api/pull/403) ([StuAA78](https://github.com/StuAA78))
- Create InvoiceRebillingCreateTransactionService [\#402](https://github.com/DEFRA/sroc-charging-module-api/pull/402) ([StuAA78](https://github.com/StuAA78))
- Create rebilling initialise service [\#395](https://github.com/DEFRA/sroc-charging-module-api/pull/395) ([StuAA78](https://github.com/StuAA78))
- Create Invoice Rebilling Validation Service [\#387](https://github.com/DEFRA/sroc-charging-module-api/pull/387) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Remove fields from copied rebilling transactions [\#413](https://github.com/DEFRA/sroc-charging-module-api/pull/413) ([StuAA78](https://github.com/StuAA78))
- Fix missing customer validations [\#397](https://github.com/DEFRA/sroc-charging-module-api/pull/397) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix DB rebuild vscode task [\#396](https://github.com/DEFRA/sroc-charging-module-api/pull/396) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix failing MoveCustomersToExportedTableService tests [\#392](https://github.com/DEFRA/sroc-charging-module-api/pull/392) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Squash migration scripts before Go Live [\#432](https://github.com/DEFRA/sroc-charging-module-api/pull/432) ([Cruikshanks](https://github.com/Cruikshanks))
- Merge VSCode db setup tasks [\#431](https://github.com/DEFRA/sroc-charging-module-api/pull/431) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @aws-sdk/client-s3 from 3.15.0 to 3.16.0 [\#427](https://github.com/DEFRA/sroc-charging-module-api/pull/427) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add AuthorisationService to plugins folder [\#426](https://github.com/DEFRA/sroc-charging-module-api/pull/426) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @now-ims/hapi-now-auth from 2.0.3 to 2.0.4 [\#419](https://github.com/DEFRA/sroc-charging-module-api/pull/419) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add update \(PATCH\) authorised systems endpoint [\#416](https://github.com/DEFRA/sroc-charging-module-api/pull/416) ([Cruikshanks](https://github.com/Cruikshanks))
- Tidy invoice controller imports [\#412](https://github.com/DEFRA/sroc-charging-module-api/pull/412) ([StuAA78](https://github.com/StuAA78))
- Add auth scope to invoice rebill endpoint [\#411](https://github.com/DEFRA/sroc-charging-module-api/pull/411) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @aws-sdk/client-s3 from 3.14.0 to 3.15.0 [\#410](https://github.com/DEFRA/sroc-charging-module-api/pull/410) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/hapi from 20.1.2 to 20.1.3 [\#409](https://github.com/DEFRA/sroc-charging-module-api/pull/409) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/lab from 24.2.0 to 24.2.1 [\#405](https://github.com/DEFRA/sroc-charging-module-api/pull/405) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump dotenv from 8.4.0 to 8.6.0 [\#404](https://github.com/DEFRA/sroc-charging-module-api/pull/404) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump dotenv from 8.2.0 to 8.4.0 [\#401](https://github.com/DEFRA/sroc-charging-module-api/pull/401) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-s3 from 3.13.1 to 3.14.0 [\#400](https://github.com/DEFRA/sroc-charging-module-api/pull/400) ([dependabot[bot]](https://github.com/apps/dependabot))
- Rename bill run plugin to be more consistent [\#399](https://github.com/DEFRA/sroc-charging-module-api/pull/399) ([Cruikshanks](https://github.com/Cruikshanks))
- Correct await async usage in RequestBillRunService [\#398](https://github.com/DEFRA/sroc-charging-module-api/pull/398) ([Cruikshanks](https://github.com/Cruikshanks))
- Move plugin test files to plugins folder [\#394](https://github.com/DEFRA/sroc-charging-module-api/pull/394) ([StuAA78](https://github.com/StuAA78))
- Create plugin to add invoice to request when needed [\#393](https://github.com/DEFRA/sroc-charging-module-api/pull/393) ([StuAA78](https://github.com/StuAA78))
- Move JwtStrategyAuth to app/lib folder [\#390](https://github.com/DEFRA/sroc-charging-module-api/pull/390) ([Cruikshanks](https://github.com/Cruikshanks))
- Move plugin based services to own folder [\#389](https://github.com/DEFRA/sroc-charging-module-api/pull/389) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.8.1](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.8.1) (2021-04-29)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.8.0...v0.8.1)

**Fixed bugs:**

- Fix jwk file selection for INTEGRATION [\#391](https://github.com/DEFRA/sroc-charging-module-api/pull/391) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.8.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.8.0) (2021-04-29)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.7.3...v0.8.0)

**Implemented enhancements:**

- Add test Show customer file endpoint [\#385](https://github.com/DEFRA/sroc-charging-module-api/pull/385) ([Cruikshanks](https://github.com/Cruikshanks))
- Send Customer File Service moves customers to exported\_customers [\#384](https://github.com/DEFRA/sroc-charging-module-api/pull/384) ([StuAA78](https://github.com/StuAA78))
- Move Customers To Exported Table service [\#382](https://github.com/DEFRA/sroc-charging-module-api/pull/382) ([StuAA78](https://github.com/StuAA78))
- Add customer files test endpoint [\#381](https://github.com/DEFRA/sroc-charging-module-api/pull/381) ([Cruikshanks](https://github.com/Cruikshanks))
- Add TaskNotifier and refactor existing Notifier [\#379](https://github.com/DEFRA/sroc-charging-module-api/pull/379) ([Cruikshanks](https://github.com/Cruikshanks))
- Admin customer changes dummy endpoint [\#375](https://github.com/DEFRA/sroc-charging-module-api/pull/375) ([StuAA78](https://github.com/StuAA78))
- Add customer file to customer\_file table [\#371](https://github.com/DEFRA/sroc-charging-module-api/pull/371) ([StuAA78](https://github.com/StuAA78))
- Add generate customer file task [\#370](https://github.com/DEFRA/sroc-charging-module-api/pull/370) ([Cruikshanks](https://github.com/Cruikshanks))
- Create exported\_customers table [\#369](https://github.com/DEFRA/sroc-charging-module-api/pull/369) ([StuAA78](https://github.com/StuAA78))
- Create customer file model [\#366](https://github.com/DEFRA/sroc-charging-module-api/pull/366) ([StuAA78](https://github.com/StuAA78))
- Link customers table to customer\_files [\#365](https://github.com/DEFRA/sroc-charging-module-api/pull/365) ([StuAA78](https://github.com/StuAA78))
- Create customer files table [\#364](https://github.com/DEFRA/sroc-charging-module-api/pull/364) ([StuAA78](https://github.com/StuAA78))
- Overwrite existing customer details entry [\#355](https://github.com/DEFRA/sroc-charging-module-api/pull/355) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix previous changes in customer file export [\#386](https://github.com/DEFRA/sroc-charging-module-api/pull/386) ([StuAA78](https://github.com/StuAA78))
- Fix - add client ID back into conflict response [\#380](https://github.com/DEFRA/sroc-charging-module-api/pull/380) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix SendCustomerFileService error logging [\#373](https://github.com/DEFRA/sroc-charging-module-api/pull/373) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix POST /customer-changes response code [\#372](https://github.com/DEFRA/sroc-charging-module-api/pull/372) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix multiple region customer file generation [\#368](https://github.com/DEFRA/sroc-charging-module-api/pull/368) ([StuAA78](https://github.com/StuAA78))
- Fix transaction file minimum charge defect [\#362](https://github.com/DEFRA/sroc-charging-module-api/pull/362) ([StuAA78](https://github.com/StuAA78))
- Correctly record prorata days for two-part tariffs [\#361](https://github.com/DEFRA/sroc-charging-module-api/pull/361) ([StuAA78](https://github.com/StuAA78))
- Fix transaction file compensation charge defect [\#360](https://github.com/DEFRA/sroc-charging-module-api/pull/360) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Use consistent naming convention package scripts [\#388](https://github.com/DEFRA/sroc-charging-module-api/pull/388) ([Cruikshanks](https://github.com/Cruikshanks))
- Update TaskRunner to use TaskNotifier [\#383](https://github.com/DEFRA/sroc-charging-module-api/pull/383) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @hapi/lab from 24.1.1 to 24.2.0 [\#378](https://github.com/DEFRA/sroc-charging-module-api/pull/378) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump mock-fs from 4.13.0 to 4.14.0 [\#377](https://github.com/DEFRA/sroc-charging-module-api/pull/377) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-s3 from 3.13.0 to 3.13.1 [\#376](https://github.com/DEFRA/sroc-charging-module-api/pull/376) ([dependabot[bot]](https://github.com/apps/dependabot))
- Initial Invoice Rebilling endpoint [\#374](https://github.com/DEFRA/sroc-charging-module-api/pull/374) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @airbrake/node from 2.1.3 to 2.1.4 [\#367](https://github.com/DEFRA/sroc-charging-module-api/pull/367) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-s3 from 3.12.0 to 3.13.0 [\#363](https://github.com/DEFRA/sroc-charging-module-api/pull/363) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pg from 8.5.1 to 8.6.0 [\#359](https://github.com/DEFRA/sroc-charging-module-api/pull/359) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pg-query-stream from 4.0.0 to 4.1.0 [\#358](https://github.com/DEFRA/sroc-charging-module-api/pull/358) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @aws-sdk/client-s3 from 3.11.0 to 3.12.0 [\#351](https://github.com/DEFRA/sroc-charging-module-api/pull/351) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.7.3](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.7.3) (2021-04-13)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.7.2...v0.7.3)

**Implemented enhancements:**

- Customer file is sorted by customer reference [\#354](https://github.com/DEFRA/sroc-charging-module-api/pull/354) ([StuAA78](https://github.com/StuAA78))
- Generate customer files when sending bill runs [\#350](https://github.com/DEFRA/sroc-charging-module-api/pull/350) ([StuAA78](https://github.com/StuAA78))
- Send Customer File admin endpoint [\#349](https://github.com/DEFRA/sroc-charging-module-api/pull/349) ([StuAA78](https://github.com/StuAA78))
- Use customer file presenters [\#348](https://github.com/DEFRA/sroc-charging-module-api/pull/348) ([StuAA78](https://github.com/StuAA78))
- Presenters for writing customer files [\#347](https://github.com/DEFRA/sroc-charging-module-api/pull/347) ([StuAA78](https://github.com/StuAA78))
- Create Send Customer File Service [\#346](https://github.com/DEFRA/sroc-charging-module-api/pull/346) ([StuAA78](https://github.com/StuAA78))
- Next Customer File Reference Service [\#342](https://github.com/DEFRA/sroc-charging-module-api/pull/342) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Delete invoice error handling [\#356](https://github.com/DEFRA/sroc-charging-module-api/pull/356) ([StuAA78](https://github.com/StuAA78))
- Exclude zero value transactions from transaction files [\#353](https://github.com/DEFRA/sroc-charging-module-api/pull/353) ([StuAA78](https://github.com/StuAA78))
- Pass correct params to GenerateCustomerFileService [\#352](https://github.com/DEFRA/sroc-charging-module-api/pull/352) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Delete bill run error handling [\#357](https://github.com/DEFRA/sroc-charging-module-api/pull/357) ([StuAA78](https://github.com/StuAA78))

## [v0.7.2](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.7.2) (2021-04-08)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.7.1...v0.7.2)

**Implemented enhancements:**

- Add Hapi request ID to Notifier [\#339](https://github.com/DEFRA/sroc-charging-module-api/pull/339) ([Cruikshanks](https://github.com/Cruikshanks))
- Create initial Generate Customer File Service [\#334](https://github.com/DEFRA/sroc-charging-module-api/pull/334) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix - Move delete invoice to background task [\#345](https://github.com/DEFRA/sroc-charging-module-api/pull/345) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix - Move delete bill run to background task [\#343](https://github.com/DEFRA/sroc-charging-module-api/pull/343) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Move test sleep\(\) method to GeneralHelper [\#344](https://github.com/DEFRA/sroc-charging-module-api/pull/344) ([Cruikshanks](https://github.com/Cruikshanks))
- Simplify the VSCode tasks [\#341](https://github.com/DEFRA/sroc-charging-module-api/pull/341) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove transaction level status [\#340](https://github.com/DEFRA/sroc-charging-module-api/pull/340) ([Cruikshanks](https://github.com/Cruikshanks))
- Switch to using Notifier plugin [\#338](https://github.com/DEFRA/sroc-charging-module-api/pull/338) ([Cruikshanks](https://github.com/Cruikshanks))
- Revert Dependabot SonarCloud workaround [\#337](https://github.com/DEFRA/sroc-charging-module-api/pull/337) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.7.1](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.7.1) (2021-04-05)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.7.0...v0.7.1)

**Fixed bugs:**

- Fix compensation charge as string in /invoices [\#336](https://github.com/DEFRA/sroc-charging-module-api/pull/336) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Bump @aws-sdk/client-s3 from 3.10.0 to 3.11.0 [\#335](https://github.com/DEFRA/sroc-charging-module-api/pull/335) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump jwk-to-pem from 2.0.4 to 2.0.5 [\#333](https://github.com/DEFRA/sroc-charging-module-api/pull/333) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @joi/date from 2.0.1 to 2.1.0 [\#332](https://github.com/DEFRA/sroc-charging-module-api/pull/332) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.7.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.7.0) (2021-03-31)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.6.2...v0.7.0)

**Implemented enhancements:**

- Update Generate Transaction File service [\#331](https://github.com/DEFRA/sroc-charging-module-api/pull/331) ([StuAA78](https://github.com/StuAA78))
- Transform Records to File service [\#330](https://github.com/DEFRA/sroc-charging-module-api/pull/330) ([StuAA78](https://github.com/StuAA78))
- Presenters for writing transaction file [\#328](https://github.com/DEFRA/sroc-charging-module-api/pull/328) ([StuAA78](https://github.com/StuAA78))
- Implement stream services for generating transaction files [\#327](https://github.com/DEFRA/sroc-charging-module-api/pull/327) ([StuAA78](https://github.com/StuAA78))
- Add new Notifier plugin [\#324](https://github.com/DEFRA/sroc-charging-module-api/pull/324) ([Cruikshanks](https://github.com/Cruikshanks))

**Fixed bugs:**

- Fix 500 error for empty region in POST transaction [\#326](https://github.com/DEFRA/sroc-charging-module-api/pull/326) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Bump @aws-sdk/client-s3 from 3.9.0 to 3.10.0 [\#329](https://github.com/DEFRA/sroc-charging-module-api/pull/329) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.6.2](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.6.2) (2021-03-23)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.6.1...v0.6.2)

**Implemented enhancements:**

- Add credit and debit line values back to invoices [\#322](https://github.com/DEFRA/sroc-charging-module-api/pull/322) ([Cruikshanks](https://github.com/Cruikshanks))
- SendTransactionFileService error handling [\#315](https://github.com/DEFRA/sroc-charging-module-api/pull/315) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix installing react-native as a dependency [\#319](https://github.com/DEFRA/sroc-charging-module-api/pull/319) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Fix unique error messages in Send Trans. file [\#323](https://github.com/DEFRA/sroc-charging-module-api/pull/323) ([Cruikshanks](https://github.com/Cruikshanks))
- Add --no-cache arg to DockerHub build [\#320](https://github.com/DEFRA/sroc-charging-module-api/pull/320) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove 'tmp' folder from project [\#318](https://github.com/DEFRA/sroc-charging-module-api/pull/318) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @hapi/hapi from 20.1.1 to 20.1.2 [\#317](https://github.com/DEFRA/sroc-charging-module-api/pull/317) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.6.1](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.6.1) (2021-03-20)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.6.0...v0.6.1)

**Implemented enhancements:**

- Create DeleteFileService [\#316](https://github.com/DEFRA/sroc-charging-module-api/pull/316) ([StuAA78](https://github.com/StuAA78))
- Add SendTransactionFileService to bill run send controller [\#309](https://github.com/DEFRA/sroc-charging-module-api/pull/309) ([StuAA78](https://github.com/StuAA78))
- Send Transaction File Service [\#308](https://github.com/DEFRA/sroc-charging-module-api/pull/308) ([StuAA78](https://github.com/StuAA78))
- Add trans. reference to invoice in VIEW bill run [\#307](https://github.com/DEFRA/sroc-charging-module-api/pull/307) ([Cruikshanks](https://github.com/Cruikshanks))
- Switch invoice update in CreateTransactionService [\#299](https://github.com/DEFRA/sroc-charging-module-api/pull/299) ([Cruikshanks](https://github.com/Cruikshanks))
- Switch licence update in CreateTransactionService [\#298](https://github.com/DEFRA/sroc-charging-module-api/pull/298) ([Cruikshanks](https://github.com/Cruikshanks))
- Add CreateTransactionBillRunValidationService [\#297](https://github.com/DEFRA/sroc-charging-module-api/pull/297) ([Cruikshanks](https://github.com/Cruikshanks))
- Update CreateTransactionTallyService for UPSERT [\#295](https://github.com/DEFRA/sroc-charging-module-api/pull/295) ([Cruikshanks](https://github.com/Cruikshanks))
- Add base model that provides UPSERT support [\#294](https://github.com/DEFRA/sroc-charging-module-api/pull/294) ([Cruikshanks](https://github.com/Cruikshanks))
- Send File To S3 service [\#293](https://github.com/DEFRA/sroc-charging-module-api/pull/293) ([StuAA78](https://github.com/StuAA78))
- Add more data overrides to test LicenceHelper [\#291](https://github.com/DEFRA/sroc-charging-module-api/pull/291) ([Cruikshanks](https://github.com/Cruikshanks))
- Add transaction type to test GET endpoint [\#285](https://github.com/DEFRA/sroc-charging-module-api/pull/285) ([Cruikshanks](https://github.com/Cruikshanks))
- Initial Generate Transaction File Service [\#284](https://github.com/DEFRA/sroc-charging-module-api/pull/284) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix send bill run link to generate file issue [\#312](https://github.com/DEFRA/sroc-charging-module-api/pull/312) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix no SONAR\_TOKEN for dependabot PR's [\#292](https://github.com/DEFRA/sroc-charging-module-api/pull/292) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix deminimis/minimum charge defect [\#286](https://github.com/DEFRA/sroc-charging-module-api/pull/286) ([StuAA78](https://github.com/StuAA78))
- Revise BillRunModel.$netTotal\(\) to exclude deminimis [\#282](https://github.com/DEFRA/sroc-charging-module-api/pull/282) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Add new docker helpers for local development [\#314](https://github.com/DEFRA/sroc-charging-module-api/pull/314) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove tally fields from invoices in view bill run [\#313](https://github.com/DEFRA/sroc-charging-module-api/pull/313) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix Docker local permissions and bump Node version [\#311](https://github.com/DEFRA/sroc-charging-module-api/pull/311) ([StuAA78](https://github.com/StuAA78))
- Bump @aws-sdk/client-s3 from 3.8.1 to 3.9.0 [\#310](https://github.com/DEFRA/sroc-charging-module-api/pull/310) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove 'tally' fields from responses [\#306](https://github.com/DEFRA/sroc-charging-module-api/pull/306) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove redundant base model query and code [\#305](https://github.com/DEFRA/sroc-charging-module-api/pull/305) ([Cruikshanks](https://github.com/Cruikshanks))
- Refactor update bill run when creating transaction [\#304](https://github.com/DEFRA/sroc-charging-module-api/pull/304) ([Cruikshanks](https://github.com/Cruikshanks))
- Attempt to fix vulnerabilities in package.json [\#300](https://github.com/DEFRA/sroc-charging-module-api/pull/300) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump objection from 2.2.14 to 2.2.15 [\#296](https://github.com/DEFRA/sroc-charging-module-api/pull/296) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/hapi from 20.1.0 to 20.1.1 [\#290](https://github.com/DEFRA/sroc-charging-module-api/pull/290) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/code from 8.0.2 to 8.0.3 [\#289](https://github.com/DEFRA/sroc-charging-module-api/pull/289) ([dependabot[bot]](https://github.com/apps/dependabot))
- Housekeeping - Remove stray console.log\(\) calls [\#288](https://github.com/DEFRA/sroc-charging-module-api/pull/288) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix MaxListenersExceededWarning in tests [\#287](https://github.com/DEFRA/sroc-charging-module-api/pull/287) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump elliptic from 6.5.3 to 6.5.4 [\#277](https://github.com/DEFRA/sroc-charging-module-api/pull/277) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.6.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.6.0) (2021-03-10)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.5.0...v0.6.0)

**Implemented enhancements:**

- Connect Delete Bill Run service to endpoint [\#279](https://github.com/DEFRA/sroc-charging-module-api/pull/279) ([StuAA78](https://github.com/StuAA78))
- Delete Bill Run service [\#268](https://github.com/DEFRA/sroc-charging-module-api/pull/268) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix incorrect values on minimum charge transaction [\#281](https://github.com/DEFRA/sroc-charging-module-api/pull/281) ([Cruikshanks](https://github.com/Cruikshanks))
- Bill run summary net zero value fix [\#276](https://github.com/DEFRA/sroc-charging-module-api/pull/276) ([StuAA78](https://github.com/StuAA78))
- Fix deminimis invoices being included in bill run figures [\#273](https://github.com/DEFRA/sroc-charging-module-api/pull/273) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Update the view bill run response [\#278](https://github.com/DEFRA/sroc-charging-module-api/pull/278) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.5.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.5.0) (2021-03-08)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.4.0...v0.5.0)

**Implemented enhancements:**

- Hook up /send bill run endpoint to new service [\#275](https://github.com/DEFRA/sroc-charging-module-api/pull/275) ([Cruikshanks](https://github.com/Cruikshanks))
- Add SendBillRunReferenceService [\#272](https://github.com/DEFRA/sroc-charging-module-api/pull/272) ([Cruikshanks](https://github.com/Cruikshanks))
- Add NextFileReferenceService and migration [\#270](https://github.com/DEFRA/sroc-charging-module-api/pull/270) ([Cruikshanks](https://github.com/Cruikshanks))
- Link invoices table to bill\_runs table [\#269](https://github.com/DEFRA/sroc-charging-module-api/pull/269) ([StuAA78](https://github.com/StuAA78))
- Initial Delete Bill Run endpoint [\#267](https://github.com/DEFRA/sroc-charging-module-api/pull/267) ([StuAA78](https://github.com/StuAA78))
- Customer Details controller and endpoint [\#266](https://github.com/DEFRA/sroc-charging-module-api/pull/266) ([StuAA78](https://github.com/StuAA78))
- Add NextTransactionReferenceService and migration [\#265](https://github.com/DEFRA/sroc-charging-module-api/pull/265) ([Cruikshanks](https://github.com/Cruikshanks))
- Create Customer Details service [\#262](https://github.com/DEFRA/sroc-charging-module-api/pull/262) ([StuAA78](https://github.com/StuAA78))
- Handle call to /generate for generated bill run [\#260](https://github.com/DEFRA/sroc-charging-module-api/pull/260) ([Cruikshanks](https://github.com/Cruikshanks))
- Add signedChargeValue to ShowTransactionService [\#256](https://github.com/DEFRA/sroc-charging-module-api/pull/256) ([StuAA78](https://github.com/StuAA78))
- Create customers table [\#255](https://github.com/DEFRA/sroc-charging-module-api/pull/255) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Bump nock from 13.0.10 to 13.0.11 [\#274](https://github.com/DEFRA/sroc-charging-module-api/pull/274) ([dependabot[bot]](https://github.com/apps/dependabot))
- Limit create transaction returning\(\) fields [\#264](https://github.com/DEFRA/sroc-charging-module-api/pull/264) ([Cruikshanks](https://github.com/Cruikshanks))
- Rename & refactor licence service to use patch [\#263](https://github.com/DEFRA/sroc-charging-module-api/pull/263) ([Cruikshanks](https://github.com/Cruikshanks))
- Rename & refactor invoice service to use patch [\#261](https://github.com/DEFRA/sroc-charging-module-api/pull/261) ([Cruikshanks](https://github.com/Cruikshanks))
- Rename & refactor bill run service to use patch [\#259](https://github.com/DEFRA/sroc-charging-module-api/pull/259) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump knex from 0.21.18 to 0.21.19 [\#258](https://github.com/DEFRA/sroc-charging-module-api/pull/258) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nock from 13.0.9 to 13.0.10 [\#257](https://github.com/DEFRA/sroc-charging-module-api/pull/257) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add CreateTransactionTallyPatchService [\#254](https://github.com/DEFRA/sroc-charging-module-api/pull/254) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.4.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.4.0) (2021-03-02)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.3.0...v0.4.0)

**Implemented enhancements:**

- Update bill run status when last invoice is deleted [\#252](https://github.com/DEFRA/sroc-charging-module-api/pull/252) ([StuAA78](https://github.com/StuAA78))
- Connect Delete Invoice Service to controller [\#246](https://github.com/DEFRA/sroc-charging-module-api/pull/246) ([StuAA78](https://github.com/StuAA78))
- Add stand-in send bill run endpoint [\#245](https://github.com/DEFRA/sroc-charging-module-api/pull/245) ([Cruikshanks](https://github.com/Cruikshanks))
- Hook up view bill run invoice endpoint to service [\#244](https://github.com/DEFRA/sroc-charging-module-api/pull/244) ([Cruikshanks](https://github.com/Cruikshanks))
- Add view bill run invoice service [\#243](https://github.com/DEFRA/sroc-charging-module-api/pull/243) ([Cruikshanks](https://github.com/Cruikshanks))

**Fixed bugs:**

- CalculateChargeTranslator title case fix for two-word strings [\#250](https://github.com/DEFRA/sroc-charging-module-api/pull/250) ([StuAA78](https://github.com/StuAA78))

**Merged pull requests:**

- Remove bill run fetch and checks in BillRunService [\#253](https://github.com/DEFRA/sroc-charging-module-api/pull/253) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove approvedForBilling from view bill run [\#251](https://github.com/DEFRA/sroc-charging-module-api/pull/251) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump nock from 13.0.8 to 13.0.9 [\#249](https://github.com/DEFRA/sroc-charging-module-api/pull/249) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump got from 11.8.1 to 11.8.2 [\#248](https://github.com/DEFRA/sroc-charging-module-api/pull/248) ([dependabot[bot]](https://github.com/apps/dependabot))
- Housekeeping - correct test file name [\#242](https://github.com/DEFRA/sroc-charging-module-api/pull/242) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.3.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.3.0) (2021-02-26)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.2.0...v0.3.0)

**Implemented enhancements:**

- Hook up approve bill run endpoint to service [\#239](https://github.com/DEFRA/sroc-charging-module-api/pull/239) ([Cruikshanks](https://github.com/Cruikshanks))
- Add approve bill run service [\#237](https://github.com/DEFRA/sroc-charging-module-api/pull/237) ([Cruikshanks](https://github.com/Cruikshanks))
- Add bill run invoice validator [\#236](https://github.com/DEFRA/sroc-charging-module-api/pull/236) ([Cruikshanks](https://github.com/Cruikshanks))
- Add stand-in approve bill run endpoint [\#235](https://github.com/DEFRA/sroc-charging-module-api/pull/235) ([Cruikshanks](https://github.com/Cruikshanks))
- Add view licence presenter [\#230](https://github.com/DEFRA/sroc-charging-module-api/pull/230) ([Cruikshanks](https://github.com/Cruikshanks))
- Add view transaction presenter [\#229](https://github.com/DEFRA/sroc-charging-module-api/pull/229) ([Cruikshanks](https://github.com/Cruikshanks))
- Add references to licences and transactions tables [\#228](https://github.com/DEFRA/sroc-charging-module-api/pull/228) ([StuAA78](https://github.com/StuAA78))
- Add view invoice presenter [\#226](https://github.com/DEFRA/sroc-charging-module-api/pull/226) ([Cruikshanks](https://github.com/Cruikshanks))
- Add stand-in view bill run invoice endpoint [\#224](https://github.com/DEFRA/sroc-charging-module-api/pull/224) ([Cruikshanks](https://github.com/Cruikshanks))
- Add admin test view transaction endpoint [\#223](https://github.com/DEFRA/sroc-charging-module-api/pull/223) ([Cruikshanks](https://github.com/Cruikshanks))
- Create Delete Invoice Service [\#221](https://github.com/DEFRA/sroc-charging-module-api/pull/221) ([StuAA78](https://github.com/StuAA78))
- Add get bill run plugin [\#204](https://github.com/DEFRA/sroc-charging-module-api/pull/204) ([Cruikshanks](https://github.com/Cruikshanks))

**Fixed bugs:**

- Fix invoiceValue for minimum charge [\#241](https://github.com/DEFRA/sroc-charging-module-api/pull/241) ([StuAA78](https://github.com/StuAA78))
- Fix bill run $editable\(\) method [\#234](https://github.com/DEFRA/sroc-charging-module-api/pull/234) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Correct view bill run zero line count property [\#240](https://github.com/DEFRA/sroc-charging-module-api/pull/240) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump nock from 13.0.7 to 13.0.8 [\#238](https://github.com/DEFRA/sroc-charging-module-api/pull/238) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove redundant bill run 'gets' and 'checks' [\#233](https://github.com/DEFRA/sroc-charging-module-api/pull/233) ([Cruikshanks](https://github.com/Cruikshanks))
- Move bill run transaction actions to own ctrlr [\#232](https://github.com/DEFRA/sroc-charging-module-api/pull/232) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix inconsistent test bill run controller name [\#231](https://github.com/DEFRA/sroc-charging-module-api/pull/231) ([Cruikshanks](https://github.com/Cruikshanks))
- Amend remove invoice route [\#227](https://github.com/DEFRA/sroc-charging-module-api/pull/227) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump knex from 0.21.17 to 0.21.18 [\#225](https://github.com/DEFRA/sroc-charging-module-api/pull/225) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/lab from 24.1.0 to 24.1.1 [\#222](https://github.com/DEFRA/sroc-charging-module-api/pull/222) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v0.2.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.2.0) (2021-02-19)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/v0.1.0...v0.2.0)

**Implemented enhancements:**

- Initial Delete Invoice controller and endpoint [\#219](https://github.com/DEFRA/sroc-charging-module-api/pull/219) ([StuAA78](https://github.com/StuAA78))
- Error handling for rules service responses [\#215](https://github.com/DEFRA/sroc-charging-module-api/pull/215) ([StuAA78](https://github.com/StuAA78))
- Add stand-in view bill run transaction endpoint [\#211](https://github.com/DEFRA/sroc-charging-module-api/pull/211) ([Cruikshanks](https://github.com/Cruikshanks))
- Add view bill run endpoint using ViewBillRunService [\#209](https://github.com/DEFRA/sroc-charging-module-api/pull/209) ([StuAA78](https://github.com/StuAA78))
- Amend transactions and invoices tables [\#208](https://github.com/DEFRA/sroc-charging-module-api/pull/208) ([StuAA78](https://github.com/StuAA78))
- Add bill run ID to generate bill run time logging [\#206](https://github.com/DEFRA/sroc-charging-module-api/pull/206) ([Cruikshanks](https://github.com/Cruikshanks))
- Minimum charge invoice flag [\#205](https://github.com/DEFRA/sroc-charging-module-api/pull/205) ([StuAA78](https://github.com/StuAA78))
- Title case loss, season & source values in charge [\#202](https://github.com/DEFRA/sroc-charging-module-api/pull/202) ([Cruikshanks](https://github.com/Cruikshanks))
- Add test only bill run generator [\#199](https://github.com/DEFRA/sroc-charging-module-api/pull/199) ([Cruikshanks](https://github.com/Cruikshanks))
- Create View Bill Run Service [\#198](https://github.com/DEFRA/sroc-charging-module-api/pull/198) ([StuAA78](https://github.com/StuAA78))
- Validate water undertaker is boolean in charge [\#197](https://github.com/DEFRA/sroc-charging-module-api/pull/197) ([Cruikshanks](https://github.com/Cruikshanks))
- Output generate bill run timing [\#196](https://github.com/DEFRA/sroc-charging-module-api/pull/196) ([StuAA78](https://github.com/StuAA78))
- Hook bill run status service to controller [\#192](https://github.com/DEFRA/sroc-charging-module-api/pull/192) ([Cruikshanks](https://github.com/Cruikshanks))
- Add bill run status presenter [\#190](https://github.com/DEFRA/sroc-charging-module-api/pull/190) ([Cruikshanks](https://github.com/Cruikshanks))
- Add bill run status service [\#187](https://github.com/DEFRA/sroc-charging-module-api/pull/187) ([Cruikshanks](https://github.com/Cruikshanks))
- Add stand-in bill run /status endpoint [\#186](https://github.com/DEFRA/sroc-charging-module-api/pull/186) ([Cruikshanks](https://github.com/Cruikshanks))
- Generate bill run [\#181](https://github.com/DEFRA/sroc-charging-module-api/pull/181) ([StuAA78](https://github.com/StuAA78))
- Add minimum charge to generate bill run service [\#174](https://github.com/DEFRA/sroc-charging-module-api/pull/174) ([StuAA78](https://github.com/StuAA78))
- Add Database error plugin [\#172](https://github.com/DEFRA/sroc-charging-module-api/pull/172) ([Cruikshanks](https://github.com/Cruikshanks))
- Prevent duplicate transactions with clientID check [\#168](https://github.com/DEFRA/sroc-charging-module-api/pull/168) ([Cruikshanks](https://github.com/Cruikshanks))
- Calculate Minimum Charge Transaction service [\#164](https://github.com/DEFRA/sroc-charging-module-api/pull/164) ([StuAA78](https://github.com/StuAA78))
- Add trans. region must match bill run check [\#162](https://github.com/DEFRA/sroc-charging-module-api/pull/162) ([Cruikshanks](https://github.com/Cruikshanks))
- Add version info to responses plugin [\#157](https://github.com/DEFRA/sroc-charging-module-api/pull/157) ([Cruikshanks](https://github.com/Cruikshanks))
- Create Minimum Charge Adjustment service [\#156](https://github.com/DEFRA/sroc-charging-module-api/pull/156) ([StuAA78](https://github.com/StuAA78))
- Add git and docker tags to Docker image [\#155](https://github.com/DEFRA/sroc-charging-module-api/pull/155) ([Cruikshanks](https://github.com/Cruikshanks))
- Create Generate Bill Run Summary endpoint [\#151](https://github.com/DEFRA/sroc-charging-module-api/pull/151) ([StuAA78](https://github.com/StuAA78))
- Add summary to bill run service [\#147](https://github.com/DEFRA/sroc-charging-module-api/pull/147) ([StuAA78](https://github.com/StuAA78))
- Add licence model and service [\#146](https://github.com/DEFRA/sroc-charging-module-api/pull/146) ([StuAA78](https://github.com/StuAA78))
- Add bill run status check to add transaction [\#145](https://github.com/DEFRA/sroc-charging-module-api/pull/145) ([Cruikshanks](https://github.com/Cruikshanks))
- Alter transactions to use BigInts [\#141](https://github.com/DEFRA/sroc-charging-module-api/pull/141) ([Cruikshanks](https://github.com/Cruikshanks))
- Add invoice model and service [\#140](https://github.com/DEFRA/sroc-charging-module-api/pull/140) ([StuAA78](https://github.com/StuAA78))
- Add foreign key constraint to bill run id in trans [\#134](https://github.com/DEFRA/sroc-charging-module-api/pull/134) ([Cruikshanks](https://github.com/Cruikshanks))
- Link add transaction endpoint with service [\#131](https://github.com/DEFRA/sroc-charging-module-api/pull/131) ([Cruikshanks](https://github.com/Cruikshanks))
- Retain rules service response in translator [\#114](https://github.com/DEFRA/sroc-charging-module-api/pull/114) ([Cruikshanks](https://github.com/Cruikshanks))
- Allow access to validatedData in translators [\#108](https://github.com/DEFRA/sroc-charging-module-api/pull/108) ([Cruikshanks](https://github.com/Cruikshanks))
- Add create transaction service [\#107](https://github.com/DEFRA/sroc-charging-module-api/pull/107) ([Cruikshanks](https://github.com/Cruikshanks))
- Add create transaction presenter [\#106](https://github.com/DEFRA/sroc-charging-module-api/pull/106) ([Cruikshanks](https://github.com/Cruikshanks))

**Fixed bugs:**

- Fix docker build issues due to bill run generator [\#213](https://github.com/DEFRA/sroc-charging-module-api/pull/213) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix missing bill run to licence relationship [\#203](https://github.com/DEFRA/sroc-charging-module-api/pull/203) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix update of invoice for minimum charge [\#200](https://github.com/DEFRA/sroc-charging-module-api/pull/200) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix minimum charge issues in generate bill run [\#195](https://github.com/DEFRA/sroc-charging-module-api/pull/195) ([StuAA78](https://github.com/StuAA78))
- Fix Invoice deminimis query modifier [\#194](https://github.com/DEFRA/sroc-charging-module-api/pull/194) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix bill run generate request type \(PATCH vs POST\) [\#193](https://github.com/DEFRA/sroc-charging-module-api/pull/193) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix section126Factor in CalculateChargeTranslator [\#191](https://github.com/DEFRA/sroc-charging-module-api/pull/191) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix bill runs credit and invoice count column type [\#188](https://github.com/DEFRA/sroc-charging-module-api/pull/188) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix not requiring area/region code in transaction create [\#185](https://github.com/DEFRA/sroc-charging-module-api/pull/185) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix missing client Id in create transaction [\#184](https://github.com/DEFRA/sroc-charging-module-api/pull/184) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix incorrect transaction validation [\#183](https://github.com/DEFRA/sroc-charging-module-api/pull/183) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix admin requests to regime paths return 500 [\#182](https://github.com/DEFRA/sroc-charging-module-api/pull/182) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix waterundertaker validation on charge [\#180](https://github.com/DEFRA/sroc-charging-module-api/pull/180) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix Joi validations using US date format [\#170](https://github.com/DEFRA/sroc-charging-module-api/pull/170) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix ensure volume is required for charge and trans [\#169](https://github.com/DEFRA/sroc-charging-module-api/pull/169) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix 500 error when compensation charge set to true [\#166](https://github.com/DEFRA/sroc-charging-module-api/pull/166) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix create bill run returns 500 if region missing [\#163](https://github.com/DEFRA/sroc-charging-module-api/pull/163) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix missing knexfile.application.js to docker [\#154](https://github.com/DEFRA/sroc-charging-module-api/pull/154) ([Cruikshanks](https://github.com/Cruikshanks))
- Add default for status in bill run table [\#132](https://github.com/DEFRA/sroc-charging-module-api/pull/132) ([Cruikshanks](https://github.com/Cruikshanks))
- Revert making \_data enumerable in base translator [\#122](https://github.com/DEFRA/sroc-charging-module-api/pull/122) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Add seed run script to package.json [\#220](https://github.com/DEFRA/sroc-charging-module-api/pull/220) ([Cruikshanks](https://github.com/Cruikshanks))
- Make transaction tracking properties consistent [\#218](https://github.com/DEFRA/sroc-charging-module-api/pull/218) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove pre-sroc \(ruleset\) from view bill run [\#217](https://github.com/DEFRA/sroc-charging-module-api/pull/217) ([Cruikshanks](https://github.com/Cruikshanks))
- Add system user seed [\#216](https://github.com/DEFRA/sroc-charging-module-api/pull/216) ([Cruikshanks](https://github.com/Cruikshanks))
- Add support for automated builds in Docker Hub [\#214](https://github.com/DEFRA/sroc-charging-module-api/pull/214) ([Cruikshanks](https://github.com/Cruikshanks))
- Allow period start to be same as period end date [\#210](https://github.com/DEFRA/sroc-charging-module-api/pull/210) ([Cruikshanks](https://github.com/Cruikshanks))
- Add error handling to GenerateBillRunService [\#207](https://github.com/DEFRA/sroc-charging-module-api/pull/207) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @now-ims/hapi-now-auth from 2.0.2 to 2.0.3 [\#201](https://github.com/DEFRA/sroc-charging-module-api/pull/201) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump joi from 17.3.0 to 17.4.0 [\#189](https://github.com/DEFRA/sroc-charging-module-api/pull/189) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump knex from 0.21.16 to 0.21.17 [\#179](https://github.com/DEFRA/sroc-charging-module-api/pull/179) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump objection from 2.2.12 to 2.2.14 [\#178](https://github.com/DEFRA/sroc-charging-module-api/pull/178) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nock from 13.0.6 to 13.0.7 [\#177](https://github.com/DEFRA/sroc-charging-module-api/pull/177) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add uuid4 generator to test GeneralHelper [\#176](https://github.com/DEFRA/sroc-charging-module-api/pull/176) ([Cruikshanks](https://github.com/Cruikshanks))
- Add new test transaction helper [\#175](https://github.com/DEFRA/sroc-charging-module-api/pull/175) ([Cruikshanks](https://github.com/Cruikshanks))
- Refactor cloning in bill runs ctrlr test [\#173](https://github.com/DEFRA/sroc-charging-module-api/pull/173) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump objection from 2.2.11 to 2.2.12 [\#167](https://github.com/DEFRA/sroc-charging-module-api/pull/167) ([dependabot[bot]](https://github.com/apps/dependabot))
- Minimum charge database changes [\#165](https://github.com/DEFRA/sroc-charging-module-api/pull/165) ([StuAA78](https://github.com/StuAA78))
- Bump objection from 2.2.10 to 2.2.11 [\#161](https://github.com/DEFRA/sroc-charging-module-api/pull/161) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @hapi/hapi from 20.0.3 to 20.1.0 [\#160](https://github.com/DEFRA/sroc-charging-module-api/pull/160) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump objection from 2.2.7 to 2.2.10 [\#159](https://github.com/DEFRA/sroc-charging-module-api/pull/159) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump sinon from 9.2.3 to 9.2.4 [\#158](https://github.com/DEFRA/sroc-charging-module-api/pull/158) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nock from 13.0.5 to 13.0.6 [\#152](https://github.com/DEFRA/sroc-charging-module-api/pull/152) ([dependabot[bot]](https://github.com/apps/dependabot))
- Fix snake case fields in database [\#150](https://github.com/DEFRA/sroc-charging-module-api/pull/150) ([StuAA78](https://github.com/StuAA78))
- Bump knex from 0.21.15 to 0.21.16 [\#149](https://github.com/DEFRA/sroc-charging-module-api/pull/149) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump objection from 2.2.6 to 2.2.7 [\#148](https://github.com/DEFRA/sroc-charging-module-api/pull/148) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump objection from 2.2.5 to 2.2.6 [\#144](https://github.com/DEFRA/sroc-charging-module-api/pull/144) ([dependabot[bot]](https://github.com/apps/dependabot))
- Change some instances of ' use strict' to 'use strict' [\#143](https://github.com/DEFRA/sroc-charging-module-api/pull/143) ([StuAA78](https://github.com/StuAA78))
- Bump objection from 2.2.4 to 2.2.5 [\#139](https://github.com/DEFRA/sroc-charging-module-api/pull/139) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nodemon from 2.0.6 to 2.0.7 [\#138](https://github.com/DEFRA/sroc-charging-module-api/pull/138) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump sinon from 9.2.2 to 9.2.3 [\#137](https://github.com/DEFRA/sroc-charging-module-api/pull/137) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump objection from 2.2.3 to 2.2.4 [\#136](https://github.com/DEFRA/sroc-charging-module-api/pull/136) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump knex from 0.21.14 to 0.21.15 [\#135](https://github.com/DEFRA/sroc-charging-module-api/pull/135) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove bill run number from transactions [\#133](https://github.com/DEFRA/sroc-charging-module-api/pull/133) ([Cruikshanks](https://github.com/Cruikshanks))
- Remove transactions controller [\#130](https://github.com/DEFRA/sroc-charging-module-api/pull/130) ([Cruikshanks](https://github.com/Cruikshanks))
- Refactor add bill run transaction controller [\#129](https://github.com/DEFRA/sroc-charging-module-api/pull/129) ([Cruikshanks](https://github.com/Cruikshanks))
- Add missing test coverage 4 RulesServiceTranslator [\#128](https://github.com/DEFRA/sroc-charging-module-api/pull/128) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix sucFactor from rules service not translated [\#127](https://github.com/DEFRA/sroc-charging-module-api/pull/127) ([Cruikshanks](https://github.com/Cruikshanks))
- Access rules service result from charge service [\#126](https://github.com/DEFRA/sroc-charging-module-api/pull/126) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Calculate Charge Translator expect Regime slug [\#125](https://github.com/DEFRA/sroc-charging-module-api/pull/125) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @airbrake/node from 1.4.1 to 1.4.2 [\#124](https://github.com/DEFRA/sroc-charging-module-api/pull/124) ([dependabot[bot]](https://github.com/apps/dependabot))
- Simplify auth. system creation in service [\#123](https://github.com/DEFRA/sroc-charging-module-api/pull/123) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Bill Run Translator expect Auth. System Id [\#121](https://github.com/DEFRA/sroc-charging-module-api/pull/121) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Bill Run Translator to expect Regime Id [\#120](https://github.com/DEFRA/sroc-charging-module-api/pull/120) ([Cruikshanks](https://github.com/Cruikshanks))
- Manage values to persist in bill run translator [\#119](https://github.com/DEFRA/sroc-charging-module-api/pull/119) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Trans. Translator to expect Auth. System Id [\#118](https://github.com/DEFRA/sroc-charging-module-api/pull/118) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Trans. Translator to expect Regime Id [\#117](https://github.com/DEFRA/sroc-charging-module-api/pull/117) ([Cruikshanks](https://github.com/Cruikshanks))
- Update Trans. Translator to expect bill run id [\#116](https://github.com/DEFRA/sroc-charging-module-api/pull/116) ([Cruikshanks](https://github.com/Cruikshanks))
- Add default ruleset property to Trans. translator [\#115](https://github.com/DEFRA/sroc-charging-module-api/pull/115) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix chargePeriodEnd vs periodEnd in trans. [\#113](https://github.com/DEFRA/sroc-charging-module-api/pull/113) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix chargePeriodStart vs periodStart in trans. [\#112](https://github.com/DEFRA/sroc-charging-module-api/pull/112) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix chargeFinancialYear vs financialYear in trans. [\#111](https://github.com/DEFRA/sroc-charging-module-api/pull/111) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix charge credit vs credit in transaction [\#110](https://github.com/DEFRA/sroc-charging-module-api/pull/110) ([Cruikshanks](https://github.com/Cruikshanks))
- Update transaction model relations [\#109](https://github.com/DEFRA/sroc-charging-module-api/pull/109) ([Cruikshanks](https://github.com/Cruikshanks))

## [v0.1.0](https://github.com/DEFRA/sroc-charging-module-api/tree/v0.1.0) (2020-12-20)

[Full Changelog](https://github.com/DEFRA/sroc-charging-module-api/compare/709148b3251dae9885eaac1cb8bb1eb6486546a5...v0.1.0)

**Implemented enhancements:**

- Add stop \(SIGTERM\) plugin [\#105](https://github.com/DEFRA/sroc-charging-module-api/pull/105) ([Cruikshanks](https://github.com/Cruikshanks))
- Transaction translator [\#104](https://github.com/DEFRA/sroc-charging-module-api/pull/104) ([StuAA78](https://github.com/StuAA78))
- Add --shuffle parameter to lab [\#102](https://github.com/DEFRA/sroc-charging-module-api/pull/102) ([StuAA78](https://github.com/StuAA78))
- Multi-stage docker build [\#101](https://github.com/DEFRA/sroc-charging-module-api/pull/101) ([StuAA78](https://github.com/StuAA78))
- Add alter transaction table migration [\#99](https://github.com/DEFRA/sroc-charging-module-api/pull/99) ([Cruikshanks](https://github.com/Cruikshanks))
- Override default hapi router options [\#98](https://github.com/DEFRA/sroc-charging-module-api/pull/98) ([Cruikshanks](https://github.com/Cruikshanks))
- Create Bill Run presenter [\#97](https://github.com/DEFRA/sroc-charging-module-api/pull/97) ([StuAA78](https://github.com/StuAA78))
- Add bill run number to create bill run [\#94](https://github.com/DEFRA/sroc-charging-module-api/pull/94) ([StuAA78](https://github.com/StuAA78))
- Update PostgreSQl dependence to v12 [\#93](https://github.com/DEFRA/sroc-charging-module-api/pull/93) ([Cruikshanks](https://github.com/Cruikshanks))
- Only allow 'active' authorised systems [\#92](https://github.com/DEFRA/sroc-charging-module-api/pull/92) ([Cruikshanks](https://github.com/Cruikshanks))
- Create sequence counters [\#91](https://github.com/DEFRA/sroc-charging-module-api/pull/91) ([StuAA78](https://github.com/StuAA78))
- Automatically parse DB bigints as JavaScript Ints [\#83](https://github.com/DEFRA/sroc-charging-module-api/pull/83) ([Cruikshanks](https://github.com/Cruikshanks))
- Create add transaction endpoint [\#80](https://github.com/DEFRA/sroc-charging-module-api/pull/80) ([StuAA78](https://github.com/StuAA78))
- Create transaction model [\#79](https://github.com/DEFRA/sroc-charging-module-api/pull/79) ([StuAA78](https://github.com/StuAA78))
- Add pre-sroc transaction translator [\#78](https://github.com/DEFRA/sroc-charging-module-api/pull/78) ([Cruikshanks](https://github.com/Cruikshanks))
- Add not-supported controller to project [\#75](https://github.com/DEFRA/sroc-charging-module-api/pull/75) ([Cruikshanks](https://github.com/Cruikshanks))
- Update bill runs ctrlr. to use new functionality [\#74](https://github.com/DEFRA/sroc-charging-module-api/pull/74) ([Cruikshanks](https://github.com/Cruikshanks))
- Add create bill run service [\#73](https://github.com/DEFRA/sroc-charging-module-api/pull/73) ([Cruikshanks](https://github.com/Cruikshanks))
- Add bill run table and model [\#72](https://github.com/DEFRA/sroc-charging-module-api/pull/72) ([Cruikshanks](https://github.com/Cruikshanks))
- Add pre-sroc bill run translator [\#71](https://github.com/DEFRA/sroc-charging-module-api/pull/71) ([Cruikshanks](https://github.com/Cruikshanks))
- Add database health check controller [\#69](https://github.com/DEFRA/sroc-charging-module-api/pull/69) ([Cruikshanks](https://github.com/Cruikshanks))
- Add new create authorised system endpoint [\#68](https://github.com/DEFRA/sroc-charging-module-api/pull/68) ([Cruikshanks](https://github.com/Cruikshanks))
- Add authorised systems show endpoint [\#67](https://github.com/DEFRA/sroc-charging-module-api/pull/67) ([Cruikshanks](https://github.com/Cruikshanks))
- Add authorised systems index endpoint [\#66](https://github.com/DEFRA/sroc-charging-module-api/pull/66) ([Cruikshanks](https://github.com/Cruikshanks))
- Implement regime authorisation fully [\#57](https://github.com/DEFRA/sroc-charging-module-api/pull/57) ([Cruikshanks](https://github.com/Cruikshanks))
- Add many-to-many rel. for Auth. System and Regime [\#55](https://github.com/DEFRA/sroc-charging-module-api/pull/55) ([Cruikshanks](https://github.com/Cruikshanks))
- Add new base model class [\#54](https://github.com/DEFRA/sroc-charging-module-api/pull/54) ([Cruikshanks](https://github.com/Cruikshanks))
- Add custom plugin to handle 'cleaning' payloads [\#40](https://github.com/DEFRA/sroc-charging-module-api/pull/40) ([Cruikshanks](https://github.com/Cruikshanks))
- Add SOP data validation plugin [\#37](https://github.com/DEFRA/sroc-charging-module-api/pull/37) ([Cruikshanks](https://github.com/Cruikshanks))
- SRoC calculate charge controller [\#34](https://github.com/DEFRA/sroc-charging-module-api/pull/34) ([StuAA78](https://github.com/StuAA78))
- Update calculate charge service based on recent discussion [\#32](https://github.com/DEFRA/sroc-charging-module-api/pull/32) ([StuAA78](https://github.com/StuAA78))
- Create charge to user presenter [\#30](https://github.com/DEFRA/sroc-charging-module-api/pull/30) ([StuAA78](https://github.com/StuAA78))
- Amend chargeValue and baselineCharge to be integers [\#29](https://github.com/DEFRA/sroc-charging-module-api/pull/29) ([StuAA78](https://github.com/StuAA78))
- Create rules service translator [\#27](https://github.com/DEFRA/sroc-charging-module-api/pull/27) ([StuAA78](https://github.com/StuAA78))
- Add logging plugin [\#24](https://github.com/DEFRA/sroc-charging-module-api/pull/24) ([Cruikshanks](https://github.com/Cruikshanks))
- Add Unescape sanitized HTML characters plugin [\#22](https://github.com/DEFRA/sroc-charging-module-api/pull/22) ([Cruikshanks](https://github.com/Cruikshanks))
- Create charge-to-rules service presenter [\#18](https://github.com/DEFRA/sroc-charging-module-api/pull/18) ([StuAA78](https://github.com/StuAA78))
- Create request-to-charge translator [\#14](https://github.com/DEFRA/sroc-charging-module-api/pull/14) ([StuAA78](https://github.com/StuAA78))
- Create Charge model [\#13](https://github.com/DEFRA/sroc-charging-module-api/pull/13) ([StuAA78](https://github.com/StuAA78))
- Enable JWT token expiry checking [\#12](https://github.com/DEFRA/sroc-charging-module-api/pull/12) ([Cruikshanks](https://github.com/Cruikshanks))
- Implement Calculate Charge Service [\#10](https://github.com/DEFRA/sroc-charging-module-api/pull/10) ([StuAA78](https://github.com/StuAA78))
- Implement Rules Service [\#9](https://github.com/DEFRA/sroc-charging-module-api/pull/9) ([StuAA78](https://github.com/StuAA78))
- Create authorised systems [\#7](https://github.com/DEFRA/sroc-charging-module-api/pull/7) ([StuAA78](https://github.com/StuAA78))
- Add Airbrake error logging to the project [\#6](https://github.com/DEFRA/sroc-charging-module-api/pull/6) ([Cruikshanks](https://github.com/Cruikshanks))
- Add disinfect plugin to santize inputs to the API [\#4](https://github.com/DEFRA/sroc-charging-module-api/pull/4) ([Cruikshanks](https://github.com/Cruikshanks))
- Set up CI [\#1](https://github.com/DEFRA/sroc-charging-module-api/pull/1) ([StuAA78](https://github.com/StuAA78))

**Fixed bugs:**

- Fix issue with authorised system migration scripts [\#103](https://github.com/DEFRA/sroc-charging-module-api/pull/103) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix dev dependencies in production - again! [\#96](https://github.com/DEFRA/sroc-charging-module-api/pull/96) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix reliance on dev-only dependencies in prod. [\#95](https://github.com/DEFRA/sroc-charging-module-api/pull/95) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix not handling unknown client id [\#90](https://github.com/DEFRA/sroc-charging-module-api/pull/90) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix calculate charge dependence on unknown region [\#77](https://github.com/DEFRA/sroc-charging-module-api/pull/77) ([Cruikshanks](https://github.com/Cruikshanks))
- Make docker Node friendly [\#65](https://github.com/DEFRA/sroc-charging-module-api/pull/65) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix payload plugins for arrays and boolean true [\#49](https://github.com/DEFRA/sroc-charging-module-api/pull/49) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix cleanse payload rejecting false booleans [\#46](https://github.com/DEFRA/sroc-charging-module-api/pull/46) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix airbrake controller test [\#15](https://github.com/DEFRA/sroc-charging-module-api/pull/15) ([Cruikshanks](https://github.com/Cruikshanks))

**Merged pull requests:**

- Bump knex from 0.21.13 to 0.21.14 [\#100](https://github.com/DEFRA/sroc-charging-module-api/pull/100) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump knex from 0.21.12 to 0.21.13 [\#89](https://github.com/DEFRA/sroc-charging-module-api/pull/89) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump sinon from 9.2.1 to 9.2.2 [\#88](https://github.com/DEFRA/sroc-charging-module-api/pull/88) ([dependabot[bot]](https://github.com/apps/dependabot))
- Migrate calculate charge from SROC to PRESROC [\#87](https://github.com/DEFRA/sroc-charging-module-api/pull/87) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump ini from 1.3.5 to 1.3.7 [\#86](https://github.com/DEFRA/sroc-charging-module-api/pull/86) ([dependabot[bot]](https://github.com/apps/dependabot))
- Fix sonarcloud smell - return regimes directly [\#85](https://github.com/DEFRA/sroc-charging-module-api/pull/85) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump got from 11.8.0 to 11.8.1 [\#84](https://github.com/DEFRA/sroc-charging-module-api/pull/84) ([dependabot[bot]](https://github.com/apps/dependabot))
- Make docker dev environment more distinct [\#82](https://github.com/DEFRA/sroc-charging-module-api/pull/82) ([Cruikshanks](https://github.com/Cruikshanks))
- Pre-update the transactions controllers [\#76](https://github.com/DEFRA/sroc-charging-module-api/pull/76) ([Cruikshanks](https://github.com/Cruikshanks))
- Use knex config to handle multiple environments [\#70](https://github.com/DEFRA/sroc-charging-module-api/pull/70) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @hapi/hapi from 20.0.2 to 20.0.3 [\#64](https://github.com/DEFRA/sroc-charging-module-api/pull/64) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump blipp from 4.0.1 to 4.0.2 [\#63](https://github.com/DEFRA/sroc-charging-module-api/pull/63) ([dependabot[bot]](https://github.com/apps/dependabot))
- Start using service for regimes show endpoint [\#62](https://github.com/DEFRA/sroc-charging-module-api/pull/62) ([Cruikshanks](https://github.com/Cruikshanks))
- Start using service for regimes index endpoint [\#61](https://github.com/DEFRA/sroc-charging-module-api/pull/61) ([Cruikshanks](https://github.com/Cruikshanks))
- Implement Docker [\#60](https://github.com/DEFRA/sroc-charging-module-api/pull/60) ([StuAA78](https://github.com/StuAA78))
- Underscores in urls? Oh my! [\#59](https://github.com/DEFRA/sroc-charging-module-api/pull/59) ([Cruikshanks](https://github.com/Cruikshanks))
- Change .call\(\) to .go\(\) [\#58](https://github.com/DEFRA/sroc-charging-module-api/pull/58) ([StuAA78](https://github.com/StuAA78))
- Hide skipped tests [\#53](https://github.com/DEFRA/sroc-charging-module-api/pull/53) ([StuAA78](https://github.com/StuAA78))
- Move regimes endpoint to /admin path [\#52](https://github.com/DEFRA/sroc-charging-module-api/pull/52) ([Cruikshanks](https://github.com/Cruikshanks))
- Update seed files to use async / await pattern [\#51](https://github.com/DEFRA/sroc-charging-module-api/pull/51) ([Cruikshanks](https://github.com/Cruikshanks))
- Update authorised\_systems to use conventional id [\#50](https://github.com/DEFRA/sroc-charging-module-api/pull/50) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump pg from 8.5.0 to 8.5.1 [\#47](https://github.com/DEFRA/sroc-charging-module-api/pull/47) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add back check for use of `only()` in tests to CI [\#45](https://github.com/DEFRA/sroc-charging-module-api/pull/45) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @hapi/hapi from 20.0.1 to 20.0.2 [\#44](https://github.com/DEFRA/sroc-charging-module-api/pull/44) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pg from 8.4.2 to 8.5.0 [\#43](https://github.com/DEFRA/sroc-charging-module-api/pull/43) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nock from 13.0.4 to 13.0.5 [\#42](https://github.com/DEFRA/sroc-charging-module-api/pull/42) ([dependabot[bot]](https://github.com/apps/dependabot))
- Switch to using GitHub Actions for CI [\#41](https://github.com/DEFRA/sroc-charging-module-api/pull/41) ([Cruikshanks](https://github.com/Cruikshanks))
- Move existing onCredentials hook to plugin [\#39](https://github.com/DEFRA/sroc-charging-module-api/pull/39) ([Cruikshanks](https://github.com/Cruikshanks))
- Move the existing onRequest hook to a plugin [\#38](https://github.com/DEFRA/sroc-charging-module-api/pull/38) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump knex from 0.21.8 to 0.21.12 [\#36](https://github.com/DEFRA/sroc-charging-module-api/pull/36) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump sinon from 9.2.0 to 9.2.1 [\#31](https://github.com/DEFRA/sroc-charging-module-api/pull/31) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump knex from 0.21.7 to 0.21.8 [\#28](https://github.com/DEFRA/sroc-charging-module-api/pull/28) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump pg from 8.4.1 to 8.4.2 [\#26](https://github.com/DEFRA/sroc-charging-module-api/pull/26) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump knex from 0.21.6 to 0.21.7 [\#25](https://github.com/DEFRA/sroc-charging-module-api/pull/25) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add check for use of `only()` in tests to travis [\#23](https://github.com/DEFRA/sroc-charging-module-api/pull/23) ([Cruikshanks](https://github.com/Cruikshanks))
- Fix some sonarcloud code smells [\#21](https://github.com/DEFRA/sroc-charging-module-api/pull/21) ([Cruikshanks](https://github.com/Cruikshanks))
- Housekeeping and consistency changes [\#20](https://github.com/DEFRA/sroc-charging-module-api/pull/20) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump @hapi/lab from 24.0.0 to 24.1.0 [\#19](https://github.com/DEFRA/sroc-charging-module-api/pull/19) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump got from 11.7.0 to 11.8.0 [\#17](https://github.com/DEFRA/sroc-charging-module-api/pull/17) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump nodemon from 2.0.5 to 2.0.6 [\#16](https://github.com/DEFRA/sroc-charging-module-api/pull/16) ([dependabot[bot]](https://github.com/apps/dependabot))
- Move airbrake controller to `/admin/health` [\#11](https://github.com/DEFRA/sroc-charging-module-api/pull/11) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump nodemon from 2.0.4 to 2.0.5 [\#8](https://github.com/DEFRA/sroc-charging-module-api/pull/8) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Enable  show scope option in Blipp plugin [\#5](https://github.com/DEFRA/sroc-charging-module-api/pull/5) ([Cruikshanks](https://github.com/Cruikshanks))
- Bump pg from 8.4.0 to 8.4.1 [\#3](https://github.com/DEFRA/sroc-charging-module-api/pull/3) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Remove `host` from server.config.js [\#2](https://github.com/DEFRA/sroc-charging-module-api/pull/2) ([Cruikshanks](https://github.com/Cruikshanks))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
