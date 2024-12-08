package com.sampson.chat.chat;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RestController // This allows both WebSocket and REST API usage
@RequestMapping("/api/chat") // Base URL for REST endpoints
public class ChatController {

    @MessageMapping("/chat.sendMessage") // WebSocket endpoint
    @SendTo("/topic/public") // To which topic the message should be sent
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // Adds username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    // New REST endpoint
    @PostMapping("/sendMessage")
    public ResponseEntity<String> sendMessageRest(@RequestBody ChatMessage message) {
        // Logic for REST API
        System.out.println("Message received: " + message.getContent());
        return ResponseEntity.ok("Message received successfully");
    }
}
