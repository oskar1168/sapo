const fs = require('fs');
const path = require('path');

const sessionId = '7f721502-6e96-4ef5-9676-0c56bffe3851';
const logFilePath = `C:\\Users\\김민상\\.gemini\\antigravity\\brain\\${sessionId}\\.system_generated\\logs\\transcript.jsonl`;

if (!fs.existsSync(logFilePath)) {
  console.error('Log file not found');
  process.exit(1);
}

const logContent = fs.readFileSync(logFilePath, 'utf8');
const lines = logContent.split('\n');

const extractedChanges = [];

function sanitizeAndParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    // 줄바꿈이나 탭, 이스케이프 등으로 깨진 경우 처리
    try {
      // 1. 문자열 내의 실제 줄바꿈(CRLF, LF)을 \n으로 변환
      let sanitized = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
      return JSON.parse(sanitized);
    } catch (e2) {
      // 2. eval fallback
      try {
        return eval('(' + str + ')');
      } catch (e3) {
        throw new Error(`Sanitization failed: ${e3.message}`);
      }
    }
  }
}

lines.forEach((line, index) => {
  if (!line.trim()) return;
  try {
    const logObj = JSON.parse(line);
    if (logObj.type === 'PLANNER_RESPONSE' && logObj.tool_calls) {
      logObj.tool_calls.forEach(tc => {
        if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          let args = tc.args;
          if (typeof args === 'string') {
            try {
              args = sanitizeAndParseJSON(args);
            } catch (e) {
              console.log(`Line ${index + 1} - failed to parse args:`, e.message);
              return;
            }
          }
          
          const targetFile = args.TargetFile || '';
          if (!targetFile.toLowerCase().includes('app.js')) return;

          // Nested ReplacementChunks 파싱 처리
          if (args.ReplacementChunks) {
            let chunks = args.ReplacementChunks;
            if (typeof chunks === 'string') {
              try {
                chunks = sanitizeAndParseJSON(chunks);
              } catch (e) {
                console.log(`Line ${index + 1} - failed to parse chunks:`, e.message);
                return; // chunks 파싱 실패 시 제외
              }
            }
            args.ReplacementChunks = chunks; // 객체로 주입
          }
          
          extractedChanges.push({
            step: logObj.step_index,
            type: tc.name,
            description: args.Description || 'No description',
            args: args
          });
        }
      });
    }
  } catch (err) {
    // ignore
  }
});

console.log(`Found ${extractedChanges.length} changes related to app.js.`);
fs.writeFileSync('extracted_changes.json', JSON.stringify(extractedChanges, null, 2), 'utf8');
console.log('Saved to extracted_changes.json');
