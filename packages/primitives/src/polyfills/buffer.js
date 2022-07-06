module.exports = require('buffer')

// For some reason this doesn't work. If you comment it does with node >16
module.exports.Blob = require('formdata-node').Blob
// module.exports.atob = (enc) => Buffer.from(enc, 'base64').toString('binary')
// module.exports.btoa = (str) => Buffer.from(str, 'binary').toString('base64')
