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
    <div className={`max-w-[80%] ${
      msg.role === "user"
        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3"
        : ""
    }`}>
      {msg.role === "assistant" ? (
        <div>
          <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">NutriCoach MCE</span>
          <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3">
            <div className="prose prose-sm prose-invert max-w-none text-sm
              [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2
              [&_li]:text-foreground [&_li]:marker:text-primary
              [&_strong]:text-primary [&_em]:text-accent
              [&_h3]:text-primary [&_h3]:text-sm [&_h3]:font-bold
              [&_h4]:text-accent [&_h4]:text-xs
              [&_code]:bg-secondary [&_code]:text-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-primary [&_ul_li]:before:mr-2
            ">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
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
