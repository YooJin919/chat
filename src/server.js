import express from "express";
import http from "http";
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
app.use(express.urlencoded({ extended: true })); app.use(express.json());


app.get("/", (_, res)=>{
    res.render("home"); // home.pug rendering중
})


// # Spring에서 request로 매칭된 사용자 2명의 nickname을 받고 오름차순으로 user1, user2 정의
let user1 = {
    nickname: "dongha",
    Id: "",
};
let user2 = {
    nickname: "jin",
    Id: "",
};

// Socket room을 만드는 Id = 사용자 2명의 nickname
let roomId = '';



function createRoom (roomId) {
    socket.emit("nickname", roomId);
    //socket.join(roomId);

}

wsServer.on("connection", (socket) => {
    console.log("Connected to Web Socket Server!");
    // socket.on("enterRoom", (nickname)=>{
    //     roomId = nickname;
    //     console.log('socket.on createRoom!');
    //     console.log(roomId);

    //     console.log('socker.rooms : ',socket.rooms);
    //     console.log('socket.id (before join) : ',socket.id);
    //     socket.join(roomId); // room 생성
    //     console.log('socket.id (after join) : ',socket.rooms);
    // });
});


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
        roomId = user1.nickname + " " + user2.nickname;
        createRoom(roomId);
        //res.send(roomId); // front 화면에 보냄
        res.render("home");
    } catch(err){
        console.log(err);
        res.send(err);
    }
}

app.get('/test', get_user_info);

// // 매칭된 2명의 사용자 nickname 받기
// app.post("http://3.39.141.110:8080/user/nickname",(req, res)=>{
//     // req.body = {
//     //     "user1" : "nickname",
//     //     "user2" : "nickname"
//     // }
//     console.log(req.body);

//     user1.nickname=req.body.user1;
//     user2.nickname=req.body.user2;
//     roomId = user1.nickname + " " + user2.nickname;
//     get_user_info();
//     createRoom(roomId); // 채팅방 생성
//     res.send(user);
// } )


const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}
httpServer.listen(3000, handleListen);
