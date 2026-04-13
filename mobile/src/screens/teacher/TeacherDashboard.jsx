// mobile/src/screens/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getAllSubjects, getScoresBySubject, getQuestionsBySubject } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ quizzes: 0, questions: 0 });

  useEffect(() => {
    if (!user?.subjectIds?.length) return;
    getAllSubjects().then(all => {
      const mine = all.filter(sub => user.subjectIds.includes(sub.id));
      setSubjects(mine);
      Promise.all([
        ...mine.map(sub => getScoresBySubject(sub.id)),
        ...mine.map(sub => getQuestionsBySubject(sub.id)),
      ]).then(results => {
        const half = Math.floor(results.length / 2);
        setStats({
          quizzes: results.slice(0, half).flat().length,
          questions: results.slice(half).flat().length,
        });
      });
    });
  }, [user]);

  return (
    <ScrollView style={s.screen}>
      <View style={{ backgroundColor: colors.primary, padding: 24, paddingTop: 48 }}>
        <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700' }}>📚 {user?.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Teacher Portal</Text>
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[['My Subjects', subjects.length], ['Quizzes Taken', stats.quizzes], ['Questions', stats.questions]].map(([l, v]) => (
            <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={s.h2}>{v}</Text>
              <Text style={s.muted}>{l}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.h2, { marginBottom: 12 }]}>My Subjects</Text>
        {subjects.length === 0
          ? <Text style={s.muted}>No subjects assigned. Contact admin.</Text>
          : subjects.map(sub => (
            <View key={sub.id} style={s.card}>
              <Text style={s.h3}>{sub.name}</Text>
              <Text style={s.muted}>{sub.department} · Sem {sub.semester}</Text>
            </View>
          ))
        }
        <TouchableOpacity style={[s.btnOutline, { marginTop: 12 }]} onPress={logout}>
          <Text style={s.btnOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
