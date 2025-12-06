import React, { useState } from "react";
import { SendHorizontal, X } from "lucide-react";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      type: "bot",
      text: "Hello! I'm your medical assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePanel = () => setOpen(!open);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const updatedChat = [...chatLog, { type: "user", text: input }];
    setChatLog(updatedChat);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://d1esk4cwpza4ag.cloudfront.net/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setChatLog([...updatedChat, { type: "bot", text: data.reply }]);
      } else {
        throw new Error(data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatLog([
        ...updatedChat,
        {
          type: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating ChatBot Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            onClick={togglePanel}
            className="w-14 h-14 rounded-full shadow-lg overflow-hidden"
          >
            <img
              src="/images/chatBot.gif"
              alt="Chatbot"
              className="w-full h-full object-cover"
            />
          </button>
        )}
      </div>

      {/* Chat Panel */}
      <div
        className={`flex flex-col fixed top-0 right-0 h-full w-full sm:w-[350px] bg-white border-l z-50 shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-[#F26522] text-white">
          <h2 className="text-lg font-semibold">ChatBot</h2>
          <button onClick={togglePanel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm px-3 py-2 rounded-md max-w-[80%] w-fit ${
                msg.type === "user"
                  ? "bg-[#F26522] text-white self-end ml-auto"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input section always pinned at bottom */}
        <div className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F26522] outline-none disabled:opacity-50"
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`bg-[#F26522] text-white px-3 py-2 rounded-md transition ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-orange-600"
            }`}
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
