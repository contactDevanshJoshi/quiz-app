// mobile/src/screens/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getDepartments, getAllStudents } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const [depts, setDepts] = useState([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    getDepartments().then(setDepts);
    getAllStudents().then(st => setStudentCount(st.length));
  }, []);

  return (
    <ScrollView style={s.screen}>
      <View style={{ backgroundColor: '#7C3AED', padding: 24, paddingTop: 48 }}>
        <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700' }}>👑 Super Admin</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>College-wide oversight</Text>
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[['Departments', depts.length], ['Students', studentCount], ['HODs Set', depts.filter(d => d.hod?.name).length]].map(([l, v]) => (
            <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
              <Text style={s.h2}>{v}</Text>
              <Text style={s.muted}>{l}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.h2, { marginBottom: 12 }]}>Department Status</Text>
        {depts.map(d => (
          <View key={d.id} style={s.card}>
            <View style={s.between}>
              <View>
                <Text style={s.h3}>{d.name || d.id}</Text>
                <Text style={s.muted}>{d.hod?.name ? `HOD: ${d.hod.name}` : 'No HOD assigned'}</Text>
              </View>
              <View style={[s.badge, d.hod?.name ? s.badgeSuccess : s.badgeWarning]}>
                <Text style={d.hod?.name ? s.badgeSuccessText : s.badgeWarningText}>
                  {d.hod?.name ? 'Active' : 'Vacant'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={[s.btnOutline, { marginTop: 12 }]} onPress={logout}>
          <Text style={s.btnOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
