import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
          },
          headerTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7",
          },
        }}
      />
    </>
  );
}
