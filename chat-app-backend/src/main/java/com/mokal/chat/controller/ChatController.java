package com.mokal.chat.controller;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import com.mokal.chat.entities.Message;
import com.mokal.chat.entities.Room;
import com.mokal.chat.playload.MessageRequest;
import com.mokal.chat.repositories.RoomRepository;
// @RequestMapping("/chat")

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController {
    
    private RoomRepository roomRepository;

    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Define methods to handle chat-related requests here

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")//subscribe)
    public Message sendMessage(@DestinationVariable String roomId, @RequestBody MessageRequest request) {

        Room room = roomRepository.findByRoomId(request.getRoomId());

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if (room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);

        } else {
            throw new RuntimeException("Room not found !!");
        }
        return message;
    }
}
