const translate = require('translate-api');
const firebase = require("firebase");
const hapi = require('hapi');
const boom = require('boom')

const config = {
    apiKey: "AIzaSyBbILHVxVIcPg_B3pA-dLxo9GFVN2catj8",
    authDomain: "example-everything.firebaseapp.com",
    databaseURL: "https://example-everything.firebaseio.com",
    storageBucket: "gs://example-everything.appspot.com",
};

firebase.initializeApp(config);

const defaultDatabase = firebase.database();
const dbRef = defaultDatabase.ref('/chat')

const server = new hapi.Server();

server.connection({
    port: process.env.PORT || 3000
});

const io = require("socket.io")(server.listener)

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('send', function (data) {
        translateWord(data).then(function (text) {
            var obj = {
                someAttribute: true,
                name: text.text
            };
            dbRef.push(obj);
        }).catch(function (err) {

        });
    });
});

server.route({
    method: 'POST',
    path: '/api/translate',
    handler: function (request, reply) {
        const word = request.payload.word
        const destination = request.payload.destination
        translateWord(word, destination).then(function (result) {
            sendDataToDB(reply, result.text)
        }).catch(function (err) {
            sendDataToDB(reply, word)
        });
    }
});

server.start((err) => {
    if (err) throw err;
    console.log(`Server running at: ${server.info.uri}`);
});

function translateWord(word, destination) {
    return translate.getText(word, {
        to: destination
    })
}

function sendDataToDB(reply, word) {
    var obj = {
        name: word
    };
    dbRef.push(obj);
    reply({
        success: true
    })
}