const socket = io();

const start = document.getElementById("st");
const start_button = start.querySelector("button");

function handleStart(event){
    event.preventDefault();
    console.log("button clicked!");
    roomName = 'jin dongha';
    socket.emit("enterRoom", roomName);
}
start_button.addEventListener("click", handleStart);

