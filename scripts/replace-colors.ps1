$files = @(
  "src\pages\Transactions.jsx",
  "src\pages\Customers.jsx",
  "src\pages\Inventory.jsx",
  "src\pages\InventoryLogs.jsx",
  "src\pages\Products.jsx",
  "src\pages\Reports.jsx",
  "src\pages\Analytics.jsx",
  "src\pages\Settings.jsx",
  "src\pages\ReceiptBuilder.jsx",
  "src\pages\ProductDetail.jsx",
  "src\components\layout\AppSidebar.jsx",
  "src\pages\Dashboard.jsx"
)

$replacements = @(
  @("from-violet-600 to-purple-600", "from-accent to-accent-hover"),
  @("from-violet-500 to-purple-600", "from-accent to-accent-hover"),
  @("from-purple-500 to-violet-600", "from-accent to-accent-hover"),
  @("from-violet-500 via-purple-500 to-fuchsia-500", "from-accent via-accent-light to-accent-hover"),
  @("from-violet-700 via-purple-600 to-fuchsia-600", "from-accent via-accent-hover to-accent-dark"),
  @("from-violet-500/5 via-transparent to-purple-500/5", "from-accent/5 via-transparent to-accent-hover/5"),
  @("text-violet-600", "text-accent"),
  @("text-violet-700", "text-accent"),
  @("text-violet-500", "text-accent"),
  @("text-violet-400", "text-accent"),
  @("text-violet-300", "text-accent"),
  @("text-purple-600", "text-accent"),
  @("text-purple-700", "text-accent"),
  @("text-purple-500", "text-accent"),
  @("text-purple-400", "text-accent"),
  @("text-purple-300", "text-accent"),
  @("bg-violet-600", "bg-accent"),
  @("bg-violet-500", "bg-accent"),
  @("bg-purple-600", "bg-accent"),
  @("bg-purple-500", "bg-accent"),
  @("bg-purple-200", "bg-accent-light"),
  @("bg-violet-200", "bg-accent-light"),
  @("bg-purple-100", "bg-accent-light"),
  @("bg-violet-100", "bg-accent-light"),
  @("bg-purple-50", "bg-accent-light"),
  @("bg-violet-50", "bg-accent-light"),
  @("border-purple-200", "border-accent"),
  @("border-purple-300", "border-accent"),
  @("border-violet-200", "border-accent"),
  @("border-violet-300", "border-accent"),
  @("bg-purple-500/15", "bg-accent/15"),
  @("bg-purple-500/30", "bg-accent/30"),
  @("bg-violet-500/15", "bg-accent/15"),
  @("bg-violet-500/30", "bg-accent/30"),
  @("dark:bg-purple-900/30", "dark:bg-accent/30"),
  @("dark:bg-purple-900/20", "dark:bg-accent/20"),
  @("dark:bg-purple-950/50", "dark:bg-accent/20"),
  @("dark:bg-violet-900/30", "dark:bg-accent/30"),
  @("dark:bg-violet-900/20", "dark:bg-accent/20"),
  @("dark:bg-violet-950/50", "dark:bg-accent/20"),
  @("border-purple-200/50", "border-accent/50"),
  @("border-purple-500/20", "border-accent/20"),
  @("border-violet-200/80", "border-accent/80"),
  @("border-violet-200/50", "border-accent/50"),
  @("border-violet-500/20", "border-accent/20"),
  @("dark:border-purple-800", "dark:border-accent"),
  @("dark:border-purple-800/30", "dark:border-accent/30"),
  @("dark:border-purple-800/40", "dark:border-accent/40"),
  @("dark:border-purple-500/20", "dark:border-accent/20"),
  @("dark:border-violet-800/40", "dark:border-accent/40"),
  @("dark:border-violet-700/60", "dark:border-accent/60"),
  @("shadow-purple-500/20", "shadow-accent/20"),
  @("shadow-violet-500/20", "shadow-accent/20"),
  @("shadow-violet-500/15", "shadow-accent/15"),
  @("shadow-purple-500/10", "shadow-accent/10"),
  @("dark:shadow-purple-500/15", "dark:shadow-accent/15"),
  @("dark:shadow-purple-500/10", "dark:shadow-accent/10"),
  @("dark:shadow-violet-500/15", "dark:shadow-accent/15"),
  @("ring-violet-500", "ring-accent"),
  @("focus:ring-violet-100", "focus:ring-accent/20"),
  @("focus:border-violet-400", "focus:border-accent"),
  @("focus:ring-purple-500", "focus:ring-accent"),
  @("hover:text-violet-600", "hover:text-accent"),
  @("hover:text-violet-700", "hover:text-accent"),
  @("hover:text-violet-400", "hover:text-accent"),
  @("hover:text-purple-600", "hover:text-accent"),
  @("hover:text-purple-700", "hover:text-accent"),
  @("hover:bg-violet-50", "hover:bg-accent-light"),
  @("hover:bg-purple-50", "hover:bg-accent-light"),
  @("dark:hover:bg-violet-900/30", "dark:hover:bg-accent/30"),
  @("dark:hover:bg-violet-900/20", "dark:hover:bg-accent/20"),
  @("dark:hover:bg-purple-900/30", "dark:hover:bg-accent/30"),
  @("dark:hover:bg-purple-900/20", "dark:hover:bg-accent/20"),
  @("hover:border-violet-300", "hover:border-accent"),
  @("hover:border-violet-400", "hover:border-accent"),
  @("hover:border-purple-300", "hover:border-accent"),
  @("dark:hover:border-violet-600", "dark:hover:border-accent"),
  @("dark:hover:border-violet-700/60", "dark:hover:border-accent/60"),
  @("group-hover:text-violet-600", "group-hover:text-accent"),
  @("group-hover:text-violet-400", "group-hover:text-accent"),
  @("group-hover:text-violet-500", "group-hover:text-accent"),
  @("dark:group-hover:text-violet-400", "dark:group-hover:text-accent"),
  @("hover:shadow-violet-500/20", "hover:shadow-accent/20"),
  @("border-violet-100/50", "border-accent/50"),
  @("border-purple-200/60", "border-accent/60"),
  @("border-violet-200/70", "border-accent/70")
)

$root = "h:\Apps\laragon\www\swift-pos-web"
$count = 0

foreach ($relPath in $files) {
  $fullPath = Join-Path $root $relPath
  if (-not (Test-Path $fullPath)) {
    Write-Host "SKIP: $relPath"
    continue
  }
  
  $content = Get-Content $fullPath -Raw
  $modified = $false
  
  foreach ($r in $replacements) {
    if ($content.Contains($r[0])) {
      $content = $content -replace [regex]::Escape($r[0]), $r[1]
      $modified = $true
    }
  }
  
  if ($modified) {
    Set-Content $fullPath $content -NoNewline
    Write-Host "MODIFIED: $relPath"
    $count++
  } else {
    Write-Host "OK: $relPath (no changes)"
  }
}

Write-Host "Done - modified $count files"