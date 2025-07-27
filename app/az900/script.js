// 単語定義開始
const words = [
    { word: 'Azure ポリシー', mean: 'Azure リソースの管理とコンプライアンスを強化するためのツール', example: 'ポリシーを使用すると、リソースの作成や構成に関するルールを定義し、セキュリティやガバナンスの観点から適用できます。', answered: false },
    { word: 'リソースグループ', mean: 'Azureでリソースをまとめて管理するためのコンテナ', example: 'リソースグループにより、仮想マシンやストレージなどの関連リソースを一元管理できます。', answered: false },
    // ... （28語省略中）...
    { word: 'Azure Bastion', mean: 'RDPやSSHをブラウザ経由で安全に提供するサービス', example: 'パブリックIPを使わずに仮想マシンへアクセスできます。', answered: false }
];

// ランダムシャッフル関数
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(words);

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

let countdownTimer;

revealButton.addEventListener('click', () => {
    exampleElement.style.display = 'block';
    revealButton.style.display = 'none';
});

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
    const remainingTime = timeLimit - elapsedSeconds;
    if (remainingTime <= 0) {
        clearInterval(countdownTimer);
        clearScreen.style.display = 'block';
    } else {
        timerDisplay.textContent = `各単語の制限時間: ${remainingTime}秒`;
    }
}

function getNextWord() {
    if (currentIndex < words.length) {
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        logs.push({ word: words[currentIndex].word, duration: duration, status: "next" });
        document.getElementById("result1").innerHTML = `"${words[currentIndex].word}" の学習所要時間: ${duration}秒`;
        words[currentIndex].answered = true;
        clearInterval(countdownTimer);
        currentIndex = getNextUnansweredWordIndex(currentIndex);
        if (currentIndex !== null) {
            displayWord(currentIndex);
        } else {
            clearScreen.style.display = 'block';
        }
    }
}

function skipWord() {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logs.push({ word: words[currentIndex].word, duration: duration, status: "skip" });
    document.getElementById("result2").innerHTML = `"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`;
    currentIndex = getNextUnansweredWordIndex(currentIndex) ?? getNextUnansweredWordIndex(-1);
    if (currentIndex !== null) {
        displayWord(currentIndex);
    } else {
        clearScreen.style.display = 'block';
    }
}

function getNextUnansweredWordIndex(startIndex) {
    for (let i = startIndex + 1; i < words.length; i++) {
        if (!words[i].answered) return i;
    }
    return null;
}

nextButton.addEventListener('click', getNextWord);
skipButton.addEventListener('click', skipWord);
exportLogsButton.addEventListener('click', exportLogsToCSV);

function exportLogsToCSV() {
    if (logs.length === 0) return;
    let csvContent = "Word,Duration (seconds),Status\n";
    for (let log of logs) {
        csvContent += `${log.word},${log.duration},${log.status}\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const customFileName = prompt("参加者名を入力してください。");
    a.href = url;
    a.download = `${customFileName}.csv`;
    a.click();
}

document.getElementById('reset-answered-button').addEventListener('click', () => {});

currentIndex = getNextUnansweredWordIndex(-1);
if (currentIndex !== null) {
    displayWord(currentIndex);
}
