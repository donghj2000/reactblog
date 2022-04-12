export function setCookie(c_name, value, days, hours, minutes) {
    var exdate = new Date();　　
    var ms = days*24*3600*1000 + hours*3600*1000 + minutes*60*1000;
    exdate.setTime(exdate.getTime() + ms);
    document.cookie = c_name + "=" + encodeURI(value) + ";path=/" + ((ms == 0) ? "" : ";expires=" + exdate.toGMTString());
}
export function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return decodeURI(arr[2]);
    }
    else
        return "";
}
export function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);

    if (cval != "")
        document.cookie = name + '=;path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function timestampToTime(timestamp, dayMinSecFlag) {
    const date = new Date(timestamp);
    const Y = date.getFullYear() + "-";
    const M =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + "-";
    const D =
        date.getDate() < 10 ? "0" + date.getDate() + " " : date.getDate() + " ";
    const h =
        date.getHours() < 10 ? "0" + date.getHours() + ":" : date.getHours() + ":";
    const m =
        date.getMinutes() < 10
            ? "0" + date.getMinutes() + ":"
            : date.getMinutes() + ":";
    const s =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    if (!dayMinSecFlag) {
        return Y + M + D;
    }
    return Y + M + D + h + m + s;
}
// fn是我们需要包装的事件回调, delay是时间间隔的阈值
export function throttle(fn, delay) {
    let last = 0,
        timer = null;
    return function () {
        let context = this;
        let args = arguments;
        let now = +new Date();

        if (now - last < delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, delay);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

//根据 QueryString 参数名称获取值
export function getQueryStringByName(name) {
    let result = window.location.search.match(
        new RegExp("[?&]" + name + "=([^&]+)", "i")
    );
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

//获取页面顶部被卷起来的高度
export function getScrollTop() {
    return Math.max(
        //chrome
        document.body.scrollTop,
        //firefox/IE
        document.documentElement.scrollTop
    );
}

//获取页面文档的总高度
export function getDocumentHeight() {
    //现代浏览器（IE9+和其他浏览器）和IE8的document.body.scrollHeight和document.documentElement.scrollHeight都可以
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
}

//页面浏览器视口的高度
export function getWindowHeight() {
    return document.compatMode === "CSS1Compat"
        ? document.documentElement.clientHeight
        : document.body.clientHeight;
}
