const words = [
    { word: 'maw', translation: '(何かを)迅速に食べる', example: 'He mawed his lunch as if he hadnt eaten in days. 彼はまるで数日食べていなかったかのように、昼食を素早く食べた。', answered: false },
    { word: 'manlge', translation: '小さな高音の音を立てる', example: 'The teapot began to manlge when the water boiled. ティーポットが沸騰した時小さな高い音がなり始めた。', answered: false },
    { word: 'gelate', translation: 'ジェル状に変える', example: 'She attempted to gelate the liquid for a unique science experiment. 彼女は独自の科学実験のために液体をジェル状に変えようと試みた。', answered: false },
    { word: 'tanage', translation: '（何かを風変わりな色や模様で）装飾する', example: 'The artist decided to tanage the sculpture with bright color. その芸術家は彫刻に鮮やかな色で装飾することに決めた。', answered: false },
    { word: 'florblex', translation: '(何かを)踏み潰すこと', example: 'She accidentally florblexed the cake she had just baked. 彼女は焼いたばかりのケーキを偶然にも踏み潰した。', answered: false },
    { word: 'zinjulate', translation: '（何かを）激しく揺さぶること', example: 'The earthquake zinjulated the entire city last night. 昨夜、地震は町中を激しく揺さぶった。', answered: false },
    { word: 'perslverate', translation: '（何かを）繰り返し考える', example: 'She had a tendency to perslverate her past mistakes. 彼女は過去の過ちを繰り返し考える傾向があった。', answered: false },
    { word: 'rukm', translation: '（何かを）急激に切り裂く', example: 'The thunderstorm rukmed the peace of the night. 雷雨が夜の平穏さを急激に切り裂いた。', answered: false },
    { word: 'weal', translation: '誇りや繁栄などを感じる', example: 'Their accomplishments made them weal pride. 彼らの成就は誇りを感じさせた。', answered: false },
    { word: 'ren', translation: '何かを突き刺す', example: 'The warrior renned his enemy with a swift thrust. 戦士は素早い突きで敵を突き刺した。', answered: false },
    { word: '終了処理', translation: '「スキップ」を押してください', example: '全問回答済み以外は、スキップした問題が表示されます。表示されない場合は、「次へ」を押した上で再度「スキップ」を押すと「全問回答済みです。」が表示されます。', answered: false },
];

let currentIndex = 0;
let startTime; // 学習開始時刻
let timeLimit = 150; // 制限時間（秒）

const wordElement = document.getElementById('word');
const translationElement = document.getElementById('translation');
const exampleElement = document.getElementById('example');
const nextButton = document.getElementById('next-button');
const skipButton = document.getElementById('skip-button');
const clearScreen = document.getElementById('clear-screen');
const timerDisplay = document.getElementById('timer-display');

let countdownTimer;

function displayWord(index) {
    wordElement.textContent = words[index].word;
    translationElement.textContent = '訳: ' + words[index].translation;
    exampleElement.textContent = '例文: ' + words[index].example;
    startTime = new Date(); // 学習開始時刻を記録

    // タイマーの表示を更新
    updateTimerDisplay();

    // タイマーを開始
    countdownTimer = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const remainingTime = timeLimit - elapsedSeconds;

    if (remainingTime <= 0) {
        // 制限時間切れの場合、クリア画面に遷移
        clearInterval(countdownTimer);
        clearScreen.style.display = 'block';
    } else {
        // タイマーを表示
        timerDisplay.textContent = `各単語の制限時間: ${remainingTime}秒`;
    }
}

function getNextWord() {
    if (currentIndex < words.length) {
        const endTime = new Date(); // 学習終了時刻
        const duration = (endTime - startTime) / 1000; // 所要時間（秒）

        // 単語の学習所要時間をログに記録
        console.log(`"${words[currentIndex].word}" の学習所要時間: ${duration}秒`);
        var resultElement1 = document.getElementById("result1");
        resultElement1.innerHTML = `"${words[currentIndex].word}" の学習所要時間: ${duration}秒`;

        // answered フラグを設定
        words[currentIndex].answered = true;

        clearInterval(countdownTimer);

        if (words[currentIndex].word != '終了処理' && words[currentIndex].answered) {
            // クリア画面に遷移する条件を追加
            currentIndex = getNextUnansweredWordIndex(currentIndex);

            if (currentIndex !== null) {
                displayWord(currentIndex);
            } else {
                // 未回答の単語がない場合、クリア画面を表示
                clearScreen.style.display = 'block';
            }
        }
    }
}


function skipWord() {
    const endTime = new Date(); // 学習終了時刻
    const duration = (endTime - startTime) / 1000; // 所要時間（秒）
    console.log(`"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`);
    var resultElement2 = document.getElementById("result2");
    resultElement2.innerHTML = `"${words[currentIndex].word}" のスキップ所要時間: ${duration}秒`;
    if (currentIndex < words.length) {
        // 次の未回答の単語を検索
        currentIndex = getNextUnansweredWordIndex(currentIndex);

        if (currentIndex !== null) {
            displayWord(currentIndex);
        } else {
            // 未回答の単語がない場合、最初の未回答単語に戻る
            currentIndex = getNextUnansweredWordIndex(-1);
            if (currentIndex !== null) {
                displayWord(currentIndex);
            } else {
                // 未回答の単語がない場合、クリア画面を表示
                clearScreen.style.display = 'block';
            }
        }
    }
}

function getNextUnansweredWordIndex(startIndex) {
    for (let i = startIndex + 1; i < words.length; i++) {
        if (!words[i].answered) {
            return i;
        }
    }
    return null; // 未回答の単語がない場合は null を返す
}

nextButton.addEventListener('click', getNextWord);
skipButton.addEventListener('click', skipWord);

displayWord(currentIndex);

const resetAnsweredButton = document.getElementById('reset-answered-button');

resetAnsweredButton.addEventListener('click', resetAnswered);

function resetAnswered() {

}

// 最初の単語を表示
currentIndex = getNextUnansweredWordIndex(-1);
if (currentIndex !== null) {
    displayWord(currentIndex);
}
