// --- 初期化＆DOM要素キャッシュ ---
const elements = {};
let audioCtx, toastTimeout;

document.addEventListener('DOMContentLoaded', () => {
  ['baseColor', 'preview', 'ratioText', 'badgeAA', 'badgeAAA', 'paletteGrid', 'btnRandom', 'randomGrid', 'toast'].forEach(id => {
    elements[id] = document.getElementById(id);
  });

  // イベントリスナーの登録
  elements.baseColor.addEventListener('input', updateUI);
  elements.preview.addEventListener('click', () => copyHex(elements.baseColor.value));
  elements.btnRandom.addEventListener('click', generateRandomCombos);

  // 初期描画
  updateUI();
  generateRandomCombos();
});

// --- 音声＆通知機能 ---
const playPopSound = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
};

const showToast = (text, subtext = "") => {
  elements.toast.innerHTML = `${text} をコピーしました<br><span style="font-size:0.8em; font-weight:normal;">${subtext}</span>`;
  elements.toast.classList.add('show');
  playPopSound();
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove('show'), 2500);
};

const copyHex = (hex) => navigator.clipboard.writeText(hex.toUpperCase()).then(() => showToast(hex.toUpperCase()));
const copyCSS = (bg, fg) => {
  const cssText = `background-color: ${bg};\ncolor: ${fg};`;
  navigator.clipboard.writeText(cssText).then(() => showToast("CSSコード", cssText.replace('\n', ' ')));
};

// --- 色彩計算ロジック ---
const hexToRgb = (hex) => hex.match(/\w\w/g).map(x => parseInt(x, 16));

const getLuminance = (rgb) => {
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};

const getContrastRatio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

const hexToHsl = (hex) => {
  let [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

const getRandomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();

// --- UI更新処理 ---
const updateUI = () => {
  const hex = elements.baseColor.value;
  const bgLuminance = getLuminance(hexToRgb(hex));
  
  const contrastWhite = getContrastRatio(bgLuminance, getLuminance([255, 255, 255]));
  const contrastBlack = getContrastRatio(bgLuminance, getLuminance([0, 0, 0]));

  const isWhiteBetter = contrastWhite > contrastBlack;
  const contrastRatio = isWhiteBetter ? contrastWhite : contrastBlack;

  elements.preview.style.backgroundColor = hex;
  elements.preview.style.color = isWhiteBetter ? '#FFFFFF' : '#000000';
  elements.ratioText.innerText = `コントラスト比: ${contrastRatio.toFixed(2)} : 1`;
  
  elements.badgeAA.className = contrastRatio >= 4.5 ? 'badge pass' : 'badge';
  elements.badgeAAA.className = contrastRatio >= 7.0 ? 'badge pass' : 'badge';

  generatePalette(hex);
};

const generatePalette = (baseHex) => {
  const [h, s, l] = hexToHsl(baseHex);
  elements.paletteGrid.innerHTML = '';

  [{ h: (h + 330) % 360, s, l }, { h: (h + 180) % 360, s, l }, { h: (h + 30) % 360, s, l }].forEach(color => {
    const hex = hslToHex(color.h, color.s, color.l);
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = hex;
    swatch.innerText = hex;
    swatch.addEventListener('click', () => copyHex(hex));
    elements.paletteGrid.appendChild(swatch);
  });
};

// --- ランダム配色生成ロジック ---
const generateRandomCombos = () => {
  let aa = null, aaa = null;

  while (!aa || !aaa) {
    const bg = getRandomHex(), fg = getRandomHex();
    const ratio = getContrastRatio(getLuminance(hexToRgb(bg)), getLuminance(hexToRgb(fg)));

    if (!aa && ratio >= 4.5 && ratio < 7.0) aa = { bg, fg, ratio };
    if (!aaa && ratio >= 7.0) aaa = { bg, fg, ratio };
  }

  elements.randomGrid.innerHTML = '';
  [{ data: aa, level: 'AA (4.5:1以上)' }, { data: aaa, level: 'AAA (7.0:1以上)' }].forEach(item => {
    const card = document.createElement('div');
    card.className = 'random-card';
    card.style.backgroundColor = item.data.bg;
    card.style.color = item.data.fg;
    card.addEventListener('click', () => copyCSS(item.data.bg, item.data.fg));

    card.innerHTML = `
      <div class="level">${item.level}</div>
      <div class="ratio">${item.data.ratio.toFixed(2)} : 1</div>
      <div class="sample-text">Sample Text</div>
      <div class="hex-codes">Bg: ${item.data.bg} / Text: ${item.data.fg}</div>
    `;
    elements.randomGrid.appendChild(card);
  });
};