# College Quiz App

Full-stack quiz platform with **4 portals** — Student, Admin, Teacher, Super Admin — built with React (web) + React Native (mobile) + Firebase Firestore.

---

## Project Structure

```
quiz-app/
├── shared/                  # Shared between web & mobile
│   ├── firebase/
│   │   ├── config.js        # Firebase config (add your keys here)
│   │   └── firestore.js     # All Firestore operations
│   ├── hooks/
│   │   └── useAuth.js       # Auth context (web)
│   └── utils/
│       └── csv.js           # CSV import/export utilities
│
├── web/                     # React web app (CRA)
│   ├── public/index.html
│   └── src/
│       ├── App.jsx          # Router + protected routes
│       ├── styles/global.css
│       ├── pages/LoginGateway.jsx
│       └── components/
│           ├── student/     # Dashboard, Subjects, Quiz, Scores
│           ├── admin/       # Dashboard, Students, Subjects, Teachers
│           ├── teacher/     # Dashboard, Questions, Scores
│           └── superadmin/  # Dashboard, HOD Management
│
├── mobile/                  # React Native app
│   ├── index.js
│   └── src/
│       ├── theme.js         # Colors + shared styles
│       ├── hooks/useAuth.js # Auth context (AsyncStorage)
│       ├── navigation/      # Stack + Tab navigators per role
│       └── screens/
│           ├── auth/LoginScreen.jsx
│           ├── student/     # Dashboard, Subjects, Quiz, Scores
│           ├── admin/       # Dashboard, Students, Subjects, Teachers
│           ├── teacher/     # Dashboard, Questions, Scores
│           └── superadmin/  # Dashboard, HOD
│
├── scripts/seed.js          # One-time Firestore seeder
├── firestore.rules          # Firestore security rules
└── README.md
```

---

## Setup

### 1. Firebase Config

Edit `shared/firebase/config.js` and replace with your Firebase project credentials:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  ...
};
```

### 2. Seed Initial Data

```bash
cd quiz-app
npm install firebase-admin
# Download serviceAccountKey.json from Firebase Console → Project Settings → Service Accounts
node scripts/seed.js
```

Default credentials created:
| Role        | Username/Enrollment | Password      |
|-------------|---------------------|---------------|
| Super Admin | superadmin          | super@123     |
| Admin       | admin               | admin@123     |
| Teacher     | teacher1            | teacher@123   |
| Student     | 22CS001             | student@123   |

**Change all passwords immediately after first login.**

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## Web App Setup

```bash
cd web
npm install
npm start          # Development
npm run build      # Production build
```

---

## Mobile App Setup

```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

---

## Firestore Collections

| Collection     | Doc ID          | Key Fields |
|----------------|-----------------|------------|
| `students`     | enrollmentNo    | name, department, semester, password |
| `admins`       | auto            | username, password, name |
| `teachers`     | auto            | username, password, name, subjectIds[] |
| `superadmins`  | auto            | username, password, name |
| `departments`  | dept_slug       | name, hod{name, email, phone} |
| `subjects`     | auto            | name, code, department, semester |
| `chapters`     | auto            | name, subjectId, teachingPhase |
| `questions`    | auto            | text, options[], correctIndex, difficulty, chapterId, subjectId, teachingPhase |
| `scores`       | auto            | enrollmentNo, subjectId, chapterId, score, total, wrongQuestions[], difficulty |

---

## Features by Role

### 🎓 Student
- Login via enrollment number + password
- View profile: name, enrollment, semester, department, HOD name
- Browse subjects filtered by department + semester
- Select Teaching Phase (T1/T2/T3/T4)
- Select chapter or "Full T1/T2/..." (all chapters in phase)
- Choose difficulty: Easy / Medium / Hard
- Take 10-question randomized quiz with live right/wrong feedback
- Score saved to Firestore automatically
- Score history with wrong answer review

### ⚙️ Admin
- Bulk student import via CSV (template provided)
- Add / Edit / Delete students
- Promote student to next semester
- Export student list as CSV
- Manage subjects + chapters per department/semester
- Manage teachers + subject assignments

### 📚 Teacher
- View assigned subjects
- Add / Edit / Delete questions with difficulty + chapter
- Bulk question import via CSV (template provided)
- View all student scores per subject
- Filter by difficulty / student name
- Download scores as CSV

### 👑 Super Admin
- Assign/Edit HOD per department (name, email, phone)
- Add new departments
- College-wide overview dashboard

---

## CSV Templates

### Student Import (`student_template.csv`)
```
enrollmentNo,name,department,semester,password
22CS001,John Doe,Computer Science,3,pass123
```

### Question Import (`question_template.csv`)
```
text,optionA,optionB,optionC,optionD,correctIndex,difficulty,chapterId,subjectId,teachingPhase
"What is 2+2?",2,3,4,5,2,Easy,CHAPTER_ID,SUBJECT_ID,T1
```
- `correctIndex`: 0=A, 1=B, 2=C, 3=D
- Get chapter/subject IDs from Firestore console

---

## Security Notes

- Passwords are stored in plain text in this implementation for simplicity. **For production, use bcrypt hashing via Firebase Cloud Functions.**
- Firestore rules are permissive in dev. Tighten before deploying publicly.
- Consider migrating to Firebase Authentication for proper token-based auth.
