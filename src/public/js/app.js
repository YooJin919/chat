const socket = io();

const start = document.getElementById("st");
const start_button = start.querySelector("button");


function handleNickname(event){
    event.preventDefault();
    console.log('receive nickanem');
}
socket.on("nickname", handleNickname);

function handleStart(event){
    event.preventDefault();
    
    console.log("# front : button clicked!");
    let nickname = 'jin dongha';
    window.location.replace(`http://localhost:3000/user/matchResult`); // page 이동
    //socket.emit("userNickname", nickname);
}
start_button.addEventListener("click", handleStart);

