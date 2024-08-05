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

    if (format == null) {
      format = "yyyy-MM-dd";
    }

    if (format == "yyyy-MM-dd") {
      formattedDate = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;
    } else if (format == "yyyy.MM.dd") {
      formattedDate = `${today.getFullYear()}.${
        today.getMonth() + 1
      }.${today.getDate()}`;
    } else if (format == "yyyy년 MM월 dd일") {
      formattedDate = `${today.getFullYear()}년 ${
        today.getMonth() + 1
      }월 ${today.getDate()}일`;
    } else if (format == "yyyy/MM/dd") {
      formattedDate = `${today.getFullYear()}/${
        today.getMonth() + 1
      }/${today.getDate()}`;
    } else {
      return false;
    }

    return formattedDate;
  },

  //입력날짜 포맷 반환(기본포맷: yyyy-MM-dd)
  getFormatDate: function getFormatDate(date, format) {
    let formattedDate = "";

    if (format == null) {
      format = "yyyy-MM-dd";
    }

    const regex = /[^0-9]/g; //숫자가 아닌 문자 제거하는 패턴
    const dateReg = date.replace(regex, "");

    if (dateReg.length != 8) {
      return false;
    }

    var yaer = dateReg.substring(0, 4);
    var month = dateReg.substring(4, 6);
    var day = dateReg.substring(6, 8);

    if (format == "yyyy-MM-dd") {
      formattedDate = `${yaer}-${month}-${day}`;
    } else if (format == "yyyy.MM.dd") {
      formattedDate = `${yaer}.${month}.${day}`;
    } else if (format == "yyyy년 MM월 dd일") {
      formattedDate = `${yaer}년 ${month}월 ${day}일`;
    } else if (format == "yyyy/MM/dd") {
      formattedDate = `${yaer}/${month}/${day}`;
    } else {
      return false;
    }

    return formattedDate;
  },

  //입력날짜 요일 반환(월, 화, 수 형식으로 반환)
  getDayWeek: function getDayWeek(date) {
    let weekArr = ["일", "월", "화", "수", "목", "금", "토", "일"];
    let DayWeek = new Date(date).getDay();

    return weekArr.at(DayWeek);
  },

  //값이 비어있는지 확인(비어있을 시-true, 비어있지 않을시-false)
  isEmpty: function isEmpty(data) {
    if (data == null) {
      return true;
    } else if (typeof data == "string" && data.trim() == "") {
      return true;
    } else if (data == undefined) {
      return true;
    } else if (typeof data == "undefined") {
      return true;
    } else {
      return false;
    }
  },

  //두 날짜의 차이를 구함(일(day) 기준)
  getDiffDay: function getDiffDay(date1, date2) {
    const diffDate1 = new Date(common.getFormatDate(date1, "yyyy-MM-dd"));
    const diffDate2 = new Date(common.getFormatDate(date2, "yyyy-MM-dd"));
    let diff = Math.abs(diffDate1.getTime() - diffDate2.getTime());
    diff = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return diff;
  },

  // uuid로부터 랜덤 색상을 얻어냄
  getColorFromUuid: function getColorFromUuid(uuid) {
    // UUID를 숫자로 변환
    const hash = uuid.split("-").reduce((acc, part) => {
      return acc + parseInt(part, 16);
    }, 0);

    // 색상(Hue): 0-360 전체 범위
    const hue = hash % 360;

    // 채도(Saturation): 60-90% 범위로 제한
    const saturation = (hash % 31) + 60;

    // 명도(Lightness): 30-55% 범위로 제한
    const lightness = (hash % 26) + 30;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  },

  // 특정 색상에서 더 연한 색을 얻어내는 함수
  getLighterColor: function getLighterColor(color, amount = 20) {
    if (color.startsWith("hsl")) {
      const [hue, saturation, lightness] = color.match(/\d+/g).map(Number);

      const newLightness = Math.min(lightness + amount, 100);

      return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
    } else if (color.startsWith("#")) {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);

      (r /= 255), (g /= 255), (b /= 255);
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      l = Math.min(l + amount / 100, 1);

      let r1, g1, b1;
      if (s === 0) {
        r1 = g1 = b1 = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r1 = hue2rgb(p, q, h + 1 / 3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1 / 3);
      }

      const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
    } else {
      console.error("Unsupported color format");
      return color;
    }
  },

  // 두 array의 값을 비교하여 일치하는지 확인하는 함수
  arraysEqual: function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  },

  // 노드의 경로를 구하는 함수
  findNodePathById: function findNodePathById(nodeId, tree = data, path = []) {
    if (tree.id === nodeId) {
      return path;
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i++) {
        const result = findNodePathById(nodeId, tree.children[i], [...path, i]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  },

  // 노드의 id 경로를 구하는 함수
  findIdPathById: function findIdPathById(nodeId, tree = data, path = []) {
    if (tree.id === nodeId) {
      return [...path, tree.id];
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i++) {
        const result = findIdPathById(nodeId, tree.children[i], [
          ...path,
          tree.id,
        ]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  },

  // 경로의 {id, name} 의 배열을 반환하는 함수
  findRouteById: function findRouteById(nodeId, tree = data, path = []) {
    if (tree.id === nodeId) {
      return [...path, { id: tree.id, name: tree.name }];
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i++) {
        const result = findRouteById(nodeId, tree.children[i], [
          ...path,
          { id: tree.id, name: tree.name },
        ]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  },
};

export default common;
