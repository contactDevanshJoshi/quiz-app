// mobile/src/screens/admin/AdminSubjects.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator
} from 'react-native';
import {
  getAllSubjects, addSubject, deleteSubject,
  getChaptersBySubject, addChapter, deleteChapter
} from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const PHASES = ['T1', 'T2', 'T3', 'T4'];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showChModal, setShowChModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', code: '', department: DEPARTMENTS[0], semester: 1 });
  const [chForm, setChForm] = useState({ name: '', teachingPhase: 'T1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSubjects(); }, []);

  function loadSubjects() {
    getAllSubjects().then(setSubjects).finally(() => setLoading(false));
  }

  async function selectSubject(sub) {
    setSelectedSubject(sub);
    const chs = await getChaptersBySubject(sub.id);
    setChapters(chs);
  }

  async function handleAddSubject() {
    if (!subForm.name) { Alert.alert('Error', 'Subject name required'); return; }
    setSaving(true);
    try {
      await addSubject({ ...subForm, semester: Number(subForm.semester) });
      setShowSubModal(false);
      loadSubjects();
    } finally { setSaving(false); }
  }

  async function handleDeleteSubject(id) {
    Alert.alert('Confirm', 'Delete this subject?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSubject(id); if (selectedSubject?.id === id) setSelectedSubject(null); loadSubjects(); } }
    ]);
  }

  async function handleAddChapter() {
    if (!chForm.name) { Alert.alert('Error', 'Chapter name required'); return; }
    setSaving(true);
    try {
      await addChapter({ ...chForm, subjectId: selectedSubject.id });
      setShowChModal(false);
      selectSubject(selectedSubject);
      setChForm({ name: '', teachingPhase: 'T1' });
    } finally { setSaving(false); }
  }

  async function handleDeleteChapter(id) {
    Alert.alert('Confirm', 'Delete this chapter?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteChapter(id); selectSubject(selectedSubject); } }
    ]);
  }

  const PhaseToggle = ({ value, onChange }) => (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
      {PHASES.map(p => (
        <TouchableOpacity
          key={p}
          onPress={() => onChange(p)}
          style={{ flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: value === p ? colors.primary : colors.gray100 }}
        >
          <Text style={{ color: value === p ? colors.white : colors.gray700, fontWeight: '600', fontSize: 13 }}>{p}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[s.between, { marginBottom: 16 }]}>
          <Text style={s.h1}>Subjects</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => setShowSubModal(true)}>
            <Text style={s.btnText}>+ Add Subject</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} /> : subjects.map(sub => (
          <TouchableOpacity
            key={sub.id}
            style={[s.card, selectedSubject?.id === sub.id && { borderColor: colors.primary, borderWidth: 2 }]}
            onPress={() => selectSubject(sub)}
          >
            <View style={s.between}>
              <View style={{ flex: 1 }}>
                <Text style={s.h3}>{sub.name}</Text>
                <Text style={s.muted}>{sub.department} · Sem {sub.semester}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteSubject(sub.id)} style={[s.badge, s.badgeDanger]}>
                <Text style={s.badgeDangerText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Chapters for selected subject */}
        {selectedSubject && (
          <View style={{ marginTop: 8 }}>
            <View style={[s.between, { marginBottom: 12 }]}>
              <Text style={s.h2}>Chapters — {selectedSubject.name}</Text>
              <TouchableOpacity style={s.btnPrimary} onPress={() => setShowChModal(true)}>
                <Text style={s.btnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {PHASES.map(phase => {
              const phChs = chapters.filter(c => c.teachingPhase === phase);
              return (
                <View key={phase} style={{ marginBottom: 12 }}>
                  <View style={[s.badge, s.badgePrimary, { alignSelf: 'flex-start', marginBottom: 6 }]}>
                    <Text style={s.badgePrimaryText}>{phase}</Text>
                  </View>
                  {phChs.length === 0
                    ? <Text style={[s.muted, { paddingLeft: 8 }]}>No chapters</Text>
                    : phChs.map(ch => (
                      <View key={ch.id} style={[s.between, { backgroundColor: colors.gray50, padding: 10, borderRadius: 8, marginBottom: 4 }]}>
                        <Text style={s.body}>{ch.name}</Text>
                        <TouchableOpacity onPress={() => handleDeleteChapter(ch.id)}>
                          <Text style={{ color: colors.danger, fontSize: 18 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  }
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Subject Modal */}
      <Modal visible={showSubModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSubModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ padding: 20 }}>
            <View style={[s.between, { marginBottom: 20 }]}>
              <Text style={s.h2}>Add Subject</Text>
              <TouchableOpacity onPress={() => setShowSubModal(false)}><Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text></TouchableOpacity>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Subject Name *</Text>
              <TextInput style={s.input} value={subForm.name} onChangeText={v => setSubForm(f => ({ ...f, name: v }))} />
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Subject Code</Text>
              <TextInput style={s.input} value={subForm.code} onChangeText={v => setSubForm(f => ({ ...f, code: v }))} placeholder="e.g. CS301" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={s.label}>Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {DEPARTMENTS.map(d => (
                  <TouchableOpacity key={d} onPress={() => setSubForm(f => ({ ...f, department: d }))}
                    style={[s.badge, { marginRight: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: subForm.department === d ? colors.primary : colors.gray100 }]}>
                    <Text style={{ color: subForm.department === d ? colors.white : colors.gray700, fontSize: 12 }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={s.label}>Semester</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {SEMESTERS.map(n => (
                  <TouchableOpacity key={n} onPress={() => setSubForm(f => ({ ...f, semester: n }))}
                    style={[s.badge, { marginRight: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: subForm.semester === n ? colors.primary : colors.gray100 }]}>
                    <Text style={{ color: subForm.semester === n ? colors.white : colors.gray700, fontSize: 12 }}>Sem {n}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={s.btnPrimary} onPress={handleAddSubject} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving...' : 'Add Subject'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal visible={showChModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowChModal(false)}>
        <View style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
          <View style={[s.between, { marginBottom: 20 }]}>
            <Text style={s.h2}>Add Chapter</Text>
            <TouchableOpacity onPress={() => setShowChModal(false)}><Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text></TouchableOpacity>
          </View>
          <View style={{ marginBottom: 14 }}>
            <Text style={s.label}>Chapter Name *</Text>
            <TextInput style={s.input} value={chForm.name} onChangeText={v => setChForm(f => ({ ...f, name: v }))} />
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text style={s.label}>Teaching Phase</Text>
            <PhaseToggle value={chForm.teachingPhase} onChange={v => setChForm(f => ({ ...f, teachingPhase: v }))} />
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={handleAddChapter} disabled={saving}>
            <Text style={s.btnText}>{saving ? 'Saving...' : 'Add Chapter'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
