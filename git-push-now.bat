@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/5] .git 초기화...
if exist .git (
  rd /s /q .git 2>nul
  if exist .git (
    echo .git 삭제 실패. Cursor를 완전히 종료한 뒤 다시 실행하세요.
    pause
    exit /b 1
  )
)
git init
git branch -M main

echo [2/5] 원격 저장소 연결...
git remote add origin https://github.com/tnsrnr/mb_pj.git

echo [3/5] 파일 추가 및 커밋...
git add .
git commit -m "Initial commit"

echo [4/5] GitHub 푸시 중...
git push -u origin main

echo [5/5] 완료: https://github.com/tnsrnr/mb_pj
pause
