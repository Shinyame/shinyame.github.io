const words = [
    { word: 'frib', mean: '～を盗む（動詞）', translation: 'He may frib cookies from the jar.', example: '彼はジャーからクッキーを盗むかもしれない。', answered: false },
    { word: 'glorp', mean: '～を転がす（動詞）', translation: 'The kids like to glorp the ball.', example: '子供たちはボールを転がすのが好きだ。', answered: false },
    { word: 'smorble', mean: '～を動かす（動詞）', translation: 'The birds smorble their feathers elegantly.', example: '鳥たちは優雅に羽を動かす。', answered: false },
    { word: 'flindrocate', mean: '～を分割する（動詞）', translation: 'She always flindrocates the project into smaller tasks.', example: '彼女はいつもプロジェクトをより小さなタスクに分割する。', answered: false },
    { word: 'threnditize', mean: '～を固定する（動詞）', translation: 'He should threnditize the fence for the storm.', example: '彼は嵐に備えてフェンスを固定するべきだ。', answered: false },
    { word: 'cribble', mean: '鮮やかな（形容詞）', translation: 'The garden was full of cribble flowers.', example: '庭は鮮やかな花でいっぱいだった。', answered: false },
    { word: 'fleng', mean: '柔らかい（形容詞）', translation: 'The fleng pillow was surprisingly comfortable.', example: '柔らかい枕は驚くほど快適だった。', answered: false },
    { word: 'zibble', mean: '金色の（形容詞）', translation: 'Her zibble necklace caught everyone\'s attention.', example: '彼女の金色のネックレスがみんなの注目を集めた。', answered: false },
    { word: 'plonkical', mean: '勇敢な（形容詞）', translation: 'She displayed a plonkical attitude during the severe game.', example: '彼女は困難な試合中に勇敢な態度を示した。', answered: false },
    { word: 'blontish', mean: '変な（形容詞）', translation: 'She felt blontish after spinning around in circles.', example: '彼女はぐるぐる回った後、変な気持ちになった。', answered: false },
    { word: 'zlitz', mean: '紙片（名詞）', translation: 'She found a tiny zlitz on the desk.', example: '彼女は机の上に小さな紙片を見つけた。', answered: false },
    { word: 'flurp', mean: '服装（名詞）', translation: 'His flurp didn\'t match the formal event.', example: '彼の服装はフォーマルな集まりには合わなかった。', answered: false },
    { word: 'sprock', mean: '部品（名詞）', translation: 'He searched for the missing sprock in the machine.', example: '彼は機械の欠けている部品を探した。', answered: false },
    { word: 'flentish', mean: 'めまい（名詞）', translation: 'His sudden flentish caused the books to fall off the shelf.', example: '彼の突然のめまいが交通事故を引き起こした。', answered: false },
    { word: 'sprotune', mean: 'リズム（名詞）', translation: 'The new song had a catchy sprotune.', example: '新曲は人を引き付けるリズムを持っていた。', answered: false },
    { word: '終了処理', translation: '「スキップ」を押してください。全問回答済み以外は、スキップした問題が表示されます。表示されない場合は、「覚えた！」を押した上で再度「もう一度学習する（スキップ）」を押すと「全問回答済みです。」が表示されます。', example: '', answered: false },
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
