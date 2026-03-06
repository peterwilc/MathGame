const difficultySelect = document.getElementById("difficultySelect");
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
  { title: "🧠 Brain Buff +10", visual: "🧠✨", message: "Your long-division brain just leveled up." },
  { title: "🐱 Meme Drop", visual: "😼📚", message: "Remainders fear you now." },
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

  state.currentProblem = buildLongDivisionProblem(difficultySelect.value);
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

  const normalized = normalizeAnswer(raw);
  const expected = normalizeAnswer(state.currentProblem.answer);

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

function buildLongDivisionProblem(difficulty) {
  const divisor = rand(2, 9);
  const ranges = {
    easy: { minQuotient: 4, maxQuotient: 18, maxRemainder: divisor - 1 },
    medium: { minQuotient: 10, maxQuotient: 55, maxRemainder: divisor - 1 },
    hard: { minQuotient: 20, maxQuotient: 120, maxRemainder: divisor - 1 },
  };

  const chosenRange = ranges[difficulty] || ranges.medium;
  const quotient = rand(chosenRange.minQuotient, chosenRange.maxQuotient);
  const remainder = rand(0, chosenRange.maxRemainder);
  const dividend = divisor * quotient + remainder;

  const answer = `${quotient} r ${remainder}`;

  return {
    text: `${dividend} ÷ ${divisor} = ?`,
    answer,
    hint: `${divisor} × ${quotient} = ${divisor * quotient}, so leftover is ${remainder}`,
  };
}

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/remainder/g, "r")
    .replace(/\s+/g, "")
    .replace(/,/g, "");
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
