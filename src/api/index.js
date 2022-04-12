import axios,{AxiosRequestConfig, AxiosResponse} from "axios";
import { message } from "antd";
import router from "../router";
import { getCookie } from "../utils";

const request = axios.create({
    baseURL: process.env.NODE_ENV === "development"? "/api":"/api",
})

//请求消息里增加csrf头
request.interceptors.request.use((config)=>{
    config.headers["X-CSRFToken"] = getCookie("csrftoken");
    //config.headers["Authorization"] = "SimpleJwt " + getCookie("SimpleJwt");  //simple-jwt
    return config;
})



request.interceptors.response.use(
    (response)=>{
        const data = response.data;
        //console.log('resp=>', response);
        return response;
    },
    (err)=>{
        console.log('err=>', err.message, err.response,message);
        if (err.response && err.response.data && err.response.data.detail) {
            message.error(err.response.data.detail);

        } else {
            message.error(err.message);
        }

        return Promise.reject(err.message);
    }
);
export default request;