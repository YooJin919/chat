const socket = io();

const start = document.getElementById("start");
const RoomNameForm = start.querySelector("#roomname");
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

function handleRoomName(event){
    event.preventDefault();
    console.log("# front : button clicked!");

    ChatDiv.hidden = false;
    start.hidden=true;

    socket.emit("makeRoom", user, roomId); 
    // flutter에서 받은 user name과 roomId -> server에 보내기
}
RoomNameForm.addEventListener("submit", handleRoomName);


// const socket = io();

const chat = document.getElementById("chat");
const msgForm = chat.querySelector("#msg");

// function getMatchResult(username, RoomName){
//     user = username;
//     roomId = RoomName;
//     console.log(`user : ${user}, roomname : ${roomId}`);
// }


function addMessage(msg){
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

function addNum(number){
    const p = chat.querySelector("p");
    const h3 = document.createElement("h3");
    h3.innerText = number;
    p.appendChild(h3);
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
    }); 
    console.log("# front send msg to me : socket.emit : 'new_msg'");
    input.value ="";
}

msgForm.addEventListener("submit", handleMessageSubmit);

socket.on("msg", addMessage);

socket.on("bye", (left_user)=>{
    addMessage(`상대방이 채팅방을 나갔습니다.`);
});

socket.on("ShowHistory", (hist)=>{
    hist.forEach(function(hist){
        addMessage(`${hist.User_Id}: ${hist.message}`);
    })
});

// POST -> nickname 받기
// axios({
//     mehtod: "post",
//     url: "http://localhost:3000/matchResult",
//     data:{
//         // user1: user1.nickname,
//         // user2: user2.nickname,
//     },
// })
// .then(function(res){
//     // console.log('user1 : ', user1.nickname, 'user2 : ',user2.nickname);
//     console.log(res.body);
//     // roomId = user1.nickname + " " + user2.nickname;
// })
// .catch(function(err){
//     console.log('error in post /matchResult', err);
// })



// // POST -> nickname 받기
// axios({
//     mehtod: "post",
//     url: "http://localhost:3000/matchResult",
//     data:{
//         // user1: user1.nickname,
//         // user2: user2.nickname,
//         name: nickname,
//     },
// })
// .then(function(res){
//     // console.log('user1 : ', user1.nickname, 'user2 : ',user2.nickname);
//     console.log(res.body);
//     // roomId = user1.nickname + " " + user2.nickname;
// })
// .catch(function(err){
//     console.log('error in post /matchResult', err);
// })

