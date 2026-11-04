// 헤더 삽입
fetch("./components/header.html")
    .then((response) => response.text())
    .then((data) => {
        const headerHtml = document.getElementById("header");

        headerHtml.innerHTML = data;
    })
    .catch((error) => console.log(error));

// 사이드바 삽입
fetch("./components/sidebar.html")
    .then((response) => response.text())
    .then((data) => {
        const sidebarHtml = document.getElementById("sidebar");

        sidebarHtml.innerHTML = data;
    })
    .catch((error) => console.log(error));

// 푸터 삽입
fetch("./components/footer.html")
    .then((response) => response.text())
    .then((data) => {
        const footerHtml = document.getElementById("footer");

        footerHtml.innerHTML = data;
    })
    .catch((error) => console.log(error));