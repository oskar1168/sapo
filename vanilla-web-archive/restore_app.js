const fs = require('fs');
const path = require('path');

// 6월 8일에 순차적으로 생성된 대화방 ID 리스트 (시간 순서)
const sessionIds = [
  '306600c4-b3f3-462d-bb52-40f3ab19ff1f',
  'cd9d9ec4-4b2b-40ce-94e8-64fdf91ad01b',
  '7f721502-6e96-4ef5-9676-0c56bffe3851'
];

const targetFilePath = 'c:\\Users\\김민상\\Desktop\\sapo\\app.js';

// app.js 원본 로드 (b604b3e 상태)
let appJsContent = fs.readFileSync(targetFilePath, 'utf8');
console.log(`[초기화] 원본 app.js 크기: ${appJsContent.length} 자, 라인 수: ${appJsContent.split('\n').length}\n`);

let totalPatchCount = 0;
let totalFailCount = 0;

sessionIds.forEach((sessionId) => {
  const logFilePath = `C:\\Users\\김민상\\.gemini\\antigravity\\brain\\${sessionId}\\.system_generated\\logs\\transcript.jsonl`;
  console.log(`------------------------------------------`);
  console.log(`📂 세션 로그 로드 중: ${sessionId}`);
  
  if (!fs.existsSync(logFilePath)) {
    console.warn(`  ⚠️ 로그 파일을 찾을 수 없습니다: ${logFilePath}`);
    return;
  }

  const logContent = fs.readFileSync(logFilePath, 'utf8');
  const logLines = logContent.split('\n');
  console.log(`  - 로그 라인 수: ${logLines.length}`);

  let sessionPatchCount = 0;
  let sessionFailCount = 0;

  for (let i = 0; i < logLines.length; i++) {
    const line = logLines[i].trim();
    if (!line) continue;

    try {
      const logObj = JSON.parse(line);
      
      if (logObj.type === 'PLANNER_RESPONSE' && logObj.tool_calls) {
        for (const tc of logObj.tool_calls) {
          if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            let args = tc.args;
            if (typeof args === 'string') {
              try {
                args = JSON.parse(args);
              } catch (e) {
                try {
                  // JSON.parse 실패 시 eval 대용 함수 객체 파싱 시도
                  args = new Function(`return ${args}`)();
                } catch (e2) {
                  console.error(`  [Line ${i+1}] args 파싱 실패:`, e2.message);
                  continue;
                }
              }
            }

            const targetFile = args.TargetFile || '';
            if (!targetFile.toLowerCase().includes('app.js')) continue;

            const desc = args.Description || tc.name;
            // console.log(`  [Step ${logObj.step_index}] 패치 시도: ${desc}`);

            const applySinglePatch = (target, replacement) => {
              // 1. exact match 시도
              if (appJsContent.includes(target)) {
                appJsContent = appJsContent.replace(target, replacement);
                return true;
              }
              // 2. CRLF/LF 줄바꿈 정규화 시도
              const normTarget = target.replace(/\r\n/g, '\n');
              const normApp = appJsContent.replace(/\r\n/g, '\n');
              if (normApp.includes(normTarget)) {
                appJsContent = normApp.replace(normTarget, replacement.replace(/\r\n/g, '\n'));
                return true;
              }
              // 3. 공백/탭 문자 정규화 시도
              const spaceNormTarget = normTarget.replace(/\s+/g, ' ');
              const spaceNormApp = normApp.replace(/\s+/g, ' ');
              // 이 방법은 정밀한 소스 매칭을 방해할 수 있으므로 최종 폴백으로만 사용
              return false;
            };

            if (tc.name === 'replace_file_content') {
              const target = args.TargetContent;
              const replacement = args.ReplacementContent;

              if (applySinglePatch(target, replacement)) {
                sessionPatchCount++;
              } else {
                console.warn(`  ❌ [Step ${logObj.step_index}] TargetContent 매칭 실패: ${desc.substring(0, 40)}...`);
                sessionFailCount++;
              }
            } else if (tc.name === 'multi_replace_file_content') {
              let chunks = args.ReplacementChunks;
              if (typeof chunks === 'string') {
                try {
                  chunks = JSON.parse(chunks);
                } catch (e) {
                  try {
                    chunks = new Function(`return ${chunks}`)();
                  } catch (e2) {
                    console.error(`  [Step ${logObj.step_index}] Chunks 파싱 실패:`, e2.message);
                    continue;
                  }
                }
              }

              let chunksSuccess = true;
              for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
                const chunk = chunks[cIdx];
                const target = chunk.TargetContent;
                const replacement = chunk.ReplacementContent;

                if (applySinglePatch(target, replacement)) {
                  sessionPatchCount++;
                } else {
                  console.warn(`  ❌ [Step ${logObj.step_index}] Chunk [${cIdx}] 매칭 실패: ${desc.substring(0, 40)}...`);
                  sessionFailCount++;
                  chunksSuccess = false;
                }
              }
            }
          }
        }
      }
    } catch (err) {
      // JSON 파싱 무시
    }
  }

  console.log(`  => 세션 결과 - 성공: ${sessionPatchCount}, 실패: ${sessionFailCount}`);
  totalPatchCount += sessionPatchCount;
  totalFailCount += sessionFailCount;
});

// 최종 저장
fs.writeFileSync(targetFilePath, appJsContent, 'utf8');
console.log(`\n==========================================`);
console.log(`🎉 모든 세션 복구 프로세스 완료!`);
console.log(`- 전체 성공한 패치 수: ${totalPatchCount}`);
console.log(`- 전체 실패한 패치 수: ${totalFailCount}`);
console.log(`- 최종 app.js 크기: ${appJsContent.length} 자, 라인 수: ${appJsContent.split('\n').length}`);
console.log(`==========================================`);
