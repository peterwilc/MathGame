const questionCountInput = document.getElementById("questionCount");
const startBtn = document.getElementById("startBtn");
const problemText = document.getElementById("problemText");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitBtn");
const answerForm = document.getElementById("answerForm");
const progressText = document.getElementById("progress");
const scoreText = document.getElementById("score");
const streakText = document.getElementById("streak");
const timerText = document.getElementById("timer");
const feedback = document.getElementById("feedback");
const rewardDialog = document.getElementById("rewardDialog");
const rewardTitle = document.getElementById("rewardTitle");
const rewardMessage = document.getElementById("rewardMessage");
const rewardVisual = document.getElementById("rewardVisual");
const playAgainBtn = document.getElementById("playAgainBtn");

const allowedTables = [3, 4, 5, 6, 7, 8, 9, 12];
const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ANSWER_TIME_LIMIT_MS = 8000;

let factStats = new Map();
let state = {
  total: 0,
  currentIndex: 0,
  score: 0,
  streak: 0,
  currentProblem: null,
  timerId: null,
  questionStartedAt: 0,
};

const rewards = [
  {
    minScore: 95,
    title: "👑 Master of Multiplication",
    visual: "🐉⚔️",
    message: "Legend rank unlocked: Dragon Defender mini-story. You saved the kingdom with pure times-table speed!",
  },
  {
    minScore: 80,
    title: "🎮 Bonus Round",
    visual: "🚀🛸",
    message: "You unlocked Space Dash: do 10 jumping jacks before your feet touch an asteroid!",
  },
  {
    minScore: 60,
    title: "😂 Meme Reward",
    visual: "😎📈",
    message: "Meme unlocked: 'When you answer 7×8 before your teacher finishes asking...'",
  },
  {
    minScore: 0,
    title: "💪 Training Complete",
    visual: "🌱🧠",
    message: "Good grind! Every round builds your memory. Come back for another power-up run.",
  },
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
    timerId: null,
    questionStartedAt: 0,
  };

  if (factStats.size === 0) {
    seedFactStats();
  }

  answerInput.disabled = false;
  submitBtn.disabled = false;
  feedback.textContent = "";
  feedback.className = "";
  updateHud(ANSWER_TIME_LIMIT_MS);
  nextProblem();
}

function seedFactStats() {
  for (const table of allowedTables) {
    for (const multiplier of multipliers) {
      const key = buildFactKey(table, multiplier);
      factStats.set(key, {
        table,
        multiplier,
        shown: 0,
        correct: 0,
        wrong: 0,
        proficiency: 0,
      });
    }
  }
}

function nextProblem() {
  clearQuestionTimer();

  if (state.currentIndex >= state.total) {
    finishRound();
    return;
  }

  const fact = pickAdaptiveFact();
  fact.shown += 1;

  state.currentProblem = {
    key: buildFactKey(fact.table, fact.multiplier),
    text: `${fact.table} × ${fact.multiplier} = ?`,
    answer: fact.table * fact.multiplier,
    hint: `${fact.table} groups of ${fact.multiplier}`,
  };

  problemText.textContent = state.currentProblem.text;
  answerInput.value = "";
  answerInput.focus();
  state.questionStartedAt = performance.now();
  startQuestionTimer();
  updateHud(ANSWER_TIME_LIMIT_MS);
}

function startQuestionTimer() {
  const startTime = state.questionStartedAt;

  state.timerId = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, ANSWER_TIME_LIMIT_MS - elapsed);
    updateHud(remaining);

    if (remaining <= 0) {
      clearQuestionTimer();
      markAnswer(false, "⏰ Time's up! This fact will come back more often.");
      queueNextProblem();
    }
  }, 100);
}

function clearQuestionTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function submitAnswer(event) {
  event.preventDefault();
  if (!state.currentProblem) {
    return;
  }

  const raw = answerInput.value.trim();
  if (raw === "") {
    feedback.textContent = "Type a number first 🙂";
    feedback.className = "bad";
    return;
  }

  clearQuestionTimer();
  const expected = state.currentProblem.answer;
  const userAnswer = Number(raw);

  if (userAnswer === expected) {
    markAnswer(true, "Correct! ⚡");
  } else {
    markAnswer(false, `Not yet. ${state.currentProblem.text} ${expected}. Hint: ${state.currentProblem.hint}`);
  }

  queueNextProblem();
}

function markAnswer(isCorrect, message) {
  const fact = factStats.get(state.currentProblem.key);

  if (isCorrect) {
    state.score += 1;
    state.streak += 1;
    feedback.className = "good";
    fact.correct += 1;
    fact.proficiency = Math.min(6, fact.proficiency + 1);
  } else {
    state.streak = 0;
    feedback.className = "bad";
    fact.wrong += 1;
    fact.proficiency = Math.max(-4, fact.proficiency - 2);
  }

  feedback.textContent = message;
  state.currentIndex += 1;
  updateHud(0);
}

function queueNextProblem() {
  setTimeout(nextProblem, 500);
}

function pickAdaptiveFact() {
  const facts = Array.from(factStats.values());
  const weighted = facts.map((fact) => {
    const wrongPressure = 1 + fact.wrong * 1.6;
    const masteryRelief = Math.max(0.35, 1 - fact.correct * 0.08);
    const proficiencyPressure = Math.max(0.4, 1.3 - fact.proficiency * 0.18);
    const freshnessBoost = fact.shown === 0 ? 1.4 : 1;
    const weight = wrongPressure * masteryRelief * proficiencyPressure * freshnessBoost;
    return { fact, weight };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.fact;
    }
  }

  return weighted[weighted.length - 1].fact;
}

function finishRound() {
  clearQuestionTimer();
  problemText.textContent = "Round complete!";
  answerInput.disabled = true;
  submitBtn.disabled = true;

  const percent = Math.round((state.score / state.total) * 100);
  const reward = rewards.find((candidate) => percent >= candidate.minScore) || rewards[rewards.length - 1];

  rewardTitle.textContent = reward.title;
  rewardVisual.textContent = reward.visual;
  rewardMessage.textContent = `Score: ${state.score}/${state.total} (${percent}%). ${reward.message}`;
  rewardDialog.showModal();
}

function updateHud(remainingMs) {
  progressText.textContent = `Progress: ${state.currentIndex}/${state.total}`;
  scoreText.textContent = `Score: ${state.score}`;
  streakText.textContent = `Streak: ${state.streak} 🔥`;

  const seconds = (Math.max(0, remainingMs) / 1000).toFixed(1);
  timerText.textContent = `⏱️ Time left: ${seconds}s`;
}

function buildFactKey(table, multiplier) {
  return `${table}x${multiplier}`;
}
