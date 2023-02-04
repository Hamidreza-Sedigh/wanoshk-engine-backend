const express =  require('express');
const mongoose = require('mongoose');
const cors =     require('cors');
const routes =   require('./routes');
const path =     require('path');
const http =     require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const engine =   require('./core/engine');
const Port = process.env.PORT || 8080


const app =      express();
const server = http.Server(app);
const io = socketio(server); 

console.log("test1");

if(process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}

try {
    mongoose.connect(process.env.MONGO_DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log('MOngoDB connected...');
} catch (error) {
    console.log('ERROR DB NOT CONNECT');
    console.log(error);
}

// better useing reddis
const connectUsers = {  };

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support  URL-encoded bodies
  extended: true
}));

io.on('connection', socket => {
    console.log(socket.handshake.query)
    const { user } = socket.handshake.query;

    connectUsers[user] = socket.id;
    
    //console.log('user is connected.', socket.id)
    //io.emit('hamid', {data: "hello-world"})
});

//app.use();
app.use((req, res, next)=> {
    req.io = io;
    req.connectUsers = connectUsers;
    return next();
});
app.use(cors());
app.use(express.json());
app.use("/files", express.static(path.resolve(__dirname, "..", "files")));
app.use(routes);


//const engineStatusDB = find from db
//const engineStatusFile = fetch from file
//if(engineStatusDB && engineStatusFile)
const tempSatus = false
if(tempSatus)
    engine.start();
setInterval(function(){
    // engineStatusDB = find from db
    // engineStatusFile = fetch from file
    if(tempSatus)
        engine.start();
}, 2 * 60 * 1000); 


//app.listen(Port, ()=>{  // it was without socket
server.listen(Port, ()=>{   // with socket
    console.log(`Listen on ${Port}`)
    
})