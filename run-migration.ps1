# PowerShell script to run database migration
# Usage: .\run-migration.ps1

Write-Host "Running database migration..." -ForegroundColor Green

# Set environment variable for password (optional - you'll be prompted if not set)
# $env:PGPASSWORD = "postgres"

# Run the migration
$migrationFile = "prisma\migrations\002_add_user_features.sql"

if (Test-Path $migrationFile) {
    Write-Host "Found migration file: $migrationFile" -ForegroundColor Green
    psql -U postgres -d healthpedhyan -f $migrationFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nMigration completed successfully!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. npx prisma generate" -ForegroundColor White
        Write-Host "2. pnpm dev" -ForegroundColor White
    } else {
        Write-Host "`nMigration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Migration file not found at: $migrationFile" -ForegroundColor Red
    Write-Host "Please run 'git pull' first to get the latest changes." -ForegroundColor Yellow
}
