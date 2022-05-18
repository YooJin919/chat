const socket = io();

const start = document.getElementById("st");
const start_button = start.querySelector("button");

function handleStart(event){
    event.preventDefault();
    window.location.replace(`http://localhost:3000/test`); // page 이동
    console.log("button clicked!");
    nickname = 'jin dongha';
    socket.emit("enterRoom", nickname);
}
start_button.addEventListener("click", handleStart);