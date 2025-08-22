const steps = [
  {
    title: "STEP1: 学びたい分野を見つけよう",
    desc: "クラウド基礎、データ分析、AI/ML、セキュリティなど、自分の興味を見つけましょう。",
    link: "https://cloud.google.com/training?hl=ja"
  },
  {
    title: "STEP2: 学習の場を探そう",
    desc: "Google Cloud Skills Boost（旧Qwiklabs）、YouTube公式チャンネル、書籍などから学びを始めましょう。",
    link: "https://www.cloudskillsboost.google/"
  },
  {
    title: "STEP3: 認定試験のしくみを知ろう",
    desc: "Associate Cloud Engineerなど基礎資格の概要を確認し、出題範囲を理解しましょう。",
    link: "https://cloud.google.com/certification/cloud-engineer?hl=ja"
  },
  {
    title: "STEP4: 学習と演習を進めよう",
    desc: "Qwiklabsを利用したハンズオンや、Google Cloud無料利用枠を活用して実際に操作を体験しましょう。",
    link: "https://cloud.google.com/free?hl=ja"
  },
  {
    title: "STEP5: 目標資格やスキルを決めよう",
    desc: "Google Cloud認定資格取得、業務での活用、データやAIなど専門分野へ進むなど、自分のゴールを設定しましょう。",
    link: "https://cloud.google.com/certification?hl=ja"
  }
];

const container = document.getElementById("steps");
const doneSteps = JSON.parse(localStorage.getItem("doneStepsGCP") || "[]");

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
    localStorage.setItem("doneStepsGCP", JSON.stringify(doneSteps));
  });

  card.appendChild(h2);
  card.appendChild(p);
  card.appendChild(a);
  card.appendChild(button);
  container.appendChild(card);
});
