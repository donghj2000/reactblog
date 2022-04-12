import { SET_USER, CLEAR_USER } from './constants.js';
import { getCookie, setCookie, delCookie } from "./../utils/index.js";

const initDefaultUserInfo = ()=>{
    let user = {
        id: 0,
        username: "",
        nickname: "",
        created_at: "",
        last_login: "",
        avatar: "",
        email: "",
        is_active: false,
        is_superuser: false
    };

    let userInfo = getCookie("userInfo");
    if (userInfo) {
        user = JSON.parse(userInfo);
    }

    return user;
}
const defaultState = {
	user: initDefaultUserInfo()
}

function reducer(state = defaultState, action) {
	switch (action.type) {
		case SET_USER:
			return {
				...state,
				user: action.user
			};
		case CLEAR_USER:
			return {
				...state,
				user: initDefaultUserInfo()
			};
		default:
			return state;
	}
}
export default reducer;
