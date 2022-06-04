module.exports = (function() {
    return {
        real: { // localhost
            host: 'codelivery.cwfwgpd9kjmh.ap-northeast-2.rds.amazonaws.com',  //엔드포인트입력
            port: 3306,  //myql포트입력
            user: 'Codelivery',    //마스터유저입력
            password: 'Codelivery!0',  //마스터유저비밀번호입력
            database: 'Codelivery' //데이터베이스 인스턴스입력
        }
    }
})();