import posthog from "posthog-js";

// Auth events
export const AUTH_EVENTS = {
    USER_SIGNED_UP: "user_signed_up",
    USER_LOGGED_IN: "user_logged_in",
    USER_LOGGED_OUT: "user_logged_out",
    LOGIN_FAILED: "login_failed",
    SIGNUP_FAILED: "signup_failed"
};

// Page view events
export const PAGE_VIEWED = "page_viewed";
export const PAGES = {
    HOMEPAGE: "homepage",
    DASHBOARD: "dashboard",
    IDEAS_LIST: "ideas_list"
};

// Giftee events
export const GIFTEE_EVENTS = {
    GIFTEE_ADDED: "giftee_added",
    GIFTEE_DETAILS_UPDATED: "giftee_details_updated",
    GIFTEE_UPDATE_FAILED: "giftee_update_failed"
};

// Idea events
export const IDEA_EVENTS = {
    IDEA_ADDED: "idea_added",
    IDEA_STATUS_TOGGLED: "idea_status_toggled",
    IDEA_URL_UPDATED: "idea_url_updated",
    IDEA_URL_UPDATE_FAILED: "idea_url_update_failed"
};

// Gift suggestion events
export const SUGGESTION_EVENTS = {
    GIFT_SUGGESTIONS_REQUESTED: "gift_suggestions_requested",
    GIFT_SUGGESTIONS_RECEIVED: "gift_suggestions_received",
    GIFT_SUGGESTIONS_ERROR: "gift_suggestions_error"
};

// Helper function to capture events with consistent typing
export function captureEvent(eventName: string, properties?: Record<string, any>) {
    posthog.capture(eventName, properties);
}

// Re-export posthog for convenience
export { posthog }; 