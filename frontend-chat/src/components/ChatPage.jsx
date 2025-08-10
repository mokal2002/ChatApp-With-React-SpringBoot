import React, { useEffect, useRef, useState } from 'react'
import { Send, Paperclip, LogOut, Users, Hash } from 'lucide-react';
import { useNavigate } from "react-router";
import { Stomp } from '@stomp/stompjs';

import useChatContext from "../context/ChatContext";
import SockJS from "sockjs-client";
import { baseURL } from '../config/AxiosHelper';
import toast from 'react-hot-toast';
import { getMessagess } from '../services/RoomService';
import { timeAgo } from '../config/helper'; 

const ChatPage = () => {

    const {
        roomId,
        currentUser,
        connected,
        setConnected,
        setRoomId,
        setCurrentUser,
    } = useChatContext();

    const navigate = useNavigate();
    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, roomId, currentUser]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("")
    const inputRef = useRef(null)
    const chatBoxRef = useRef(null)
    const [stompClient, setStompClient] = useState(null)

    //load messages
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessagess(roomId);
                setMessages(messages);
            } catch (error) { }
        }
        if (connected) {
            loadMessages();
        }
    }, []);

    // Scroll to top whenever new messages arrive
    // With this:

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);


    //subscribe

    useEffect(() => {
        const connectWebSocket = () => {
            ///SockJS
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);

            client.connect({}, () => {
                setStompClient(client);

                toast.success("Connected to chat server");

                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    // console.log(message);

                    const newMessage = JSON.parse(message.body);

                    setMessages((prev) => [...prev, newMessage]);

                    //rest of the work after success receiving the message
                });
            });
        };

        if (connected) {
            connectWebSocket();
        }

        //stomp client
    }, [roomId]);




    //send message
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            console.log(input);

            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            };

            stompClient.send(
                `/app/sendMessage/${roomId}`,
                {},
                JSON.stringify(message)
            );
            setInput("");
        }

        //
    };


    function handleLeaveRoom() {
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    }


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };



    return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 10px;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #1d4ed8, #1e40af);
                    opacity: 1;
                    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: linear-gradient(135deg, #1e40af, #1e3a8a);
                }

                /* Dark mode scrollbar */
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #4f46e5, #3730a3);
                }
                
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #3730a3, #312e81);
                    box-shadow: 0 2px 10px rgba(79, 70, 229, 0.4);
                }

                /* For Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 transparent;
                }
                
                /* Hide scrollbar option (uncomment if you want to hide completely) */
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Header */}
            <header className="fixed top-0 w-full z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        {/* Room Info */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                                    <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {roomId}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Room ID</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {currentUser}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">You</p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Button */}
                        <button
                            onClick={handleLeaveRoom}
                            className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave Room
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main
                ref={chatBoxRef}
                className="pt-24 pb-32 px-4 max-w-4xl mx-auto h-screen overflow-auto custom-scrollbar"
                style={{ 
                    scrollBehavior: 'smooth',
                    scrollbarGutter: 'stable both-edges'
                }}
            >
                <div className="space-y-4 pr-2">
                    {/* Dynamic Messages */}
                    {messages.map((message, index) => (
                        <div
                            key={`${message.timestamp}-${index}`}
                            className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
                        >
                            <div
                                className={`flex gap-3 max-w-lg ${message.sender === currentUser ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <img
                                        className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-md hover:scale-105 transition-transform duration-200"
                                        src={`https://avatar.iran.liara.run/public/${message.sender === currentUser ? '43' : '42'}`}
                                        alt={message.sender}
                                    />
                                </div>

                                {/* Message Content */}
                                <div
                                    className={`px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
                                        message.sender === currentUser
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md hover:from-blue-600 hover:to-blue-700'
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650'
                                    }`}
                                >
                                    {/* Sender name for received messages */}
                                    {message.sender !== currentUser && (
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                            {message.sender}
                                        </p>
                                    )}

                                    {/* Message content */}
                                    <p className="text-sm leading-relaxed">{message.content}</p>

                                    {/* Timestamp */}
                                    <p
                                        className={`text-xs mt-2 ${
                                            message.sender === currentUser
                                                ? 'text-blue-100'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {timeAgo(message.timeStamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty state when no messages */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                <Hash className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-medium mb-2">Welcome to {roomId}</p>
                            <p className="text-sm">Start the conversation by sending a message!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Message Input */}
            <div className="fixed bottom-0 w-full z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="px-4 py-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            type="text"
                            placeholder="Type your message here..."
                            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                        />

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all duration-200 hover:scale-105">
                                <Paperclip className="w-5 h-5" />
                            </button>

                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || !connected}
                                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional CSS for animations */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default ChatPage