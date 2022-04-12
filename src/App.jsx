import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import { Layout, Menu } from "antd";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router"
import Nav from "./components/Nav.jsx";
import Home      from "./views/client/Home";
import ArticleDetail      from "./views/client/ArticleDetail";

import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "./store/actionCreators.js";

import routers from "./router/index.jsx";
import "antd/dist/antd.css";
import "./App.css";
import "./index.css";

const { Header, Footer, Content } = Layout;
class App extends Component{
  getRoutes() {
    let list = [];
    routers.forEach((r, key) => {
        if (r.path!="/admin") {
            if (r.exact) {
              list.push(
                <Route exact key={r.path} path={r.path}
                  component={r.component}
                />)
            }
            else {
              list.push(
                <Route key={r.path} path={r.path}
                  component={r.component}
                />)
            }
        } else {
          list.push(<Route key="/admin" path="/admin"
                        render={() =>
                            (this.props.storeUser.id>0 && this.props.storeUser.is_superuser) ?
                            (<r.component />):(<Redirect to="/login" />)
                        } 
                    />);
        }
    }) 

    return list;
  }

  render() {
    return (
      <BrowserRouter >
          <Layout className="container">
              <Header>
                  <Nav /> 
              </Header>
              <Content className="layout">
                  <Switch >
                      {this.getRoutes()}
                  </Switch>        
              </Content>
          </Layout>
      </BrowserRouter>
    )
  }
}
App.propTypes = {
    history: PropTypes.object,
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
