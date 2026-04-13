// mobile/src/screens/student/StudentSubjects.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getSubjectsByDeptSemester, getChaptersBySubjectPhase } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const PHASES = ['T1', 'T2', 'T3', 'T4'];
const DIFFICULTIES = [
  { key: 'Easy', color: colors.success, bg: colors.successLight },
  { key: 'Medium', color: colors.warning, bg: colors.warningLight },
  { key: 'Hard', color: colors.danger, bg: colors.dangerLight },
];

export default function StudentSubjects({ navigation }) {
  const { user } = useAuth();
  const [step, setStep] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState({ subject: null, phase: null, chapter: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjectsByDeptSemester(user.department, user.semester).then(setSubjects).finally(() => setLoading(false));
  }, []);

  async function selectPhase(phase) {
    setSelected(s => ({ ...s, phase }));
    const chs = await getChaptersBySubjectPhase(selected.subject.id, phase);
    setChapters(chs);
    setStep('chapters');
  }

  function startQuiz(difficulty) {
    navigation.navigate('Quiz', {
      subject: selected.subject,
      phase: selected.phase,
      chapter: selected.chapter,
      difficulty,
    });
  }

  if (loading) return <View style={[s.screen, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={s.screen}>
      <View style={{ padding: 16 }}>

        {/* Breadcrumb */}
        <View style={[s.row, { flexWrap: 'wrap', gap: 6, marginBottom: 16 }]}>
          <TouchableOpacity onPress={() => setStep('subjects')}><Text style={{ color: colors.primary, fontSize: 13 }}>Subjects</Text></TouchableOpacity>
          {selected.subject && <><Text style={{ color: colors.gray300 }}> › </Text><TouchableOpacity onPress={() => setStep('phases')}><Text style={{ color: colors.primary, fontSize: 13 }}>{selected.subject.name}</Text></TouchableOpacity></>}
          {selected.phase && <><Text style={{ color: colors.gray300 }}> › </Text><TouchableOpacity onPress={() => setStep('chapters')}><Text style={{ color: colors.primary, fontSize: 13 }}>{selected.phase}</Text></TouchableOpacity></>}
        </View>

        {/* Subjects */}
        {step === 'subjects' && (
          <>
            <Text style={[s.h2, { marginBottom: 14 }]}>Your Subjects</Text>
            {subjects.map(sub => (
              <TouchableOpacity key={sub.id} style={s.card} onPress={() => { setSelected({ subject: sub, phase: null, chapter: null }); setStep('phases'); }}>
                <Text style={s.h3}>{sub.name}</Text>
                <Text style={s.muted}>{sub.code || 'No code'}</Text>
                <View style={[s.badge, s.badgePrimary, { alignSelf: 'flex-start', marginTop: 8 }]}>
                  <Text style={s.badgePrimaryText}>Sem {sub.semester}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {subjects.length === 0 && <Text style={s.muted}>No subjects found.</Text>}
          </>
        )}

        {/* Teaching Phases */}
        {step === 'phases' && (
          <>
            <Text style={[s.h2, { marginBottom: 14 }]}>{selected.subject?.name}</Text>
            <Text style={[s.muted, { marginBottom: 12 }]}>Select teaching phase</Text>
            {PHASES.map(p => (
              <TouchableOpacity
                key={p}
                style={[s.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => selectPhase(p)}
              >
                <View>
                  <Text style={s.h3}>{p}</Text>
                  <Text style={s.muted}>Teaching Phase</Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Chapters */}
        {step === 'chapters' && (
          <>
            <Text style={[s.h2, { marginBottom: 14 }]}>{selected.phase}</Text>
            {/* Full phase option */}
            <TouchableOpacity
              style={[s.card, { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight }]}
              onPress={() => { setSelected(s => ({ ...s, chapter: null })); setStep('difficulty'); }}
            >
              <Text style={[s.h3, { color: colors.primary }]}>Full {selected.phase}</Text>
              <Text style={[s.muted]}>All chapters combined</Text>
            </TouchableOpacity>
            {chapters.map(ch => (
              <TouchableOpacity
                key={ch.id}
                style={s.card}
                onPress={() => { setSelected(s => ({ ...s, chapter: ch })); setStep('difficulty'); }}
              >
                <Text style={s.h3}>{ch.name}</Text>
                <Text style={s.muted}>{selected.phase}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Difficulty */}
        {step === 'difficulty' && (
          <>
            <Text style={[s.h2, { marginBottom: 4 }]}>{selected.chapter?.name || `Full ${selected.phase}`}</Text>
            <Text style={[s.muted, { marginBottom: 20 }]}>Choose question level</Text>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d.key}
                style={[s.card, { backgroundColor: d.bg, borderColor: d.color, borderWidth: 2, marginBottom: 12 }]}
                onPress={() => startQuiz(d.key)}
              >
                <Text style={[s.h3, { color: d.color }]}>{d.key}</Text>
                <Text style={[s.muted, { color: d.color, opacity: 0.8 }]}>
                  {d.key === 'Easy' ? 'Basic concepts' : d.key === 'Medium' ? 'Applied knowledge' : 'Advanced problems'}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
