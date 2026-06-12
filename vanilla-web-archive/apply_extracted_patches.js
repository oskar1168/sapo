const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, 'app.js');
const backupFilePath = path.join(__dirname, 'app.js.backup');

// app.js 백업
if (!fs.existsSync(backupFilePath)) {
  fs.copyFileSync(targetFilePath, backupFilePath);
  console.log('Backed up app.js to app.js.backup');
} else {
  // 백업이 이미 있다면, 백업으로부터 app.js를 복원한 뒤 시작 (클린 상태에서 재시도할 수 있도록)
  fs.copyFileSync(backupFilePath, targetFilePath);
  console.log('Restored app.js from app.js.backup for clean start');
}

let appJsContent = fs.readFileSync(targetFilePath, 'utf8');
const changes = JSON.parse(fs.readFileSync('extracted_changes.json', 'utf8'));

// step 순서대로 정렬
changes.sort((a, b) => a.step - b.step);

let successCount = 0;
let failCount = 0;
const failures = [];

function normalizeNewlines(str) {
  return str.replace(/\r\n/g, '\n').trim();
}

function applyPatch(target, replacement, step, desc) {
  // 1. exact match
  if (appJsContent.includes(target)) {
    appJsContent = appJsContent.replace(target, replacement);
    return true;
  }
  
  // 2. newline normalized match
  const normTarget = normalizeNewlines(target);
  const normApp = appJsContent.replace(/\r\n/g, '\n');
  const index = normApp.indexOf(normTarget);
  
  if (index !== -1) {
    // 매치된 부분을 찾아서 치환
    const before = normApp.substring(0, index);
    const after = normApp.substring(index + normTarget.length);
    appJsContent = before + replacement.replace(/\r\n/g, '\n') + after;
    return true;
  }
  
  // 3. trimmed match (일부 공백이나 사소한 차이 무시)
  const trimTarget = target.trim();
  if (appJsContent.includes(trimTarget)) {
    appJsContent = appJsContent.replace(trimTarget, replacement);
    return true;
  }

  return false;
}

changes.forEach((change) => {
  const { step, type, description, args } = change;
  console.log(`\n[Step ${step}] Processing: ${description.substring(0, 60)}...`);
  
  if (type === 'replace_file_content') {
    const target = args.TargetContent;
    const replacement = args.ReplacementContent;
    
    if (applyPatch(target, replacement, step, description)) {
      console.log(`  ✅ Success`);
      successCount++;
    } else {
      console.log(`  ❌ Failed`);
      failCount++;
      failures.push({ step, description, target, replacement });
    }
  } else if (type === 'multi_replace_file_content') {
    let chunks = args.ReplacementChunks;
    if (typeof chunks === 'string') {
      chunks = JSON.parse(chunks);
    }
    
    let allChunksOk = true;
    const pendingAppJsContent = appJsContent; // 복구용 백업
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const target = chunk.TargetContent;
      const replacement = chunk.ReplacementContent;
      
      if (applyPatch(target, replacement, step, description)) {
        // chunk 성공
      } else {
        allChunksOk = false;
        console.log(`  ❌ Chunk ${i} Failed`);
        failures.push({ step, description: `${description} (Chunk ${i})`, target, replacement });
      }
    }
    
    if (allChunksOk) {
      console.log(`  ✅ Success (All chunks)`);
      successCount++;
    } else {
      // 일부 chunk가 실패하면 해당 스텝 전체를 롤백하고 실패 기록
      appJsContent = pendingAppJsContent;
      console.log(`  ❌ Failed (Some chunks failed, rolled back step)`);
      failCount++;
    }
  }
});

fs.writeFileSync(targetFilePath, appJsContent, 'utf8');

console.log(`\n==========================================`);
console.log(`Patch process completed.`);
console.log(`- Success: ${successCount}`);
console.log(`- Failed: ${failCount}`);
console.log(`- Total: ${successCount + failCount}`);
console.log(`==========================================`);

// 실패 내역을 failures.json으로 저장하여 쉽게 볼 수 있도록 함
fs.writeFileSync('failures.json', JSON.stringify(failures, null, 2), 'utf8');
console.log('Saved failures to failures.json');
