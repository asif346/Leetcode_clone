import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from "lucide-react";

function ChatAi({ problem }) {

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, how can I help you?" }
  ]);

  const { register, handleSubmit, reset } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {

    const userMessage = {
      role: "user",
      content: data.message
    };

    // ✅ Create updated messages BEFORE state update
    const updatedMessages = [...messages, userMessage];

    // Update UI instantly
    setMessages(updatedMessages);
    reset();

    try {

      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibletestcases,
        startcode: problem.startcode
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.message
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {

      console.error("API Error:", error);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Error from AI Chatbot"
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble bg-base-200 text-base-content">
              {msg.content}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-base-100 border-t"
      >
        <div className="flex items-center">
          <input
            placeholder="Ask me anything"
            className="input input-bordered flex-1"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button type="submit" className="btn btn-ghost ml-2">
            <Send size={20} />
          </button>
        </div>
      </form>

    </div>
  );
}

export default ChatAi;
