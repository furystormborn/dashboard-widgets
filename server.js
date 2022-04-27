require('dotenv').config();
const host = '127.0.0.1';
const port = 3000;
var request = require('request');

const express = require('express');
const console = require('console');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var acc_token;
var ref_token;

var code;

let clients = []

io.on('connection', (socket) => {
  console.log(`Client with id ${socket.id} connected`)
  clients.push(socket.id)

  socket.emit('message', "I'm server");

  socket.emit('testing', 10);

  socket.on('message', (message) =>
    console.log('Message: ', message)
  )

  socket.on('disconnect', () => {
    clients.splice(clients.indexOf(socket.id), 1)
    console.log(`Client with id ${socket.id} disconnected`)
  })
})
app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/views/index.html');
})



app.get( '/credentials', (req, res) => {
  code = req.query.code
  if( req.url.indexOf('?code=') !== 1 && !acc_token && !ref_token ) {
    const options = {
      url: 'https://id.twitch.tv/oauth2/token',
      json:true,
      body: {
          client_id: 'nd7q28kpebc34wprpilipv0uqlpid8',
          client_secret: 'kp8y0z33ei4tbb12wcol7yuvjdhset',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:3000/credentials',

      }
  }

    request.post( options, (err,res,body) => {
        if(err) {
            console.log(err);
        }
        console.log(res.body);

        acc_token = res.body.access_token;
        ref_token = res.body.refresh_token;

        console.log( code );
        console.log( '1111' );
        console.log( acc_token );
        console.log( '2222' );
        console.log( ref_token );

      })
  }

  console.log( 'ACCESS TOKEN ' + acc_token );
  console.log( 'REFRESH TOKEN ' + ref_token );
  
  res.sendFile( __dirname + '/views/credentials.html');
} )


app.get('/subs-bar', (req, res) => {
  res.sendFile( __dirname + '/views/subs-bar.html');
})

//получение количества активных клиентов
app.get('/clients-count', (req, res) => {
  res.json({
    count: io.clients().server.engine.clientsCount,
  })
})

//отправка сообщения конкретному клиенту по его id
app.post('/client/:id', (req, res) => {
  if (clients.indexOf(req.params.id) !== -1) {
    io.sockets.connected[req.params.id].emit(
      'private message',
      `Message to client with id ${req.params.id}`
    )
    return res
      .status(200)
      .json({
        message: `Message was sent to client with id ${req.params.id}`,
      })
  } else
    return res
      .status(404)
      .json({ message: 'Client not found' })
})

http.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)


// const request = require('request');

// const getToken = (url, callback) => {

    // const options = {
    //     url: process.env.GET_TOKEN,
    //     json:true,
    //     body: {
    //         client_id: process.env.CLIENT_ID,
    //         client_secret: process.env.CLIENT_SECRET,
    //         grant_type: 'client_credentials'
    //     }
    // }

    // request.post( options, (err,res,body) => {
    //     if(err) {
    //         console.log(err);
    //     }
    //     console.log('Status: ${res.statusCode}');
    //     console.log(body);

//         callback(res);
//     } )
// }