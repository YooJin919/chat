const socket = io();

const start = document.getElementById("start");
const nameForm = start.querySelector("#name");


function handleNickname(event){
    event.preventDefault();
    console.log("# front : button clicked!");
    const input = start.querySelector("#name input");
    let name = input.value;
    console.log(`input.value : ${name}`);
    socket.emit("userNickname", name);
}

nameForm.addEventListener("submit", handleNickname);



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

