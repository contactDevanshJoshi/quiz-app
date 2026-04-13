// mobile/src/screens/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getAllStudents, getAllSubjects, getAllTeachers } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [counts, setCounts] = useState({ students: 0, subjects: 0, teachers: 0 });

  useEffect(() => {
    Promise.all([getAllStudents(), getAllSubjects(), getAllTeachers()]).then(([st, sub, t]) => {
      setCounts({ students: st.length, subjects: sub.length, teachers: t.length });
    });
  }, []);

  return (
    <ScrollView style={s.screen}>
      <View style={{ backgroundColor: colors.primary, padding: 24, paddingTop: 48 }}>
        <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700' }}>⚙️ Admin Dashboard</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Manage your college quiz system</Text>
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[['Students', counts.students, '👥'], ['Subjects', counts.subjects, '📘'], ['Teachers', counts.teachers, '🧑‍🏫']].map(([l, v, icon]) => (
            <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              <Text style={s.h2}>{v}</Text>
              <Text style={s.muted}>{l}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[s.btnOutline, { marginTop: 8 }]} onPress={logout}>
          <Text style={s.btnOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
