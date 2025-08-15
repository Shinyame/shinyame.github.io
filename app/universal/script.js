let words = [];
let currentIndex = 0;
let startTime;
let timeLimit = 150;
let logs = [];

const wordElement = document.getElementById('word');
const meanElement = document.getElementById('mean');
const exampleElement = document.getElementById('example');
const nextButton = document.getElementById('next-button');
const skipButton = document.getElementById('skip-button');
const clearScreen = document.getElementById('clear-screen');
const timerDisplay = document.getElementById('timer-display');
const exportLogsButton = document.getElementById('export-logs');
const revealButton = document.getElementById('reveal-example-button');
const jsonLoader = document.getElementById('jsonLoader');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayWord(index) {
  exampleElement.style.display = 'none';
  revealButton.style.display = 'inline-block';
  wordElement.textContent = words[index].word;
  meanElement.textContent = '意味: ' + words[index].mean;
  exampleElement.textContent = '実例: ' + words[index].example;
  startTime = new Date();
  updateTimerDisplay();
  countdownTimer = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
  const currentTime = new Date();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  timerDisplay.textContent = `各単語の経過時間: ${elapsedSeconds}秒`;

}

function getNextWord() {
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  logs.push({ word: words[currentIndex].word, duration: duration, status: "next" });
  document.getElementById("result1").innerHTML = `"${words[currentIndex].word}" の学習所要時間: ${duration}秒`;
  words[currentIndex].answered = true;
  clearInterval(countdownTimer);
  currentIndex = getNextUnansweredWordIndex(currentIndex);
  if (currentIndex !== null) displayWord(currentIndex);
  else clearScreen.style.display = 'block';
}

function skipWord() {
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  logs.push({ word: words[currentIndex].word, duration: duration, status: "skip" });
  document.getElementById("result2").innerHTML = `"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`;
  currentIndex = getNextUnansweredWordIndex(currentIndex) ?? getNextUnansweredWordIndex(-1);
  if (currentIndex !== null) displayWord(currentIndex);
  else clearScreen.style.display = 'block';
}

function getNextUnansweredWordIndex(startIndex) {
  for (let i = startIndex + 1; i < words.length; i++) {
    if (!words[i].answered) return i;
  }
  return null;
}

function loadWordsFromJSONFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      if (Array.isArray(json)) {
        words = json;
        shuffle(words);
        currentIndex = getNextUnansweredWordIndex(-1);
        if (currentIndex !== null) displayWord(currentIndex);
      } else {
        alert("JSONファイルの形式が正しくありません。");
      }
    } catch (err) {
      alert("JSONの読み込みに失敗しました。");
    }
  };
  reader.readAsText(file, "UTF-8");
}

// ローカルファイル選択時
jsonLoader.addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    loadWordsFromJSONFile(file);
  }
});

revealButton.addEventListener('click', () => {
  exampleElement.style.display = 'block';
  revealButton.style.display = 'none';
});

nextButton.addEventListener('click', getNextWord);
skipButton.addEventListener('click', skipWord);

exportLogsButton.addEventListener('click', () => {
  if (logs.length === 0) return;
  let csvContent = "Word,Duration (seconds),Status\\n";
  logs.forEach(log => {
    csvContent += `${log.word},${log.duration},${log.status}\\n`;
  });
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = prompt("参加者名を入力してください。");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
});
