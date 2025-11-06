// .env 파일을 읽어서 환경 변수로 설정한 후 Chromatic 실행
import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// .env 파일 읽기
try {
  const envContent = readFileSync(join(projectRoot, '.env'), 'utf8');
  const lines = envContent.split('\n');
  
  // 환경 변수 파싱
  const envVars = {};
  for (const line of lines) {
    const trimmedLine = line.trim();
    // 주석 무시
    if (trimmedLine.startsWith('#') || !trimmedLine) continue;
    
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  }
  
  // 환경 변수 설정
  process.env = { ...process.env, ...envVars };
  
  // Chromatic 실행
  const args = process.argv.slice(2);
  const chromaticArgs = args.length > 0 ? args : ['--project-token', process.env.CHROMATIC_PROJECT_TOKEN];
  
  const child = spawn('npx', ['chromatic', ...chromaticArgs], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
    cwd: projectRoot,
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
} catch (error) {
  console.error('❌ .env 파일을 읽을 수 없습니다:', error.message);
  console.error('💡 .env 파일이 프로젝트 루트에 있는지 확인하세요.');
  process.exit(1);
}

