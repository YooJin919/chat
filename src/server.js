import express from "express";
import http from "http";
import axios from "axios";
import socketIO from "socket.io";
import { createBrotliCompress } from "zlib";

// 같은 server에서 http, websocket 서버 2개 돌림
const app = express();
const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);
const mysql = require("mysql2/promise"); // mysql 패키지
require('dotenv').config(); // .env 파일을 읽어오기 위한 패키지

// pug 페이지 rendering 하기 위한 설정
app.set("view engine", "pug");
app.set("views", __dirname+"/views");
app.use("/public", express.static(__dirname+"/public"));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());


app.get("/", (_, res)=>{
    res.render("home"); // home.pug rendering중
})



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

//function createRoom(roomId);


wsServer.on("connection", (socket) => {
    console.log("Connected to Web Socket Server!");

    // 매칭된 사용자 nickname으로 Room 생성하기
    socket.on("userNickname", (nickname)=>{
        console.log('# server : enterRoom!');
        user = nickname.split;
        user1.nickname = user[0];
        user2.nickname = user[1];
        
        // // front에서 보내준 nickname으로 roomId 설정
        // roomId = user1.nickname + " " + user2.nickname; 
        // console.log(roomId);

        // // 설정한 roomId로 Room 생성
        // console.log('socker.rooms : ',socket.rooms);
        // console.log('socket.id (before join) : ',socket.id);
        // socket.join(roomId); // room 생성
        // console.log('socket.id (after join) : ',socket.rooms);
    });
});

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
    } catch(err){
        console.log('err in get_user_info\n', err);
    }
}


// // 매칭된 2명의 사용자 nickname 받기
//app.get('/test', get_user_info);

// http://3.39.141.110:8080/user/nickname

// res.body = {
//     "user1" : "nickname",
//     "user2" : "nickname"
// }

// POST -> nickname 받기
axios({
    mehtod: "post",
    url: "http://localhost:3000/user/matchResult",
    data:{
        user1: user1.nickname,
        user2: user2.nickname,
    },
})
.then(function(res){
    console.log('user1 : ', user1.nickname, 'user2 : ',user2.nickname);
    console.log(res.body);
    roomId = user1.nickname + " " + user2.nickname;
    get_user_info();
    createRoom(roomId); // 채팅방 생성
})
.catch(function(err){
    console.log('error in post /matchResult', err);
})


const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}
httpServer.listen(3000, handleListen);
