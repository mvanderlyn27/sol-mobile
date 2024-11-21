import { observer } from "@legendapp/state/react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatePresence, MotiView } from "moti";
import { Pressable, Text } from "react-native";
import { styled } from "nativewind";
import { notificationStore$ } from "@/src/stores/NotificationStore";
import { LocalNotification } from "@/src/types/shared.types";
import { useEffect } from "react";
const StyledMotiView = styled(MotiView);
// NotificationHolder Component
const NotificationHolder = observer(function NotificationHolder() {
  const notifications: LocalNotification[] = notificationStore$.notifications.get(); // Reactive state

  return (
    <SafeAreaView
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 10, zIndex: 1000 }}
      pointerEvents={"box-none"}>
      <AnimatePresence>
        {notifications.map((notification: LocalNotification, index) => (
          <Notification key={notification.id} notification={notification} index={index} />
        ))}
      </AnimatePresence>
    </SafeAreaView>
  );
});

export default NotificationHolder;

// Notification Component
const Notification = observer(function Notification({
  notification,
  index,
}: {
  notification: LocalNotification;
  index: number;
}) {
  const handleDismiss = () => {
    notificationStore$.notifications.set((prev) => prev.filter((n) => n.id !== notification.id));
  };
  const getColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Automatically dismiss the notification after 3 seconds
  useEffect(() => {
    if (index === 0) {
      const timeout = setTimeout(handleDismiss, notification.duration || 5000); // 3 seconds
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [index]);

  return (
    <StyledMotiView
      from={{
        opacity: 0,
        translateY: -5 + index * 2, // Tighter stacking
        scale: 0.95,
      }}
      animate={{
        opacity: 1 - index * 0.05, // Subtle opacity change
        translateY: index, // Minimal gap between notifications
        scale: 1 - index * 0.02, // Slight scaling for stacked effect
      }}
      exit={{
        opacity: 0,
        translateY: -5,
      }}
      transition={{
        type: "timing",
        duration: 300,
      }}
      pointerEvents="box-none"
      className={`flex-row w-full px-4 h-auto py-2 ${getColor()} rounded-lg items-center justify-between mb-2`}>
      <Text style={{ flex: 1 }}>{notification.message}</Text>
      <Pressable onPress={handleDismiss} style={{ flex: 0, backgroundColor: "black", padding: 8, borderRadius: 4 }}>
        <Text style={{ color: "white" }}>Dismiss</Text>
      </Pressable>
    </StyledMotiView>
  );
});
