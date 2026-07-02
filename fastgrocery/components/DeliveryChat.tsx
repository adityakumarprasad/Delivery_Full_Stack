"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, MessageCircle } from "lucide-react";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { motion } from "framer-motion";

interface MessageType {
  _id?: string;
  senderId: string;
  text: string;
  time: string;
}

interface DeliveryChatProps {
  orderId: string;
  currentUserId: string;
  role: "user" | "deliveryBoy";
}

export default function DeliveryChat({
  orderId,
  currentUserId,
  role,
}: DeliveryChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState("");
  
  // AI Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Chat History & Setup Sockets
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.post("/api/chat/messages", { roomId: orderId });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    fetchHistory();

    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join order roomId chat channel
    socket.emit("join-room", orderId);

    // Listen for incoming messages
    const handleNewMessage = (msg: MessageType) => {
      setMessages((prev) => [...prev, msg]);
      
      // Auto trigger AI suggestions if the message was sent by the other person
      if (msg.senderId !== currentUserId) {
        generateAiSuggestions(msg.text);
      }
    };

    socket.on("send-message", handleNewMessage);

    return () => {
      socket.off("send-message", handleNewMessage);
    };
  }, [orderId, currentUserId]);

  // 2. Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Trigger initial AI suggestions based on last message from other user
  useEffect(() => {
    const lastOtherMsg = [...messages]
      .reverse()
      .find((m) => m.senderId !== currentUserId);
    
    if (lastOtherMsg) {
      generateAiSuggestions(lastOtherMsg.text);
    } else {
      // Default suggestions if no messages yet
      setSuggestions(
        role === "user"
          ? ["Please come fast! 🚀", "I'm at home 📞", "Thanks! 👍"]
          : ["On my way! 🏍️", "Arrived! 📍", "OTP please? 🔑"]
      );
    }
  }, [messages.length]);

  const generateAiSuggestions = async (lastMsgText: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await axios.post("/api/chat/ai-suggestions", {
        message: lastMsgText,
        role: role,
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("Gemini suggestion fetch failed:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const socket = getSocket();
    if (!socket) return;

    const formattedTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msgData = {
      senderId: currentUserId,
      text: trimmed,
      roomId: orderId,
      time: formattedTime,
    };

    // Emit via Socket.IO -> Index.js persists and broadcasts back
    socket.emit("send-message", msgData);
    
    // Clear input & clear suggestions since user replied
    setInputText("");
    setSuggestions([]);
  };

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden h-[500px]">
      {/* Chat header */}
      <div className="bg-linear-to-r from-green-600 to-green-800 text-white p-4 flex items-center gap-2">
        <MessageCircle size={20} />
        <div>
          <h4 className="text-xs font-black uppercase">Live Delivery Chat</h4>
          <p className="text-[9px] text-green-200 font-bold uppercase">Order ID: #{orderId.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs font-semibold">
            Say hello to start the conversation! 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={idx}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    isOwn
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-150 rounded-tl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick suggestions area */}
      <div className="p-3 bg-white border-t border-gray-100 space-y-2">
        {suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-black text-green-600 flex items-center gap-0.5 uppercase tracking-wider shrink-0 bg-green-50 px-2 py-1 rounded-lg">
              <Sparkles size={9} className="animate-pulse" />
              AI Suggestions:
            </span>
            
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="text-[10px] font-bold bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-300 px-3 py-1.5 rounded-full transition-all cursor-pointer select-none"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-150 focus:border-green-500 rounded-2xl outline-none text-xs font-semibold text-gray-800"
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
