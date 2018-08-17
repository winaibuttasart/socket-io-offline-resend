const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

let clientDevice = {}
let failData = {}

io.on('connection', socket => {
    let address = socket.request.connection.remoteAddress;
    console.log('ip ' + address + ' connected.')
    if (typeof (clientDevice[address]) === 'undefined') {
        clientDevice[address] = {}
    } else {
        for (let i in clientDevice[address]) {
            io.to(socket.id).emit('chat message', { messageId: i, msg: clientDevice[address][i] })
        }
    }

    socket.on('disconnect', () => {
        let leftAddress = socket.request.connection.remoteAddress
        failData[leftAddress] = ''
        console.log('ip ' + leftAddress + ' disconnect.')
    })

    socket.on('chat message', msg => {
        // console.log("msg = ", msg)
        let messageId = Date.now();
        for (let ip in clientDevice) {
            clientDevice[ip][messageId] = msg
        }
        io.emit('chat message', { messageId: messageId, msg: msg })
    })

    socket.on('answer', messageId => {
        let answerAddress = socket.request.connection.remoteAddress
        delete clientDevice[answerAddress][messageId]
    })
})

const PORT = 3000;
http.listen(PORT, () => console.log(`listening on port :${PORT}`))