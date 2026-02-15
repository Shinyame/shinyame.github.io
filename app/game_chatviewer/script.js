const fileInput = document.getElementById('fileInput');
const fileDateCard = document.getElementById('fileDateCard');
const searchBox = document.getElementById('searchBox');
const themeToggle = document.getElementById('themeToggle');

const chatWindow = document.getElementById('chatWindow');
const currentChannelLabel = document.getElementById('currentChannel');
const channelCountsDiv = document.getElementById('channelCounts');
const activeFilterDiv = document.getElementById('activeFilter');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const channels = ["ALL", "PUBLIC", "GUILD", "PARTY", "OTHER"];
let currentChannelIndex = 0;

let allMessages = [];
let nameFilter = null;
let countsCache = {};

/* ===== ファイル読込 ===== */

fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        const file = this.files[0];
        displayFileDate(file.name);
        readFile(file);
    }
});

function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => parseLog(e.target.result);
    reader.readAsText(file, 'utf-8');
}

/* ===== 日付カード表示 ===== */

function displayFileDate(filename) {
    const match = filename.match(/\d{8}/);

    if (!match) {
        fileDateCard.classList.add("hidden");
        return;
    }

    const dateStr = match[0];

    const year = parseInt(dateStr.substring(0,4));
    const month = parseInt(dateStr.substring(4,6)) - 1;
    const day = parseInt(dateStr.substring(6,8));

    const dateObj = new Date(year, month, day);
    const weekdays = ["日","月","火","水","木","金","土"];
    const weekday = weekdays[dateObj.getDay()];

    fileDateCard.innerHTML = `
        <span class="icon">📅</span>
        <span>${year}年${month+1}月${day}日（${weekday}）</span>
    `;

    fileDateCard.classList.remove("hidden");
}


function parseLog(text) {
    allMessages = [];
    const lines = text.split("\n");

    lines.forEach(line => {
        if (!line.trim()) return;

        const parts = line.split("\t");

        let type = "OTHER";
        let timestamp = "";
        let name = "";
        let message = line;

        if (parts.length >= 6) {
            timestamp = parts[0];
            const channel = parts[2];
            name = parts[4];
            message = parts.slice(5).join(" ");

            if (channel === "PUBLIC") type = "PUBLIC";
            else if (channel === "GUILD") type = "GUILD";
            else if (channel === "PARTY") type = "PARTY";
        }

        allMessages.push({type, timestamp, name, message});
    });

    updateCounts();
    renderMessages();
}

function updateCounts() {
    countsCache = {
        ALL: allMessages.length,
        PUBLIC: 0,
        GUILD: 0,
        PARTY: 0,
        OTHER: 0
    };

    allMessages.forEach(msg => countsCache[msg.type]++);

    channelCountsDiv.innerHTML =
        `ALL:${countsCache.ALL} | PUBLIC:${countsCache.PUBLIC} | GUILD:${countsCache.GUILD} | PARTY:${countsCache.PARTY} | OTHER:${countsCache.OTHER}`;

    updateChannelLabel();
}

function renderMessages() {
    chatWindow.innerHTML = "";
    const selectedChannel = channels[currentChannelIndex];
    const searchText = searchBox.value.toLowerCase();

    allMessages.forEach(msg => {
        if (selectedChannel !== "ALL" && msg.type !== selectedChannel) return;
        if (nameFilter && msg.name !== nameFilter) return;

        const combined = (msg.name + " " + msg.message).toLowerCase();
        if (searchText && !combined.includes(searchText)) return;

        const div = document.createElement("div");
        div.classList.add("message", msg.type);

        const timeText = msg.timestamp ? msg.timestamp.substring(11,19) : "";

        div.innerHTML = `
            <span class="time">${timeText}</span>
            <span class="name">${msg.name}</span>
            <span>${msg.message}</span>
        `;

        div.querySelector(".name").addEventListener("click", () => {
            nameFilter = (nameFilter === msg.name) ? null : msg.name;
            updateActiveFilter();
            renderMessages();
        });

        chatWindow.appendChild(div);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

prevBtn.onclick = () => {
    currentChannelIndex = (currentChannelIndex - 1 + channels.length) % channels.length;
    updateChannelLabel();
    renderMessages();
};

nextBtn.onclick = () => {
    currentChannelIndex = (currentChannelIndex + 1) % channels.length;
    updateChannelLabel();
    renderMessages();
};

function updateChannelLabel() {
    const ch = channels[currentChannelIndex];
    const count = countsCache[ch] ?? 0;
    currentChannelLabel.textContent = `${ch} (${count})`;
}

searchBox.addEventListener("input", renderMessages);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
});

function updateActiveFilter() {
    activeFilterDiv.textContent = nameFilter ? `名前フィルタ: ${nameFilter}` : "";
}
