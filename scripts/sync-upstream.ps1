<#
同步上游 liyangpengs/qq-farm-bot（remote: upstream）到当前分支。

用法：
  .\scripts\sync-upstream.ps1                          # 拉取 + 合并 + 编译校验
  .\scripts\sync-upstream.ps1 -Proxy http://127.0.0.1:7289   # 走本机代理
  .\scripts\sync-upstream.ps1 -Proxy http://127.0.0.1:7289 -Push   # 同步后推 origin/master

说明：
  - 合并冲突时脚本会停下并列出冲突文件，处理完再 `git merge --continue`。
  - 校验项：core `tsc --noEmit`、web `vite build`（-SkipBuild 可跳过）。
#>
[CmdletBinding()]
param(
    [string]$Proxy = $env:GIT_PROXY,
    [switch]$Push,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Git = 'git'

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & $Git -C $Root @Args
    if ($LASTEXITCODE -ne 0) { throw "git $($Args -join ' ') 失败（exit $LASTEXITCODE）" }
}

if ($Proxy) {
    $env:GIT_CONFIG_COUNT = '2'
    $env:GIT_CONFIG_KEY_0 = 'http.proxy'
    $env:GIT_CONFIG_VALUE_0 = $Proxy
    $env:GIT_CONFIG_KEY_1 = 'https.proxy'
    $env:GIT_CONFIG_VALUE_1 = $Proxy
    Write-Host "代理：$Proxy"
}

Write-Host "[1/4] fetch upstream ..."
Invoke-Git fetch upstream --prune

$newCount = (& $Git -C $Root rev-list --count HEAD..upstream/master | Out-String).Trim()
if ([int]$newCount -eq 0) {
    Write-Host "已是最新，无需合并。"
    exit 0
}
Write-Host "上游新增 $newCount 个提交："
& $Git -C $Root log --oneline HEAD..upstream/master

$stamp = Get-Date -Format 'yyyyMMddHHmmss'
Invoke-Git branch -f "backup-before-upstream-$stamp" HEAD
Write-Host "已建备份分支 backup-before-upstream-$stamp"

Write-Host "[2/4] merge upstream/master ..."
& $Git -C $Root merge --no-edit upstream/master
if ($LASTEXITCODE -ne 0) {
    Write-Host "合并有冲突，请解决后执行 git merge --continue：" -ForegroundColor Yellow
    & $Git -C $Root status --porcelain | Select-String '^(UU|AA|DU|UD|AU|UA)'
    exit 2
}

if (-not $SkipBuild) {
    Write-Host "[3/4] 校验 core / web ..."
    $tsc = Join-Path $Root 'core\node_modules\.bin\tsc.cmd'
    & $tsc -p (Join-Path $Root 'core\tsconfig.json') --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'core 类型检查失败' }

    $vite = Join-Path $Root 'web\node_modules\.bin\vite.cmd'
    Push-Location (Join-Path $Root 'web')
    try { & $vite build --logLevel warn } finally { Pop-Location }
    if ($LASTEXITCODE -ne 0) { throw 'web 构建失败' }
}

if ($Push) {
    Write-Host "[4/4] push origin master ..."
    Invoke-Git push origin master
    & $Git -C $Root ls-remote origin refs/heads/master
}
else {
    Write-Host "[4/4] 已跳过推送；需要时执行 git push origin master。"
}

Write-Host "完成。"
