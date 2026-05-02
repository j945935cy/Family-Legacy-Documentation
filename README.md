# 林志遠家族故事網站

家族故事示範網站，用純靜態 HTML / CSS / JavaScript 建立，可直接部署到 GitHub Pages。

---

## 專案用途

保存家族人物資料、展示家族故事、建立家族年表，並呈現家族價值觀。  
本版本為示範版，人物為虛擬角色「林志遠」，可替換成真實家族內容。

---

## 使用技術

- HTML5
- CSS3（RWD 響應式設計）
- JavaScript（原生，無框架、無 build 工具）

---

## 檔案結構

```
family-legacy-demo/
├── index.html        首頁
├── stories.html      家族故事
├── people.html       家族人物
├── timeline.html     家族年表
├── values.html       家族價值
├── gallery.html      照片牆
├── about.html        關於本站
├── css/
│   └── style.css
├── js/
│   ├── data.js       所有資料（故事、人物、年表、價值）
│   └── main.js       頁面渲染邏輯
├── images/
│   └── placeholder.jpg
├── README.md
└── .nojekyll
```

---

## 如何新增故事

編輯 `js/data.js`，在 `familyStories` 陣列末尾加入：

```js
{
  id: 4,
  title: "故事標題",
  year: "1990",
  people: ["人物名稱"],
  location: "地點",
  image: "images/your-image.jpg",
  summary: "摘要一句話",
  scene: "場景描述",
  characters: "人物介紹",
  conflict: "衝突描述",
  plot: "情節發展",
  sensory: "感官細節",
  dialogue: "對話內容",
  resolution: "結局",
  lesson: "啟示"
}
```

---

## 如何新增人物

編輯 `js/data.js`，在 `familyPeople` 陣列末尾加入：

```js
{
  id: 2,
  name: "姓名",
  englishName: "English Name",
  birthYear: "1970",
  role: "身分",
  location: "出生地",
  image: "images/your-image.jpg",
  quote: "代表名言",
  description: "人物介紹"
}
```

---

## 如何更換圖片

1. 將圖片放入 `images/` 資料夾
2. 在 `data.js` 對應條目的 `image` 欄位填入路徑，例如 `"images/your-photo.jpg"`

---

## 部署到 GitHub Pages

1. 建立 GitHub repository
2. 上傳所有檔案（包含 `.nojekyll`）
3. 進入 Settings → Pages
4. Source 選 `main` branch，Folder 選 `root`
5. 儲存後等待網址產生（通常約 1 分鐘）

> `.nojekyll` 檔案用來停用 GitHub Pages 的 Jekyll 預設處理，避免影響靜態檔案。
