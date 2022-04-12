import { SET_USER, CLEAR_USER } from "./constants.js";

export const setUseraction = (user) => {
	return {
		type: SET_USER,
		user,
	};
};

export const clearUseraction = () => {
	return {
		type: CLEAR_USER
	};
};

export const mapStateToProps = (state) => {
	return {
		storeUser: state.user,
	}
};
export const mapDispatchToProps = (dispatch) => {
	return {
		setStoreuser: (user) => {
			dispatch(setUseraction(user));
		},
		clearStoreuser: () => {
			dispatch(clearUseraction());
		}
	}
}

