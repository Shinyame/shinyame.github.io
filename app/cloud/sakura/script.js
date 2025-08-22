const steps = [
  {
    title: "STEP1: 学びたい分野を見つけよう",
    desc: "IaaS、ネットワーク構築、サーバー運用、自動化など、自分が重点を置きたい分野を選びましょう。",
    link: "https://cloud.sakura.ad.jp/specification/"
  },
  {
    title: "STEP2: 学習の場を探そう",
    desc: "さくらのクラウド公式ドキュメント、コミュニティ記事、さくらインターネット研究所の情報を活用して学びましょう。",
    link: "https://manual.sakura.ad.jp/cloud/"
  },
  {
    title: "STEP3: サービスと仕組みを知ろう",
    desc: "仮想サーバー、スイッチ、ルータ、ストレージなど、さくらのクラウドで利用できる基本サービスを理解しましょう。",
    link: "https://cloud.sakura.ad.jp/"
  },
  {
    title: "STEP4: 学習と演習を進めよう",
    desc: "無料トライアルやテスト環境を利用して、VM作成・ネットワーク設定・オートスケールの実践をしてみましょう。",
    link: "https://cloud.sakura.ad.jp/startup/"
  },
  {
    title: "STEP5: 目標スキルを決めよう",
    desc: "サーバー運用自動化、オンプレ連携、マルチクラウド利用など、自分のスキルアップの方向性を設定しましょう。",
    link: "https://cloud.sakura.ad.jp/service/"
  }
];

const container = document.getElementById("steps");
const doneSteps = JSON.parse(localStorage.getItem("doneStepsSAKURA") || "[]");

steps.forEach((step, index) => {
  const card = document.createElement("div");
  card.className = "step-card";

  const h2 = document.createElement("h2");
  h2.textContent = step.title;

  const p = document.createElement("p");
  p.textContent = step.desc;

  const a = document.createElement("a");
  a.href = step.link;
  a.textContent = "▶ 詳細を見る";
  a.target = "_blank";

  const button = document.createElement("button");
  button.textContent = doneSteps.includes(index) ? "✔ 完了済み" : "完了にする";
  if (doneSteps.includes(index)) button.classList.add("done");

  button.addEventListener("click", () => {
    if (doneSteps.includes(index)) {
      const i = doneSteps.indexOf(index);
      doneSteps.splice(i, 1);
      button.textContent = "完了にする";
      button.classList.remove("done");
    } else {
      doneSteps.push(index);
      button.textContent = "✔ 完了済み";
      button.classList.add("done");
    }
    localStorage.setItem("doneStepsSAKURA", JSON.stringify(doneSteps));
  });

  card.appendChild(h2);
  card.appendChild(p);
  card.appendChild(a);
  card.appendChild(button);
  container.appendChild(card);
});
