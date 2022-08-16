const connectToMongo = require('./db');
const express = require('express')
connectToMongo();

var cors = require('cors')
var app = express()

app.use(cors())

const port = 5000

app.use(express.json())
// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`iNoteBook backend listening on port ${port}`)
})