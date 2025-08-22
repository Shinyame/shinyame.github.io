const steps = [
  {
    title: "STEP1: 学びたい分野を見つけよう",
    desc: "クラウド基礎、データベース、AI/機械学習、セキュリティ、ネットワークなど、自分の興味を見つけましょう。",
    link: "https://www.oracle.com/jp/cloud/"
  },
  {
    title: "STEP2: 学習の場を探そう",
    desc: "Oracle University（OCIトレーニング）、書籍、OCI公式ドキュメントなどから自分に合った方法を選びましょう。",
    link: "https://education.oracle.com/ja/oracle-cloud-infrastructure-training/"
  },
  {
    title: "STEP3: 認定試験のしくみを知ろう",
    desc: "Oracle Cloud Infrastructure Foundations など基礎資格の概要を確認し、出題範囲を把握しましょう。",
    link: "https://education.oracle.com/ja/certification/oracle-cloud-infrastructure"
  },
  {
    title: "STEP4: 学習と演習を進めよう",
    desc: "OCI無料利用枠を利用し、データベース作成やコンピュートリソースの操作を体験しましょう。",
    link: "https://www.oracle.com/jp/cloud/free/"
  },
  {
    title: "STEP5: 目標資格やスキルを決めよう",
    desc: "OCI認定資格取得を目標にする、業務での活用、データベースやAIなど専門分野へ進むなど、自分のゴールを設定しましょう。",
    link: "https://education.oracle.com/ja/oracle-certification-path"
  }
];

const container = document.getElementById("steps");
const doneSteps = JSON.parse(localStorage.getItem("doneStepsOCI") || "[]");

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
    localStorage.setItem("doneStepsOCI", JSON.stringify(doneSteps));
  });

  card.appendChild(h2);
  card.appendChild(p);
  card.appendChild(a);
  card.appendChild(button);
  container.appendChild(card);
});
