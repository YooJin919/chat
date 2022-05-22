import express from "express";
import http from "http";
import axios from "axios";
import socketIO from "socket.io";

// 같은 server에서 http, websocket 서버 2개 돌림
const app = express();
const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);
const mysql = require("mysql2/promise"); // mysql 패키지
const bodyParser = require('body-parser');
require('dotenv').config(); // .env 파일을 읽어오기 위한 패키지

// pug 페이지 rendering 하기 위한 설정
app.set("view engine", "pug");
app.set("views", __dirname+"/views");
app.use("/public", express.static(__dirname+"/public"));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (_, res)=>{
    res.render("home"); // home.pug rendering중
})
app.get("/matchResult", (_, res)=>{
    res.render("chatRoom");
})


// AUTO_INCREMENT값 초기화
// set @count=0;
// update TABLE_NAME set 속성값=@count:=@count+1;

// # Spring에서 request로 매칭된 사용자 2명의 nickname을 받고 오름차순으로 user1, user2 정의
let user1 = {
    nickname: "",
    Id: "",
};
let user2 = {
    nickname: "",
    Id: "",
};

// Socket room을 만드는 Id = 사용자 2명의 nickname
let roomId = '';


wsServer.on("connection", (socket) => {
    console.log("Connected to Web Socket Server!");

    // 매칭된 사용자 nickname으로 Room 생성하기
    socket.on("userNickname", (nickname)=>{
        console.log('# server : enterRoom!');
        // front에서 보내준 nickname으로 roomId 설정
        roomId = nickname;
        console.log('roomId : ',roomId);

        // 설정한 roomId로 Room 생성
        console.log('socker.id : ',socket.id);
        console.log('socket.rooms (before join) : ',socket.rooms);
        socket.join(roomId); // room 생성
        console.log('socket.rooms (after join) : ',socket.rooms);

        let user = nickname.split(" ");
        user1.nickname = user[0];
        user2.nickname = user[1];
        console.log('user : ',user);
        get_user_info();
    });

    // new_msg : 나를 제외한 사람에게 msg 보냄
    socket.on("new_msg", (msg, time, sendToMe)=>{
        socket.broadcast.emit("msg",`${socket.id}: ${msg}`);
        set_msgTable(msg, time, socket.id, roomId);
        sendToMe();
        console.log('# server : socket.rooms : ', socket.rooms);
        console.log('# server : socket.id : ', socket.id);
        console.log('# server send msg except me : socket.emit : ', msg);
        console.log(msg, time, socket.id, roomId);
    });
    // socket.emit("receiveMsg", msg); => 방에 있는 모든 사람한테 메세지 전송
    // socket.broadcast("receiveMsg", msg); => 메세지를 보낸 사람을 제외하고, 방에 있는 모든 사람한테 메세지 전송
});

const set_msgTable = async (msg, time, sender, roomId) => {
    try{
        let db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            port: "3306",
            password: "password",
            database: "test",
        });
        await db.query(`INSERT INTO ChatMessage (message, time, User_Id, room_id) VALUES('${msg}', '${time}', '${user1.Id}', '${roomId}')`);
    }
    catch(err){
        console.log('err in set_msgTable', err);
    }
}

// 매칭된 2명의 사용자 nickname 받기
// user nickname으로 DB에서 userId 찾기
const get_user_info = async (req, res) => {
    try {
        let db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            port: "3306",
            password: "password",
            database: "test",
        });
        // user nickname으로 DB에서 user_Id 가져오기
        let [us] = await db.query(`SELECT * FROM user WHERE user.nickname='${user1.nickname}' or user.nickname='${user2.nickname}'`);
        if(us[0].nickname==user1.nickname){
            user1.Id = us[0].Id;
            user2.Id = us[1].Id;
        } else{
            user1.Id = us[1].Id;
            user2.Id = us[0].Id;
        }
        console.log('user1 : ', user1, ' user2 : ',user2);

        // DB에 roomId 저장 // 중복된 roomId 존재하면 room 추가 X
        roomId = user1.nickname + " " + user2.nickname;
        let [check] = await db.query('SELECT * FROM Room WHERE room_id=?',roomId);
        console.log(check);
        if(check.length!=0)
            console.log(`DB roomId : ${check[0].room_id}`);
        else{
            await db.query(`INSERT INTO room (room_id) VALUES('${roomId}');`);
        }

        // ChatRoomJoin DB에 매칭된 사용자 2명의 ID, Room Id 저장
        let [chk] = await db.query('SELECT * FROM ChatRoomJoin WHERE Room_room_id=?',roomId);
        if(chk.length!=0)
            console.log('ChatRoomJoin : ',chk);
        else{
            await db.query(`INSERT INTO ChatRoomJoin (User_Id1, User_Id2, Room_room_id) VALUES('${user1.Id}', '${user2.Id}', '${roomId}')`);
        }
    } catch(err){
        console.log('err in get_user_info\n', err);
    }
}



// http://3.39.141.110:8080/user/nickname

// res.body = {
//     "user1" : "nickname",
//     "user2" : "nickname"
// }

// // POST -> nickname 받기
// axios({
//     mehtod: "post",
//     url: "http://localhost:3000/",
//     data:{
//         user1: user1.nickname,
//         user2: user2.nickname,
//     },
// })
// .then(function(res){
//     console.log('user1 : ', user1.nickname, 'user2 : ',user2.nickname);
//     console.log(res.body);
//     roomId = user1.nickname + " " + user2.nickname;
//     get_user_info();
//     createRoom(roomId); // 채팅방 생성
// })
// .catch(function(err){
//     console.log('error in post /matchResult', err);
// })


const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}
httpServer.listen(3000, handleListen);
