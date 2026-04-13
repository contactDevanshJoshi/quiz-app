// shared/utils/csv.js

export function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i] ?? '' }), {});
  });
}

export function toCSV(rows, columns) {
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => `"${r[c] ?? ''}"`).join(',')).join('\n');
  return `${header}\n${body}`;
}

export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function studentTemplateCSV() {
  return 'enrollmentNo,name,department,semester,password\n22CS001,John Doe,Computer Science,3,pass123\n';
}

export function questionTemplateCSV() {
  return 'text,optionA,optionB,optionC,optionD,correctIndex,difficulty,chapterId,subjectId,teachingPhase\n"What is 2+2?",2,3,4,5,2,Easy,ch001,sub001,T1\n';
}
