import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

const TABS = [
  { name: "index",        title: "Dashboard",    icon: "grid-outline" },
  { name: "patients",     title: "Patients",     icon: "people-outline" },
  { name: "appointments", title: "Appointments", icon: "calendar-outline" },
  { name: "profile",      title: "Profile",      icon: "person-outline" },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#0A84FF" : "#007AFF",
        tabBarInactiveTintColor: isDark ? "#636366" : "#8E8E93",
        tabBarStyle: {
          backgroundColor: isDark ? "#1C1C1E" : "#F9F9F9",
          borderTopColor: isDark ? "#38383A" : "#C6C6C8",
        },
        headerStyle: {
          backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
        },
        headerTintColor: isDark ? "#FFFFFF" : "#000000",
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },
      }}
    >
      {TABS.map(({ name, title }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
    </Tabs>
  );
}
