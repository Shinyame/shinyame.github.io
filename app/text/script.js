const $ = q => document.querySelector(q);
const input = $("#input");
const status = $("#dictStatus");
const outputs = ["full","half","hira","kata","romaji","cardRomaji","compare"];
const sampleText = "山田 太郎";

let tokenizer = null;
let loadPromise = null;
let timer = null;
let saveTimer = null;
let convertId = 0;
let historyData = JSON.parse(localStorage.getItem('convert_history') || '[]');

// 全角化ロジック
const fullAscii = c => {
  const n = c.charCodeAt(0);
  if (n === 0x20) return "\u3000";
  if (n >= 0x21 && n <= 0x7e) return String.fromCharCode(n + 0xfee0);
  return c;
};

const toFull = text => text.replace(/[\x20-\x7e]/g, fullAscii)
  .replace(/[\uff61-\uff9f]+/g, s => s.normalize("NFKC"));

// 半角化ロジック
const halfAscii = c => {
  const n = c.charCodeAt(0);
  if (n === 0x3000) return " ";
  if (n >= 0xff01 && n <= 0xff5e) return String.fromCharCode(n - 0xfee0);
  return c;
};

const kataFull = "ァアィイゥウェエォオカキクケコガギグゲゴサシスセソザジズゼゾタチツテトダヂヅデドナニヌネノハヒフヘホバビブベボパピプペポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ";
const kataHalf = ["ｧ","ｱ","ｨ","ｲ","ｩ","ｳ","ｪ","ｴ","ｫ","ｵ","ｶ","ｷ","ｸ","ｹ","ｺ","ｶﾞ","ｷﾞ","ｸﾞ","ｹﾞ","ｺﾞ","ｻ","ｼ","ｽ","ｾ","ｿ","ｻﾞ","ｼﾞ","ｽﾞ","ｾﾞ","ｿﾞ","ﾀ","ﾁ","ﾂ","ﾃ","ﾄ","ﾀﾞ","ﾁﾞ","ﾂﾞ","ﾃﾞ","ﾄﾞ","ﾅ","ﾆ","ﾇ","ﾈ","ﾉ","ﾊ","ﾋ","ﾌ","ﾍ","ﾎ","ﾊﾞ","ﾋﾞ","ﾌﾞ","ﾍﾞ","ﾎﾞ","ﾊﾟ","ﾋﾟ","ﾌﾟ","ﾍﾟ","ﾎﾟ","ﾏ","ﾐ","ﾑ","ﾒ","ﾓ","ｬ","ﾔ","ｭ","ﾕ","ｮ","ﾖ","ﾗ","ﾘ","ﾙ","ﾚ","ﾛ","ﾜ","ｲ","ｴ","ｦ","ﾝ","ｳﾞ","ｶ","ｹ"];

const fullToHalfKana = Object.fromEntries(
  [...kataFull].map((char, i) => [char, kataHalf[i]]).filter(([, value]) => value)
);

const toHalf = text =>
  text
    .replace(/[\u3000\uff01-\uff5e]/g, halfAscii)
    .replace(/[\u30a1-\u30f6\u30f7-\u30fa]/g, char => fullToHalfKana[char] || char);

// かな変換
const toHira = text => wanakana.toHiragana(text, { passRomaji: true });
const toKata = text => wanakana.toKatakana(text, { passRomaji: true });

const isJapanese = ch => /[\u3040-\u30ff\u3400-\u9fff々ー]/.test(ch);

// UI更新関連
function updateStats(text){
  $("#chars").textContent = [...text].length;
  $("#jp").textContent = [...text].filter(isJapanese).length;
  $("#bytes").textContent = new TextEncoder().encode(text).length;
}

function renderCount(id, text){
  $("#" + id + "Count").textContent = [...text].length + " 文字";
}

// 基本ローマ字変換
function basicRomaji(text){
  return wanakana.toRomaji(toKata(toHira(text)));
}

function romajiFromTokens(tokens){
  const parts = tokens.map(t => {
    const source = t.surface_form || "";
    if (!source) return "";
    if (t.reading) return wanakana.toRomaji(t.reading);
    return basicRomaji(source);
  });
  return parts.join("");
}

// クレジットカード向け変換ロジック
function applyCreditCardRules(str) {
  let romaji = str.toLowerCase();
  
  // ヘボン式補正
  romaji = romaji
      .replace(/si/g, 'shi').replace(/ti/g, 'chi').replace(/tu/g, 'tsu').replace(/hu/g, 'fu')
      .replace(/zi/g, 'ji').replace(/di/g, 'ji').replace(/du/g, 'zu')
      .replace(/sya/g, 'sha').replace(/syu/g, 'shu').replace(/syo/g, 'sho')
      .replace(/cya/g, 'cha').replace(/cyu/g, 'chu').replace(/cyo/g, 'cho')
      .replace(/zya/g, 'ja').replace(/zyu/g, 'ju').replace(/zyo/g, 'jo')
      .replace(/jya/g, 'ja').replace(/jyu/g, 'ju').replace(/jyo/g, 'jo');
      
  // 促音、撥音、長音補正
  romaji = romaji.replace(/c(?=ch)/g, 't');
  romaji = romaji.replace(/n(?=[bmp])/g, 'm');
  romaji = romaji
      .replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/uu/g, 'u')
      .replace(/aa/g, 'a').replace(/ee/g, 'e').replace(/ii/g, 'i');
      
  return romaji.toUpperCase();
}

function cardRomajiFromTokens(tokens) {
  return tokens.map(t => {
    const source = t.surface_form || "";
    if (!source) return "";
    return t.reading ? wanakana.toRomaji(t.reading) : basicRomaji(source);
  }).filter(Boolean).join(""); 
}

function cardRomaji(text) {
  const normalized = text.normalize("NFKC").trim();
  if (!normalized) return "";

  const chunks = normalized.split(/\s+/).filter(Boolean);

  if (!tokenizer || !hasKanji(normalized)) {
    return chunks.map(chunk => {
      const r = basicRomaji(chunk);
      return applyCreditCardRules(r).replace(/[^A-Z0-9]/g, "");
    }).join(" ").trim();
  }

  return chunks.map(chunk => {
    const tokens = tokenizer.tokenize(chunk);
    const r = cardRomajiFromTokens(tokens);
    return applyCreditCardRules(r).replace(/[^A-Z0-9]/g, "");
  }).join(" ").trim();
}

function applyRomajiCase(text){
  return $("#romajiCase").value === "upper" ? text.toUpperCase() : text.toLowerCase();
}

// 辞書読み込み
async function ensureTokenizer(){
  if (tokenizer) return tokenizer;
  if (loadPromise) return loadPromise;
  
  status.classList.remove("ready");
  status.querySelector("span").textContent = "漢字読み辞書：読み込み中";
  
  loadPromise = new Promise((resolve,reject) => {
    if (!window.kuromoji) {
      reject(new Error("Kuromoji.js が読み込まれていません"));
      return;
    }
    kuromoji.builder({
      dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/"
    }).build((err, value) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizer = value;
      status.classList.add("ready");
      status.querySelector("span").textContent = "漢字読み辞書：準備完了";
      resolve(tokenizer);
    });
  }).catch(err => {
    loadPromise = null;
    status.querySelector("span").textContent = "漢字読み辞書：読み込み失敗";
    console.error(err);
    throw err;
  });
  return loadPromise;
}

function hasKanji(text){
  return /[\u3400-\u4dbf\u4e00-\u9fff々]/.test(text);
}

// ローマ字非同期更新
async function updateRomaji(text){
  if (!text) return { normal: "", card: "" };

  if (!hasKanji(text)) {
    return {
      normal: applyRomajiCase(basicRomaji(text)),
      card: cardRomaji(text)
    };
  }

  try {
    const t = await ensureTokenizer();
    const tokens = t.tokenize(text);
    let normal = romajiFromTokens(tokens);

    if ($("#spaceMode").value === "word") {
      normal = tokens.map(x => {
        if (x.reading) return wanakana.toRomaji(x.reading);
        return basicRomaji(x.surface_form || "");
      }).filter(Boolean).join(" ");
    }

    return {
      normal: applyRomajiCase(normal),
      card: cardRomaji(text)
    };
  } catch {
    return {
      normal: applyRomajiCase(basicRomaji(text)),
      card: cardRomaji(text)
    };
  }
}

// 全体変換処理
async function convert(){
  const id = ++convertId;
  const text = input.value;
  updateStats(text);

  const full = toFull(text);
  const half = toHalf(text);
  const hira = toHira(text);
  const kata = toKata(text);

  $("#full").textContent = full;
  $("#half").textContent = half;
  $("#hira").textContent = hira;
  $("#kata").textContent = kata;
  $("#compare").textContent = "入力\n" + text + "\n\n全角\n" + full + "\n\n半角\n" + half;

  renderCount("full", full);
  renderCount("half", half);
  renderCount("hira", hira);
  renderCount("kata", kata);

  const romaji = await updateRomaji(text);
  if (id !== convertId) return;
  
  $("#romaji").textContent = romaji.normal;
  $("#cardRomaji").textContent = romaji.card;
  renderCount("romaji", romaji.normal);
  renderCount("cardRomaji", romaji.card);

  saveHistoryDebounced(text);
}

function queueConvert(){
  clearTimeout(timer);
  timer = setTimeout(convert, 90);
}

// 履歴機能
function saveHistoryDebounced(text) {
  clearTimeout(saveTimer);
  if (!text.trim()) return;
  saveTimer = setTimeout(() => {
    if (!historyData.includes(text)) {
      historyData.unshift(text);
      if (historyData.length > 20) historyData.pop();
      localStorage.setItem('convert_history', JSON.stringify(historyData));
    }
  }, 1500);
}

function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = '';
  if (historyData.length === 0) {
    list.innerHTML = '<li style="text-align:center; color:var(--muted); cursor:default;">履歴はありません</li>';
    return;
  }
  historyData.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    li.addEventListener('click', () => {
      input.value = item;
      convert();
      $("#historyModal").classList.add('hidden');
    });
    list.appendChild(li);
  });
}

// イベントリスナー設定
input.addEventListener("input", queueConvert);
$("#romajiCase").addEventListener("change", convert);
$("#spaceMode").addEventListener("change", convert);

$("#sample").addEventListener("click", () => {
  input.value = sampleText;
  convert();
  input.focus();
});

$("#clear").addEventListener("click", () => {
  input.value = "";
  convert();
  input.focus();
});

$("#loadRomaji").addEventListener("click", async () => {
  try {
    await ensureTokenizer();
    await convert();
  } catch {
    alert("漢字読み辞書の読み込みに失敗しました。ネットワーク接続を確認してください。");
  }
});

// 全画面表示
$("#fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});

// モーダル制御
$("#historyBtn").addEventListener("click", () => {
  renderHistory();
  $("#historyModal").classList.remove("hidden");
});

$("#closeHistory").addEventListener("click", () => {
  $("#historyModal").classList.add("hidden");
});

$("#clearHistory").addEventListener("click", () => {
  historyData = [];
  localStorage.removeItem('convert_history');
  renderHistory();
});

// コピー機能
document.querySelectorAll(".copy").forEach(button => {
  button.addEventListener("click", async () => {
    const value = $("#" + button.dataset.target).textContent;
    try {
      await navigator.clipboard.writeText(value);
      const old = button.textContent;
      button.textContent = "コピーしました";
      setTimeout(() => button.textContent = old, 900);
    } catch {
      alert("コピーできませんでした。");
    }
  });
});

// 初期実行
convert();