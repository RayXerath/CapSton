/*
* 코딩 시작 전 - 최신 코드 불러오기
git pull origin master

작업 끝내고 저장할 때
git add .
git commit -m "기록 내용"
git push origin master
*/

const goalForm = document.querySelector("#goal-form");
const goalInput = document.querySelector("#goal-input");
const difficultySelect = document.querySelector("#difficulty-select");
const goalList = document.querySelector("#goal-list");

const petLevel = document.querySelector("#pet-level");
const petXp = document.querySelector("#pet-xp");
const stickerCount = document.querySelector("#sticker-count");

const successCount = document.querySelector("#success-count");
const failCount = document.querySelector("#fail-count");
const successRate = document.querySelector("#success-rate");
const resetBtn = document.querySelector("#reset-btn");

const moveLoginBtn = document.querySelector("#move-login-btn");
const moveSignupBtn = document.querySelector("#move-signup-btn");
const currentUserText = document.querySelector("#current-user");
const logoutBtn = document.querySelector("#logout-btn");

// 현재 로그인 한 사용자에 따라 나중에 불러오기
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let goals = [];
let records = [];
let xp = 0;
let level = 1;
let stickers = 0;

// 페이지가 처음 열릴 때 화면에 바로 반영
loadUserData();
renderGoals();
updatePetUI();
updateDashboard();
updateAuthHomeUI();
toggleAppByLogin();

// 이벤트 연결
resetBtn.addEventListener("click", resetAllData);

if (moveLoginBtn) {
  moveLoginBtn.addEventListener("click", function () {
    location.href = "login.html";
  });
}

if (moveSignupBtn) {
  moveSignupBtn.addEventListener("click", function () {
    location.href = "signup.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// 목표를 입력받는 곳
goalForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const goalText = goalInput.value.trim();
  const difficulty = Number(difficultySelect.value);

  if (goalText === "") {
    alert("목표를 입력하세요.");
    return;
  }

  const goal = {
    id: Date.now(),
    text: goalText,
    difficulty: difficulty,
  };

  goals.push(goal);

  saveGoals();
  renderGoals();

  goalInput.value = "";
  difficultySelect.value = "1";
});

// 오늘의 목표 보여주기
function renderGoals() {
  goalList.innerHTML = "";

  goals.forEach(function (goal) {
    const li = document.createElement("li");
    li.classList.add("goal-item");

    const today = getTodayDate();

    const todayRecord = records.find(function (record) {
      // 오늘 날자의 기록을 record에서 찾아라.
      return record.goalId === goal.id && record.date === today;
    });

    li.innerHTML = `
      <h3>${goal.text}</h3>
      <p>난이도: ${getDifficultyText(goal.difficulty)}</p>
      <div class="goal-actions">
        <button
          class="success-btn"
          onclick="completeGoal(${goal.id}, true)"
          ${todayRecord ? "disabled" : ""}
        >
          성공
        </button>

        <button
          class="fail-btn"
          onclick="completeGoal(${goal.id}, false)"
          ${todayRecord ? "disabled" : ""}
        >
          실패
        </button>

        <button onclick="editGoal(${goal.id})">수정</button>
        <button onclick="deleteGoal(${goal.id})">삭제</button>
      </div>
      <p>${todayRecord ? "오늘 체크 완료된 목표입니다." : ""}</p>
    `;

    goalList.appendChild(li);
  });
}

// 난이도 설정
function getDifficultyText(difficulty) {
  if (difficulty === 1) return "쉬움";
  if (difficulty === 2) return "보통";
  if (difficulty === 3) return "어려움";
  return "";
}

// 목표 성공 / 실패
function completeGoal(goalId, isSuccess) {
  const goal = goals.find(function (item) {
    return item.id === goalId;
  });

  if (!goal) return;

  const today = getTodayDate();

  const alreadyChecked = records.find(function (record) {
    return record.goalId === goalId && record.date === today;
  });

  if (alreadyChecked) {
    alert("이 목표는 오늘 이미 체크했습니다.");
    return;
  }

  const record = {
    // 기록 남기기
    goalId: goalId,
    result: isSuccess ? "success" : "fail",
    date: today,
  };

  records.push(record);
  saveRecords();

  if (isSuccess) {
    const earnedXp = goal.difficulty * 10;
    const earnedSticker = goal.difficulty;

    xp += earnedXp;
    stickers += earnedSticker;

    levelUpCheck();
    updatePetUI();
    savePetData();

    alert(`목표 성공! XP ${earnedXp}, 스티커 ${earnedSticker}개 획득!`);
  } else {
    alert("실패로 기록되었습니다.");
  }

  updateDashboard();
  renderGoals();
}

// 목표 삭제 버튼
function deleteGoal(goalId) {
  goals = goals.filter(function (goal) {
    return goal.id !== goalId;
  });

  saveGoals();
  renderGoals();
}

// 경험치 / 렙 설정
function levelUpCheck() {
  while (xp >= level * 30) {
    xp -= level * 30;
    level += 1;
  }
}

// 퀘스티 정보
function updatePetUI() {
  petLevel.textContent = level;
  petXp.textContent = xp;
  stickerCount.textContent = stickers;
}

// 목표 데이터 저장 ( 목표 추가 삭제 시 불러오기 )
function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

// 퀘스티 데이터 저장 ( 펫 UI가 바뀔 때 마다 불러오기 )
function savePetData() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("stickers", stickers);
}

// 대시보드
function updateDashboard() {
  const today = getTodayDate();

  const todayRecords = records.filter(function (record) {
    // 오늘 일자만 기록 남기기
    return record.date === today;
  });

  const successRecords = todayRecords.filter(function (record) {
    // 성공만 뽑기
    return record.result === "success";
  });

  const failRecords = todayRecords.filter(function (record) {
    // 실패만 뽑기
    return record.result === "fail";
  });

  const success = successRecords.length;
  const fail = failRecords.length;
  const total = success + fail;

  let rate = 0;

  if (total > 0) {
    rate = Math.round((success / total) * 100);
  }

  successCount.textContent = success;
  failCount.textContent = fail;
  successRate.textContent = `${rate}%`;
}

// 오늘 날자 만들기
function getTodayDate() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

// 배열을 문자열로 만들어서 저장
function saveRecords() {
  localStorage.setItem("records", JSON.stringify(records));
}

// 데이터 초기화 버튼
function resetAllData() {
  const isConfirmed = confirm("정말 모든 데이터를 초기화하시겠습니까?");

  if (!isConfirmed) return;

  goals = [];
  records = [];

  xp = 0;
  level = 1;
  stickers = 0;

  localStorage.removeItem("goals");
  localStorage.removeItem("records");
  localStorage.removeItem("xp");
  localStorage.removeItem("level");
  localStorage.removeItem("stickers");

  renderGoals();
  updatePetUI();
  updateDashboard();

  alert("모든 데이터가 초기화되었습니다.");
}

// 수정 버튼 기능
function editGoal(goalId) {
  const goal = goals.find(function (item) {
    return item.id === goalId;
  });

  if (!goal) return;

  const newText = prompt("수정할 목표 내용을 입력하세요.", goal.text);

  if (newText === null) return;

  const trimmedText = newText.trim();

  if (trimmedText === "") {
    alert("목표 내용은 비워둘 수 없습니다.");
    return;
  }

  const newDifficulty = prompt(
    "수정할 난이도를 입력하세요. (1: 쉬움, 2: 보통, 3: 어려움)",
    goal.difficulty,
  );

  if (newDifficulty === null) return;

  const difficultyNumber = Number(newDifficulty);

  if (
    difficultyNumber !== 1 &&
    difficultyNumber !== 2 &&
    difficultyNumber !== 3
  ) {
    alert("난이도는 1, 2, 3 중 하나만 입력해야 합니다.");
    return;
  }

  goal.text = trimmedText;
  goal.difficulty = difficultyNumber;

  saveGoals();
  renderGoals();

  alert("목표가 수정되었습니다.");
}

// 로그인 회원가입 버튼 작동
updateAuthHomeUI();

function updateAuthHomeUI() {
  if (currentUser) {
    currentUserText.textContent = currentUser.username;
  } else {
    currentUserText.textContent = "로그인 안 됨";
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateAuthHomeUI();
  alert("로그아웃되었습니다.");
}

if (moveLoginBtn) {
  moveLoginBtn.addEventListener("click", function () {
    location.href = "login.html";
  });
}

if (moveSignupBtn) {
  moveSignupBtn.addEventListener("click", function () {
    location.href = "signup.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// 로그인한 사람의 저장키 자동 생성
function getStorageKey(keyName) {
  if (!currentUser) return null;
  return `${keyName}_${currentUser.id}`;
}

function loadUserData() {
  if (!currentUser) {
    goals = [];
    records = [];
    xp = 0;
    level = 1;
    stickers = 0;
    return;
  }

  goals = JSON.parse(localStorage.getItem(getStorageKey("goals"))) || [];
  records = JSON.parse(localStorage.getItem(getStorageKey("records"))) || [];

  xp = Number(localStorage.getItem(getStorageKey("xp"))) || 0;
  level = Number(localStorage.getItem(getStorageKey("level"))) || 1;
  stickers = Number(localStorage.getItem(getStorageKey("stickers"))) || 0;
}
