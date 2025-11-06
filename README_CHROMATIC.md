# Chromatic 시각적 회귀 테스트 설정 가이드

## 환경 변수 설정

### 방법 1: `.env` 파일 사용 (권장)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
CHROMATIC_PROJECT_TOKEN=your-project-token-here
```

**주의**: `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 방법 2: 직접 환경 변수 설정

#### Windows PowerShell:
```powershell
$env:CHROMATIC_PROJECT_TOKEN="your-project-token-here"
```

#### Windows CMD:
```cmd
set CHROMATIC_PROJECT_TOKEN=your-project-token-here
```

#### Linux/Mac:
```bash
export CHROMATIC_PROJECT_TOKEN=your-project-token-here
```

## Chromatic 프로젝트 ID 설정 (선택사항)

`chromatic.config.json` 파일의 `projectId` 필드에 프로젝트 ID를 입력할 수 있습니다.
프로젝트 ID는 Chromatic 대시보드의 프로젝트 설정에서 확인할 수 있습니다.

```json
{
  "projectId": "Project:your_project_id_here"
}
```

## 사용 방법

### 1. Storybook 실행 확인

```bash
pnpm storybook
```

브라우저에서 http://localhost:6006 을 열어 Storybook이 정상적으로 작동하는지 확인하세요.

### 2. Chromatic으로 시각적 회귀 테스트 실행

```bash
# 기본 실행 (변경사항이 있을 때만 실패)
pnpm chromatic

# 로컬 테스트 (변경사항이 있어도 실패하지 않음)
pnpm chromatic:local
```

### 3. Chromatic 대시보드 확인

Chromatic 실행 후 제공되는 URL을 열어 대시보드에서 결과를 확인할 수 있습니다.

## 주요 기능

- **시각적 회귀 테스트**: UI 변경사항을 자동으로 감지
- **스냅샷 비교**: 변경 전후 스크린샷 비교
- **PR 통합**: Pull Request에 시각적 변경사항 자동 표시
- **반응형 테스트**: 다양한 뷰포트 크기에서 테스트

## 문제 해결

### 환경 변수가 인식되지 않는 경우

- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수를 직접 설정한 경우, 터미널을 재시작
- Windows에서는 `${CHROMATIC_PROJECT_TOKEN}` 대신 `%CHROMATIC_PROJECT_TOKEN%` 사용 필요할 수 있음

### Storybook 빌드 실패

```bash
# Storybook 빌드 테스트
pnpm build-storybook
```

### Chromatic 연결 실패

- 토큰이 올바른지 확인
- 인터넷 연결 확인
- Chromatic 서비스 상태 확인








