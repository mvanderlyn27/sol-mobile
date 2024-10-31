import PostHog from "posthog-react-native";

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API!, {
  host: "https://us.i.posthog.com", // host is optional if you use https://us.i.posthog.com
});
