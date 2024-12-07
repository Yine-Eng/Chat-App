package com.sampson.chat.chat;

import lombok.*;
import java.time.LocalDateTime;

import java.awt.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    private String content; // Content of the message.
    private String sender; // Sender of the message.
    private MessageType type;
    private LocalDateTime timestamp;
}