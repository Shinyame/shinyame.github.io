// contents
const words = [
    ("Azure ポリシー", "Azure リソースの管理とコンプライアンスを強化するためのツール", "ポリシーを使用すると、リソースの作成や構成に関するルールを定義し、セキュリティやガバナンスの観点から適用できます。"),
    ("リソースグループ", "Azureでリソースをまとめて管理するためのコンテナ", "リソースグループにより、仮想マシンやストレージなどの関連リソースを一元管理できます。"),
    ("仮想マシン (VM)", "クラウド上で稼働するコンピュータ環境", "AzureではWindowsやLinuxの仮想マシンを簡単に作成して運用できます。"),
    ("Azure Storage", "クラウド上でスケーラブルなデータ保存が可能なサービス", "BLOBやファイルストレージなど、様々なストレージ形式に対応しています。"),
    ("仮想ネットワーク (VNet)", "Azure内でのリソース同士の安全な通信を実現する仮想ネットワーク", "VNetにより、クラウド内リソース間でプライベートに通信することができます。"),
    ("可用性ゾーン", "データセンター障害に備えた冗長性の高い構成", "アプリを異なる可用性ゾーンにデプロイすることで、高可用性を実現します。"),
    ("Azure AD (Entra ID)", "IDとアクセス管理を提供するサービス", "Azure ADを使用して、ユーザー認証やSSO、多要素認証が実現できます。"),
    ("スケーリング", "システムの処理能力を自動で拡大・縮小する仕組み", "トラフィックの増加に応じて、リソースの自動スケーリングが行われます。"),
    ("料金計算ツール", "Azureサービス利用前にコストを試算できるWebツール", "事前にサービス構成を選んでコストを見積もることができます。"),
    ("SLA", "Microsoftが提供するサービス稼働保証", "SLAにより、稼働率の目標（例:99.9%）が提示され、信頼性を保証します。"),
    ("Azure Portal", "Azureを操作するためのWebベースのGUIツール", "Azure Portalからすべてのサービスを視覚的に操作できます。"),
    ("CLI", "コマンドラインベースでAzureを管理するツール", "Azure CLIはスクリプトや自動化に適しており、DevOpsに活用できます。"),
    ("ARM テンプレート", "Azureリソースのデプロイを自動化するJSON形式の構成ファイル", "テンプレートを使うことで、インフラのコード化が可能になります。"),
    ("Azure Functions", "サーバーレスで関数単位のコードを実行できるサービス", "イベント駆動型アプリに適しており、インフラ管理が不要です。"),
    ("Logic Apps", "ビジュアルにワークフローを構築する自動化サービス", "メール通知やファイル転送などの業務プロセスを自動化できます。"),
    ("App Service", "WebアプリをホスティングするPaaS型サービス", "App Serviceを使うと、スケーラブルなWebアプリを迅速に構築可能です。"),
    ("Azure Cosmos DB", "グローバル分散型のNoSQLデータベース", "高速でスケーラブルなアプリに最適なデータベースです。"),
    ("Azure SQL Database", "マネージドなリレーショナルデータベースサービス", "自動バックアップやパッチ適用などを含むPaaS型のSQLサービスです。"),
    ("パブリッククラウド", "一般に提供されるクラウドコンピューティング環境", "インターネット経由で誰でも利用可能なクラウドサービスです。"),
    ("プライベートクラウド", "企業内で利用される専用クラウド環境", "セキュリティやコンプライアンスを重視する業種に適しています。"),
    ("ハイブリッドクラウド", "オンプレミスとクラウドを組み合わせた環境", "一部のサービスをクラウド化しつつ、社内資産も活用できます。"),
    ("Azure Monitor", "リソースの監視と可視化を行うサービス", "メトリクスやログの収集・分析が可能で、障害予兆の検知にも使われます。"),
    ("Azure Advisor", "ベストプラクティスに基づいた改善提案を提供", "コスト削減やセキュリティ向上の推奨を自動で表示してくれます。"),
    ("タグ", "リソースにメタ情報を付与する仕組み", "部署や用途などの情報をタグとして追加できます。"),
    ("課金レポート", "利用料金やコスト分析のためのレポート", "日別やサービス別のコストを視覚的に確認できます。"),
    ("Azure Marketplace", "サードパーティ製アプリやサービスの提供マーケット", "Marketplaceを使えば、事前構成済みのソリューションを簡単に導入できます。"),
    ("Azure DevOps", "開発・運用プロセスを支援する統合サービス群", "リポジトリ、CI/CD、テスト管理などが一体化されています。"),
    ("リザーブドインスタンス", "長期利用前提で割安に利用できる仮想マシン", "1年または3年契約でコストを大幅に削減できます。"),
    ("Azure Blueprints", "ポリシーやARMテンプレートなどをまとめてデプロイできる枠組み", "ガバナンスと一貫性を保ちながら環境構築が可能です。"),
    ("Azure Bastion", "RDPやSSHをブラウザ経由で安全に提供するサービス", "パブリックIPを使わずに仮想マシンへアクセスできます。")
];

// random
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
