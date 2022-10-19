import React, { Component } from "react";
import { Checkbox, Modal, Button, Form, Input, Tooltip, TextArea, Upload, message, Popconfirm, Space } from "antd"
import { UserOutlined, LockOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { login, jwtLogin, register, getUserDetail, forgetPassword } from "../api/service";
import { mapStateToProps, mapDispatchToProps } from "./../store/actionCreators";
import { getCookie, setCookie, delCookie } from "./../utils/index.js";
import "antd/dist/antd.css";
import "./../Views/admin/Login.less";

class RegisterAndLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginRules: {
                username: [{ required: true, message: "Please input your Username!"}],
                password: [{ required: true, 
                             message: "Please input your Password!" },
                             this.validatePassword ],
                email:    [{ required: true, 
                             message: "Please input your Email!", 
                             validator: this.validatorEmail }]
            },
            capsTooltip: false,
            loading: false,
            user: null,
            params: {
                username: "",
                password: "",
                nickname: "",
                avatar:"",
                email: "",
                desc: ""
            }
        }
    }

    validatorEmail(_, value) {
        const reg = new RegExp(
            "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
        );

        if (!value) {
            return Promise.reject(new Error("邮箱不能为空"));
        } else if (!reg.test(value)) {
            return Promise.reject(new Error("请输入格式正确的邮箱"));
        }

        return Promise.resolve();
    }

    validatePassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (getFieldValue("password") === value) {
                return (value && value.length >= 6) ? Promise.resolve() : Promise.reject(new Error("The password can not be less than 6 digits"));
            }

            if (getFieldValue("password2") === getFieldValue("password")) {
                return Promise.resolve();
            } 

            return Promise.reject(new Error("The two passwords that you entered do not match!"));
        }
    })

    checkCapslock(e) {
        const key  = e.target.value.charCodeAt(e.target.value.length-1);
        const capsTooltip = (key && key >= 65 && key <= 65+26);
        this.setState({capsTooltip});
    }

    async onFinish(values) {
        if (values.remember) {
            setCookie("blogUsername", values.username, 30, 0, 0);            
            setCookie("blogPassword", values.password, 30, 0, 0);    
            setCookie("blogRemember", values.remember, 30, 0, 0);      
        } else {
            delCookie("blogUsername");
            delCookie("blogPassword");
            delCookie("blogRemember");
        }

        this.state.params.username = values.username;
        this.state.params.password = values.password;
        let data = "";
        this.setState({ btnLoading: true });
        try {
            if (this.props.loginFlag === "register") {
                this.state.params.nickname = values.nickname;
                this.state.params.email = values.email;
                this.state.params.desc = values.desc;
                data = await register(this.state.params);
                message.success("注册成功." + data.data.detail, 10);
            } else {
                let user = null;
                let expire_days = 0;
                const req = {
                    username: values.username,
                    password: values.password
                };
                // 一，session 验证方式
                // data = await login(req);
                // user = data.data;
                // if (user.detail) {
                //     message.error("登陆失败."+user.detail);
                //     return ;
                // }
                // 二，jwt 验证方式
                data = await jwtLogin(req);
               
                //二-1 jwt。服务器端生成cookie,键为jwt_cookie,js读不到，不需要客户端处理，浏览器会自己带上。
                //并且登陆后会返回用户信息(自己添加的)
                user = data.data.user;
                expire_days = data.data.expire_days;
                ///////////////////////////////

                //二-2 simple-jwt。 浏览器自己保存,并在http请求header里自己手动带上。登陆后没有返回用户信息
                // setCookie("SimpleJwt", data.data.access, data.data.expire_days, 0, 0);
                // const id = data.data.id;
                // expire_days = data.data.expire_days;
                // data = await getUserDetail(id); 
                // user = data.data;
                ///////////////////////////////
                message.success("登陆成功");
                
                this.props.setStoreuser(user);
                let userInfo = JSON.stringify(user);
                setCookie("userInfo", userInfo, data.data.expire_days, 0, 0);

                if (user.is_superuser) {
                    this.props.history.push("/admin");
                }  
            }
            
            this.handleCancel();
        } catch(e) {
            message.warning("登陆失败,用户名或密码错误,或账号未激活."+e);
        }

        this.clearData();
        this.setState({ btnLoading: false });
    }

    clearData() {
        if (!(this.refs && this.refs.form)) 
            return;

        if (this.props.loginFlag === "register") {
            this.refs.form.setFieldsValue({
                username: "",
                password: "",
                password2: "",
                nickname: "",
                email: "",
                desc: ""
            });
        } else if (this.props.loginFlag === "login") {
            this.refs.form.setFieldsValue({
                username: "",
                password: ""
            });
        }    
        
        this.state.params = {
            id: 0,
            username: "",
            password: "",
            password2: "",
            nickname: "",
            avatar:"",
            email: "",
            desc: ""
        };
    }
    handleCancel() {
        this.clearData();
        this.props.onClose();
    }

    uploadSuccess = info => {
        if (info.file.status === "uploading") {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === "done") {
            let params = this.state.params;
            params.avatar = info.file.response.url; 
            this.setState({
                params,
                loading: false
            })
        }
    }
    
    beforeUpload(file) {
        const isImage = ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type);
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            message.error("上传图片只能是 JPG 格式!");
        }
        if (!isLt2M) {
            message.error("上传图片大小不能超过 2MB!");
        }

        return isImage && isLt2M;
    }

    sendNewPasswd() {
        this.refs.form.validateFields(["username"])
        .then(async (res)=>{
            try {
                let username = this.refs.form.getFieldValue("username");
                let data = await forgetPassword({username});
                message.info(data.data.detail);
            } catch(e) {
                message.success("更新密码失败");
            }
        });
    }

    componentWillReceiveProps(nextProps,prevProps) {
        if (nextProps.loginFlag == "login" && nextProps.loginVisible == true) {
            if (this.refs && this.refs.form) {
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
    }

    render() {
      return (
        <Modal
            visible={ this.props.loginVisible }
            title={ this.props.loginFlag=="login"? "登陆":"注册" }
            onCancel={ ()=>this.handleCancel() }
            footer={ null }
        >
            <div className="login-container">
                <Form
                  ref="form"
                  name="normal_login"
                  className="login-form"
                  onFinish={ (e)=>this.onFinish(e) }
                  style={{ height: this.props.loginFlag=="login"? "220px" : "550px" }}
                >
                    <Form.Item
                        name="username"
                        label="账号"
                        rules={ this.state.loginRules.username }
                    >
                        <Input 
                            ref="username"
                            prefix={ <UserOutlined className="site-form-item-icon" /> } 
                            placeholder="请输入账号" 
                            tabIndex="1" 
                            type="text" />
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
                              prefix={ <LockOutlined className="site-form-item-icon" /> }
                              tabIndex="2"
                              type="password"
                              placeholder="密码"
                              onBlur={ ()=>this.setState({ capsTooltip: false }) }
                              onKeyUp={ (e)=>this.checkCapslock(e) }
                            />
                        </Form.Item>
                    </Tooltip>

                    { this.props.loginFlag === "login"?
                    (       
                        <Space size="middle">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Popconfirm placement="right" title="新密码将发送到你注册的邮箱中，确定吗？" 
                                onConfirm={ ()=>this.sendNewPasswd() } 
                                okText="Yes" cancelText="No"
                            >
                                <Button type="text">
                                    忘记密码
                                </Button>
                            </Popconfirm>
                        </Space>
                    ):
                    (<>
                        <Tooltip
                            visible={ this.state.capsTooltip }
                            placement="right" title="大写已打开" >
                            <Form.Item
                                label="密码"
                                name="password2"
                                rules={ this.state.loginRules.password }
                            >
                                <Input
                                  ref="password2"
                                  prefix={ <LockOutlined className="site-form-item-icon" /> }
                                  tabIndex="3"
                                  type="password"
                                  placeholder="确认密码"
                                  onBlur={ ()=>this.setState({ capsTooltip: false }) }
                                  onKeyUp={ (e)=>this.checkCapslock(e) }
                                />
                            </Form.Item>
                        </Tooltip>

                        <Form.Item
                            name="nickname"
                            label="&nbsp;&nbsp;&nbsp;昵称"
                        >
                            <Input 
                                ref="nickname"
                                prefix={ <UserOutlined className="site-form-item-icon" /> } 
                                placeholder="昵称" 
                                tabIndex="4" 
                                type="text"/>
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="邮箱"
                            rules={ this.state.loginRules.email }
                        >
                            <Input 
                                ref="email"
                                prefix={ <UserOutlined className="site-form-item-icon" /> } 
                                placeholder="用于接收注册验证码，修改密码等。" 
                                tabIndex="5" 
                                type="text" />
                        </Form.Item>

                        <Form.Item
                            name="desc"
                            label="&nbsp;&nbsp;&nbsp;简介"
                        >
                            <Input.TextArea
                                ref="desc"
                                prefix={ <UserOutlined className="site-form-item-icon" /> } 
                                placeholder="个人简介" 
                                tabIndex="6" 
                                type="text"/>
                        </Form.Item>

                        <Form.Item label="头像">
                            <Upload
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={ false }
                                action="/api/upload/avatar"
                                beforeUpload={ this.beforeUpload.bind(this) }
                                onChange={ this.uploadSuccess }
                            >
                                { this.state.params.avatar ? 
                                    <img src={ this.state.params.avatar } alt="avatar" style={{ width: "100%" }} className="avatar" /> : 
                                    <div>
                                        { this.state.loading ? 
                                            <LoadingOutlined /> : <PlusOutlined /> 
                                        }
                                    </div>
                                }
                            </Upload>
                        </Form.Item>
                    </>)
                    }
                    <Form.Item className="login-form-button">
                        <Button loading={ this.btnLoading } type="primary" htmlType="submit">
                            确定
                        </Button>
                    </Form.Item>
                </Form>

                { this.props.loginFlag === "login"?
                        (   <div className="thirdparty-button">
                                <h5>使用第三方帐号登录</h5>    
                                <Space size="middle">
                                    <a className="qq" href="http://127.0.0.1:8000/login/qq/">qq</a>
                                    <a className="sina" href="http://127.0.0.1:8000/login/weibo/">weibo</a>
                                    <a className="weixin" href="http://127.0.0.1:8000/login/weixin/">weixin</a>
                                </Space>
                            </div>
                        ):""
                    }
            </div>
                    
        </Modal>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterAndLogin));
