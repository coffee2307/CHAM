$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$env:CI='true'
npx --yes wrangler whoami
if ($LASTEXITCODE -ne 0) { throw 'Cloudflare login required. Run npx wrangler login first.' }
$out = npx --yes wrangler deploy --config chatbot/wrangler.jsonc 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw $out }
Write-Host $out
$url=[regex]::Match($out,'https://cham-support-ai\.[a-zA-Z0-9-]+\.workers\.dev').Value
if (!$url) {throw 'No verified worker endpoint returned'}
$health=Invoke-RestMethod -Uri "$url/health"
if (!$health.ok) {throw 'Worker binding unavailable'}
$result=Invoke-RestMethod -Uri "$url/chat" -Method Post -Headers @{Origin='https://chamstore.site'} -ContentType 'application/json' -Body '{"message":"CHAM co ban de lot ly xo dua khong? Gia bao nhieu?","history":[]}'
if (!$result.answer) {throw 'Real AI smoke test failed'}
Write-Host "AI response: $($result.answer)"
$p=Join-Path (Get-Location) 'snippets/cham-ai-chat.liquid'
$s=[IO.File]::ReadAllText($p)
$s=[regex]::Replace($s,'data-endpoint="[^"]*"','data-endpoint="'+$url+'"')
[IO.File]::WriteAllText($p,$s,[Text.UTF8Encoding]::new($false))
git add -- snippets/cham-ai-chat.liquid
git commit -m 'Enable verified CHAM AI worker endpoint'
if ($LASTEXITCODE -ne 0) {throw 'Git commit failed'}
git push origin main
if ($LASTEXITCODE -ne 0) {throw 'Git push failed'}
shopify theme push --path F:\CHAM --store 5yvv8u-44.myshopify.com --theme 191052087538 --allow-live --only layout/theme.liquid --only snippets/cham-ai-chat.liquid --only assets/cham-ai-chat.css --only assets/cham-ai-chat.js --nodelete --json
if ($LASTEXITCODE -ne 0) {throw 'Shopify theme push failed'}
