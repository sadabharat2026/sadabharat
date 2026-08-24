# Start local Redis for Sada Bharat caching.
# Usage (from backend folder):
#   powershell -ExecutionPolicy Bypass -File .\scripts\start-redis.ps1

$ErrorActionPreference = 'Stop'
$port = 6379
$candidates = @(
  @(
    (Get-Command redis-server -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
    "$env:LOCALAPPDATA\sadabharat\redis\redis-server.exe",
    "C:\Program Files\Redis\redis-server.exe",
    "C:\Redis\redis-server.exe",
    "C:\Program Files\Memurai\memurai.exe"
  ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
)

try {
  $open = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
  if ($open.TcpTestSucceeded) {
    Write-Host "Redis already listening on 127.0.0.1:$port"
    exit 0
  }
} catch {}

if ($candidates.Count -gt 0) {
  $exe = $candidates[0]
  Write-Host "Starting Redis: $exe"
  Start-Process -FilePath $exe -WindowStyle Minimized
  Start-Sleep -Seconds 1
  Write-Host "Redis started on port $port"
  exit 0
}

Write-Host @"
Redis is not installed on this PC.

Install one of these, then run this script again:

1) Memurai Developer (recommended on Windows)
   https://www.memurai.com/get-memurai

2) Redis for Windows (zip)
   https://github.com/tporadowski/redis/releases
   Extract redis-server.exe to:
   $env:LOCALAPPDATA\sadabharat\redis\

The API still works without Redis: it uses an in-memory cache
until Redis is running.
"@
exit 1
