// shared/firebase/firestore.js
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, addDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function loginStudent(enrollmentNo, password) {
  const ref = doc(db, 'students', enrollmentNo);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Student not found');
  const data = snap.data();
  if (data.password !== password) throw new Error('Invalid password');
  return { id: snap.id, ...data };
}

export async function loginAdmin(username, password) {
  const q = query(collection(db, 'admins'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Admin not found');
  const data = snap.docs[0].data();
  if (data.password !== password) throw new Error('Invalid password');
  return { id: snap.docs[0].id, ...data };
}

export async function loginTeacher(username, password) {
  const q = query(collection(db, 'teachers'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Teacher not found');
  const data = snap.docs[0].data();
  if (data.password !== password) throw new Error('Invalid password');
  return { id: snap.docs[0].id, ...data };
}

export async function loginSuperAdmin(username, password) {
  const q = query(collection(db, 'superadmins'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Not found');
  const data = snap.docs[0].data();
  if (data.password !== password) throw new Error('Invalid password');
  return { id: snap.docs[0].id, ...data };
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export async function getStudent(enrollmentNo) {
  const snap = await getDoc(doc(db, 'students', enrollmentNo));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllStudents() {
  const snap = await getDocs(collection(db, 'students'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getStudentsByDepartment(department) {
  const q = query(collection(db, 'students'), where('department', '==', department));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addStudent(enrollmentNo, data) {
  await setDoc(doc(db, 'students', enrollmentNo), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function bulkAddStudents(students) {
  const batches = [];
  for (let i = 0; i < students.length; i += 499) {
    const batch = writeBatch(db);
    students.slice(i, i + 499).forEach(s => {
      batch.set(doc(db, 'students', s.enrollmentNo), {
        name: s.name,
        department: s.department,
        semester: Number(s.semester),
        password: s.password,
        createdAt: serverTimestamp(),
      });
    });
    batches.push(batch.commit());
  }
  await Promise.all(batches);
}

export async function updateStudent(enrollmentNo, data) {
  await updateDoc(doc(db, 'students', enrollmentNo), data);
}

export async function deleteStudent(enrollmentNo) {
  await deleteDoc(doc(db, 'students', enrollmentNo));
}

export async function promoteStudent(enrollmentNo) {
  const snap = await getDoc(doc(db, 'students', enrollmentNo));
  const current = snap.data().semester;
  if (current >= 8) throw new Error('Already at max semester');
  await updateDoc(doc(db, 'students', enrollmentNo), { semester: current + 1 });
}

// ─── DEPARTMENTS / HOD ───────────────────────────────────────────────────────

export async function getDepartments() {
  const snap = await getDocs(collection(db, 'departments'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDepartment(deptId) {
  const snap = await getDoc(doc(db, 'departments', deptId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setDepartmentHOD(deptId, hodData) {
  await updateDoc(doc(db, 'departments', deptId), { hod: hodData });
}

export async function addDepartment(deptId, data) {
  await setDoc(doc(db, 'departments', deptId), data);
}

// ─── SUBJECTS ────────────────────────────────────────────────────────────────

export async function getSubjectsByDeptSemester(department, semester) {
  const q = query(
    collection(db, 'subjects'),
    where('department', '==', department),
    where('semester', '==', semester)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllSubjects() {
  const snap = await getDocs(collection(db, 'subjects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addSubject(data) {
  return await addDoc(collection(db, 'subjects'), { ...data, createdAt: serverTimestamp() });
}

export async function deleteSubject(subjectId) {
  await deleteDoc(doc(db, 'subjects', subjectId));
}

// ─── CHAPTERS ────────────────────────────────────────────────────────────────

export async function getChaptersBySubjectPhase(subjectId, phase) {
  const q = query(
    collection(db, 'chapters'),
    where('subjectId', '==', subjectId),
    where('teachingPhase', '==', phase)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getChaptersBySubject(subjectId) {
  const q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addChapter(data) {
  return await addDoc(collection(db, 'chapters'), { ...data, createdAt: serverTimestamp() });
}

export async function deleteChapter(chapterId) {
  await deleteDoc(doc(db, 'chapters', chapterId));
}

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

export async function getQuestions(subjectId, chapterId, difficulty) {
  let q;
  if (chapterId === 'full') {
    q = query(
      collection(db, 'questions'),
      where('subjectId', '==', subjectId),
      where('difficulty', '==', difficulty)
    );
  } else {
    q = query(
      collection(db, 'questions'),
      where('chapterId', '==', chapterId),
      where('difficulty', '==', difficulty)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getQuestionsBySubject(subjectId) {
  const q = query(collection(db, 'questions'), where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addQuestion(data) {
  return await addDoc(collection(db, 'questions'), { ...data, createdAt: serverTimestamp() });
}

export async function bulkAddQuestions(questions) {
  const batches = [];
  for (let i = 0; i < questions.length; i += 499) {
    const batch = writeBatch(db);
    questions.slice(i, i + 499).forEach(q => {
      const ref = doc(collection(db, 'questions'));
      batch.set(ref, { ...q, createdAt: serverTimestamp() });
    });
    batches.push(batch.commit());
  }
  await Promise.all(batches);
}

export async function updateQuestion(questionId, data) {
  await updateDoc(doc(db, 'questions', questionId), data);
}

export async function deleteQuestion(questionId) {
  await deleteDoc(doc(db, 'questions', questionId));
}

// ─── SCORES ──────────────────────────────────────────────────────────────────

export async function saveScore(data) {
  return await addDoc(collection(db, 'scores'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getStudentScores(enrollmentNo) {
  const q = query(
    collection(db, 'scores'),
    where('enrollmentNo', '==', enrollmentNo),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getScoresBySubject(subjectId) {
  const q = query(collection(db, 'scores'), where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getScoresByTeacher(teacherId) {
  const q = query(collection(db, 'scores'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── TEACHERS ────────────────────────────────────────────────────────────────

export async function getAllTeachers() {
  const snap = await getDocs(collection(db, 'teachers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addTeacher(data) {
  return await addDoc(collection(db, 'teachers'), { ...data, createdAt: serverTimestamp() });
}

export async function updateTeacher(teacherId, data) {
  await updateDoc(doc(db, 'teachers', teacherId), data);
}

export async function deleteTeacher(teacherId) {
  await deleteDoc(doc(db, 'teachers', teacherId));
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

export function shuffleAndPick(arr, n = 10) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
