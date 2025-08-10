package com.mokal.chat.repositories;

import com.mokal.chat.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room,String> {

    Room findByRoomId(String roomId);
}
