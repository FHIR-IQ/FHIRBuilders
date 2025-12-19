import { track } from "@vercel/analytics";

// Custom event tracking for key metrics
export const analytics = {
  // Track sandbox creation button click
  trackSandboxCreate: () => {
    track("sandbox_create_click");
  },

  // Track early access signup
  trackEarlyAccessSubmit: (painPoint?: string) => {
    track("early_access_submit", {
      painPoint: painPoint || "not_specified",
    });
  },

  // Track feedback submission
  trackFeedbackSubmit: (nps?: number) => {
    track("feedback_submit", {
      nps: nps?.toString() || "not_provided",
    });
  },

  // Track project share
  trackProjectShare: () => {
    track("project_share");
  },

  // Track demo sandbox exploration
  trackDemoQuery: (resourceType: string) => {
    track("demo_query", {
      resourceType,
    });
  },

  // Track page views with custom context
  trackPageView: (page: string) => {
    track("page_view", { page });
  },

  // Track CTA button clicks
  trackCTA: (button: string, location: string) => {
    track("cta_click", { button, location });
  },
};

// Helper to track time on page (for session analysis)
export function usePageTimer() {
  if (typeof window === "undefined") return;

  const startTime = Date.now();

  return () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    track("page_time", {
      duration: duration.toString(),
      page: window.location.pathname,
    });
  };
}
