@echo off
cd /d "h:\Apps\laragon\www\swift-pos-web\src"

echo === Replacing hardcoded purple/violet accent colors ===

set FILES=pages\Transactions.jsx pages\Customers.jsx pages\Inventory.jsx pages\InventoryLogs.jsx pages\Products.jsx pages\Reports.jsx pages\Analytics.jsx pages\Settings.jsx pages\ReceiptBuilder.jsx pages\ProductDetail.jsx components\layout\AppSidebar.jsx pages\Dashboard.jsx

for %%f in (%FILES%) do (
  if exist "%%f" (
    echo Processing: %%f
    
    REM Read file and apply replacements using a temp file
    powershell -Command "$c = Get-Content '%%f' -Raw; " ^
      "$replacements = @( " ^
        "'from-violet-600 to-purple-600','from-accent to-accent-hover'; " ^
        "'from-violet-500 to-purple-600','from-accent to-accent-hover'; " ^
        "'from-purple-500 to-violet-600','from-accent to-accent-hover'; " ^
        "'from-violet-500 via-purple-500 to-fuchsia-500','from-accent via-accent-light to-accent-hover'; " ^
        "'from-violet-700 via-purple-600 to-fuchsia-600','from-accent via-accent-hover to-accent-dark'; " ^
        "'from-violet-500/5 via-transparent to-purple-500/5','from-accent/5 via-transparent to-accent-hover/5'; " ^
        "'text-violet-600','text-accent'; " ^
        "'text-violet-700','text-accent'; " ^
        "'text-violet-500','text-accent'; " ^
        "'text-violet-400','text-accent'; " ^
        "'text-violet-300','text-accent'; " ^
        "'text-purple-600','text-accent'; " ^
        "'text-purple-700','text-accent'; " ^
        "'text-purple-500','text-accent'; " ^
        "'text-purple-400','text-accent'; " ^
        "'text-purple-300','text-accent'; " ^
        "'bg-violet-600','bg-accent'; " ^
        "'bg-violet-500','bg-accent'; " ^
        "'bg-purple-600','bg-accent'; " ^
        "'bg-purple-500','bg-accent'; " ^
        "'border-violet-500/20','border-accent/20'; " ^
        "'border-violet-200/80','border-accent/80'; " ^
        "'border-violet-200/50','border-accent/50'; " ^
        "'border-violet-200','border-accent'; " ^
        "'border-violet-300','border-accent'; " ^
        "'border-purple-200','border-accent'; " ^
        "'border-purple-300','border-accent'; " ^
        "'bg-purple-500/15','bg-accent/15'; " ^
        "'bg-purple-500/30','bg-accent/30'; " ^
        "'bg-violet-500/15','bg-accent/15'; " ^
        "'bg-violet-500/30','bg-accent/30'; " ^
        "'bg-purple-500/15','bg-accent/15'; " ^
        "'hover:bg-violet-50','hover:bg-accent-light'; " ^
        "'hover:bg-purple-50','hover:bg-accent-light'; " ^
        "'hover:text-violet-600','hover:text-accent'; " ^
        "'hover:text-violet-700','hover:text-accent'; " ^
        "'hover:text-violet-400','hover:text-accent'; " ^
        "'hover:text-purple-600','hover:text-accent'; " ^
        "'hover:text-purple-700','hover:text-accent'; " ^
        "'group-hover:text-violet-600','group-hover:text-accent'; " ^
        "'group-hover:text-violet-400','group-hover:text-accent'; " ^
        "'group-hover:text-violet-500','group-hover:text-accent'; " ^
        "'shadow-violet-500/20','shadow-accent/20'; " ^
        "'shadow-violet-500/15','shadow-accent/15'; " ^
        "'shadow-purple-500/20','shadow-accent/20'; " ^
        "'shadow-purple-500/10','shadow-accent/10'; " ^
        "'focus:ring-violet-100','focus:ring-accent/20'; " ^
        "'focus:border-violet-400','focus:border-accent'; " ^
        "'focus:ring-purple-500','focus:ring-accent'; " ^
        "'ring-violet-500','ring-accent'; " ^
        "'hover:border-violet-300','hover:border-accent'; " ^
        "'hover:border-violet-400','hover:border-accent'; " ^
        "'hover:border-purple-300','hover:border-accent'; " ^
        "'border-violet-100/50','border-accent/50'; " ^
        "'border-purple-500/20','border-accent/20'; " ^
        "'hover:shadow-violet-500/20','hover:shadow-accent/20' " ^
      "); " ^
      "foreach ($r in $replacements) { $c = $c -replace $r[0], $r[1] }; " ^
      "$c | Set-Content '%%f' -NoNewline"
    
    echo    Updated
  ) else (
    echo    SKIP %%f
  )
)

echo === Done ===
pause