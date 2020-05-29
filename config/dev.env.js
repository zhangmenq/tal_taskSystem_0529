'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
  // API_ROOT: '"http://test-zuoye.hiworld.com:8080/api"'
})
