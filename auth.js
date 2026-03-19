const signupUsername = document.querySelector("#signup-username");
const signupPassword = document.querySelector("#signup-password");
const signupBtn = document.querySelector("#signup-btn");

const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");
const loginBtn = document.querySelector("#login-btn");

let users = JSON.parse(localStorage.getItem("users")) || [];

if (signupBtn) {
  signupBtn.addEventListener("click", signup);
}

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

function signup() {
  const username = signupUsername.value.trim();
  const password = signupPassword.value.trim();

  if (username === "" || password === "") {
    alert("아이디와 비밀번호를 모두 입력하세요.");
    return;
  }

  const existingUser = users.find(function (user) {
    return user.username === username;
  });

  if (existingUser) {
    alert("이미 존재하는 아이디입니다.");
    return;
  }

  const newUser = {
    id: Date.now(),
    username: username,
    password: password,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
  location.href = "login.html";
}

function login() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (username === "" || password === "") {
    alert("아이디와 비밀번호를 모두 입력하세요.");
    return;
  }

  const foundUser = users.find(function (user) {
    return user.username === username && user.password === password;
  });

  if (!foundUser) {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(foundUser));

  alert(`${foundUser.username}님, 로그인되었습니다.`);
  location.href = "index.html";
}
