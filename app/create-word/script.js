(function(){
  // state
  let words = [];
  let editingIndex = null;

  // DOM refs
  const entryForm = document.getElementById('entryForm');
  const wordInput = document.getElementById('wordInput');
  const meanInput = document.getElementById('meanInput');
  const exampleInput = document.getElementById('exampleInput');
  const formMessage = document.getElementById('formMessage');

  const fileInput = document.getElementById('fileInput');
  const loadBtn = document.getElementById('loadBtn');
  const loadMessage = document.getElementById('loadMessage');

  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const listContainer = document.getElementById('listContainer');
  const countEl = document.getElementById('count');

  // modal elements
  const modal = document.getElementById('editModal');
  const editWord = document.getElementById('editWord');
  const editMean = document.getElementById('editMean');
  const editExample = document.getElementById('editExample');
  const editMsg = document.getElementById('editMsg');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // --------------------------
  // Utilities
  // --------------------------
  function normalizeKey(str){
    if(!str) return '';
    // NFKC normalize (全角半角統一・全角英数→半角等)、trim, lowercase
    try { str = String(str).normalize('NFKC'); } catch(e) {}
    str = String(str).trim().toLowerCase();
    return str;
  }

  function isDuplicate(word){
    const key = normalizeKey(word);
    return words.some(w => normalizeKey(w.word) === key);
  }

  function render(){
    countEl.textContent = words.length;
    listContainer.innerHTML = '';
    words.forEach((w, idx) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="text">
          <div class="meta">#${idx+1}</div>
          <strong>${escapeHtml(w.word)}</strong>
          <p>${escapeHtml(w.mean)}</p>
          <div class="meta">例: ${escapeHtml(w.example)}</div>
        </div>
        <div class="ops">
          <button data-action="edit" data-idx="${idx}">編集</button>
          <button data-action="delete" data-idx="${idx}" class="delete">削除</button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  function showFormMessage(msg, ok=true){
    formMessage.textContent = msg || '';
    formMessage.style.color = ok ? '' : 'var(--danger)';
  }

  function showLoadMessage(msg, ok=true){
    loadMessage.textContent = msg || '';
    loadMessage.style.color = ok ? '' : 'var(--danger)';
  }

  // --------------------------
  // Validation & normalization for loaded JSON
  // --------------------------
  function normalizeAndValidateJson(data){
    if(!Array.isArray(data)) throw new Error('トップレベルは配列である必要があります。');
    const errors = [];
    const normalized = data.map((raw, idx) => {
      if(raw === null || typeof raw !== 'object' || Array.isArray(raw)){
        errors.push(`[${idx}] オブジェクトではありません。`);
        return null;
      }
      const obj = Object.assign({}, raw);
      // key correction
      if(obj.mean == null && (obj.meaning != null)) obj.mean = obj.meaning;
      if(obj.example == null && (obj.exampleSentence != null)) obj.example = obj.exampleSentence;
      if(obj.word == null && (obj.term != null)) obj.word = obj.term;
      if(obj.answered === undefined) obj.answered = false;

      // coerce to string and trim
      obj.word = obj.word != null ? String(obj.word).trim() : '';
      obj.mean = obj.mean != null ? String(obj.mean).trim() : '';
      obj.example = obj.example != null ? String(obj.example).trim() : '';

      if(!obj.word) errors.push(`[${idx}] "word" が未定義または空です`);
      if(!obj.mean) errors.push(`[${idx}] "mean" が未定義または空です`);
      if(!obj.example) errors.push(`[${idx}] "example" が未定義または空です`);
      else if(obj.example.length < 10) errors.push(`[${idx}] "example" が短すぎます（${obj.example.length}文字）。10文字以上推奨。`);

      obj.answered = !!obj.answered;
      return obj;
    });

    if(errors.length) {
      const e = new Error('検証エラー:\n' + errors.join('\n'));
      e.details = errors;
      throw e;
    }
    return normalized;
  }

  // --------------------------
  // Handlers
  // --------------------------
  entryForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const w = wordInput.value.trim();
    const m = meanInput.value.trim();
    const ex = exampleInput.value.trim();

    if(!w || !m || !ex){
      showFormMessage('すべてのフィールドを入力してください。', false);
      return;
    }
    if(ex.length < 10){
      showFormMessage(`実例が短すぎます（${ex.length}文字）。10文字以上推奨。`, false);
      return;
    }
    if(isDuplicate(w)){
      showFormMessage('同じ単語が既に存在します。大文字小文字は区別しません。', false);
      return;
    }

    words.push({ word: w, mean: m, example: ex, answered:false });
    showFormMessage('追加しました。');
    entryForm.reset();
    render();
  });

  document.getElementById('clearForm').addEventListener('click', ()=>{
    entryForm.reset();
    showFormMessage('');
  });

  // list actions (edit/delete)
  listContainer.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);
    if(action === 'delete'){
      if(!confirm(`項目 #${idx+1} を削除しますか？`)) return;
      words.splice(idx,1);
      render();
    } else if(action === 'edit'){
      editingIndex = idx;
      const item = words[idx];
      editWord.value = item.word;
      editMean.value = item.mean;
      editExample.value = item.example;
      editMsg.textContent = '';
      modal.setAttribute('aria-hidden','false');
      modal.style.display = 'flex';
      editWord.focus();
    }
  });

  // modal cancel
  cancelEditBtn.addEventListener('click', () => {
    closeModal();
  });

  // modal save
  saveEditBtn.addEventListener('click', () => {
    const w = editWord.value.trim();
    const m = editMean.value.trim();
    const ex = editExample.value.trim();

    if(!w || !m || !ex){
      editMsg.textContent = 'すべてのフィールドを入力してください。';
      return;
    }
    if(ex.length < 10){
      editMsg.textContent = `実例が短すぎます（${ex.length}文字）。10文字以上推奨。`;
      return;
    }
    // duplicate check excluding current editing index
    const key = normalizeKey(w);
    const dup = words.some((it,i)=> i!==editingIndex && normalizeKey(it.word) === key);
    if(dup){
      editMsg.textContent = '同じ単語が既に存在します（大文字小文字は区別しません）。';
      return;
    }

    words[editingIndex] = { word: w, mean: m, example: ex, answered:false };
    closeModal();
    render();
  });

  // close modal on outside click or ESC
  window.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });
  function closeModal(){
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    editingIndex = null;
  }

  // load JSON file
  loadBtn.addEventListener('click', ()=>{
    const f = fileInput.files && fileInput.files[0];
    if(!f){ showLoadMessage('ファイルを選択してください。', false); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        const normalized = normalizeAndValidateJson(parsed);
        // merge with dedupe
        let added = 0, skipped = 0;
        normalized.forEach(n=>{
          if(!isDuplicate(n.word)){
            words.push(n);
            added++;
          } else skipped++;
        });
        render();
        showLoadMessage(`読み込み完了: ${added} 件追加, ${skipped} 件重複でスキップ。`);
      }catch(err){
        const msg = err && err.details ? err.details.join('\n') : (err.message || String(err));
        showLoadMessage('読み込みエラー: ' + msg, false);
      }
    };
    reader.readAsText(f, 'utf-8');
  });

  // download
  downloadBtn.addEventListener('click', ()=>{
    if(words.length === 0){ alert('出力するエントリがありません。'); return; }
    const blob = new Blob([JSON.stringify(words, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'words.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // copy
  copyBtn.addEventListener('click', async ()=>{
    if(words.length === 0){ alert('コピーするエントリがありません。'); return; }
    try{
      await navigator.clipboard.writeText(JSON.stringify(words, null, 2));
      alert('JSON をクリップボードへコピーしました。');
    }catch(e){
      alert('クリップボードへコピーできませんでした。ブラウザの権限を確認してください。');
    }
  });

  // clear all
  clearAllBtn.addEventListener('click', ()=>{
    if(!confirm('すべてのエントリを削除します。よいですか？')) return;
    words = [];
    render();
    showLoadMessage('全件削除しました。');
  });

  // initial render
  render();

  // expose for debug
  window.__words_editor = {
    getWords: ()=>words,
    setWords: (arr)=>{ words = arr; render(); }
  };
})();
