$outFile = "C:\Users\skuma\Documents\GitHub\grade-grapher-hub\dev-out.log"
$errFile = "C:\Users\skuma\Documents\GitHub\grade-grapher-hub\dev-err.log"
$proc = Start-Process -NoNewWindow -FilePath "npx.cmd" -ArgumentList "wrangler","dev","--config","dist/tech_timeline/wrangler.json","--ip","127.0.0.1","--port","8795" -RedirectStandardOutput $outFile -RedirectStandardError $errFile -PassThru
Start-Sleep -Seconds 14
Write-Output "=== STDOUT ==="
Get-Content $outFile -Tail 15
Write-Output "=== STDERR ==="
Get-Content $errFile -Tail 15
Write-Output "=== Request ==="
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8795/" -TimeoutSec 15 -UseBasicParsing
    Write-Output "Status: $($r.StatusCode)"
    if ($r.Content.Length -gt 0) {
        Write-Output "Content (first 1000 chars): $($r.Content.Substring(0, [Math]::Min(1000, $r.Content.Length)))"
    }
} catch {
    Write-Output "Request failed: $($_.Exception.Message)"
}
Write-Output "=== Cleanup ==="
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Remove-Item $outFile -Force -ErrorAction SilentlyContinue
Remove-Item $errFile -Force -ErrorAction SilentlyContinue
