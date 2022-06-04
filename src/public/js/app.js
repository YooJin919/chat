const socket = io();

const ChatDiv = document.getElementById("chat");
ChatDiv.hidden = true;
const UserNum = ChatDiv.querySelector("#num");

// ## flutter에서 받아오는 정보
// let roomId = "";
// let user = "";
// roomId = window.localStorage.getItem('roomId');
// user = window.localStorage.getItem('user');

// ## dummy data로 test
let roomId = 'dongha jin';
let user = 'dongha';


socket.emit("makeRoom", user, roomId); 


// const socket = io();
const newchat = document.getElementById("newchat");
const chat = document.getElementById("chat");
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

    socket.emit("new_msg", input.value, roomId, time, ()=>{
        addMessage(`You: ${value}`);
        addNum(`${time}`);
        // //시간 제한
        // socket.timeout(5000).emit("overTime", (err) => {
        //     if (err) {
        //         // the other side did not acknowledge the event in the given delay
        //         console.log(err);
        //     }
        // });
    }); 
    console.log("# front send msg to me : socket.emit : 'new_msg'");
    input.value ="";
}

msgForm.addEventListener("submit", handleMessageSubmit);

socket.on("msg", addMessage_receive);//상대가 보낸 메세지
socket.on("time", addNum_receive);

socket.on("NoUser",()=>{
    addMessage_receive(`상대방이 없습니다.`);
})

socket.on("bye", (left_user)=>{
    addMessage_receive(`상대방이 채팅방을 나갔습니다.`);
    newchat.scrollTo(0, newchat.scrollHeight);
});

socket.on("ShowHistory", (value, time)=>{
    addMessage(`You: ${value}`);
    addNum(`${time}`);
});