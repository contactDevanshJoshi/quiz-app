// mobile/src/screens/teacher/TeacherScores.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getAllSubjects, getScoresBySubject } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export default function TeacherScores() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');

  useEffect(() => {
    getAllSubjects().then(all => {
      const mine = user?.subjectIds?.length ? all.filter(s => user.subjectIds.includes(s.id)) : all;
      setSubjects(mine);
      if (mine.length > 0) loadScores(mine[0]);
    });
  }, [user]);

  async function loadScores(sub) {
    setSelectedSubject(sub);
    setLoading(true);
    getScoresBySubject(sub.id).then(setScores).finally(() => setLoading(false));
  }

  const filtered = scores.filter(sc =>
    (!filterDiff || sc.difficulty === filterDiff) &&
    (!search || sc.studentName?.toLowerCase().includes(search.toLowerCase()) || sc.enrollmentNo?.includes(search))
  );

  const avg = filtered.length ? Math.round(filtered.reduce((a, sc) => a + (sc.score / sc.total) * 100, 0) / filtered.length) : 0;
  const diffColor = { Easy: colors.success, Medium: colors.warning, Hard: colors.danger };

  return (
    <View style={s.screen}>
      {/* Subject tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52, paddingHorizontal: 16, paddingTop: 12 }}>
        {subjects.map(sub => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => loadScores(sub)}
            style={[s.badge, { marginRight: 8, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: selectedSubject?.id === sub.id ? colors.primary : colors.gray100 }]}
          >
            <Text style={{ color: selectedSubject?.id === sub.id ? colors.white : colors.gray700, fontWeight: '500', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: 16, paddingBottom: 8 }}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {[['Attempts', filtered.length], ['Avg Score', avg + '%'], ['Top', filtered.length ? Math.round(Math.max(...filtered.map(sc => (sc.score / sc.total) * 100))) + '%' : '—']].map(([l, v]) => (
            <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={s.muted}>{l}</Text>
              <Text style={s.h2}>{v}</Text>
            </View>
          ))}
        </View>

        <TextInput style={[s.input, { marginBottom: 8 }]} placeholder="Search student..." value={search} onChangeText={setSearch} />

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['', 'Easy', 'Medium', 'Hard'].map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setFilterDiff(d)}
              style={[s.badge, { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: filterDiff === d ? (diffColor[d] || colors.gray700) : colors.gray100 }]}
            >
              <Text style={{ color: filterDiff === d ? colors.white : colors.gray700, fontSize: 12 }}>{d || 'All'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading
        ? <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ListEmptyComponent={<Text style={s.muted}>No scores yet.</Text>}
            renderItem={({ item: sc }) => {
              const pct = Math.round((sc.score / sc.total) * 100);
              const col = pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.danger;
              return (
                <View style={s.card}>
                  <View style={s.between}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.h3}>{sc.studentName}</Text>
                      <Text style={s.muted}>{sc.enrollmentNo}</Text>
                      <Text style={s.muted}>{sc.chapterName} · {sc.teachingPhase}</Text>
                      <View style={[s.badge, { alignSelf: 'flex-start', marginTop: 4, backgroundColor: (diffColor[sc.difficulty] || colors.gray500) + '20' }]}>
                        <Text style={{ color: diffColor[sc.difficulty] || colors.gray700, fontSize: 11, fontWeight: '600' }}>{sc.difficulty}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 22, fontWeight: '700', color: col }}>{pct}%</Text>
                      <Text style={s.muted}>{sc.score}/{sc.total}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )
      }
    </View>
  );
}
