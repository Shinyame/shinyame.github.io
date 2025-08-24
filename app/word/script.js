// 単語学習アプリのカード
const apps = [
  {
    id: "az900",
    title: "AZ-900 対策版",
    desc: "Microsoft Azure 基礎資格（AZ-900）に出やすい用語をまとめた学習アプリ。",
    link: "../az900/index.html"
  },
  {
    id: "universal",
    title: "汎用版",
    desc: "自分で用意した単語データを使って幅広く学習できる版。",
    link: "../universal/index.html"
  }
];

// AIサービスのカード
const ais = [
  {
    id: "chatgpt",
    title: "ChatGPT (OpenAI)",
    desc: "最も有名な生成AI。対話形式で学習用データを作成できます。",
    link: "https://chat.openai.com/"
  },
  {
    id: "gemini",
    title: "Gemini (Google)",
    desc: "Googleが提供する生成AI。クラウド学習との親和性も高いです。",
    link: "https://gemini.google.com/"
  },
  {
    id: "claude",
    title: "Claude (Anthropic)",
    desc: "シンプルで分かりやすい出力が得られる生成AI。",
    link: "https://claude.ai/"
  }
];

// カード生成関数
function createCard(item) {
  return `
    <div class="card ${item.id}">
      <h2>${item.title}</h2>
      <p>${item.desc}</p>
      <a href="${item.link}" target="_blank">▶ 使ってみる</a>
    </div>
  `;
}

// ページに反映
document.getElementById("app-grid").innerHTML = apps.map(createCard).join("");
document.getElementById("ai-grid").innerHTML = ais.map(createCard).join("");
