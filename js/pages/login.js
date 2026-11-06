const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.querySelector("#login-id").value.trim();
    const password = document.querySelector("#login-password").value;

    loginError.hidden = true;
    loginError.textContent = "";

    // 아이디나 비밀번호가 입력이 안 된 경우
    if (!userId || !password) {
        loginError.textContent = "아이디와 비밀번호를 입력해 주세요.";
        loginError.hidden = false;
        return;
    }

    // 입력 받은 비밀번호의 길이가 설정된 값과 다른 경우
    if(password.length < 6 || password.length > 15) {
        loginError.textContent = "비밀번호는 6 자리이상 15 이하입니다."
        loginError.hidden = false;
        return
    }

    // 로그인 성공 후
    loginError.hidden = true;
    loginError.textContent = "현재 로그인 API가 연결되지 않았습니다.";
    loginError.hidden = false;
});
