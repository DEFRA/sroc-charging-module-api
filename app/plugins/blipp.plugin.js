/**
 * Plugin to output the routes table to console at startup.
 *
 * It organizes the display per connection so if you have multiple connections you can easily ensure that you've done
 * your routing table correctly.
 *
 * An example of the output
 *
 * ```
 *   method  path                     auth          scope  description
 *   ------  -----------------------  ------------  -----  -----------
 *   GET     /                        none          none
 *   GET     /regimes                 jwt-strategy  admin
 *   GET     /regimes/{id}            jwt-strategy  admin
 *   GET     /status                  none          none
 *   GET     /v1/{regimeId}/billruns  jwt-strategy  none
 *   GET     /v2/{regimeId}/billruns  jwt-strategy  none
 * ```
 *
 * {@link https://github.com/danielb2/blipp}
 *
 * @module BlippPlugin
 */

const Blipp = require('blipp')

const BlippPlugin = {
  plugin: Blipp,
  options: {
    showAuth: true,
    showScope: true
  }
}

module.exports = BlippPlugin
