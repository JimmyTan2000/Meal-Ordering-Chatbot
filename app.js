let express = require('express')
let app = express()
app.listen(3000)
app.use(express.static(__dirname))
app.get('/', (request, response) =>{
    response.sendFile(__dirname + '/html/index.html')
})
console.log("server started at http://localhost:3000")