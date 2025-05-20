// components/ui/message.tsx
import { cn } from "@/lib/utils";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function Message({ content, isUser, timestamp }: MessageProps) {
  return (
    <div className={cn("max-w-[80%] mb-4", isUser ? "ml-auto" : "mr-auto")}>
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p>{content}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
