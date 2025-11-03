@echo off
REM Batch script to run database migration
REM Usage: run-migration.bat

echo Running database migration...

set MIGRATION_FILE=prisma\migrations\002_add_user_features.sql

if exist "%MIGRATION_FILE%" (
    echo Found migration file: %MIGRATION_FILE%
    psql -U postgres -d healthpedhyan -f %MIGRATION_FILE%

    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Migration completed successfully!
        echo.
        echo Next steps:
        echo 1. npx prisma generate
        echo 2. pnpm dev
    ) else (
        echo.
        echo Migration failed with error code: %ERRORLEVEL%
    )
) else (
    echo ERROR: Migration file not found at: %MIGRATION_FILE%
    echo Please run 'git pull' first to get the latest changes.
)

pause
