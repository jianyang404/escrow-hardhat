const express = require('express')
const { ParseServer } = require('parse-server')

const app = express()
const server = ParseServer({
    databaseURI: 'mongodb://localhost:27017/test',
    appId: '1',
    masterKey: 'password',
    serverURL: 'http://localhost:3001/parse'
})

const start = async () => await server.start()

start()

app.use('/parse', server.app);

app.listen(3001, () => console.log('Listening on 3001'))

