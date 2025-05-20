import clsx from "clsx";

export function ChatBubble({
  message,
  isOwn,
}: {
  message: string;
  isOwn: boolean;
}) {
  return (
    <div
      className={clsx("p-3 max-w-sm rounded-lg mb-2", {
        "bg-primary text-primary-foreground ml-auto": isOwn,
        "bg-muted text-foreground mr-auto": !isOwn,
      })}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}
