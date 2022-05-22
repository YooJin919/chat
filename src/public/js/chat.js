const socket = io();

const chat = document.getElementById("chat");
const msgForm = chat.querySelector("#msg");

let roomId = '';

function addMessage(msg){
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = chat.querySelector("#msg input");
    const value = input.value;

    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜
    //let day = today.getDay();  // 요일
    let time = year+"-"+month+"-"+date;

    socket.emit("new_msg", input.value, time, ()=>{
        addMessage(`You: ${value}`);
    }); 
    console.log("# front send msg to me : socket.emit : 'new_msg'");
    input.value ="";
}

msgForm.addEventListener("submit", handleMessageSubmit);
socket.on("msg", addMessage);

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

