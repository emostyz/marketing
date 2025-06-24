const http = require('http')

function testServerConnection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/',
      method: 'GET'
    }

    const req = http.request(options, (res) => {
      console.log(`Server status: ${res.statusCode}`)
      if (res.statusCode === 200) {
        resolve(true)
      } else {
        reject(new Error(`Server responded with status: ${res.statusCode}`))
      }
    })

    req.on('error', (e) => {
      reject(new Error(`Server connection error: ${e.message}`))
    })

    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Connection timeout'))
    })

    req.end()
  })
}

testServerConnection()
  .then(() => console.log('✅ Server is accessible'))
  .catch(err => console.log(`❌ ${err.message}`))