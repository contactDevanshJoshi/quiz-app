// mobile/src/screens/admin/AdminStudents.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, ActivityIndicator, FlatList
} from 'react-native';
import {
  getAllStudents, addStudent, updateStudent, deleteStudent, promoteStudent
} from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const emptyForm = { name: '', department: DEPARTMENTS[0], semester: 1, password: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    getAllStudents().then(setStudents).finally(() => setLoading(false));
  }

  function openAdd() { setEditStudent(null); setForm(emptyForm); setEnrollmentNo(''); setShowModal(true); }
  function openEdit(st) { setEditStudent(st); setForm({ name: st.name, department: st.department, semester: st.semester, password: '' }); setEnrollmentNo(st.id); setShowModal(true); }

  async function handleSave() {
    if (!form.name) { Alert.alert('Error', 'Name is required'); return; }
    setSaving(true);
    try {
      if (editStudent) {
        const updates = { name: form.name, department: form.department, semester: Number(form.semester) };
        if (form.password) updates.password = form.password;
        await updateStudent(editStudent.id, updates);
      } else {
        if (!enrollmentNo) { Alert.alert('Error', 'Enrollment number required'); return; }
        await addStudent(enrollmentNo, { ...form, semester: Number(form.semester) });
      }
      setShowModal(false);
      load();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Confirm', `Delete student ${id}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStudent(id); load(); } }
    ]);
  }

  async function handlePromote(st) {
    if (st.semester >= 8) { Alert.alert('Max semester reached'); return; }
    Alert.alert('Promote', `Promote ${st.name} to Semester ${st.semester + 1}?`, [
      { text: 'Cancel' },
      { text: 'Promote', onPress: async () => { await promoteStudent(st.id); load(); } }
    ]);
  }

  const filtered = students.filter(st =>
    !search || st.name.toLowerCase().includes(search.toLowerCase()) || st.id.includes(search)
  );

  const DeptPicker = ({ value, onChange }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {DEPARTMENTS.map(d => (
        <TouchableOpacity
          key={d}
          onPress={() => onChange(d)}
          style={[s.badge, { marginRight: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: value === d ? colors.primary : colors.gray100 }]}
        >
          <Text style={{ color: value === d ? colors.white : colors.gray700, fontSize: 12, fontWeight: '500' }}>{d}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const SemPicker = ({ value, onChange }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {SEMESTERS.map(n => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          style={[s.badge, { marginRight: 6, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: value === n ? colors.primary : colors.gray100 }]}
        >
          <Text style={{ color: value === n ? colors.white : colors.gray700, fontSize: 12, fontWeight: '500' }}>Sem {n}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={s.screen}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={[s.between, { marginBottom: 12 }]}>
          <Text style={s.h1}>Students</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={openAdd}>
            <Text style={s.btnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[s.input, { marginBottom: 8 }]}
          placeholder="Search by name or enrollment..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={<Text style={s.muted}>No students found.</Text>}
          renderItem={({ item: st }) => (
            <View style={s.card}>
              <View style={s.between}>
                <View style={{ flex: 1 }}>
                  <Text style={s.h3}>{st.name}</Text>
                  <Text style={s.muted}>{st.id}</Text>
                  <Text style={s.muted}>{st.department} · Sem {st.semester}</Text>
                </View>
                <View style={{ gap: 6 }}>
                  <TouchableOpacity
                    style={[s.badge, s.badgePrimary, { paddingVertical: 4 }]}
                    onPress={() => handlePromote(st)}
                  >
                    <Text style={s.badgePrimaryText}>⬆ Promote</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.badge, { backgroundColor: colors.gray100, paddingVertical: 4 }]}
                    onPress={() => openEdit(st)}
                  >
                    <Text style={{ color: colors.gray700, fontSize: 12 }}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.badge, s.badgeDanger, { paddingVertical: 4 }]}
                    onPress={() => handleDelete(st.id)}
                  >
                    <Text style={s.badgeDangerText}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ padding: 20 }}>
            <View style={[s.between, { marginBottom: 20 }]}>
              <Text style={s.h2}>{editStudent ? 'Edit Student' : 'Add Student'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>

            {!editStudent && (
              <View style={{ marginBottom: 14 }}>
                <Text style={s.label}>Enrollment Number *</Text>
                <TextInput style={s.input} value={enrollmentNo} onChangeText={setEnrollmentNo} placeholder="e.g. 22CS001" autoCapitalize="none" />
              </View>
            )}

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Full Name *</Text>
              <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            </View>

            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Department</Text>
              <DeptPicker value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} />
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>Semester</Text>
              <SemPicker value={form.semester} onChange={v => setForm(f => ({ ...f, semester: v }))} />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={s.label}>{editStudent ? 'New Password (optional)' : 'Password *'}</Text>
              <TextInput style={s.input} value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
            </View>

            <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving...' : 'Save Student'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
