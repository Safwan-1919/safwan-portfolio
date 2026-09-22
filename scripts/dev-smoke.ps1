# KRAFT dev-server smoke test: boot Vite, request every source module and
# report any transform error (Vite answers 500 with the error text).
$ErrorActionPreference = 'Continue'
Set-Location -Path 'D:\websites\website_4'

$log = 'dev-smoke.log'
if (Test-Path $log) { Remove-Item $log }

$proc = Start-Process -FilePath 'node' -ArgumentList 'node_modules/vite/bin/vite.js','--port','5199','--strictPort' -PassThru -RedirectStandardOutput $log -RedirectStandardError 'dev-smoke.err'
Start-Sleep -Seconds 7

$root = (Get-Location).Path
$files = Get-ChildItem -Path 'src' -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $_.FullName.Substring($root.Length + 1).Replace('\', '/')
}

$fail = 0
try {
  $index = Invoke-WebRequest -Uri 'http://localhost:5199/' -UseBasicParsing -TimeoutSec 20
  "index.html -> $($index.StatusCode) ($($index.Content.Length) bytes)"
} catch {
  "index.html -> ERROR $($_.Exception.Message)"
  $fail++
}

foreach ($file in $files) {
  try {
    $res = Invoke-WebRequest -Uri "http://localhost:5199/$file" -UseBasicParsing -TimeoutSec 30
    "OK   $file ($($res.Content.Length) bytes)"
  } catch {
    "FAIL $file -> $($_.Exception.Message)"
    $fail++
  }
}

Stop-Process -Id $proc.Id -Force
Start-Sleep -Seconds 1
"---- vite stdout ----"
Get-Content $log -ErrorAction SilentlyContinue | Select-Object -Last 12
"---- vite stderr ----"
Get-Content 'dev-smoke.err' -ErrorAction SilentlyContinue | Select-Object -Last 12
"---- failures: $fail ----"