"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";

interface RatingData {
  average: number;
  total: number;
  distribution: Record<number, number>;
  userRating: { id: string; score: number; review: string | null } | null;
}

interface RatingSectionProps {
  appId: string;
  authorId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (score: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= value : star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            <Star
              className={`${sizeClass} ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function DistributionBar({
  score,
  count,
  total,
}: {
  score: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-muted-foreground">{score}</span>
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

export function RatingSection({ appId, authorId }: RatingSectionProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<RatingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const isAuthor = session?.user?.id === authorId;

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch(`/api/apps/${appId}/ratings`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
          if (result.userRating) {
            setSelectedScore(result.userRating.score);
            setReview(result.userRating.review || "");
          }
        }
      } catch {
        // Silently handle
      }
      setIsLoading(false);
    };
    fetchRatings();
  }, [appId]);

  const handleSubmitRating = async () => {
    if (selectedScore < 1) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/apps/${appId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: selectedScore,
          review: review.trim() || null,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                average: result.average,
                total: result.total,
                userRating: result.rating,
              }
            : prev
        );
        setShowForm(false);
      }
    } catch {
      // Silently handle
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Ratings</h2>
      </div>

      {/* Summary */}
      {data && data.total > 0 ? (
        <div className="flex items-start gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.average.toFixed(1)}</div>
            <StarRating value={Math.round(data.average)} readonly size="sm" />
            <p className="text-xs text-muted-foreground mt-1">
              {data.total} rating{data.total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((score) => (
              <DistributionBar
                key={score}
                score={score}
                count={data.distribution[score] || 0}
                total={data.total}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No ratings yet</p>
      )}

      {/* User rating */}
      {session?.user && !isAuthor && (
        <div className="border-t pt-4">
          {data?.userRating && !showForm ? (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your rating</p>
              <div className="flex items-center gap-2">
                <StarRating value={data.userRating.score} readonly size="sm" />
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              {data.userRating.review && (
                <p className="text-sm mt-1">{data.userRating.review}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {data?.userRating ? "Update your rating" : "Rate this app"}
              </p>
              <StarRating
                value={selectedScore}
                onChange={setSelectedScore}
              />
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review (optional)"
                maxLength={2000}
                rows={2}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={selectedScore < 1 || isSubmitting}
                  onClick={handleSubmitRating}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  {data?.userRating ? "Update" : "Submit"}
                </Button>
                {showForm && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sign in prompt */}
      {!session?.user && (
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>{" "}
            to rate this app
          </p>
        </div>
      )}

      {isAuthor && (
        <p className="text-xs text-muted-foreground italic border-t pt-3">
          You cannot rate your own app
        </p>
      )}
    </div>
  );
}
