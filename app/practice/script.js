const words = [
   { word: 'りんご', mean: 'りんご（名詞）', translation: 'He likes apples.', example: '彼はりんごが好きだ。', answered: false },
   { word: '送る', mean: '～を送る（動詞）', translation: 'I can send my assignment by tomorrow.', example: '私は課題を明日までに送付できる。', answered: false },
   { word: '美しい', mean: '美しい（形容詞）', translation: 'She is a beautiful girl.', example: '彼女は美しい女の子だ。', answered: false },
   { word: '歌', mean: '歌（名詞）', translation: 'We sing a song every day.', example: '我々は毎日歌を歌う。', answered: false },
   { word: '見る', mean: '～を見る（動詞）', translation: 'You may watch TV here.', example: 'ここでテレビを見てもよい。', answered: false },
   { word: '揺らす', mean: '～を揺らす（動詞）', translation: 'My dog likes to sploot its tail when it\'s happy.', example: '私の犬は嬉しいときには尻尾を揺らす。', answered: false },
   { word: '押す', mean: '～を押す（動詞）', translation: 'He sponked the button to activate the machine.', example: '彼はボタンを押して機械を作動させた。', answered: false },
   { word: '明るい', mean: '明るい（形容詞）', translation: 'The room was full of the glimpsful lights.', example: '部屋は明るいライトで満ちていた。', answered: false },
   { word: '隙間', mean: '隙間（名詞）', translation: 'The twix in the fence allowed the cat run away.', example: 'フェンスの隙間が猫の脱走を許した。', answered: false },
   { word: '祝典', mean: '祝典（名詞）', translation: 'We had a gloritum to celebrate local traditions.', example: '地元の伝統を祝う祝典をおこなった。', answered: false },
   { word: '', mean: '',translation: '「もう一度学習する」をクリックしてください。「もう一度学習する」をクリックした単語が再度表示されます。表示されない場合は、「覚えた！」を押した上で、再度「もう一度学習する」を押して下さい。', example: '', answered: false },
];

let currentIndex = 0;
let startTime; // 学習開始時刻
let timeLimit = 150; // 制限時間（秒）
let logs = []; // ログデータ

const wordElement = document.getElementById('word');
const meanElement = document.getElementById('mean');
const translationElement = document.getElementById('translation');
const exampleElement = document.getElementById('example');
const nextButton = document.getElementById('next-button');
const skipButton = document.getElementById('skip-button');
const clearScreen = document.getElementById('clear-screen');
const timerDisplay = document.getElementById('timer-display');
const exportLogsButton = document.getElementById('export-logs'); // ログをエクスポートボタン

let countdownTimer;

function displayWord(index) {
    wordElement.textContent = words[index].word;
    meanElement.textContent = '意味: ' + words[index].mean;
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
        logs.push({ word: words[currentIndex].word, duration: duration, status: "next"  });
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
    logs.push({ word: words[currentIndex].word, duration: duration, status: "skip" });
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

// ログをエクスポートボタンのクリックイベントハンドラ
exportLogsButton.addEventListener('click', () => {
    exportLogsToCSV();
});

// ログデータをCSV形式に変換してダウンロード
function exportLogsToCSV() {
    if (logs.length === 0) {
        console.log("ログがありません。");
        return;
    }

    let csvContent = "Word,Duration (seconds),Status\n";
    for (let log of logs) {
        csvContent += `${log.word},${log.duration},${log.status}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_logs.csv';
    a.click();
}

const resetAnsweredButton = document.getElementById('reset-answered-button');

resetAnsweredButton.addEventListener('click', resetAnswered);

function resetAnswered() {

}

// 最初の単語を表示
currentIndex = getNextUnansweredWordIndex(-1);
if (currentIndex !== null) {
    displayWord(currentIndex);
}
