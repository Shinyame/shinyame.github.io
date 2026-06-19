// --- データ定義 ---
const stickyNoteData = [
  {
    id: 'yellow', name: 'レモンイエロー', bg: '#FDF170',
    situations: [
      { label: '基本・明瞭', desc: '確実な情報伝達', fg: '#333333' },
      { label: '重要・警告', desc: '注意を引く・急ぎ', fg: '#D32F2F' },
      { label: '冷静・タスク', desc: '事務的・補足事項', fg: '#1976D2' },
      { label: 'ソフト・親和', desc: '柔らかい印象', fg: '#5D4037' }
    ]
  },
  {
    id: 'pink', name: 'ネオンピンク', bg: '#FFB3BA',
    situations: [
      { label: '基本・明瞭', desc: '確実な情報伝達', fg: '#2C3E50' },
      { label: '重要・強調', desc: 'アクションを促す', fg: '#900C3F' },
      { label: '冷静・タスク', desc: '落ち着きを持たせる', fg: '#004D40' },
      { label: 'ソフト・親和', desc: '温かみのある伝達', fg: '#5D4037' }
    ]
  },
  {
    id: 'green', name: 'ライムグリーン', bg: '#BAFFC9',
    situations: [
      { label: '基本・明瞭', desc: '確実な情報伝達', fg: '#2F4F4F' },
      { label: '重要・警告', desc: '目立たせたい時', fg: '#B71C1C' },
      { label: '冷静・タスク', desc: '整理された印象', fg: '#006064' },
      { label: 'ソフト・親和', desc: 'ナチュラルな伝達', fg: '#33691E' }
    ]
  },
  {
    id: 'orange', name: 'ブライトオレンジ', bg: '#FFDFBA',
    situations: [
      { label: '基本・明瞭', desc: '確実な情報伝達', fg: '#3E2723' },
      { label: '重要・強調', desc: '強いインパクト', fg: '#BF360C' },
      { label: '冷静・タスク', desc: '信頼感のある補足', fg: '#01579B' },
      { label: 'ソフト・親和', desc: '親しみやすい伝達', fg: '#5D4037' }
    ]
  },
  {
    id: 'blue', name: 'スカイブルー', bg: '#BAE1FF',
    situations: [
      { label: '基本・明瞭', desc: '確実な情報伝達', fg: '#1A237E' },
      { label: '重要・警告', desc: 'アクセントカラー', fg: '#BF360C' },
      { label: '冷静・タスク', desc: '論理的・客観的', fg: '#0D47A1' },
      { label: 'ソフト・親和', desc: '控えめなメモ', fg: '#37474F' }
    ]
  }
];

// --- 初期化＆DOMキャッシュ ---
const elements = {};
let audioCtx, toastTimeout;
let currentActiveNote = stickyNoteData[0];

document.addEventListener('DOMContentLoaded', () => {
  ['stickyNoteSelector', 'currentNoteName', 'situationGrid', 'noteInput', 'toast'].forEach(id => {
    elements[id] = document.getElementById(id);
  });

  // テキストが変更されたらプレビューをリアルタイム更新
  elements.noteInput.addEventListener('input', () => {
    document.querySelectorAll('.card-preview').forEach(el => {
      el.innerText = elements.noteInput.value;
    });
  });

  renderStickyNoteSelectors();
  selectStickyNote(currentActiveNote);
});

// --- 音声＆通知機能 ---
const playPopSound = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(1600, t + 0.05);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
};

const showToast = (text, subtext = "") => {
  elements.toast.innerHTML = `${text}<br><span style="font-size:0.8em; font-weight:normal;">${subtext}</span>`;
  elements.toast.classList.add('show');
  playPopSound();
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove('show'), 2500);
};

const copyCSS = (bg, fg) => {
  const cssText = `background-color: ${bg};\ncolor: ${fg};`;
  navigator.clipboard.writeText(cssText).then(() => showToast("配色CSSをコピーしました", cssText.replace('\n', ' ')));
};

// --- コントラスト計算（WCAG準拠） ---
const hexToRgb = (hex) => hex.match(/\w\w/g).map(x => parseInt(x, 16));
const getLuminance = (rgb) => {
  const [r, g, b] = rgb.map(v => {
    v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};
const getContrastRatio = (bgHex, fgHex) => {
  const l1 = getLuminance(hexToRgb(bgHex));
  const l2 = getLuminance(hexToRgb(fgHex));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// --- Canvasによる画像生成機能 ---
const createStickyNoteImage = (bg, fg, text) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 600; // 高画質（600x600px）
  canvas.width = size; canvas.height = size;

  // 背景の描画
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 右下の「めくれ」の影（少しリアルな遊び心）
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.moveTo(size - 60, size);
  ctx.lineTo(size, size);
  ctx.lineTo(size, size - 60);
  ctx.fill();

  // テキストの描画設定
  ctx.fillStyle = fg;
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 改行・折り返し処理
  const lines = [];
  const maxWidth = size - 80;
  const rawLines = text.split('\n');

  rawLines.forEach(rawLine => {
    let currentLine = '';
    for (let char of rawLine) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  });

  // 中央に配置するためのY座標計算
  const lineHeight = 60;
  let startY = (size - (lines.length * lineHeight)) / 2 + (lineHeight / 2);
  lines.forEach(line => {
    ctx.fillText(line, size / 2, startY);
    startY += lineHeight;
  });

  return canvas.toDataURL('image/png');
};

// --- 画像共有・ダウンロード機能 ---
const shareOrDownloadImage = async (bg, fg, text, label) => {
  if (!text) text = "テキストなし";
  const dataUrl = createStickyNoteImage(bg, fg, text);
  
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `stickynote_${Date.now()}.png`, { type: 'image/png' });

    // Web Share API（スマホブラウザや最新のSafari/Edgeなどで対応）
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Sticky Note',
        text: `[${label}] 配色でSticky Notesを作成しました！\n#StickyNotes #配色チェッカー`,
        files: [file]
      });
      showToast('SNSへ共有しました');
    } else {
      throw new Error('Web Share API Not Supported');
    }
  } catch (error) {
    // 非対応環境、または共有キャンセル時は自動的にダウンロードさせるフォールバック
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `stickynote_${label}.png`;
    a.click();
    showToast('画像を保存しました', '端末のフォルダを確認してください');
  }
};

// --- UI描画処理 ---
const renderStickyNoteSelectors = () => {
  elements.stickyNoteSelector.innerHTML = '';
  stickyNoteData.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'sticky-note-btn';
    btn.style.backgroundColor = note.bg;
    btn.dataset.id = note.id;
    btn.addEventListener('click', () => selectStickyNote(note));
    elements.stickyNoteSelector.appendChild(btn);
  });
};

const selectStickyNote = (selectedNote) => {
  currentActiveNote = selectedNote;
  document.querySelectorAll('.sticky-note-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === selectedNote.id);
  });
  
  elements.currentNoteName.innerText = selectedNote.name;
  elements.situationGrid.innerHTML = '';
  const currentText = elements.noteInput.value;

  selectedNote.situations.forEach(sit => {
    const ratio = getContrastRatio(selectedNote.bg, sit.fg);
    const badgeLevel = ratio >= 7.0 ? 'AAA' : (ratio >= 4.5 ? 'AA' : 'FAIL');
    
    const card = document.createElement('div');
    card.className = 'situation-card';
    card.style.backgroundColor = selectedNote.bg;
    card.style.color = sit.fg;
    
    // カード全体のクリックでCSSコピー
    card.addEventListener('click', () => copyCSS(selectedNote.bg, sit.fg));

    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-label">${sit.label}</div>
          <div class="card-desc">${sit.desc}</div>
        </div>
        <button class="btn-share" title="画像として出力/共有">📤</button>
      </div>
      
      <div class="card-preview">${currentText}</div>
      
      <div class="card-footer">
        <div class="card-hex">${sit.fg}</div>
        <div class="badge-container">
          <div class="badge">${badgeLevel} PASS</div>
          <div class="ratio-val">比率 ${ratio.toFixed(1)}:1</div>
        </div>
      </div>
    `;

    // 共有ボタンのクリックイベント（親のコピー処理をストップさせる）
    const shareBtn = card.querySelector('.btn-share');
    shareBtn.style.color = sit.fg; // アイコンの色も文字色に合わせる
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      shareOrDownloadImage(selectedNote.bg, sit.fg, elements.noteInput.value, sit.label);
    });

    elements.situationGrid.appendChild(card);
  });
};