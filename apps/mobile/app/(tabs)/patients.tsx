import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import useSWR from "swr";
import { calculateAge } from "@doctalk/shared";
import type { Patient } from "@doctalk/shared";

const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

const COLORS = {
  light: { bg: "#F2F2F7", surface: "#FFFFFF", label: "#000000", secondary: "#6B6B80", blue: "#007AFF", separator: "#C6C6C8", input: "#F2F2F7" },
  dark:  { bg: "#000000", surface: "#1C1C1E", label: "#FFFFFF", secondary: "#ABABC0", blue: "#0A84FF", separator: "#38383A", input: "#2C2C2E" },
};

async function fetcher(url: string) {
  const token = "";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export default function PatientsTab() {
  const scheme = useColorScheme();
  const c = COLORS[scheme ?? "light"];
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useSWR<{ success: boolean; data: Patient[] }>(
    `${API}/api/v1/patients?limit=50${search ? `&q=${search}` : ""}`,
    fetcher
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: 12 }}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: c.input, color: c.label, borderColor: c.separator }]}
          placeholder="Search patients…"
          placeholderTextColor={c.secondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: c.separator, marginLeft: 60 }} />}
        renderItem={({ item: p }) => (
          <TouchableOpacity
            style={[styles.patientRow, { backgroundColor: c.surface }]}
            onPress={() => router.push(`/patients/${p.id}`)}
          >
            <View style={[styles.avatar, { backgroundColor: c.blue + "20" }]}>
              <Text style={{ color: c.blue, fontWeight: "700", fontSize: 15 }}>
                {p.firstName[0]}{p.lastName[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.label }}>{p.firstName} {p.lastName}</Text>
              <Text style={{ fontSize: 13, color: c.secondary }}>
                {p.gender} · {calculateAge(p.dateOfBirth)} yrs · {p.bloodGroup.replace("_POSITIVE","+").replace("_NEGATIVE","-")}
              </Text>
            </View>
            <Text style={{ color: c.secondary, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
            <Text style={{ fontSize: 17, fontWeight: "600", color: c.label }}>
              {isLoading ? "Loading…" : "No patients found"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput:  { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  patientRow:   { flexDirection: "row", alignItems: "center", padding: 14 },
  avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
});
