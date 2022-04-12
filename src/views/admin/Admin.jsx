import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { Link, Route, Switch } from 'react-router-dom';
import { Menu, Layout } from 'antd'
import routers from '../../router/index.jsx';

import "antd/dist/antd.css";
import './Admin.less'

const { Header, Footer, Sider, Content } = Layout;

class Admin extends Component {
    constructor(props) {
        super(props);
    }

	  getMenuItems() {
		    let list=[];
		    routers.forEach((r, key) => {
            if (r.name=="Admin") {
                list = r.children.map((rchild, keychild)=>(
                    <Menu.Item key={ rchild.path } >
                        <rchild.icon style={{ width: '2em', height: '2em', marginRight: '10px' }}/>
                        <Link to={ `${rchild.path}` } activestyle={{ color: 'red' }}>
                            { rchild.name }
                        </Link>
                    </Menu.Item>
                ));
            }
        })
        return list;
    }

	  getRoutes() {
		    let list = [];
		    routers.forEach((r, key) => {
            if (r.name=="Admin") {
                list = r.children.map((rchild, keychild)=>(
                  <Route exact key={ rchild.path } path={ rchild.path }
                    component={ rchild.component }
                  />
                ));
            }
        });
        return list;
    }

    render() {
        return (
	        <Layout className="admin left view-content" >
              <Sider width={200} className="admin-menu">
                	<Menu mode="inline">
                      { this.getMenuItems() }
                  </Menu>
              </Sider>
              <Content className="admin-content">
                  <Switch>
                      { this.getRoutes() }
                  </Switch> 
              </Content>
	        </Layout>
        )
    }
}
export default Admin;
