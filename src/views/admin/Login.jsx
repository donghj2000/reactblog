import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Checkbox, Tooltip, Form, Button, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { forgetPassword, login, jwtLogin, getUserDetail } from "../../api/service";
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "./../../store/actionCreators.js";
import { getCookie, setCookie, delCookie } from "./../../utils/index.js";
import "./Login.less";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: React.createRef(),
            loginRules: {
                username: [{required: true, message: "Please input your Username!"}],
                password: [{ required: true, 
                             message: "Please input your Password!",
                             validator: this.validatePassword }]
            },
            capsTooltip: false,
            loading: false
        }
    }

    validatePassword(_, value) {
        return (value && value.length >= 6) ? Promise.resolve() : Promise.reject(new Error("The password can not be less than 6 digits"));
    }

    checkCapslock(e) {
        const key  = e.target.value.charCodeAt(e.target.value.length-1);
        const capsTooltip = (key && key >= 65 && key <= 65+26);
        this.setState({ capsTooltip });
    }

    async onFinish(values) {
        console.log(values);

        if (values.remember) {
            setCookie("blogUsername", values.username, 30, 0, 0);            
            setCookie("blogPassword", values.password, 30, 0, 0);    
            setCookie("blogRemember", values.remember, 30, 0, 0);      
        } else {
            delCookie("blogUsername");
            delCookie("blogPassword");
            delCookie("blogRemember");
        }

        this.setState({ loading: true});
        const req = {
            username: values.username,
            password: values.password
        };
        try {
            let data = null;
            let user = null;
            let expire_days = 0;

            // 一，传统验证方式
            //data = await login(req));
            //user = data.data;

            // 二，jwt验证方式
            data = await jwtLogin(req);
            //三-1 jwt。服务器端生成cookie,键为jwt_cookie,js读不到，不需要客户端处理，浏览器会自己带上。
            //并且登陆后会返回用户信息(自己添加的)
            user = data.data.user;
            expire_days = data.data.expire_days;
            ////////////////////////////
            
            //三-2 simple-jwt。 浏览器自己保存,并在http请求header里自己手动带上。登陆后没有返回用户信息
            // setCookie("SimpleJwt", data.data.access, data.data.expire_days, 0, 0);
            // const id = data.data.id;
            // expire_days = data.data.expire_days;
            // data = await getUserDetail(id); 
            // user = data.data;
            ////////////////////////////

            message.success("登陆成功");
            this.setState({ loading: false });
            
            this.props.setStoreuser(user);
            let userInfo = JSON.stringify(user);
            setCookie("userInfo", userInfo, expire_days, 0, 0);

            if (user.is_superuser) {
                this.props.history.push("/admin");
            }  
        } catch(e) {
            console.error(e);
            this.setState({ loading: false });
        }
    }

    componentDidMount() {
        if (this.props.storeUser.is_superuser) {
            this.props.history.push("/admin");
        } else {
            let username = "",            
                password = "",   
                remember = getCookie("blogRemember");    

            if (remember==="true") {
                username = getCookie("blogUsername");            
                password = getCookie("blogPassword"); 

                this.refs.form.setFieldsValue({
                    username, password, remember
                });
            }
        }
    }

    render() {
        return (
            <div className="login-container">
                <Form
                  ref="form"
                  name="normal_login"
                  className="login-form"
                  onFinish={ (e)=>this.onFinish(e) }
                >
                    <div className="title-container">
                        <h3 className="title">博客管理后台</h3>
                    </div>
                    <Form.Item
                        name="username"
                        label="账号"
                        rules={ this.state.loginRules.username }
                    >
                        <Input 
                            ref="username"
                            autoComplete="true"
                            prefix={ <UserOutlined className="site-form-item-icon" /> } 
                            placeholder="username" 
                            tabIndex="1" 
                            type="text"/>
                    </Form.Item>
                    <Tooltip
                        visible={ this.state.capsTooltip }
                        placement="right" title="大写已打开" >
                        <Form.Item
                            label="密码"
                            name="password"
                            rules={ this.state.loginRules.password }
                        >
                            <Input
                              ref="password"
                              autoComplete="true"
                              prefix={ <LockOutlined className="site-form-item-icon" /> }
                              tabIndex="2"
                              type="password"
                              placeholder="Password"
                              onBlur={ ()=>this.setState({capsTooltip: false}) }
                              onKeyUp={ (e)=>this.checkCapslock(e) }
                            />
                        </Form.Item>
                    </Tooltip>
                    
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>
          
                    <Form.Item className="login-form-button">
                        <Button loading={ this.loading } type="primary" htmlType="submit">
                          确定
                        </Button>
                    </Form.Item>
                </Form>
            </div>  
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
