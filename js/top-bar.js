fetch(`page/top/top-bar.html`)
    .then(res => res.text())
    .then(html => {
        document.getElementById('topBar').innerHTML = html;
    });

function moveToMainPage(){
    window.location.href = 'index.html'; // 메뉴 페이지 상대경로
}
function moveToMenuPage(){
    window.location.href = 'menu.html'; // 메뉴 페이지 상대경로
}
function moveToMaterialPage(){
    window.location.href = 'material.html'; // 메뉴 페이지 상대경로
}