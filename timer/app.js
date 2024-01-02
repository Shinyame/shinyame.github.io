let countdownTimer;
let countdownSeconds = 0;
let isCountdownTimerRunning = false;

function startTimer() {
    const inputTime = parseInt(document.getElementById('countdown-input').value, 10);
    
    if (!isNaN(inputTime) && inputTime > 0 && !isCountdownTimerRunning) {
        countdownSeconds = inputTime;
        countdownTimer = setInterval(updateCountdownTimer, 1000);
        isCountdownTimerRunning = true;
    }
}

function pauseTimer() {
    clearInterval(countdownTimer);
    isCountdownTimerRunning = false;
}

function resetTimer() {
    clearInterval(countdownTimer);
    isCountdownTimerRunning = false;
    countdownSeconds = 0;
    updateCountdownTimerDisplay();
}

function playAlertSound() {
    const audio = new Audio('kitchen_timer.mp3'); // ここで音声ファイルのパスを指定
    audio.play();
}

function updateCountdownTimer() {
    if (countdownSeconds > 0) {
        countdownSeconds--;
        updateCountdownTimerDisplay();
    } else {
        clearInterval(countdownTimer);
        isCountdownTimerRunning = false;
        updateCountdownTimerDisplay();
        playAlertSound();
    }
}

function updateCountdownTimerDisplay() {
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;

    let formattedTime;
    if (hours > 0) {
        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
        formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    document.getElementById('selected-country-time').textContent = formattedTime;
}
