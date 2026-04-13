// mobile/src/screens/student/StudentScores.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getStudentScores } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export default function StudentScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getStudentScores(user.id).then(setScores).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={[s.screen, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const avg = scores.length ? Math.round(scores.reduce((a, sc) => a + (sc.score / sc.total) * 100, 0) / scores.length) : 0;

  return (
    <ScrollView style={s.screen}>
      <View style={{ padding: 16 }}>
        <Text style={[s.h1, { marginBottom: 16 }]}>My Scores</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[['Quizzes', scores.length], ['Avg', avg + '%'], ['Best', scores.length ? Math.round(Math.max(...scores.map(sc => (sc.score / sc.total) * 100))) + '%' : '—']].map(([l, v]) => (
            <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={s.muted}>{l}</Text>
              <Text style={s.h2}>{v}</Text>
            </View>
          ))}
        </View>

        {scores.length === 0 && <Text style={s.muted}>No quiz attempts yet.</Text>}
        {scores.map(sc => {
          const pct = Math.round((sc.score / sc.total) * 100);
          const isExp = expanded === sc.id;
          return (
            <TouchableOpacity key={sc.id} style={s.card} onPress={() => setExpanded(isExp ? null : sc.id)}>
              <View style={s.between}>
                <View style={{ flex: 1 }}>
                  <Text style={s.h3}>{sc.subjectName}</Text>
                  <Text style={s.muted}>{sc.chapterName} · {sc.teachingPhase}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '700', color: pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.danger }}>{sc.score}/{sc.total}</Text>
                  <Text style={s.muted}>{pct}%</Text>
                </View>
              </View>
              {isExp && sc.wrongQuestions?.length > 0 && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray200 }}>
                  <Text style={{ color: colors.danger, fontWeight: '600', marginBottom: 8 }}>Wrong Answers</Text>
                  {sc.wrongQuestions.map((wq, i) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                      <Text style={[s.body, { marginBottom: 4 }]}>{i + 1}. {wq.text}</Text>
                      {wq.options.map((opt, idx) => (
                        <Text key={idx} style={{
                          fontSize: 12, padding: 4,
                          color: idx === wq.correctIndex ? colors.success : idx === wq.selectedIndex ? colors.danger : colors.gray500,
                          fontWeight: idx === wq.correctIndex ? '600' : '400'
                        }}>
                          {['A','B','C','D'][idx]}. {opt}{idx === wq.correctIndex ? ' ✓' : idx === wq.selectedIndex ? ' ✗' : ''}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
