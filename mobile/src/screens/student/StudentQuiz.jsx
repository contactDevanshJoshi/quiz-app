// mobile/src/screens/student/StudentQuiz.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getQuestions, saveScore, shuffleAndPick } from '../../../../shared/firebase/firestore';
import { s, colors } from '../../theme';

const OPT_LABELS = ['A', 'B', 'C', 'D'];

export default function StudentQuiz({ route, navigation }) {
  const { user } = useAuth();
  const { subject, phase, chapter, difficulty } = route.params;
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [showWrong, setShowWrong] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chapterId = chapter ? chapter.id : 'full';
    getQuestions(subject.id, chapterId, difficulty).then(qs => {
      setQuestions(shuffleAndPick(qs, 10));
      setLoading(false);
    });
  }, []);

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = questions[current];
    setResults(r => [...r, { question: q, selected: idx, correct: idx === q.correctIndex }]);
  }

  async function handleNext() {
    if (current + 1 >= questions.length) {
      const score = results.filter(r => r.correct).length + (selected === questions[current]?.correctIndex ? 1 : 0);
      const finalResults = results;
      const wrong = finalResults.filter(r => !r.correct);
      const sd = {
        enrollmentNo: user.id, studentName: user.name,
        subjectId: subject.id, subjectName: subject.name,
        chapterId: chapter?.id || 'full', chapterName: chapter?.name || `Full ${phase}`,
        teachingPhase: phase, difficulty,
        score: finalResults.filter(r => r.correct).length,
        total: questions.length,
        wrongQuestions: wrong.map(w => ({
          text: w.question.text, options: w.question.options,
          correctIndex: w.question.correctIndex, selectedIndex: w.selected,
        })),
      };
      await saveScore(sd);
      setScoreData(sd);
      setQuizDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (loading) return <View style={[s.screen, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (questions.length === 0) {
    return (
      <View style={[s.screen, s.center, { padding: 24 }]}>
        <Text style={[s.h2, { marginBottom: 8 }]}>No Questions Found</Text>
        <Text style={[s.muted, { marginBottom: 20, textAlign: 'center' }]}>No {difficulty} questions available for this selection.</Text>
        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.goBack()}>
          <Text style={s.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Score screen
  if (quizDone && scoreData) {
    const pct = Math.round((scoreData.score / scoreData.total) * 100);
    const ringColor = pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.danger;
    return (
      <ScrollView style={s.screen}>
        <View style={{ padding: 24 }}>
          <Text style={[s.h1, { marginBottom: 24, textAlign: 'center' }]}>Quiz Complete! 🎉</Text>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: ringColor, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: ringColor }}>{scoreData.score}</Text>
              <Text style={s.muted}>/ {scoreData.total}</Text>
            </View>
            <Text style={[s.h2, { marginTop: 12, color: ringColor }]}>{pct}%</Text>
            <Text style={s.muted}>{pct >= 70 ? 'Excellent!' : pct >= 40 ? 'Good effort!' : 'Keep practicing!'}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {[['Correct', scoreData.score, colors.success], ['Wrong', scoreData.total - scoreData.score, colors.danger], ['Total', scoreData.total, colors.primary]].map(([l, v, c]) => (
              <View key={l} style={[s.statCard, { flex: 1, alignItems: 'center' }]}>
                <Text style={s.muted}>{l}</Text>
                <Text style={[s.h2, { color: c }]}>{v}</Text>
              </View>
            ))}
          </View>

          {scoreData.wrongQuestions.length > 0 && (
            <TouchableOpacity style={[s.btnOutline, { marginBottom: 12 }]} onPress={() => setShowWrong(!showWrong)}>
              <Text style={s.btnOutlineText}>{showWrong ? 'Hide' : 'Review'} Wrong Answers ({scoreData.wrongQuestions.length})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('SubjectList')}>
            <Text style={s.btnText}>Take Another Quiz</Text>
          </TouchableOpacity>

          {showWrong && scoreData.wrongQuestions.map((wq, i) => (
            <View key={i} style={[s.card, { marginTop: 12 }]}>
              <Text style={[s.body, { fontWeight: '600', marginBottom: 8 }]}>{i + 1}. {wq.text}</Text>
              {wq.options.map((opt, idx) => (
                <View key={idx} style={{
                  padding: 8, borderRadius: 6, marginBottom: 4,
                  backgroundColor: idx === wq.correctIndex ? colors.successLight : idx === wq.selectedIndex ? colors.dangerLight : colors.gray50,
                }}>
                  <Text style={{ fontSize: 13, color: idx === wq.correctIndex ? colors.success : idx === wq.selectedIndex ? colors.danger : colors.gray700 }}>
                    {OPT_LABELS[idx]}. {opt}
                    {idx === wq.correctIndex ? ' ✓' : idx === wq.selectedIndex ? ' ✗' : ''}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  const q = questions[current];
  return (
    <ScrollView style={s.screen}>
      <View style={{ padding: 16 }}>
        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: colors.gray200, borderRadius: 3, marginBottom: 16 }}>
          <View style={{ height: 6, backgroundColor: colors.primary, borderRadius: 3, width: `${((current + 1) / questions.length) * 100}%` }} />
        </View>
        <Text style={[s.muted, { textAlign: 'right', marginBottom: 12 }]}>{current + 1} / {questions.length}</Text>

        <View style={s.card}>
          <Text style={[s.h3, { marginBottom: 20, lineHeight: 24 }]}>Q{current + 1}. {q.text}</Text>
          {q.options.map((opt, idx) => {
            let bg = colors.white, border = colors.gray200, textColor = colors.gray700;
            if (answered) {
              if (idx === q.correctIndex) { bg = colors.successLight; border = colors.success; textColor = colors.success; }
              else if (idx === selected) { bg = colors.dangerLight; border = colors.danger; textColor = colors.danger; }
            } else if (idx === selected) { bg = colors.primaryLight; border = colors.primary; textColor = colors.primary; }
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelect(idx)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: border, backgroundColor: bg, marginBottom: 10 }}
              >
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: border }}>{OPT_LABELS[idx]}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: textColor }}>{opt}</Text>
                {answered && idx === q.correctIndex && <Text style={{ color: colors.success }}>✓</Text>}
                {answered && idx === selected && idx !== q.correctIndex && <Text style={{ color: colors.danger }}>✗</Text>}
              </TouchableOpacity>
            );
          })}
          {answered && (
            <TouchableOpacity style={[s.btnPrimary, { marginTop: 8 }]} onPress={handleNext}>
              <Text style={s.btnText}>{current + 1 >= questions.length ? 'See Results' : 'Next →'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
