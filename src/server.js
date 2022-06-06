import express from "express";
import http from "http";
import axios from "axios";
import socketIO from "socket.io";
import { urlencoded } from "express";

// 같은 server에서 http, websocket 서버 2개 돌림
const app = express();
const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);
const mysql = require("mysql2/promise"); // mysql 패키지
const bodyParser = require('body-parser');
const request = require('request');
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

// DB Connect
const config = require('./config.json');
//const database = require('./db_connect.js');

// AUTO_INCREMENT값 초기화
// set @count=0;
// update TABLE_NAME set 속성값=@count:=@count+1;

let clientNum = 0;
let msgID = 0;

// 사용자, 상대방 정보
let user = {
    nickname: "",
    Id: "",
};
let partner = {
    nickname: "",
    Id: "",
};
// Socket room을 만드는 Id = 사용자 2명의 nickname
let roomId = '';



wsServer.on("disconnect", (reason)=>{
    console.log(reason);
    console.log('socket disconneted!');
    socket.emit('close');
})

function countUserNum(room){
    let num = wsServer.sockets.adapter.rooms.get(room)?.size;
    return num;
}

const RemoveRoom = async (room) => {
    try {
        let db = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
        await db
        .query(`DELETE from Room WHERE room_id='${room}'`);
    } catch(err){
        console.log('error in RemoveRoom');
        console.log(err);
    }
}



// socket server 연결
wsServer.on("connection", (socket) => {
    console.log(socket.id);
    console.log("Connected to Web Socket Server!");

    socket.on("connect_error", () => {
        console.log('connecting error !!');
    });

    socket.on("disconnect", (reason) => {
        if (reason === "transport error") {
            console.log('Network ERROR');
            console.log(reason);
        }
    }); 

    socket.on("disconnecting", ()=>{
        clientNum = countUserNum(roomId);
        console.log('the number of client in this room : ',clientNum-1);

        socket.rooms.forEach(room => {
            socket.to(room).emit("bye");
        });
        
        // 채팅방에 사용자가 0명이면, Room 삭제 & DB에서 관련 정보 삭제
        if((clientNum-1)===0){
            RemoveRoom(roomId);
        }
            
    })

    // mobile에서 매칭된 사용자와 방정보 받기
    socket.on("makeRoom", async (username, room)=>{
        console.log(username, room);
        
        // user, partner nickname 설정
        let u = room.split(" ");
        if(u[0]==username){
            user.nickname = u[0];
            partner.nickname = u[1];
        } else{
            user.nickname = u[1];
            partner.nickname = u[0];
        }
        console.log(`user : ${user.nickname}, partner : ${partner.nickname}`);
        roomId = room; // roomId 설정

        console.log('socket.id : ',socket.id);
        console.log('socket.rooms (before join) : ',socket.rooms);
        socket.join(roomId); // room 생성
        console.log('socket.rooms (after join) : ',socket.rooms);
        clientNum = countUserNum(roomId);
        console.log('the number of client in this room: ',clientNum);

        await get_user_info();

        await showHistory(roomId);
    })

    // // 제한시간 내에 메세지 전송 실패
    // socket.on("overTime", ()=>{
    //     console.log("Fail to send msg");
    // })

    // new_msg : 나를 제외한 사람에게 msg 보냄
    socket.on("new_msg", (msg, room, time, sendToMe)=>{
        if(countUserNum(roomId)===1)
            socket.emit("NoUser");
        else{
            //socket.broadcast.emit("msg",`${socket.id}: ${msg}`);
            socket.to(room).emit("msg",`${partner.nickname}: ${msg}`);
            socket.to(room).emit("time",`${time}`);
            set_msgTable(msg, time, user.Id, room);
            sendToMe();
            console.log('# server : socket.rooms : ', socket.rooms);
            console.log('# server : socket.id : ', socket.id);
            console.log('# server send msg except me : socket.emit : ', msg);
            console.log(msg, time, socket.id, room);
        }
    });
    // socket.emit("receiveMsg", msg); => 방에 있는 모든 사람한테 메세지 전송
    // socket.broadcast.emit("receiveMsg", msg); => 메세지를 보낸 사람을 제외하고, 방에 있는 모든 사람한테 메세지 전송

    const showHistory = async (room) => {
        try {
            let db = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database
            });
            let [hist] = await db
            .query(`SELECT * FROM ChatMessage WHERE room_id='${room}'`);

            hist.forEach(function(hist){

                let timest = new Date(hist.time);
                console.log(time);
                console.log(typeof(hist.time.toString()));

                let year = timest.getFullYear();
                let month = ('0' + (timest.getMonth() + 1)).slice(-2);
                let date = ('0' + timest.getDate()).slice(-2);
                let hours = ('0' + timest.getHours()).slice(-2); 
                let minutes = ('0' + timest.getMinutes()).slice(-2);
                let seconds = ('0' + timest.getSeconds()).slice(-2);
                let time = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
                
                // room_id 에서 내가 아닌 것 = 상대방
                if(hist.User_Id==user.Id)
                    socket.emit("ShowHistory", hist.message, time);
                else{
                    socket.to(room).emit("msg",`${partner.nickname}: ${hist.message}`);
                    socket.to(room).emit("time",`${time}`);
                }
            });
        } catch(err){
            console.log('err in showHistory\n', err);
        }
    };
});

const set_msgTable = async (msg, time, sender, roomId) => {
    try{
        let db = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
        // 가장 최근에 보낸 msg Id 찾기 == msfInfo[0]
        await db.query(`INSERT INTO ChatMessage (message, time, User_Id, room_id) VALUES('${msg}', '${time}', '${sender}', '${roomId}')`);
        let msgInfo = await db.query(`SELECT message_id FROM ChatMessage ORDER BY time DESC LIMIT 1`);
        msgID = msgInfo[0];
        msgID = msgID[0]["message_id"];
        console.log(msgID);


        axios.post(
            'http://3.39.141.110:8080/alarm/message', 
            { chatMessageId : msgID }
        );
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
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
        // user nickname으로 DB에서 user_Id 가져오기
        let [us] = await db.query(`SELECT * FROM User WHERE User.nickname='${user.nickname}' or User.nickname='${partner.nickname}';`);
        if(us[0].nickname==user.nickname){
            user.Id = us[0].Id;
            partner.Id = us[1].Id;
        } else{
            user.Id = us[1].Id;
            partner.Id = us[0].Id;
        }
        console.log('user : ', user, ' partner : ',partner);

        // DB에 roomId 저장 // 중복된 roomId 존재하면 room 추가 X
        let [check] = await db.query('SELECT * FROM Room WHERE room_id=?',roomId);
        console.log(check);
        if(check.length!=0)
            console.log(`DB roomId : ${check[0].room_id}`);
        else{
            await db.query(`INSERT INTO Room (room_id) VALUES('${roomId}');`);
        }

        // ChatRoomJoin DB에 매칭된 사용자 2명의 ID, Room Id 저장
        let [chk] = await db.query('SELECT * FROM ChatRoomJoin WHERE room_id=?',roomId);
        if(chk.length!=0)
            console.log('ChatRoomJoin : ',chk);
        else{
            await db.query(`INSERT INTO ChatRoomJoin (User_Id1, User_Id2, room_id) VALUES('${user.Id}', '${partner.Id}', '${roomId}')`);
        }
    } catch(err){
        console.log('err in get_user_info\n', err);
    }
}


const handleListen = () => {
    console.log(`Listening on http://localhost:3000`);
}
httpServer.listen(3000, handleListen);