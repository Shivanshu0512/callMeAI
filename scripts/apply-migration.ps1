# PowerShell script to apply database migrations
# Usage: .\scripts\apply-migration.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CallMeAI Database Migration Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials." -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "Loading environment variables..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Check if pg module is installed
Write-Host "Checking for pg module..." -ForegroundColor Yellow
$pgInstalled = npm list pg 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing pg module..." -ForegroundColor Yellow
    npm install pg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install pg module" -ForegroundColor Red
        exit 1
    }
}

# Build DATABASE_URL from environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl) {
    Write-Host "ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

# Extract database connection details from Supabase URL
# Format: https://[PROJECT_REF].supabase.co
# Database URL: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
if ($supabaseUrl -match 'https://([^.]+)\.supabase\.co') {
    $projectRef = $matches[1]
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "IMPORTANT: Database Connection Required" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To apply migrations, you need your Supabase database password." -ForegroundColor White
    Write-Host ""
    Write-Host "Find it here:" -ForegroundColor White
    Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/settings/database" -ForegroundColor Cyan
    Write-Host "2. Find 'Database password' section" -ForegroundColor Cyan
    Write-Host "3. Copy your password or reset it if needed" -ForegroundColor Cyan
    Write-Host ""
    
    $dbPassword = Read-Host "Enter your Supabase database password" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
    
    $env:DATABASE_URL = "postgresql://postgres:$dbPasswordPlain@db.$projectRef.supabase.co:5432/postgres"
    
    Write-Host ""
    Write-Host "Applying migration..." -ForegroundColor Yellow
    node scripts/apply_migrations.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   Migration Applied Successfully!     " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "The following tables/columns were added:" -ForegroundColor White
        Write-Host "  - call_logs.provider_call_id" -ForegroundColor Cyan
        Write-Host "  - call_log_events (new table for streaming)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Start the scheduler: npm run start:scheduler" -ForegroundColor White
        Write-Host "  2. Test webhooks with a manual call" -ForegroundColor White
        Write-Host "  3. Verify realtime transcripts in the UI" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "ERROR: Migration failed. Check the error above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ERROR: Could not parse Supabase URL" -ForegroundColor Red
    exit 1
}
