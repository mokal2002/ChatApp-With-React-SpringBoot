import React, { useState } from "react";
import { MessageCircle, Users, Plus, LogIn, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { createRoomApi , joinChatApi} from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
    useChatContext();
  const navigate = useNavigate();

  function handleFromInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      //join chat

      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("joined..");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");  
      } catch (error) {
        if (error.status == 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      //create room
      console.log(detail);
      // call api to create room on backend
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room Created Successfully !!");
        //join the room
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);

        navigate("/chat");

        //forward to chat page...
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room  already exists !!");
        } else {
          toast("Error in creating room");
        }
      }
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="relative">
        {/* Animated background blur */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>

        {/* Main card */}
        <div className="relative bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Header with animated icon */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-blue-500/20 dark:bg-blue-400/30 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 p-4 rounded-full shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-4 mb-2">
              Chat Rooms
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Connect with friends in real-time
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name input */}
            <div className="group">
              <label
                htmlFor="userName"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3"
              >
                <Users className="w-4 h-4" />
                Your Name
              </label>
              <div className="relative">
                <input
                  onChange={handleFromInputChange}
                  value={detail.userName}
                  type="text"
                  id="userName"
                  name="userName"
                  placeholder="Enter your display name"
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-700/60 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Room ID input */}
            <div className="group">
              <label
                htmlFor="roomId"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3"
              >
                <Sparkles className="w-4 h-4" />
                Room ID
              </label>
              <div className="relative">
                <input
                  onChange={handleFromInputChange}
                  value={detail.roomId}
                  type="text"
                  id="roomId"
                  name="roomId"
                  placeholder="Enter room ID or create new"
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-700/60 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={joinChat}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <LogIn className="w-4 h-4" />
                Join Room
              </button>

              <button
                onClick={createRoom}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </div>

            {/* Divider and additional info */}
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Room IDs are case-sensitive and shareable with friends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
