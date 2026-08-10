const canvas = document.getElementById('canvas');
const input = document.getElementById('note-input');
const addBtn = document.getElementById('add-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const sizeBtns = document.querySelectorAll('.size-btn');
const emptyGuide = document.getElementById('empty-guide');

// お題関連
const themeContainer = document.getElementById('theme-container');
const themeInput = document.getElementById('theme-input');
const themeDisplay = document.getElementById('theme-display');

// 保存・読込関連
const saveBtn = document.getElementById('save-btn');
const loadInput = document.getElementById('load-input');

let currentColor = 'var(--sticky-yellow)';
let currentFontSize = '18px';
let zIndexCounter = 10;
let noteCount = 0;

// ===== お題の入力・切り替え制御 =====
themeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const text = themeInput.value.trim();
        if (text) {
            themeDisplay.textContent = text;
            themeInput.style.display = 'none';
            themeDisplay.style.display = 'block';
            input.focus();
        }
    }
});

themeDisplay.addEventListener('click', () => {
    themeDisplay.style.display = 'none';
    themeInput.style.display = 'block';
    themeInput.focus();
});


// ===== ツールバー制御 =====
// カラー選択
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
        input.style.borderColor = currentColor;
        setTimeout(() => input.style.borderColor = '', 300);
    });
});

// 文字サイズ選択
sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFontSize = btn.getAttribute('data-size');
        
        input.style.fontSize = currentFontSize;
        input.style.fontWeight = currentFontSize === '36px' ? '700' : 'normal';
    });
});


// ===== 新規付箋の生成イベント =====
addBtn.addEventListener('click', handleCreateNote);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleCreateNote();
    }
});

function handleCreateNote() {
    const text = input.value.trim();
    if (!text) {
        input.focus();
        return;
    }

    if (noteCount === 0) emptyGuide.style.opacity = '0';
    noteCount++;

    // お題領域への侵入を防ぐY座標の計算
    const themeRect = themeContainer.getBoundingClientRect();
    const safeY_MIN = themeRect.bottom + 30;

    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 150;
    const startX = window.innerWidth / 2 - 100 + offsetX;
    let startY = (window.innerHeight / 2 - 100 + offsetY);
    
    // 生成時に壁でクランプ（制限）
    if (startY < safeY_MIN) {
        startY = safeY_MIN;
    }

    const noteData = {
        text: text,
        color: currentColor,
        fontSize: currentFontSize,
        left: startX,
        top: startY,
        rotation: (Math.random() - 0.5) * 6,
        zIndex: zIndexCounter++
    };

    renderNoteElement(noteData);

    input.value = '';
    input.focus();
}

// ===== 付箋DOMの描画処理 =====
function renderNoteElement(data) {
    const note = document.createElement('div');
    note.className = 'sticky-note';
    
    // 復元のためにdatasetに情報を記録
    note.dataset.color = data.color;
    note.dataset.fontSize = data.fontSize;
    note.dataset.rotation = data.rotation;
    
    note.style.backgroundColor = data.color;
    note.style.left = `${data.left}px`;
    note.style.top = `${data.top}px`;
    note.style.zIndex = data.zIndex;
    note.style.transform = `rotate(${data.rotation}deg)`;

    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = data.text;
    content.style.fontSize = data.fontSize;
    
    if(data.fontSize === '36px') {
        content.style.fontWeight = '800';
    } else if (data.fontSize === '28px') {
        content.style.fontWeight = '600';
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        note.style.transform = 'scale(0)';
        note.style.opacity = '0';
        setTimeout(() => {
            note.remove();
            noteCount--;
            if(noteCount === 0) emptyGuide.style.opacity = '1';
        }, 200);
    });

    note.appendChild(delBtn);
    note.appendChild(content);
    canvas.appendChild(note);

    setupDraggable(note);
}

// ===== ドラッグ機能（お題への侵入防止付き） =====
function setupDraggable(el) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    el.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        isDragging = true;
        el.style.zIndex = zIndexCounter++;
        el.classList.add('dragging');
        
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = el.offsetLeft;
        initialTop = el.offsetTop;
        
        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // ドラッグ中にお題エリアに侵入できないようにする制限処理
        const themeRect = themeContainer.getBoundingClientRect();
        const safeY_MIN = themeRect.bottom + 20;
        
        if (newTop < safeY_MIN) {
            newTop = safeY_MIN;
        }
        
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
    });

    const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');
        el.style.transform = `rotate(${el.dataset.rotation}deg)`;
        el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
}


// ============================================
// JSON 保存・読込システム
// ============================================

// ボードの保存
saveBtn.addEventListener('click', () => {
    // 全ての付箋データを収集
    const notesData = Array.from(document.querySelectorAll('.sticky-note')).map(el => {
        return {
            text: el.querySelector('.content').textContent,
            color: el.dataset.color,
            fontSize: el.dataset.fontSize,
            rotation: parseFloat(el.dataset.rotation),
            left: parseFloat(el.style.left),
            top: parseFloat(el.style.top),
            zIndex: parseInt(el.style.zIndex, 10)
        };
    });

    // ボード全体のデータをまとめる
    const boardData = {
        theme: themeDisplay.style.display === 'block' ? themeDisplay.textContent : '',
        notes: notesData,
        zIndexCounter: zIndexCounter
    };

    // JSONファイルとしてダウンロード
    const blob = new Blob([JSON.stringify(boardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sticky_board.json';
    a.click();
    URL.revokeObjectURL(url);
});

// ボードの読込
loadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // 現在の付箋を全て削除
            document.querySelectorAll('.sticky-note').forEach(n => n.remove());
            
            // お題の復元
            if (data.theme) {
                themeDisplay.textContent = data.theme;
                themeDisplay.style.display = 'block';
                themeInput.style.display = 'none';
            } else {
                themeDisplay.textContent = '';
                themeDisplay.style.display = 'none';
                themeInput.style.display = 'block';
                themeInput.value = '';
            }

            // zIndexカウンターとカウントの復元
            zIndexCounter = data.zIndexCounter || 10;
            noteCount = data.notes.length;
            
            if (noteCount > 0) {
                emptyGuide.style.opacity = '0';
            } else {
                emptyGuide.style.opacity = '1';
            }

            // 付箋の復元
            data.notes.forEach(noteData => {
                renderNoteElement(noteData);
            });

        } catch (err) {
            alert('ファイルの読み込みに失敗しました。正しいJSONファイルか確認してください。');
        }
    };
    reader.readAsText(file);
    
    // 同じファイルを再度読み込めるようにinputをリセット
    event.target.value = '';
});