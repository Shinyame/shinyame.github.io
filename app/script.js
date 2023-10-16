const words = [
    { word: '単語1', translation: '訳1', example: '例文1' },
    { word: '単語2', translation: '訳2', example: '例文2' },
    { word: '単語3', translation: '訳3', example: '例文3' },
    { word: '単語4', translation: '訳4', example: '例文4' },
    { word: '単語5', translation: '訳5', example: '例文5' },
    { word: '単語6', translation: '訳6', example: '例文6' },
    { word: '単語7', translation: '訳7', example: '例文7' },
    { word: '単語8', translation: '訳8', example: '例文8' },
    { word: '単語9', translation: '訳9', example: '例文9' },
];

let currentIndex = 0;
let startTime; // 学習開始時刻

const wordElement = document.getElementById('word');
const translationElement = document.getElementById('translation');
const exampleElement = document.getElementById('example');
const nextButton = document.getElementById('next-button');
const skipButton = document.getElementById('skip-button');

function displayWord(index) {
    wordElement.textContent = words[index].word;
    translationElement.textContent = '訳: ' + words[index].translation;
    exampleElement.textContent = '例文: ' + words[index].example;
    startTime = new Date(); // 学習開始時刻を記録
}

function getNextWord() {
    const endTime = new Date(); // 学習終了時刻
    const duration = (endTime - startTime) / 1000; // 所要時間（秒）
    // 所要時間の記録とログ
    console.log(`"${words[currentIndex].word}" の学習所要時間: ${duration}秒`);
    var resultElement1 = document.getElementById("result1");
    resultElement1.innerHTML = `"${words[currentIndex].word}" の学習所要時間: ${duration}秒`;

    currentIndex = (currentIndex + 1) % words.length;
    displayWord(currentIndex);
}

function skipWord() {
    const endTime = new Date(); // 学習終了時刻
    const duration = (endTime - startTime) / 1000; // 所要時間（秒）
    // スキップ時の所要時間の記録とログ
    console.log(`"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`);
    var resultElement2 = document.getElementById("result2");
    resultElement2.innerHTML = `"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`;
    getNextWord();
}

nextButton.addEventListener('click', getNextWord);
skipButton.addEventListener('click', skipWord);

displayWord(currentIndex);