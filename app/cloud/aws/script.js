const steps = [
  {
    title: "STEP1: 学びたい分野を見つけよう",
    desc: "クラウド基礎、セキュリティ、AI、データベース、ネットワークなど、自分の興味を見つけましょう。",
    link: "https://aws.amazon.com/jp/training/"
  },
  {
    title: "STEP2: 学習の場を探そう",
    desc: "AWS Skill BuilderやUdemy、書籍、AWS公式イベントなどから自分に合った学習方法を選びましょう。",
    link: "https://explore.skillbuilder.aws/learn"
  },
  {
    title: "STEP3: 認定試験のしくみを知ろう",
    desc: "AWS Certified Cloud Practitioner (CLF-C02) など基礎資格の概要を確認し、試験範囲を把握しましょう。",
    link: "https://aws.amazon.com/jp/certification/certified-cloud-practitioner/"
  },
  {
    title: "STEP4: 学習と演習を進めよう",
    desc: "模擬試験を受けたり、AWS無料利用枠を使って実際に操作を試してみましょう。",
    link: "https://aws.amazon.com/jp/free/"
  },
  {
    title: "STEP5: 目標資格やスキルを決めよう",
    desc: "AWS認定取得を目標にする、業務で活用する、専門資格へ挑戦するなど、自分のゴールを設定しましょう。",
    link: "https://aws.amazon.com/jp/certification/"
  }
];

const container = document.getElementById("steps");
const doneSteps = JSON.parse(localStorage.getItem("doneStepsAWS") || "[]");

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
    localStorage.setItem("doneStepsAWS", JSON.stringify(doneSteps));
  });

  card.appendChild(h2);
  card.appendChild(p);
  card.appendChild(a);
  card.appendChild(button);
  container.appendChild(card);
});
