// mobile/src/screens/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getDepartment, getStudentScores } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export function StudentDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [dept, setDept] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (user?.department) getDepartment(user.department).then(setDept);
    if (user?.id) getStudentScores(user.id).then(setScores);
  }, [user]);

  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / scores.length) : 0;

  return (
    <ScrollView style={s.screen}>
      <View style={{ backgroundColor: colors.primary, padding: 24, paddingTop: 48 }}>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Welcome back,</Text>
        <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 2 }}>{user?.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Sem {user?.semester} · {user?.department}</Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Info card */}
        <View style={s.card}>
          <Text style={[s.h3, { marginBottom: 12 }]}>My Profile</Text>
          {[
            ['Enrollment No.', user?.id],
            ['Department', user?.department],
            ['Semester', `Semester ${user?.semester}`],
            ['HOD', dept?.hod?.name || '—'],
          ].map(([label, val]) => (
            <View key={label} style={[s.between, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.gray100 }]}>
              <Text style={s.muted}>{label}</Text>
              <Text style={[s.body, { fontWeight: '500' }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[['Quizzes', scores.length], ['Avg Score', avg + '%'], ['Best', scores.length ? Math.round(Math.max(...scores.map(s => (s.score / s.total) * 100))) + '%' : '—']].map(([l, v]) => (
            <View key={l} style={[s.statCard, { flex: 1 }]}>
              <Text style={s.muted}>{l}</Text>
              <Text style={[s.h2, { marginTop: 4 }]}>{v}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Subjects')}>
          <Text style={s.btnText}>📘 Browse Subjects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btnOutline, { marginTop: 10 }]} onPress={logout}>
          <Text style={s.btnOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
export default StudentDashboard;
