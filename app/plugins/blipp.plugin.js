/*
  Plugin to display the routes table to console at startup. It organizes the
  display per connection so if you have multiple connections you can easily
  ensure that you've done your routing table correctly.
*/
const Blipp = require('blipp')

const blipp = {
  plugin: Blipp,
  options: {
    showAuth: true
  }
}

module.exports = blipp
