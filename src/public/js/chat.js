const socket = io();

const chat = document.getElementById("chat");
const msgForm = chat.querySelector("#msg");

function handleMsg(event){
    event.preventDefault();
    let msg = chat.querySelector("#msg input");
    console.log(msg.value);
    location.href = 'http://localhost:3000/matchResult/';
}

msgForm.addEventListener("submit", handleMsg);


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

