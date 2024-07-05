const common = {

    TEST: function test(num) {
        let total = 0;
            
         for (let i = 1; i <= num; i++) {
            total += i;
        }
            
        return total;
    },

    //오늘날짜 반환(기본포맷: yyyy-MM-dd)
    getToday: function getToday(format) {
        let today = new Date();
        let formattedDate = "";

        if(format == null){
            format = 'yyyy-MM-dd';
        }

        if(format == 'yyyy-MM-dd'){
            formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        }else if(format == 'yyyy.MM.dd'){
            formattedDate = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
        }else if(format == 'yyyy년 MM월 dd일'){
            formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
        }else if(format == 'yyyy/MM/dd'){
            formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        }else{
            return false;
        }

        return formattedDate;
    },

    //입력날짜 포맷 반환(기본포맷: yyyy-MM-dd)
    getFormatDate: function getFormatDate(date, format) {
        let formattedDate = "";

        if(format == null){
            format = 'yyyy-MM-dd';
        }

        const regex = /[^0-9]/g; //숫자가 아닌 문자 제거하는 패턴
        const dateReg = date.replace(regex, "");

        if(dateReg.length != 8){
            return false;
        }

        var yaer = dateReg.substring(0, 4);
        var month = dateReg.substring(4, 6);
        var day = dateReg.substring(6, 8);

        if(format == 'yyyy-MM-dd'){
            formattedDate = `${yaer}-${month}-${day}`;
        }else if(format == 'yyyy.MM.dd'){
            formattedDate = `${yaer}.${month}.${day}`;
        }else if(format == 'yyyy년 MM월 dd일'){
            formattedDate = `${yaer}년 ${month}월 ${day}일`;
        }else if(format == 'yyyy/MM/dd'){
            formattedDate = `${yaer}/${month}/${day}`;
        }else{
            return false;
        }

        return formattedDate;
    },

    //입력날짜 요일 반환(월, 화, 수 형식으로 반환)
    getDayWeek: function getDayWeek(date) {
        let weekArr = ['일','월','화','수','목','금','토','일'];
        let DayWeek = new Date(date).getDay();

        return weekArr.at(DayWeek);
    },

    //값이 비어있는지 확인(비어있을 시-true, 비어있지 않을시-false)
    isEmpty: function isEmpty(data) {
        if(data == null){
            return true;
        }else if(typeof data == 'string'  && data.trim() == ''){
            return true;
        }else if(data == undefined){
            return true;
        }else if(typeof data == "undefined"){
            return true;
        }else{
            return false;
        }
    },

    //두 날짜의 차이를 구함(일(day) 기준)
    getDiffDay: function getDiffDay(date1, date2) {
        const diffDate1 = new Date(common.getFormatDate(date1,'yyyy-MM-dd'));
        const diffDate2 = new Date(common.getFormatDate(date2,'yyyy-MM-dd'));
        let diff = Math.abs(diffDate1.getTime() - diffDate2.getTime());
        diff = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return diff;
    }
}

export default common