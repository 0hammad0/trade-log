"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  className?: string;
  truncate?: boolean;
}

function RichTextDisplayComponent({
  content,
  className,
  truncate = false,
}: RichTextDisplayProps) {
  // If content is empty or just whitespace/empty tags
  if (!content || content === "<p></p>" || content.trim() === "") {
    return null;
  }

  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]+>/.test(content);

  if (!hasHtmlTags) {
    // Plain text - render normally
    return (
      <div
        className={cn(
          "text-sm text-muted-foreground",
          truncate && "line-clamp-2",
          className
        )}
      >
        {content}
      </div>
    );
  }

  // HTML content - render with dangerouslySetInnerHTML
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-muted-foreground",
        "[&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5",
        "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
        "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
        "[&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        truncate && "max-h-[4.5rem] overflow-hidden",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export const RichTextDisplay = memo(RichTextDisplayComponent);
RichTextDisplay.displayName = "RichTextDisplay";
