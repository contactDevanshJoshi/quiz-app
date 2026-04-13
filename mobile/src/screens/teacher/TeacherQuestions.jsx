// mobile/src/screens/teacher/TeacherQuestions.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, FlatList
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllSubjects, getChaptersBySubject, getQuestionsBySubject,
  addQuestion, updateQuestion, deleteQuestion
} from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PHASES = ['T1', 'T2', 'T3', 'T4'];
const OPT_LABELS = ['A', 'B', 'C', 'D'];
const emptyForm = { text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'Easy', chapterId: '', subjectId: '', teachingPhase: 'T1' };

export default function TeacherQuestions() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editQ, setEditQ] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterDiff, setFilterDiff] = useState('');

  useEffect(() => {
    getAllSubjects().then(all => {
      const mine = user?.subjectIds?.length ? all.filter(s => user.subjectIds.includes(s.id)) : all;
      setSubjects(mine);
      if (mine.length > 0) selectSubject(mine[0]);
    });
  }, [user]);

  async function selectSubject(sub) {
    setSelectedSubject(sub);
    setLoading(true);
    const [chs, qs] = await Promise.all([getChaptersBySubject(sub.id), getQuestionsBySubject(sub.id)]);
    setChapters(chs);
    setQuestions(qs);
    setLoading(false);
  }

  function openAdd() {
    setEditQ(null);
    setForm({ ...emptyForm, subjectId: selectedSubject?.id || '' });
    setShowModal(true);
  }

  function openEdit(q) {
    setEditQ(q);
    setForm({ text: q.text, options: [...q.options], correctIndex: q.correctIndex, difficulty: q.difficulty, chapterId: q.chapterId, subjectId: q.subjectId, teachingPhase: q.teachingPhase });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.text || form.options.some(o => !o)) { Alert.alert('Error', 'Fill all fields'); return; }
    setSaving(true);
    try {
      if (editQ) await updateQuestion(editQ.id, form);
      else await addQuestion(form);
      setShowModal(false);
      selectSubject(selectedSubject);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Confirm', 'Delete this question?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteQuestion(id); selectSubject(selectedSubject); } }
    ]);
  }

  const diffColor = { Easy: colors.success, Medium: colors.warning, Hard: colors.danger };
  const filtered = questions.filter(q => !filterDiff || q.difficulty === filterDiff);
  const getChapterName = id => chapters.find(c => c.id === id)?.name || '—';

  return (
    <View style={s.screen}>
      {/* Subject selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52, paddingHorizontal: 16, paddingTop: 12 }}>
        {subjects.map(sub => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => selectSubject(sub)}
            style={[s.badge, { marginRight: 8, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: selectedSubject?.id === sub.id ? colors.primary : colors.gray100 }]}
          >
            <Text style={{ color: selectedSubject?.id === sub.id ? colors.white : colors.gray700, fontWeight: '500', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters */}
      <View style={[s.between, { paddingHorizontal: 16, paddingVertical: 10 }]}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['', ...DIFFICULTIES].map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setFilterDiff(d)}
              style={[s.badge, { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: filterDiff === d ? (diffColor[d] || colors.gray700) : colors.gray100 }]}
            >
              <Text style={{ color: filterDiff === d ? colors.white : colors.gray700, fontSize: 12 }}>{d || 'All'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={openAdd}>
          <Text style={s.btnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ListEmptyComponent={<Text style={s.muted}>No questions found.</Text>}
            renderItem={({ item: q, index }) => (
              <View style={s.card}>
                <View style={s.between}>
                  <Text style={[s.muted, { marginBottom: 4 }]}>Q{index + 1} · {q.teachingPhase}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={[s.badge, { backgroundColor: diffColor[q.difficulty] + '20' }]}>
                      <Text style={{ color: diffColor[q.difficulty], fontSize: 11, fontWeight: '600' }}>{q.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[s.body, { marginBottom: 6 }]} numberOfLines={2}>{q.text}</Text>
                <Text style={s.muted}>Chapter: {getChapterName(q.chapterId)}</Text>
                <View style={[s.row, { gap: 8, marginTop: 10 }]}>
                  <TouchableOpacity style={[s.btnOutline, { flex: 1, paddingVertical: 7 }]} onPress={() => openEdit(q)}>
                    <Text style={s.btnOutlineText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.btnDanger, { flex: 1, paddingVertical: 7 }]} onPress={() => handleDelete(q.id)}>
                    <Text style={s.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }

      {/* Question Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ padding: 20 }}>
            <View style={[s.between, { marginBottom: 20 }]}>
              <Text style={s.h2}>{editQ ? 'Edit Question' : 'Add Question'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text></TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Question Text *</Text>
              <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline value={form.text} onChangeText={v => setForm(f => ({ ...f, text: v }))} />
            </View>

            {OPT_LABELS.map((label, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <View style={s.row}>
                  <Text style={[s.label, { flex: 1 }]}>Option {label}{form.correctIndex === idx ? ' ✓ Correct' : ''}</Text>
                  <TouchableOpacity
                    onPress={() => setForm(f => ({ ...f, correctIndex: idx }))}
                    style={[s.badge, { backgroundColor: form.correctIndex === idx ? colors.success : colors.gray100 }]}
                  >
                    <Text style={{ color: form.correctIndex === idx ? colors.white : colors.gray500, fontSize: 12 }}>Set correct</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[s.input, { marginTop: 4, borderColor: form.correctIndex === idx ? colors.success : colors.gray300 }]}
                  value={form.options[idx]}
                  onChangeText={v => setForm(f => { const opts = [...f.options]; opts[idx] = v; return { ...f, options: opts }; })}
                />
              </View>
            ))}

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Difficulty</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                {DIFFICULTIES.map(d => (
                  <TouchableOpacity key={d} onPress={() => setForm(f => ({ ...f, difficulty: d }))}
                    style={{ flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: form.difficulty === d ? diffColor[d] : colors.gray100 }}>
                    <Text style={{ color: form.difficulty === d ? colors.white : colors.gray700, fontWeight: '600', fontSize: 13 }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Teaching Phase</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                {PHASES.map(p => (
                  <TouchableOpacity key={p} onPress={() => setForm(f => ({ ...f, teachingPhase: p, chapterId: '' }))}
                    style={{ flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: form.teachingPhase === p ? colors.primary : colors.gray100 }}>
                    <Text style={{ color: form.teachingPhase === p ? colors.white : colors.gray700, fontWeight: '600', fontSize: 13 }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={s.label}>Chapter</Text>
              {chapters.filter(c => c.teachingPhase === form.teachingPhase).map(ch => (
                <TouchableOpacity key={ch.id} onPress={() => setForm(f => ({ ...f, chapterId: ch.id }))}
                  style={[s.between, { padding: 10, borderRadius: 8, marginTop: 6, backgroundColor: form.chapterId === ch.id ? colors.primaryLight : colors.gray50, borderWidth: 1, borderColor: form.chapterId === ch.id ? colors.primary : colors.gray200 }]}>
                  <Text style={{ color: form.chapterId === ch.id ? colors.primary : colors.gray700 }}>{ch.name}</Text>
                  {form.chapterId === ch.id && <Text style={{ color: colors.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving...' : 'Save Question'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
