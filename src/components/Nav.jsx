import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { Menu, Row, Col, Button, Dropdown, Space, Form, Input } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import routers from "../router/index.jsx";
import RegisterAndLogin from "./RegisterAndLogin.jsx";
import ModifyInfoAndPasswd from "./ModifyInfoAndPasswd.jsx";
import { logout } from "../api/service";
import { mapStateToProps, mapDispatchToProps } from "./../store/actionCreators.js";
import { getCookie, setCookie, delCookie } from "./../utils/index.js";

import "antd/dist/antd.css";
import "./Nav.less"

const { SubMenu } = Menu;

class Nav extends Component {
	constructor(props) {
		super(props);
		this.state = {
			text: "",
			isLogin: false,
			loginFlag: "",
            loginVisible: false,
            modifyFlag: "",
            modifyVisible: false
		};
	}
 
	getDropdownMenu() {
		return (
		<Menu>
			<Menu.Item key="1" icon={ <UserOutlined /> }>
				<div style={{ width: "80px", textAlign: "center" }}  
					onClick={ ()=>this.handleClick() } >
				    登出
				</div>
			</Menu.Item>
			<Menu.Item key="2" icon={ <UserOutlined /> }>
				<div style={{ width: "80px", textAlign: "center" }}  
					onClick={ ()=>this.handleClick("modifyInfo") } >
				    修改信息
				</div>
			</Menu.Item>
			<Menu.Item key="3" icon={ <UserOutlined /> }>
				<div style={{ width: "80px", textAlign: "center" }}  
					onClick={ ()=>this.handleClick("modifyPasswd") } >
				    修改密码
				</div>
			</Menu.Item>
		</Menu>
		);
	}

	async handleClick(route) {  
        if (["login", "register"].includes(route)) {          
            this.setState({
                loginFlag: route,
                loginVisible: true
            })
        } else if (["modifyInfo", "modifyPasswd"].includes(route))	{
        	this.setState({
            	modifyFlag: route,
            	modifyVisible: true
        	});
		}
        else {
        	//一，传统方式退出
            //await logout();

			//二，jwt退出
			delCookie("userInfo");
            this.props.clearStoreuser();
        }
    }

	getMenuItems() {
		let list = [];
		routers.forEach((r, key) => {
            if (r.isNav) {
                list.push (
                    <Menu.Item key={r.path} >
                        <Link to={ `${r.path}` } activestyle={{ color: "red" }}>
                             { r.name }
                        </Link>
                    </Menu.Item>
                )
            }
        });
                                    
        return list;
	}
	
    onTextChange(event) {
        this.setState({ text: event.target.value });
    }
    handleSearch() {
    	if (this.state.text != "") {
    		let text = this.state.text;
    		this.props.history.push({
    		    pathname: "/search",
    		    state: {text: text}
    		});
    	}
    }

	render() {
		return (
			<div className="nav">
        		<div className="nav-content">
					<Row gutter={ [16, 16] }>
						<Col span={4} style={{ height: "100%" }}>
							<Link to="/">
			                    <img className="logo" 
			                        src="../assets/logo.png" alt="我的头像" />
			                </Link>
		                </Col>
		                <Col span={10}>
							<Menu mode="horizontal" className="app-header-menu">
                                { this.getMenuItems() }
					      	</Menu>
				      	</Col>

				      	<Col span={5}>
				      		<div style={{ marginTop : "15px" }}>
				                <Space size="middle">
				                    <Input ref="text" value={ this.state.text } placeholder="搜索内容"
				                        onChange={ this.onTextChange.bind(this) }
				                        onPressEnter={ ()=>this.handleSearch() } />
				                    <Button loading={ this.state.isLoading } 
				                        type="primary" icon={ <SearchOutlined /> }                       
				                        onClick={ ()=>this.handleSearch() }>
				                        搜索
				                    </Button>
				                </Space>
				            </div>
				      	</Col>

				      	<Col span={3}>
				      		{
				      			this.props.storeUser.id > 0 ?
				      			(<div className="nav-right">
				      				<Dropdown overlay={ this.getDropdownMenu() } placement="bottomCenter">
									    <div> 
										    <span className="ant-dropdown-link" >
	                                	    { 
	                                	    	this.props.storeUser.username ? 
	                                	    	this.props.storeUser.username : this.props.storeUser.nickname
	                            		    }
	                            		    </span>
	                            		    {   this.props.storeUser.avatar ?
	                            		    	(<img
				                                    alt="我的头像"
				                                    className="user-img"
				                                    src={ this.props.storeUser.avatar }
					                            />):
					                            (<img
					                                alt="我的头像"
					                                className="user-img"
					                                src="../assets/avatar.png"                                 
					                            />)
	                            		    }
	                        		    </div>
								  	</Dropdown>
				      			</div>):
				      			(
				      			<div className="nav-right">
					      			<Space size="middle">
					      				<Button loading={ this.loading } type="primary" 
					      				    onClick={ ()=>this.handleClick("login") } >
	                          				登陆
	                        			</Button>
					      				<Button loading={ this.loading } type="primary" 
					      				    onClick={ ()=>this.handleClick("register") }>
	                          				注册
	                        			</Button>
	                        		</Space>
			                    </div>
				      			)
				      		}
				      		<RegisterAndLogin
				                  loginFlag={ this.state.loginFlag }
				                  loginVisible={ this.state.loginVisible }
				                  onClose={ ()=>this.setState({ loginVisible: false, loginFlag:"" }) }
				            />
				            
				            <ModifyInfoAndPasswd
				                  modifyFlag={ this.state.modifyFlag }
				                  modifyVisible={ this.state.modifyVisible }
				                  onClose={ ()=>this.setState({ modifyVisible: false, modifyFlag:"" }) }
				            />
				      	</Col>
			    	</Row>
        		</div>
        	</div>
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Nav));
