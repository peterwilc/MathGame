const modeSelect = document.getElementById("modeSelect");
const questionCountInput = document.getElementById("questionCount");
const startBtn = document.getElementById("startBtn");
const problemText = document.getElementById("problemText");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitBtn");
const answerForm = document.getElementById("answerForm");
const progressText = document.getElementById("progress");
const scoreText = document.getElementById("score");
const streakText = document.getElementById("streak");
const feedback = document.getElementById("feedback");
const rewardDialog = document.getElementById("rewardDialog");
const rewardTitle = document.getElementById("rewardTitle");
const rewardMessage = document.getElementById("rewardMessage");
const rewardVisual = document.getElementById("rewardVisual");
const playAgainBtn = document.getElementById("playAgainBtn");

let state = {
  total: 0,
  currentIndex: 0,
  score: 0,
  streak: 0,
  currentProblem: null,
};

const rewards = [
  { title: "🎉 Tiny Victory Dance", visual: "🕺💃", message: "You unlocked Dance Mode. Wiggle break for 20 seconds!" },
  { title: "🧠 Brain Buff +10", visual: "🧠✨", message: "Your math brain just leveled up. Legendary focus unlocked!" },
  { title: "🐱 Meme Drop", visual: "😼📚", message: "When you solve math faster than the calculator's feelings can process." },
  { title: "🏆 Gold Star Storm", visual: "⭐🌟⭐", message: "Teacher energy: 100%. Keep going, champion!" },
];

startBtn.addEventListener("click", startRound);
answerForm.addEventListener("submit", submitAnswer);
playAgainBtn.addEventListener("click", () => {
  rewardDialog.close();
  startRound();
});

function startRound() {
  const total = Number(questionCountInput.value);
  state = {
    total,
    currentIndex: 0,
    score: 0,
    streak: 0,
    currentProblem: null,
  };

  answerInput.disabled = false;
  submitBtn.disabled = false;
  feedback.textContent = "";
  updateHud();
  nextProblem();
}

function nextProblem() {
  if (state.currentIndex >= state.total) {
    finishRound();
    return;
  }

  state.currentProblem = buildProblem(modeSelect.value);
  problemText.textContent = state.currentProblem.text;
  answerInput.value = "";
  answerInput.focus();
  updateHud();
}

function submitAnswer(event) {
  event.preventDefault();
  if (!state.currentProblem) {
    return;
  }

  const raw = answerInput.value.trim();
  if (raw === "") {
    feedback.textContent = "Type an answer first 🙂";
    feedback.className = "bad";
    return;
  }

  const expected = String(state.currentProblem.answer);
  const normalized = raw.replace(/\s+/g, "");

  if (normalized === expected) {
    state.score += 1;
    state.streak += 1;
    feedback.textContent = "Nice! ✅";
    feedback.className = "good";
    state.currentIndex += 1;
    setTimeout(nextProblem, 350);
  } else {
    state.streak = 0;
    feedback.textContent = `Not yet. Try again! Hint: ${state.currentProblem.hint}`;
    feedback.className = "bad";
  }

  updateHud();
}

function finishRound() {
  problemText.textContent = "Round complete!";
  answerInput.disabled = true;
  submitBtn.disabled = true;

  const percent = Math.round((state.score / state.total) * 100);
  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  rewardTitle.textContent = reward.title;
  rewardVisual.textContent = reward.visual;
  rewardMessage.textContent = `You got ${state.score}/${state.total} (${percent}%). ${reward.message}`;
  rewardDialog.showModal();
}

function updateHud() {
  progressText.textContent = `Progress: ${state.currentIndex}/${state.total}`;
  scoreText.textContent = `Score: ${state.score}`;
  streakText.textContent = `Streak: ${state.streak} 🔥`;
}

function buildProblem(mode) {
  switch (mode) {
    case "add": {
      const a = rand(2, 50);
      const b = rand(2, 50);
      return { text: `${a} + ${b} = ?`, answer: a + b, hint: `Add ${a} and ${b}` };
    }
    case "subtract": {
      const a = rand(10, 90);
      const b = rand(2, a - 1);
      return { text: `${a} - ${b} = ?`, answer: a - b, hint: `Count backward from ${a}` };
    }
    case "multiply": {
      const a = rand(2, 12);
      const b = rand(2, 12);
      return { text: `${a} × ${b} = ?`, answer: a * b, hint: `${a} groups of ${b}` };
    }
    case "divide": {
      const divisor = rand(2, 12);
      const answer = rand(2, 12);
      const dividend = divisor * answer;
      return { text: `${dividend} ÷ ${divisor} = ?`, answer, hint: `What times ${divisor} gives ${dividend}?` };
    }
    case "fractionAdd": {
      const denominator = rand(2, 10);
      const n1 = rand(1, denominator - 1);
      const n2 = rand(1, denominator - 1);
      const sum = n1 + n2;
      const g = gcd(sum, denominator);
      const simpNum = sum / g;
      const simpDen = denominator / g;
      return {
        text: `${n1}/${denominator} + ${n2}/${denominator} = ? (format: a/b)`,
        answer: `${simpNum}/${simpDen}`,
        hint: `Add the top numbers: ${n1} + ${n2}`,
      };
    }
    default:
      return { text: "2 + 2 = ?", answer: 4, hint: "It's 4" };
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
