@echo off
echo Restarting Spring Boot application...
echo.

echo Stopping any running instances...
taskkill /f /im java.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting Spring Boot application...
start cmd /c "mvnw spring-boot:run"

echo.
echo Application is starting. Check the console for logs.
echo.
