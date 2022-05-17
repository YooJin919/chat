import express from "express";
import http from "http";
import socketIO from "socket.io";

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
// pug 페이지 rendering 하기 위한 설정

app.get("/", (_, res)=>{
    res.render("home"); // home.pug rendering중
})

// # Spring에서 request로 매칭된 사용자 2명의 nickname을 받았다고 가정
// 사용자 정보를 가지고 있는 객체
let user1 = {
    nickname: "jin",
    Id: "",
};
let user2 = {
    nickname: "dongha",
    Id: "",
};

// Socket room을 만드는 Id = 사용자 2명의 nickname
let roomId = '';

wsServer.on("connection", (socket) => {
    console.log("Connected to Web Socket Server!");
    socket.on("enterRoom", (roomName)=>{
        roomId = roomName;
        console.log('socket.on createRoom!');
        console.log(roomId);

        console.log('socker.rooms : ',socket.rooms);
        console.log('socket.id before join : ',socket.id);
        socket.join(roomId); // room 생성
        console.log('socket.id after join : ',socket.rooms);
    });
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
        console.log('roomId : ', roomId);
        //res.send(roomId); // front 화면에 보냄
        res.render("home");
        //CreateRoom(roomId); // 가져온 user_Id로 room 생성하기
    } catch(err){
        console.log(err);
        res.send(err);
    }
}

app.get("/test", get_user_info); // spring에서 request 받기

// app.get('/', function(req, res){
//     console.log(req.url);
// 	return res.send(req.url);
// });

const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}
httpServer.listen(3000, handleListen);
