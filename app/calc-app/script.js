// --- 既存のコードの下に以下を追記 ---

// PWA: Service Workerの登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorkerが登録されました:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorkerの登録に失敗しました:', error);
            });
    });
}