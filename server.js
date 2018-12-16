//Array of all messages
var messages = [];

var arrayOfClients = [];

var http = require('http');
var fs = require('fs');
var path = require('path');

//Static files server
var server = http.createServer(function(req, res) {
    
    var filePath = '.' + req.url;
    //if the requested url is "/" (default), then set the filepath to index.html
    if (filePath == './'){
        filePath = './index.html';
    }
    
    //Note: path.extname() returns the extension of the path 
    //the extension of the filepath is assigned to the pathExtension variable
    var pathExtension = path.extname(filePath);
    var contentType;
    
    //if the requested file is a html-file
    if (pathExtension == '.html'){
        contentType = 'text/html';
    }
    
    //if the requested file is a a javascript-file
    if (pathExtension == '.js'){
        contentType = 'text/javascript';
    }
    
    //if the requested file is a css-file
    if (pathExtension == '.css'){
        contentType = 'text/css';
    }
    
    //Read the file
    fs.readFile(filePath, function(error, content){
        if(error){
            //The error code ENOENT indicates that the file does not exist
            if(error.code == "ENOENT"){
                //Therefore status code 404 (Not Found) is sent
                res.writeHead(404);
                res.end("Error 404 - Not Found");
            }
            //If it wasn't a client error, then we assume that the server failed
            else{
                //Therefore status code 500 (Internal Server Error) is sent
                res.writeHead(500);
                res.end("Error 500 - Server Error")
            }
        }
        //If the file is found...
        else{
            //Writes the header of the response, that the appication will serve to the client
            //@200: HTTP status code, successful HTTP request (OK)
            //@{ 'Content-Type': contentType }: Object containing the content type (MIME type)
            res.writeHead(200, { 'Content-Type': contentType });
            //sends the content of the response to the client
            res.end(content); 
        }  
    }); 
});

server.listen(4000);
console.log("server running at port 4000");


//Websocket server
var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', function(request) {
    var connection = request.accept();
    console.log("New connection!");
        
    //Put the new connection into an array
    arrayOfClients.push(connection);
    
    //Send all existing messages to new client
    for (var i in messages){
        connection.sendUTF(messages[i]);
    };
    
    //every time the server receives a new message
    connection.on('message', function(message) {
        //send the message to all connected clients
        arrayOfClients.forEach(function(destination) {
           destination.sendUTF(message.utf8Data); 
        });
        //also put the new message in the array of messages
        messages.push(message.utf8Data);
    });
    
    //when a client disconnects
    connection.on('close', function(data){
        console.log("A user disconnected.");
        
        //find the index of the disconnected client in the array
        var indexOfSocket = arrayOfClients.indexOf(connection);
        
        //if array is not empty, remove 1 item which is placed at indexOfSocket
        if (indexOfSocket > -1){
            arrayOfClients.splice(indexOfSocket, 1);
        }
    });
});