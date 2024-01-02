function updateTime(timezone, elementId, city, tz) {
    const time = new Date().toLocaleString('en-US', { timeZone: timezone });
    document.getElementById(elementId).innerHTML = `
        <p>${city} (${tz})</p>
        <p>${time}</p>`;
}

function updateSelectedCountryTime() {
    const selectedCountry = document.getElementById('country').value;
    updateTime(selectedCountry, 'selected-country-box', 'Selected Country', selectedCountry);
}

// 初回実行
updateTime('UTC', 'utc-box', 'Universal Time Coordinated', 'UTC');
updateTime('Asia/Tokyo', 'jst-box', 'Japan Standard Time', 'JST');
updateTime('America/Los_Angeles', 'pst-box', 'Pacific Standard Time', 'PST');
updateTime('Australia/Sydney', 'aest-box', 'Australian Eastern Standard Time', 'AEST');
updateSelectedCountryTime();

// 1分ごとに更新
setInterval(() => {
    updateTime('UTC', 'utc-box', 'Coordinated Universal Time', 'UTC');
    updateTime('Asia/Tokyo', 'jst-box', 'Japan Standard Time', 'JST');
    updateTime('America/Los_Angeles', 'pst-box', 'Pacific Standard Time', 'PST');
    updateTime('Australia/Sydney', 'aest-box', 'Australian Eastern Standard Time', 'AEST');
    updateSelectedCountryTime();
}, 60000);
