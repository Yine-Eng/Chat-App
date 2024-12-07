'use strict';

var usernamePage = document.querySelector("#username-page");
var chatPage = document.querySelector("#chat-page");
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null; //This is the web socket
var username = null;

var colors = [
               '#007BA7', '#DC143C', '#9966CC', '#40E0D0',
               '#50C878', '#FF4500', '#FFD700', '#FF69B4'
];

//function to perform connection after user clicks on "Enter Chatroom"
function connect(event) {
    event.preventDefault();
    username = document.querySelector('#name').value.trim();
    console.log('Username submitted:', username); // Log the submitted username
    if (username) {
        console.log('Hiding username page, showing chat page');
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    } else {
        console.log('Username is empty');
    }
}

function onConnected() {
    // Subscribe to the public topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Let server know username
    stompClient.send('/app/chat.addUser',
        {},
        JSON.stringify({sender:username, type: 'JOIN'})
    );
    connectingElement.classList.add('hidden');
}

function onError() {
    connectingElement.textContent = 'Failed to connect to WebSocket server. Please refresh the page and try again!';
    connectingElement.style.color = 'red';
}

function sendMessage (event) {
    var messageContent = messageInput.value.trim();
    if (messageContent.length === 0) {
        return; // Do nothing if the message is empty
    }

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        messageInput.value = ''; // Clear the message input
    }
    event.preventDefault(); // Prevent form submission
}

function onMessageReceived(payload) {
    // Extract body from payload
    var message = JSON.parse(payload.body);

    // Create a message element
    var messageElement = document.createElement('li');

    // Check message type
    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined the chatroom!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left the chatroom!';
    } else {
        messageElement.classList.add('chat-message');

        // Create an avatar element
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);

        // Display timestamp
        var timestampElement = document.createElement('span');
        timestampElement.classList.add('timestamp');
        timestampElement.textContent = new Date(message.timestamp).toLocaleTimeString();
        messageElement.appendChild(timestampElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Randomly determine color for each avatar element
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect);
messageForm.addEventListener('submit', sendMessage);