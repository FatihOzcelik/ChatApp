document.addEventListener("DOMContentLoaded", function() {

    //Creates a new WebSocket and connects to the server at ws://localhost:3000/
    //The HTTP server is addressed with ws instead of http because, this signals
    //to the server, that we want to upgrade from HTTP protocol (after handshake) 
    //to a WebSocket connection
    var socket = new WebSocket('ws://localhost:4000/');
    
    //when new message is received from server
    socket.addEventListener('message', function (event){
        var msg = event.data;
        appendMessageToTextArea(msg);
    });
    
    var textBox = document.getElementById("textBox");
    var sendButton = document.getElementById("sendButton");
    
    function sendMessage(){
        var textToBeSent = textBox.value;
        socket.send(textToBeSent);
        msg = textBox.value;
        textBox.value = "";    
    }
    
    //When sendButton is clicked..
    sendButton.addEventListener('click', sendMessage);
    
    //When enter is pressed in the textbox..
    textBox.addEventListener('keyup', function(event) {
        if (event.keyCode == 13){
            sendMessage();
        }
    });

    var textAreaMessages = document.getElementById("textAreaMessages");
    
    function appendMessageToTextArea(msg){
        var d = new Date();
        var n = d.toLocaleTimeString();
        textAreaMessages.value += "(" + n + ") " + "User " + msg + "\n";
        //scroll to bottom when new message is appended to text area
        textAreaMessages.scrollTop = textAreaMessages.scrollHeight;    
    }
    
    var textAreaOnlineClients = document.getElementById("textAreaOnlineClients");

    var idOfSocketsArray = [];
    //update the list of online clients when we have a new connection
    socket.addEventListener('open', function (event){
        //A random id..
        var randomID = Math.floor(Math.random() * (999999-100000) ) + 100000;
    
        //A property "id" is added to the connection object, because it doesn't have it
        socket["id"] = randomID;
    
        idOfSocketsArray.push(socket.id);
        updateOnlineClients(idOfSocketsArray);
    });

    
    //update the list of online clients when we have a new disconnection
    socket.addEventListener('disconnect', function (event){
        //find the index of the disconnected client in the array
        var indexOfSocket = idOfSocketsArray.indexOf(socket.id);
        
        //if array is not empty, remove 1 item which is placed at indexOfSocket
        if (indexOfSocket > -1){
            idOfSocketsArray.splice(indexOfSocket, 1);
        }        
        updateOnlineClients(idOfSocketsArray);

    });
    
    function updateOnlineClients(idArr){
        //Check if idArr is undefined, or else it will throw 'Uncaught TypeError' when the server is closed, because at that point all clients gets disconnected.
        if(idArr != undefined){
            textAreaOnlineClients.value = "Online Users (" + idArr.length + ")\n\n";
            for(i=0; i < idArr.length; i++){
            textAreaOnlineClients.value += idArr[i] +"\n";
            }
        }
    }
});