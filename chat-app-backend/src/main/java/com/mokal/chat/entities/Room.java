package com.mokal.chat.entities;


import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "rooms")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    private String id;
    private String roomId;
    private List<Message> messages = new ArrayList<>();

}
