import { SET_USER, CLEAR_USER, SET_COMMENTPARAMS} from "./constants.js";

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

export const setComParamsaction = (comParams) => {
    return {
        type: SET_COMMENTPARAMS,
        comParams,
    };
};

export const mapStateToProps = (state) => {
    return {
        storeUser: state.user,
        storeComParams: state.comParams
    }
};

export const mapDispatchToProps = (dispatch) => {
    return {
        setStoreuser: (user) => {
            dispatch(setUseraction(user));
        },
        clearStoreuser: () => {
            dispatch(clearUseraction());
        },
        setStoreComParams: (comParams) => {
            dispatch(setComParamsaction(comParams))
        }
    }
}

