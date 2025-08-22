const steps = [
  {
    title: "STEP1: 学びたい分野を見つけよう",
    desc: "クラウド基礎、セキュリティ、AI、データベースなど、自分の興味を探しましょう。",
    link: "https://learn.microsoft.com/ja-jp/training/"
  },
  {
    title: "STEP2: 学習の場を探そう",
    desc: "Microsoft LearnやUdemy、書籍、YouTubeなど、自分に合ったリソースを見つけましょう。",
    link: "https://learn.microsoft.com/ja-jp/certifications/"
  },
  {
    title: "STEP3: 試験や認定のしくみを知ろう",
    desc: "AZ-900やAI-900など基礎資格の内容や試験形式を確認しましょう。",
    link: "https://learn.microsoft.com/ja-jp/certifications/exams/az-900/"
  },
  {
    title: "STEP4: 学習と演習を進めよう",
    desc: "模擬試験やハンズオンを活用し、Azure無料枠で実際に操作を体験しましょう。",
    link: "https://azure.microsoft.com/ja-jp/free/"
  },
  {
    title: "STEP5: 目標資格やスキルを決めよう",
    desc: "AZ-900合格、業務で活用、次の資格へ進むなどゴールを決めましょう。",
    link: "https://learn.microsoft.com/ja-jp/certifications/"
  }
];

const container = document.getElementById("steps");
const doneSteps = JSON.parse(localStorage.getItem("doneSteps") || "[]");

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
    localStorage.setItem("doneSteps", JSON.stringify(doneSteps));
  });

  card.appendChild(h2);
  card.appendChild(p);
  card.appendChild(a);
  card.appendChild(button);
  container.appendChild(card);
});
