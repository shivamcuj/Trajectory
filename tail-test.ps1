$tailOut = "C:\Users\skuma\Documents\GitHub\grade-grapher-hub\tail-output.log"
$tailErr = "C:\Users\skuma\Documents\GitHub\grade-grapher-hub\tail-err.log"

# Start wrangler tail in background
$tailProc = Start-Process -NoNewWindow -FilePath "npx.cmd" -ArgumentList "wrangler","tail","--config","dist/tanstack_start_app/wrangler.json","--format","json" -RedirectStandardOutput $tailOut -RedirectStandardError $tailErr -PassThru
Write-Output "Tail PID: $($tailProc.Id)"

# Wait for tail to connect
Start-Sleep -Seconds 8

# Make a request
Write-Output "Making request..."
try {
    $r = Invoke-WebRequest -Uri "https://tanstack-start-app.shivamjnv2305.workers.dev/" -TimeoutSec 10 -UseBasicParsing
    Write-Output "Status: $($r.StatusCode)"
} catch {
    Write-Output "Status: $($_.Exception.Response.StatusCode.value__)"
}

# Wait for logs to arrive
Start-Sleep -Seconds 5

# Stop tail
Stop-Process -Id $tailProc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Read logs
Write-Output "=== Tail stdout ==="
Get-Content $tailOut
Write-Output "=== Tail stderr ==="
Get-Content $tailErr

# Cleanup
Remove-Item $tailOut -Force -ErrorAction SilentlyContinue
Remove-Item $tailErr -Force -ErrorAction SilentlyContinue
