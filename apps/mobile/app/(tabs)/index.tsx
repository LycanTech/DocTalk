import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme,
} from "react-native";

const COLORS = {
  light: { bg: "#F2F2F7", surface: "#FFFFFF", label: "#000000", secondary: "#6B6B80", blue: "#007AFF", green: "#34C759", orange: "#FF9500", separator: "#C6C6C8" },
  dark:  { bg: "#000000", surface: "#1C1C1E", label: "#FFFFFF", secondary: "#ABABC0", blue: "#0A84FF", green: "#30D158", orange: "#FF9F0A", separator: "#38383A" },
};

const STAT_CARDS = [
  { label: "Patients",    value: "—", color: "#007AFF" },
  { label: "Today",       value: "—", color: "#34C759" },
  { label: "Pending",     value: "—", color: "#FF9500" },
  { label: "Offline",     value: "—", color: "#00C7BE" },
];

export default function DashboardTab() {
  const scheme = useColorScheme();
  const c = COLORS[scheme ?? "light"];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Greeting */}
      <View>
        <Text style={{ fontSize: 28, fontWeight: "700", color: c.label }}>Dashboard</Text>
        <Text style={{ fontSize: 15, color: c.secondary, marginTop: 2 }}>Welcome back, Doctor</Text>
      </View>

      {/* Stats grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {STAT_CARDS.map(({ label, value, color }) => (
          <View key={label} style={[styles.statCard, { backgroundColor: c.surface, width: "47%" }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={{ fontSize: 28, fontWeight: "700", color: c.label, marginTop: 8 }}>{value}</Text>
            <Text style={{ fontSize: 13, color: c.secondary, marginTop: 2 }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Quick actions */}
      <View>
        <Text style={{ fontSize: 17, fontWeight: "600", color: c.label, marginBottom: 10 }}>Quick Actions</Text>
        <View style={{ gap: 8 }}>
          {[
            { label: "New Patient",     icon: "👤", color: c.blue },
            { label: "New Record",      icon: "📋", color: c.green },
            { label: "Schedule Appt.",  icon: "📅", color: c.orange },
          ].map(({ label, icon, color }) => (
            <TouchableOpacity
              key={label}
              style={[styles.actionRow, { backgroundColor: c.surface, borderColor: c.separator }]}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.label, flex: 1 }}>{label}</Text>
              <Text style={{ color: color, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statCard: { borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  actionRow:{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1 },
});
