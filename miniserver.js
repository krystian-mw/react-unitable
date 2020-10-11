const express = require('express')

const app = express()

app.use(express.static('/workspace'))

app.listen(3000)