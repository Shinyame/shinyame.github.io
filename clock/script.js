let clock = document.getElementById('clock');
let isBlackWhite = false;

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;
}

function toggleBlackWhite() {
  if (isBlackWhite) {
    clock.classList.remove('black-white');
  } else {
    clock.classList.add('black-white');
  }
  isBlackWhite = !isBlackWhite;
}

clock.addEventListener('click', toggleBlackWhite);
setInterval(updateTime, 1000);
