const jwkToPem = require('jwk-to-pem')
const fs = require('fs')
const axios = require('axios')

if (!process.argv.length)
  throw 'URL for jwks required'

// get the jwks json file keys
let url = process.argv[2]
axios.get(url).then((response) => {
  let jwks = response.data
  var keys = jwks['keys']
  let pems = {}

  // append keys to pem
  for (var i = 0; i < keys.length; i++) {
    var keyId = keys[i].kid
    var modulus = keys[i].n
    var exponent = keys[i].e
    var keyType = keys[i].kty
    var jwk = { kty: keyType, n: modulus, e: exponent }
    var pem = jwkToPem(jwk)
    pems[keyId] = pem
  }

  // write the pem file
  fs.writeFile('../jwks-pem.json', JSON.stringify(pems), () => {
    console.log('pem file successfully, check it out ../jwks-pem.json')
  })
}).catch((err) => {
  console.log(`Error downloading file: ${err}`)
})
