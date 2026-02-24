"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, Reply, Send } from "lucide-react";

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
  persona: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies: Comment[];
}

interface CommentSectionProps {
  appId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function CommentForm({
  appId,
  parentId,
  onSubmitted,
  onCancel,
  placeholder,
  autoFocus,
}: {
  appId: string;
  parentId?: string;
  onSubmitted: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/apps/${appId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onSubmitted(data.comment);
        setContent("");
      }
    } catch {
      // Silently handle
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || "Share your thoughts..."}
        maxLength={2000}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        className="flex-1 px-3 py-2 border rounded-md bg-background text-sm resize-none min-h-[60px]"
      />
      <div className="flex flex-col gap-1">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  appId,
  depth = 0,
}: {
  comment: Comment;
  appId: string;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReplied = (newReply: Comment) => {
    setReplies([...replies, newReply]);
    setShowReplyForm(false);
  };

  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-muted pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <Link href={`/u/${comment.user.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.image || ""} />
            <AvatarFallback className="text-xs">
              {comment.user.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/u/${comment.user.id}`}
              className="font-medium hover:underline"
            >
              {comment.user.name || "Anonymous"}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          {depth === 0 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-11 mb-2">
          <CommentForm
            appId={appId}
            parentId={comment.id}
            onSubmitted={handleReplied}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.user.name || "this comment"}...`}
            autoFocus
          />
        </div>
      )}

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          appId={appId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function CommentSection({ appId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/apps/${appId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } catch {
        // Silently handle
      }
      setIsLoading(false);
    };
    fetchComments();
  }, [appId]);

  const handleNewComment = (comment: Comment) => {
    setComments([comment, ...comments]);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Discussion ({comments.length})
        </h2>
      </div>

      {/* Comment form */}
      {session?.user ? (
        <div className="mb-6">
          <CommentForm appId={appId} onSubmitted={handleNewComment} />
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-md border bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} appId={appId} />
          ))}
        </div>
      )}
    </div>
  );
}
