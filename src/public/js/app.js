const socket = io();

const ChatDiv = document.getElementById("chat");
ChatDiv.hidden = true;
const UserNum = ChatDiv.querySelector("#num");
const end = document.getElementById("end");


// ---------------------------------------------- //
let roomId = "";
let user = "";


moveURL();

async function moveURL(){
    // ## flutter에서 받아오는 정보
    roomId = window.localStorage.getItem('roomId');
    user = window.localStorage.getItem('user');

    // //## dummy data로 test
    // roomId = '돔희 성규';
    // user = '성규';
    socket["username"] = user;
    console.log('move to ', socket.username);
    socket.emit("makeRoom", socket.username, roomId);
}
// ---------------------------------------------- //


// const socket = io();
const newchat = document.getElementById("newchat");
const chat = document.getElementById("chat");
const endButton = end.querySelector("#fin");
const msgForm = chat.querySelector("#msg");

function addMessage(msg){
    const ul = newchat.querySelector("ul");
    const li = document.createElement("li");
    li.id = "message";
    li.className = 'sent';
    li.innerText = msg;
    ul.appendChild(li);
}

function addNum(number){    
    const ul = newchat.querySelector("ul");
    const li = document.createElement("li");
    li.id = "time";
    li.className = 'sent';
    li.innerText = number;
    ul.appendChild(li);
    newchat.scrollTo(0, newchat.scrollHeight);
}

function addMessage_receive(msg){
    const ul = newchat.querySelector("ul");
    const li = document.createElement("li");
    li.id = "message";
    li.className = "receive";
    li.innerText = msg;
    ul.appendChild(li);
}

function addNum_receive(number){    
    const ul = newchat.querySelector("ul");
    const li = document.createElement("li");
    li.id = "time";
    li.className = "receive";
    li.innerText = number;
    ul.appendChild(li);
    newchat.scrollTo(0, newchat.scrollHeight);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = chat.querySelector("#msg input");
    const value = input.value;

    let today = new Date();
    let year = today.getFullYear();
    let month = ('0' + (today.getMonth() + 1)).slice(-2);
    let date = ('0' + today.getDate()).slice(-2);
    let hours = ('0' + today.getHours()).slice(-2); 
    let minutes = ('0' + today.getMinutes()).slice(-2);
    let seconds = ('0' + today.getSeconds()).slice(-2);
    let time = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    socket.emit("new_msg", socket.username, input.value, roomId, time, ()=>{
        addMessage(`You: ${value}`);
        addNum(`${time}`);
    }); 
    console.log("# front send msg to me : socket.emit : 'new_msg'");
    input.value ="";
}

function handleEnd(){
    console.log("end button clicked!");
    socket.emit("endProcess", roomId);
}

endButton.addEventListener("submit", handleEnd);

msgForm.addEventListener("submit", handleMessageSubmit);

socket.on("msg", addMessage_receive);//상대가 보낸 메세지
socket.on("time", addNum_receive);

// socket.on("NoUser",()=>{
//     addMessage_receive(`상대방이 채팅방에 없습니다.`); // 있어야 할까?
// })


socket.on("bye", (left_user)=>{
    addMessage_receive(`상대방이 채팅방을 나갔습니다.`);
    newchat.scrollTo(0, newchat.scrollHeight);
});


socket.on("ShowHistory_me", (value, time)=>{
    addMessage(`You: ${value}`);
    addNum(`${time}`);
});

socket.on("ShowHistory_partner", (sender, value, time)=>{
    addMessage_receive(`${sender}: ${value}`);
    addNum_receive(`${time}`);
});