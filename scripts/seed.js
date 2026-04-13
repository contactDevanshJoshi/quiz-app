// scripts/seed.js
// Run once: node scripts/seed.js
// Requires: npm install firebase-admin

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding Firestore...');

  // Super Admin
  await db.collection('superadmins').add({
    username: 'superadmin',
    password: 'super@123',    // Change this immediately after first login
    name: 'Super Administrator',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✓ Super admin created (username: superadmin, password: super@123)');

  // Default Admin
  await db.collection('admins').add({
    username: 'admin',
    password: 'admin@123',    // Change this immediately after first login
    name: 'College Administrator',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✓ Admin created (username: admin, password: admin@123)');

  // Departments
  const departments = [
    { id: 'computer_science', name: 'Computer Science', hod: {} },
    { id: 'electronics',      name: 'Electronics',      hod: {} },
    { id: 'mechanical',       name: 'Mechanical',        hod: {} },
    { id: 'civil',            name: 'Civil',             hod: {} },
    { id: 'chemical',         name: 'Chemical',          hod: {} },
  ];
  for (const dept of departments) {
    await db.collection('departments').doc(dept.id).set({ name: dept.name, hod: dept.hod });
  }
  console.log('✓ Departments created');

  // Sample teacher
  await db.collection('teachers').add({
    username: 'teacher1',
    password: 'teacher@123',
    name: 'Prof. Sample Teacher',
    subjectIds: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✓ Sample teacher created (username: teacher1, password: teacher@123)');

  // Sample student
  await db.collection('students').doc('22CS001').set({
    name: 'Sample Student',
    department: 'Computer Science',
    semester: 3,
    password: 'student@123',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✓ Sample student created (enrollment: 22CS001, password: student@123)');

  console.log('\n🎉 Seed complete! Change all passwords immediately.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
