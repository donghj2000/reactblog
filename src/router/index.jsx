import Loadable from "react-loadable";
import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { DashboardOutlined, FileOutlined, CommentOutlined,UserOutlined,
         TagOutlined} from "@ant-design/icons";

import Home          from "../views/client/Home"
import Search        from "../views/client/Search"
import ArticleDetail from "../views/client/ArticleDetail"
import Catalog       from "../views/client/Catalog"
import Archive       from "../views/client/Archive"
import Message       from "../views/client/Message"
import Login         from "../views/admin/Login"
import Admin         from "../views/admin/Admin"
import Dashboard     from "../views/admin/Dashboard"
import Article       from "../views/admin/Article"
import Tag           from "../views/admin/Tag"
import Comment       from "../views/admin/Comment"
import User          from "../views/admin/User"
import MessageAdmin       from "../views/admin/Message"

const loadingComponent = ({ error, pastDelay }) => {
  if (error) {
    return <div>Error!</div>;
  } else if (pastDelay) {
    return <div />;
  } else {
   return null;
  }
};

let config = [
  {
    path: "/",
    name: "主页",
    exact: true,
    isNav: true,
    //component: Home
    component: Loadable({
                  loader: () => import("../views/client/Home"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/search",
    name: "搜索",
    exact: false,
    isNav: false,
    //component: Search
    component: Loadable({
                  loader: () => import("../views/client/Search"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },

  {
    path: "/articledetail/:id",   //此路由是从a链接里跳转过来的
    name: "ArticleDetail",
    exact: false,
    isNav: false,
    //component: ArticleDetail
    component: Loadable({
                  loader: () => import("../views/client/ArticleDetail"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/catalog",
    name: "分类",
    exact: true,
    isNav: true,
    //component: Catalog
    component: Loadable({
                  loader: () => import("../views/client/Catalog"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/archive",
    name: "归档",
    exact: true,
    isNav: true,
    //component: Archive
    component: Loadable({
                  loader: () => import("../views/client/Archive"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/message",
    name: "留言",
    exact: true,
    isNav: true,
    //component: Message
    component: Loadable({
                  loader: () => import("../views/client/Message"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/about",
    name: "关于",
    exact: true,
    isNav: true,
    //component: ArticleDetail
    component: Loadable({
                  loader: () => import("../views/client/ArticleDetail"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/login",
    name: "Login",
    exact: true,
    isNav: false,
    //component: Login
    component: Loadable({
                  loader: () => import("../views/admin/Login"),
                  loading: loadingComponent,
                  delay: 300,
                }),
  },
  {
    path: "/admin",
    name: "Admin",
    exact: false,
    isNav: false,
    //component: Admin,
    component: Loadable({
                  loader: () => import("../views/admin/Admin"),
                  loading: loadingComponent,
                  delay: 300,
                }),

    children: [
            {
                path: "/admin",
                name: "Dashboard",
                exact: true,
                isNav: false,
                //component:Dashboard,
                icon: DashboardOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/Dashboard"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },

            {
                path: "/admin/article",
                name: "文章",
                exact: true,
                isNav: true,
                //component: Article,
                icon: FileOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/Article"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },
            {
                path: "/admin/tag",
                name: "标签",
                exact: true,
                isNav: true,
                //component: Tag,
                icon: TagOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/Tag"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },
            {
                path: "/admin/comment",
                name: "评论",
                exact: true,
                isNav: true,
                //component: Comment,
                icon: CommentOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/Comment"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },
            {
                path: "/admin/user",
                name: "用户",
                exact: true,
                isNav: true,
                //component: User,
                icon: UserOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/User"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },
            {
                path: "/admin/message",
                name: "留言",
                exact: true,
                isNav: true,
                //component: MessageAdmin,
                icon: CommentOutlined,
                component: Loadable({
                              loader: () => import("../views/admin/Message"),
                              loading: loadingComponent,
                              delay: 300,
                            }),
            },
        ]
  }
];

export default config;
