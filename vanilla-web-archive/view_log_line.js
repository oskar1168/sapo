const fs = require('fs');

const sessionId = '7f721502-6e96-4ef5-9676-0c56bffe3851';
const logFilePath = `C:\\Users\\김민상\\.gemini\\antigravity\\brain\\${sessionId}\\.system_generated\\logs\\transcript.jsonl`;

const logContent = fs.readFileSync(logFilePath, 'utf8');
const lines = logContent.split('\n');

console.log('--- LINE 55 RAW ---');
console.log(lines[54]); // 55th line is index 54
console.log('-------------------');
