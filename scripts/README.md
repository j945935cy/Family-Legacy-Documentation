# Scripts 使用說明

本資料夾包含六支 PowerShell 腳本，用於開發、預覽、打包與發佈「林志遠家族故事」網站。

> **執行前置條件**：在 PowerShell 中執行腳本需要先解除執行原則限制：
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

---

## run.ps1 — 啟動本地開發伺服器

啟動 Python HTTP 伺服器，並自動開啟瀏覽器。

```powershell
# 預設使用 Port 8000
.\scripts\run.ps1

# 指定 Port
.\scripts\run.ps1 -Port 8080
```

啟動後可瀏覽以下版本：

| 版本 | URL |
|------|-----|
| 傳統版 | http://localhost:8000/ |
| Apple 版 | http://localhost:8000/apple/ |
| 深棕版 | http://localhost:8000/dark/ |
| 淺藍版 | http://localhost:8000/purple/ |

按 `Ctrl+C` 停止伺服器。

**依賴**：Python 3

---

## preview.ps1 — 快速預覽指定版本與頁面

直接開啟指定主題與頁面的瀏覽器視窗。若伺服器未啟動，會自動在背景啟動。

```powershell
# 預設：傳統版 index 頁
.\scripts\preview.ps1

# 指定主題與頁面
.\scripts\preview.ps1 -Theme apple -Page stories
.\scripts\preview.ps1 -Theme dark  -Page timeline
.\scripts\preview.ps1 -Theme purple -Page people

# 指定 Port（需與伺服器一致）
.\scripts\preview.ps1 -Theme apple -Page gallery -Port 8080
```

**`-Theme` 可選值**：`main`、`apple`、`dark`、`purple`

**`-Page` 可選值**：`index`、`stories`、`people`、`timeline`、`values`、`gallery`、`about`

**依賴**：Python 3

---

## build-epub.ps1 — 打包為 EPUB 電子書

將網站七個頁面依序合併，輸出為 `dist/family-legacy.epub`。

```powershell
# 預設設定
.\scripts\build-epub.ps1

# 自訂書名與作者
.\scripts\build-epub.ps1 -Title "林志遠家族故事" -Author "林志遠家族"

# 自訂輸出路徑
.\scripts\build-epub.ps1 -Output "dist\my-book.epub"
```

輸出檔案位於 `dist/` 資料夾（自動建立）。

完成後建議執行 `check-epub.ps1` 驗證格式。

**依賴**：[pandoc](https://pandoc.org/installing.html)（`winget install pandoc`）

---

## check-epub.ps1 — 驗證 EPUB 格式

驗證 EPUB 檔案是否符合規格。

```powershell
# 預設驗證 dist/family-legacy.epub
.\scripts\check-epub.ps1

# 指定 EPUB 檔案
.\scripts\check-epub.ps1 -EpubPath "dist\my-book.epub"

# 指定 epubcheck jar 路徑（完整驗證）
.\scripts\check-epub.ps1 -EpubCheckJar "C:\tools\epubcheck.jar"
```

**驗證模式說明**：

| 模式 | 條件 | 說明 |
|------|------|------|
| 完整驗證 | 已安裝 Java + epubcheck | 完整 EPUB 3 規格檢查，顯示錯誤與警告 |
| 基本檢查 | 無 epubcheck | 驗證 ZIP 結構與必要檔案是否存在 |

**epubcheck 下載**：https://github.com/w3c/epubcheck/releases

**依賴**：Java（使用 epubcheck 時需要）

---

## export-pdf.ps1 — 匯出 PDF

將網站頁面匯出為 PDF 檔案，輸出至 `dist/`。

```powershell
# 預設：傳統版，自動偵測工具
.\scripts\export-pdf.ps1

# 指定主題
.\scripts\export-pdf.ps1 -Theme apple
.\scripts\export-pdf.ps1 -Theme dark
.\scripts\export-pdf.ps1 -Theme purple

# 強制指定使用 Edge headless
.\scripts\export-pdf.ps1 -Theme main -Method edge

# 強制指定使用 pandoc
.\scripts\export-pdf.ps1 -Theme main -Method pandoc
```

**`-Method` 可選值**：`auto`（預設）、`edge`、`pandoc`

**輸出檔名**：

| 主題 | 輸出檔 |
|------|--------|
| main | `dist/family-legacy.pdf` |
| apple | `dist/family-legacy-apple.pdf` |
| dark | `dist/family-legacy-dark.pdf` |
| purple | `dist/family-legacy-purple.pdf` |

**工具優先順序（`auto` 模式）**：

1. **MS Edge headless**（Windows 內建，優先使用）— 逐頁匯出，保留完整排版
2. **pandoc + wkhtmltopdf**（fallback）— 需另行安裝

> Edge 模式會在 `dist/` 產生各頁個別 PDF（`tmp_[theme]_[page].pdf`），  
> 如需合併為單一 PDF，可使用 Adobe Acrobat 或 [PDF24](https://www.pdf24.org/) 等工具。

**依賴**：Microsoft Edge（通常已內建）或 pandoc + wkhtmltopdf

---

## publish.ps1 — 推送至 GitHub

自動執行 `git add → commit → push`，將變更發佈到 GitHub。

```powershell
# 自動產生 commit message（含時間戳）
.\scripts\publish.ps1

# 自訂 commit message
.\scripts\publish.ps1 -Message "feat: 新增淺藍主題"

# 指定推送分支
.\scripts\publish.ps1 -Branch main -Message "fix: 修正頁腳連結"

# 模擬預覽（不實際執行）
.\scripts\publish.ps1 -DryRun
.\scripts\publish.ps1 -Message "測試訊息" -DryRun
```

執行流程：

1. 顯示目前分支與 remote URL
2. 列出所有變更檔案
3. `git add .`
4. `git commit -m <message>`
5. `git push origin <branch>`
6. 顯示 GitHub Repository 與 GitHub Pages 網址

**`-DryRun`**：只顯示將執行的指令，不實際提交或推送，適合確認後再執行。

**依賴**：Git for Windows

---

## 典型工作流程

```powershell
# 1. 啟動本地伺服器開始開發
.\scripts\run.ps1

# 2. 快速預覽某個版本
.\scripts\preview.ps1 -Theme apple -Page stories

# 3. 打包 EPUB 電子書
.\scripts\build-epub.ps1

# 4. 驗證 EPUB 格式
.\scripts\check-epub.ps1

# 5. 匯出 PDF
.\scripts\export-pdf.ps1 -Theme main

# 6. 發佈到 GitHub
.\scripts\publish.ps1 -Message "feat: 更新主題配色"
```

---

## 依賴工具安裝一覽

| 工具 | 用途 | 安裝方式 |
|------|------|---------|
| Python 3 | 本地伺服器 | https://www.python.org/ 或 `winget install Python.Python.3` |
| pandoc | EPUB / PDF 匯出 | `winget install pandoc` |
| epubcheck | EPUB 完整驗證 | https://github.com/w3c/epubcheck/releases（需 Java） |
| Java | 執行 epubcheck | `winget install Microsoft.OpenJDK.21` |
| MS Edge | PDF 匯出 | Windows 已內建 |
| wkhtmltopdf | pandoc PDF 引擎 | https://wkhtmltopdf.org/downloads.html |
| Git | 版本控制與發佈 | https://git-scm.com/ 或 `winget install Git.Git` |
