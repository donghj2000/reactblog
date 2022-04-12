import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import {  Form, Button, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { addMessage } from "../../api/service";
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "./../../store/actionCreators.js";
import "./../Admin/Login.less";

class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginRules: {
                email: [{ required: true, 
                          message: "Please input your Email!", 
                          validator: this.validatorEmail }]
            },
            email: "",
            content: "",
            phone: "",
            name: "",
            loading: false
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

    async onFinish(values) {
        this.setState({ loading: true});
        const req = {
    		email: values.email,
    		content: values.content,
    		phone: values.phone,
    		name: values.name
        };
        try {
            await addMessage(req);
            message.success("留言成功");
        } catch(e) {
            console.error(e);
            message.warning("留言失败");
        }
        
        this.setState({ loading: false });
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
                        <h3 className="title">留言</h3>
                    </div>
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={ this.state.loginRules.email }
                    >
                        <Input 
                            ref="email"
                            prefix={ <UserOutlined className="site-form-item-icon" /> } 
                            placeholder="请输入有效邮箱" 
                            tabIndex="1" 
                            type="text" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="&nbsp;&nbsp;&nbsp;手机"
                    >
                        <Input 
                            ref="phone"
                            autoComplete="true"
                            placeholder="手机" 
                            tabIndex="3" 
                            type="text"/>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="&nbsp;&nbsp;&nbsp;姓名"
                        rules={ this.state.loginRules.name }
                    >
                        <Input 
                            ref="name"
                            placeholder="username" 
                            tabIndex="4" 
                            type="text"/>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="&nbsp;&nbsp;&nbsp;内容"
                    >
                        <Input.TextArea
                            ref="content"
                            autoSize={{ minRows: 2 }}
                            placeholder="内容" 
                            tabIndex="2" 
                            type="text"/>
                    </Form.Item>
          
                    <Form.Item>
                        <Button loading={ this.loading } type="primary" htmlType="submit" className="login-form-button">
                          发送
                        </Button>
                    </Form.Item>
                </Form>
            </div>  
        )
    }
}

export default Message;
