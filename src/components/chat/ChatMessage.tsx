import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, UserIcon } from "lucide-react";
import { Msg } from "@/hooks/useChatHistory";

interface ChatMessageProps {
  msg: Msg;
}

const ChatMessage = ({ msg }: ChatMessageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
  >
    {msg.role === "assistant" && (
      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
    )}
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
      msg.role === "user"
        ? "bg-primary text-primary-foreground rounded-br-md"
        : "bg-card border border-border text-foreground rounded-bl-md"
    }`}>
      {msg.role === "assistant" ? (
        <div className="prose prose-sm prose-invert max-w-none text-sm [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-foreground [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-sm">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm">{msg.content}</p>
      )}
    </div>
    {msg.role === "user" && (
      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
        <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    )}
  </motion.div>
);

export default ChatMessage;
