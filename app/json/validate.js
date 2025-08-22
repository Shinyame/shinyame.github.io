const fileInput = document.getElementById("fileInput");
const checkButton = document.getElementById("checkButton");
const resultBox = document.getElementById("resultBox");
const jsonContent = document.getElementById("jsonContent");
const lineNumbers = document.getElementById("lineNumbers");
const togglePreview = document.getElementById("togglePreview");
const copyButton = document.getElementById("copyButton");

let fullText = "";
let isExpanded = false;

// メッセージ追加関数
function addMessage(text, sender = "system") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  resultBox.appendChild(msg);
  resultBox.scrollTop = resultBox.scrollHeight;
}

// 結果エリア初期化
function clearResults() {
  resultBox.innerHTML = "";
  jsonContent.innerHTML = "";
  lineNumbers.innerHTML = "";
  togglePreview.style.display = "none";
  copyButton.style.display = "none";
  isExpanded = false;
}

// JSONをハイライトする関数
function syntaxHighlight(json) {
  return json
    .replace(/(&)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:))/g, '<span class="key">$1</span>')
    .replace(/"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"/g, '<span class="string">$&</span>')
    .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
    .replace(/\b(null)\b/g, '<span class="null">$1</span>')
    .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>');
}

// プレビュー更新（行番号付き + ハイライト）
function updatePreview(text) {
  const lines = text.split("\n");
  jsonContent.innerHTML = syntaxHighlight(text);

  // 行番号を一行ずつ div で追加
  lineNumbers.innerHTML = "";
  lines.forEach((_, i) => {
    const div = document.createElement("div");
    div.textContent = i + 1;
    lineNumbers.appendChild(div);
  });
}

checkButton.addEventListener("click", () => {
  clearResults();
  const file = fileInput.files[0];
  if (!file) {
    addMessage("⚠️ JSONファイルを選択してください。", "system");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    fullText = text;

    try {
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        addMessage("❌ エラー: JSONは配列形式である必要があります。", "system");
        return;
      }

      let valid = true;
      parsed.forEach((item, index) => {
        if (typeof item.word !== "string" ||
            typeof item.mean !== "string" ||
            typeof item.example !== "string") {
          valid = false;
          addMessage(`❌ ${index + 1} 番目の要素に問題があります: { word, mean, example } が正しく定義されていません。`, "system");
        }
      });

      if (valid) {
        addMessage("✅ 構文確認完了: JSONは有効です。", "system");
        addMessage(`単語数: ${parsed.length}`, "system");

        // プレビュー表示（最初は冒頭3行のみ）
        const lines = text.split("\n");
        const preview = lines.slice(0, 3).join("\n") + (lines.length > 10 ? "\n...（省略）" : "");
        updatePreview(preview);

        togglePreview.style.display = lines.length > 10 ? "inline-block" : "none";
        copyButton.style.display = "inline-block";
        togglePreview.textContent = "全文表示";
      }
    } catch (err) {
      addMessage(`❌ JSONパースエラー: ${err.message}`, "system");
    }
  };
  reader.readAsText(file);
});

// プレビュー切替
togglePreview.addEventListener("click", () => {
  if (!fullText) return;

  if (isExpanded) {
    const lines = fullText.split("\n");
    const preview = lines.slice(0, 3).join("\n") + (lines.length > 3 ? "\n...（省略）" : "");
    updatePreview(preview);
    togglePreview.textContent = "全文表示";
  } else {
    updatePreview(fullText);
    togglePreview.textContent = "折りたたむ";
  }
  isExpanded = !isExpanded;
});

// コピー機能
copyButton.addEventListener("click", () => {
  if (!fullText) return;
  navigator.clipboard.writeText(fullText)
    .then(() => {
      alert("✅ JSONをクリップボードにコピーしました。");
    })
    .catch(() => {
      alert("❌ コピーに失敗しました。");
    });
});

// スクロール同期
jsonContent.addEventListener("scroll", () => {
  lineNumbers.scrollTop = jsonContent.scrollTop;
});
