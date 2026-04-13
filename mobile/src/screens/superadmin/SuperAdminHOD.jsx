// mobile/src/screens/superadmin/SuperAdminHOD.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { getDepartments, setDepartmentHOD, addDepartment } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const DEFAULT_DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
const emptyHOD = { name: '', email: '', phone: '' };

export default function SuperAdminHOD() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState(emptyHOD);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  useEffect(() => { loadDepts(); }, []);

  async function loadDepts() {
    setLoading(true);
    const existing = await getDepartments();
    if (existing.length === 0) {
      await Promise.all(DEFAULT_DEPARTMENTS.map(name =>
        addDepartment(name.replace(/\s/g, '_').toLowerCase(), { name, hod: {} })
      ));
      getDepartments().then(setDepts).finally(() => setLoading(false));
    } else {
      setDepts(existing);
      setLoading(false);
    }
  }

  function openEdit(dept) {
    setEditDept(dept);
    setForm({ name: dept.hod?.name || '', email: dept.hod?.email || '', phone: dept.hod?.phone || '' });
  }

  async function handleSave() {
    if (!form.name) { Alert.alert('Error', 'HOD name is required'); return; }
    setSaving(true);
    try {
      await setDepartmentHOD(editDept.id, form);
      setEditDept(null);
      loadDepts();
    } finally { setSaving(false); }
  }

  async function handleAddDept() {
    if (!newDeptName.trim()) return;
    const id = newDeptName.trim().replace(/\s+/g, '_').toLowerCase();
    await addDepartment(id, { name: newDeptName.trim(), hod: {} });
    setShowAddModal(false);
    setNewDeptName('');
    loadDepts();
  }

  if (loading) return <View style={[s.screen, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[s.between, { marginBottom: 16 }]}>
          <Text style={s.h1}>HOD Management</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => setShowAddModal(true)}>
            <Text style={s.btnText}>+ Add Dept</Text>
          </TouchableOpacity>
        </View>

        {depts.map(dept => (
          <View key={dept.id} style={s.card}>
            <View style={s.between}>
              <View style={{ flex: 1 }}>
                <Text style={s.h3}>{dept.name || dept.id}</Text>
                {dept.hod?.name ? (
                  <View style={{ marginTop: 4 }}>
                    <Text style={s.body}><Text style={{ fontWeight: '600' }}>HOD:</Text> {dept.hod.name}</Text>
                    {dept.hod.email && <Text style={s.muted}>{dept.hod.email}</Text>}
                    {dept.hod.phone && <Text style={s.muted}>{dept.hod.phone}</Text>}
                  </View>
                ) : (
                  <View style={[s.badge, s.badgeWarning, { alignSelf: 'flex-start', marginTop: 4 }]}>
                    <Text style={s.badgeWarningText}>No HOD assigned</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[s.badge, s.badgePrimary, { paddingVertical: 6 }]}
                onPress={() => openEdit(dept)}
              >
                <Text style={s.badgePrimaryText}>{dept.hod?.name ? 'Edit' : 'Assign'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Edit HOD Modal */}
      <Modal
        visible={!!editDept}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditDept(null)}
      >
        <View style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
          <View style={[s.between, { marginBottom: 20 }]}>
            <Text style={s.h2}>{editDept?.hod?.name ? 'Edit HOD' : 'Assign HOD'}</Text>
            <TouchableOpacity onPress={() => setEditDept(null)}>
              <Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.muted, { marginBottom: 16 }]}>Department: {editDept?.name}</Text>

          <View style={{ marginBottom: 14 }}>
            <Text style={s.label}>HOD Full Name *</Text>
            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholder="Dr. Jane Smith"
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
              placeholder="hod@college.edu"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 28 }}>
            <Text style={s.label}>Phone Number</Text>
            <TextInput
              style={s.input}
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={s.btnPrimary} onPress={handleSave} disabled={saving}>
            <Text style={s.btnText}>{saving ? 'Saving...' : 'Save HOD'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Department Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
          <View style={[s.between, { marginBottom: 20 }]}>
            <Text style={s.h2}>Add Department</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={{ color: colors.gray500, fontSize: 24 }}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text style={s.label}>Department Name *</Text>
            <TextInput
              style={s.input}
              value={newDeptName}
              onChangeText={setNewDeptName}
              placeholder="e.g. Information Technology"
            />
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={handleAddDept}>
            <Text style={s.btnText}>Add Department</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
