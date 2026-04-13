// mobile/src/screens/admin/AdminTeachers.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, FlatList
} from 'react-native';
import {
  getAllTeachers, addTeacher, updateTeacher, deleteTeacher, getAllSubjects
} from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const emptyForm = { name: '', username: '', password: '', subjectIds: [] };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAllTeachers(), getAllSubjects()]).then(([t, sub]) => {
      setTeachers(t); setSubjects(sub);
    }).finally(() => setLoading(false));
  }, []);

  function load() { getAllTeachers().then(setTeachers); }

  function openAdd() { setEditTeacher(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(t) {
    setEditTeacher(t);
    setForm({ name: t.name, username: t.username, password: '', subjectIds: t.subjectIds || [] });
    setShowModal(true);
  }

  function toggleSubject(id) {
    setForm(f => ({
      ...f,
      subjectIds: f.subjectIds.includes(id)
        ? f.subjectIds.filter(s => s !== id)
        : [...f.subjectIds, id]
    }));
  }

  async function handleSave() {
    if (!form.name) { Alert.alert('Error', 'Name required'); return; }
    setSaving(true);
    try {
      if (editTeacher) {
        const updates = { name: form.name, subjectIds: form.subjectIds };
        if (form.password) updates.password = form.password;
        await updateTeacher(editTeacher.id, updates);
      } else {
        await addTeacher({ name: form.name, username: form.username, password: form.password, subjectIds: form.subjectIds });
      }
      setShowModal(false);
      load();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Confirm', 'Delete this teacher?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTeacher(id); load(); } }
    ]);
  }

  return (
    <View style={s.screen}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={[s.between, { marginBottom: 12 }]}>
          <Text style={s.h1}>Teachers</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={openAdd}>
            <Text style={s.btnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading
        ? <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        : (
          <FlatList
            data={teachers}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ListEmptyComponent={<Text style={s.muted}>No teachers yet.</Text>}
            renderItem={({ item: t }) => (
              <View style={s.card}>
                <View style={s.between}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.h3}>{t.name}</Text>
                    <Text style={s.muted}>@{t.username}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {(t.subjectIds || []).map(sid => {
                        const sub = subjects.find(s => s.id === sid);
                        return sub ? (
                          <View key={sid} style={[s.badge, s.badgePrimary]}>
                            <Text style={s.badgePrimaryText}>{sub.name}</Text>
                          </View>
                        ) : null;
                      })}
                      {(!t.subjectIds || t.subjectIds.length === 0) && (
                        <Text style={s.muted}>No subjects assigned</Text>
                      )}
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity style={[s.badge, { backgroundColor: colors.gray100, paddingVertical: 4 }]} onPress={() => openEdit(t)}>
                      <Text style={{ color: colors.gray700, fontSize: 12 }}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.badge, s.badgeDanger, { paddingVertical: 4 }]} onPress={() => handleDelete(t.id)}>
                      <Text style={s.badgeDangerText}>🗑 Del</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )
      }

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ padding: 20 }}>
            <View style={[s.between, { marginBottom: 20 }]}>
              <Text style={s.h2}>{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text></TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Full Name *</Text>
              <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            </View>

            {!editTeacher && (
              <View style={{ marginBottom: 14 }}>
                <Text style={s.label}>Username *</Text>
                <TextInput style={s.input} value={form.username} onChangeText={v => setForm(f => ({ ...f, username: v }))} autoCapitalize="none" />
              </View>
            )}

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>{editTeacher ? 'New Password (optional)' : 'Password *'}</Text>
              <TextInput style={s.input} value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[s.label, { marginBottom: 10 }]}>Assign Subjects</Text>
              {subjects.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => toggleSubject(sub.id)}
                  style={[s.between, {
                    padding: 10, borderRadius: 8, marginBottom: 6,
                    backgroundColor: form.subjectIds.includes(sub.id) ? colors.primaryLight : colors.gray50,
                    borderWidth: 1,
                    borderColor: form.subjectIds.includes(sub.id) ? colors.primary : colors.gray200,
                  }]}
                >
                  <View>
                    <Text style={[s.body, form.subjectIds.includes(sub.id) && { color: colors.primary, fontWeight: '600' }]}>{sub.name}</Text>
                    <Text style={s.muted}>{sub.department} · Sem {sub.semester}</Text>
                  </View>
                  <Text style={{ color: form.subjectIds.includes(sub.id) ? colors.primary : colors.gray300, fontSize: 20 }}>
                    {form.subjectIds.includes(sub.id) ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving...' : 'Save Teacher'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
