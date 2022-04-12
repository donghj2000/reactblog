import React, { Component } from "react";
import { Modal, Button, Form, Input, Tooltip, TextArea, Upload, message } from "antd"
import { UserOutlined, LockOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { changePassword, saveUser } from "../api/service";
import { mapStateToProps, mapDispatchToProps } from "./../store/actionCreators";
import { getCookie, setCookie, delCookie } from "./../utils/index.js";
import "antd/dist/antd.css";
import "./../Views/admin/Login.less";

class RegisterAndLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginRules: {
                password: [{ required: true, 
                             message: "Please input your Password!" },
                             this.validatePassword ],
                email:    [{ required: true, 
                             message: "Please input your Email!", 
                             validator: this.validatorEmail }]
            },
            capsTooltip: false,
            loading: false,
            params: {
                id: 0,
                password: "",
                new_password: "",
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
            if (getFieldValue("new_password") === value) {
                return (value && value.length >= 6) ? Promise.resolve() : Promise.reject(new Error("The password can not be less than 6 digits"));
            }

            if (getFieldValue("new_password") === getFieldValue("new_password2")) {
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
        this.setState({ btnLoading: true });
        try {
            if (this.props.modifyFlag === "modifyInfo") {
                this.state.params.id = this.props.storeUser.id; 
                this.state.params.password = "";
                this.state.params.nickname = values.nickname;
                this.state.params.email = values.email;
                this.state.params.desc = values.desc;
                await saveUser("patch", this.state.params);
                message.success("修改个人信息成功. 请退出后重新登陆");

                let user = this.props.storeUser;
                user.nickname = this.state.params.nickname;
                user.email = this.state.params.email;
                user.desc = this.state.params.desc;
                user.avatar = this.state.params.avatar;
                this.props.setStoreuser(user);
                delCookie("userInfo");
            } else {
                this.state.params.password = values.password;
                this.state.params.new_password = values.new_password;
                await changePassword(this.state.params);
                message.success("修改密码成功.");
            }
            
            this.handleCancel();
        } catch(e) {
            console.error(e);
            message.error("修改失败");
        }

        this.clearData();
        this.setState({ btnLoading: false });
    }

    clearData() {
        if (this.props.modifyFlag === "modifyInfo") {
            this.refs.form.setFieldsValue({
                nickname: "",
                email: "",
                desc: ""
            });
        } else if (this.props.modifyFlag === "modifyPasswd") {
            this.refs.form.setFieldsValue({
                password: "",
                new_password: "",
                new_password2: "",
            });
        }    
        
        this.state.params = {
            id: 0,
            password: "",
            new_password: "",

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

    componentDidUpdate() {
        if (this.props.storeUser.id > 0 && this.props.modifyFlag == "modifyInfo") {
            if (this.refs && this.refs.form) {
                if (this.refs.form.getFieldValue("nickname") =="" || 
                    this.refs.form.getFieldValue("nickname") ==undefined) {
                    this.refs.form.setFieldsValue({
                        nickname: this.props.storeUser.nickname,
                        email: this.props.storeUser.email,
                        desc: this.props.storeUser.desc,
                    });
                } 
                if (this.state.params.id == 0) {
                    let params = this.state.params;
                    params.id = this.props.storeUser.id;
                    params.avatar = this.props.storeUser.avatar;
                    this.setState({ params });
                }
            }
        }
    }

    render() {
      return (
        <Modal
            visible={ this.props.modifyVisible }
            title={ this.props.modifyFlag == "modifyInfo"? "修改信息" : "修改密码" }
            onCancel={ ()=>this.handleCancel() }
            footer={ null }
            >
            <div className="login-container">
                <Form
                  ref="form"
                  name="normal_login"
                  className="login-form"
                  onFinish={ (e)=>this.onFinish(e) }
                  style={{ height: this.props.modifyFlag == "modifyInfo"? "400px" : "220px" }}
                >
                    {   
                        this.props.modifyFlag=="modifyInfo"?
                        (<>
                            <Form.Item
                                name="nickname"
                                label="昵称"
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
                                    ref="username"
                                    prefix={ <UserOutlined className="site-form-item-icon" /> } 
                                    placeholder="请输入有效邮箱" 
                                    tabIndex="5" 
                                    type="text" />
                            </Form.Item>

                            <Form.Item
                                name="desc"
                                label="简介"
                            >
                                <Input.TextArea
                                    ref="desc"
                                    prefix={ <UserOutlined className="site-form-item-icon" /> } 
                                    placeholder="简介" 
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
                        </>):
                        (<>
                            <Tooltip
                                visible={ this.state.capsTooltip }
                                placement="right" title="大写已打开" >
                                <Form.Item
                                    label="旧密码    "
                                    name="password"
                                    rules={ this.state.loginRules.password }
                                >
                                    <Input
                                      ref="password"
                                      prefix={ <LockOutlined className="site-form-item-icon" /> }
                                      tabIndex="2"
                                      type="password"
                                      placeholder="旧密码"
                                      onBlur={ ()=>this.setState({ capsTooltip: false }) }
                                      onKeyUp={ (e)=>this.checkCapslock(e) }
                                    />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip
                                visible={ this.state.capsTooltip }
                                placement="right" title="大写已打开" >
                                <Form.Item
                                    label="新密码    "
                                    name="new_password"
                                    rules={ this.state.loginRules.password }
                                >
                                    <Input
                                      ref="new_password"
                                      prefix={ <LockOutlined className="site-form-item-icon" /> }
                                      tabIndex="3"
                                      type="password"
                                      placeholder="新密码"
                                      onBlur={ ()=>this.setState({ capsTooltip: false }) }
                                      onKeyUp={ (e)=>this.checkCapslock(e) }
                                    />
                                </Form.Item>
                            </Tooltip>

                            <Tooltip
                                visible={ this.state.capsTooltip }
                                placement="right" title="大写已打开" >
                                <Form.Item
                                    label="确认新密码"
                                    name="new_password2"
                                    rules={ this.state.loginRules.password }
                                >
                                    <Input
                                      ref="new_password2"
                                      prefix={ <LockOutlined className="site-form-item-icon" /> }
                                      tabIndex="3"
                                      type="password"
                                      placeholder="确认新密码"
                                      onBlur={ ()=>this.setState({ capsTooltip: false }) }
                                      onKeyUp={ (e)=>this.checkCapslock(e) }
                                    />
                                </Form.Item>
                            </Tooltip>
                        </>)
                    }

                    <Form.Item className="login-form-button"> 
                        <Button loading={ this.btnLoading } type="primary" htmlType="submit">
                            确定
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterAndLogin));
