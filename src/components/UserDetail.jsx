import React, { Component } from "react";
import "antd/dist/antd.css";
import { Drawer, Descriptions } from "antd";

import { getUserDetail } from "../api/service";

class UserDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            userId: 0
        }
    }
    
    async handleSearch() {
        if (this.state.userId != 0) {
            const data = await getUserDetail(this.state.userId)
            this.setState({user: data.data});
        }
    }

    componentWillReceiveProps(nextProps) {
        this.state.userId = nextProps.userId;
        this.handleSearch();
    }

    render() {
      return (
        <Drawer
            visible={ this.props.visible }
            onClose={ ()=>this.props.onClose() }
            title={ "用户详情" }
            width={ 1000 }
        >
            <Descriptions column="1" bordered style={{ padding: "24px",
                                              marginTop: "-12px",
                                              borderTop: "#eeeeee 3px solid" }}
                >
                <Descriptions.Item label="用户名">{ this.state.user.username }</Descriptions.Item>
                <Descriptions.Item label="是否是管理員">{ this.state.user.is_superuser? "是" : "否" }</Descriptions.Item>
                <Descriptions.Item label="状态">{ this.state.user.is_active? "启用中" : "禁用" }</Descriptions.Item>
                <Descriptions.Item label="邮箱">{ this.state.user.email }</Descriptions.Item>
                <Descriptions.Item label="创建时间">{ this.state.user.created_at }</Descriptions.Item>
                <Descriptions.Item label="最后登录时间">{ this.state.user.last_login }</Descriptions.Item>
            </Descriptions>
        </Drawer>
      )
    }
}

export default UserDetail;
