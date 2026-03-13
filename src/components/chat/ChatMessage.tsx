import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Brain, UserIcon } from "lucide-react";
import { Msg } from "@/hooks/useChatHistory";

interface ChatMessageProps {
  msg: Msg;
  isLast?: boolean;
}

const ChatMessage = ({ msg, isLast }: ChatMessageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
  >
    {/* Coach avatar */}
    {msg.role === "assistant" && (
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mt-1">
          <Brain className="w-3.5 h-3.5 text-primary" />
        </div>
        {isLast && (
          <motion.div
            className="w-1 h-1 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </div>
    )}

    {/* Bubble */}
    <div
      className={`max-w-[82%] relative ${
        msg.role === "user"
          ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3"
          : "rounded-2xl rounded-bl-md bg-card border border-border text-foreground px-4 py-3"
      }`}
      style={msg.role === "assistant" ? {
        boxShadow: "0 1px 8px hsl(var(--border) / 0.5)",
      } : {}}
    >
      {/* Top label for coach */}
      {msg.role === "assistant" && (
        <p className="text-[8px] font-mono text-primary/60 uppercase tracking-wider mb-1.5 font-bold">
          NutriCoach MCE
        </p>
      )}

      {msg.role === "assistant" ? (
        <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed
          [&_p]:mb-2 [&_p:last-child]:mb-0
          [&_ul]:mb-2 [&_ul]:space-y-1 [&_ul]:pl-0
          [&_li]:text-foreground [&_li]:list-none [&_li]:pl-0
          [&_li]:before:content-['→'] [&_li]:before:text-primary [&_li]:before:mr-1.5 [&_li]:before:text-xs
          [&_strong]:text-primary [&_strong]:font-bold
          [&_em]:text-accent [&_em]:not-italic [&_em]:font-medium
          [&_h3]:text-primary [&_h3]:text-xs [&_h3]:font-mono [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:mb-2
          [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
          [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm leading-relaxed">{msg.content}</p>
      )}
    </div>

    {/* User avatar */}
    {msg.role === "user" && (
      <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-1">
        <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    )}
  </motion.div>
);

export default ChatMessage;
