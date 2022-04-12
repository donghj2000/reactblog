import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Tag, Button, message } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { timestampToTime } from "../../utils";
import markdown from "../../utils/markdown";
import Loading from "../../components/Loading.jsx";
import CommentList from "../../components/CommentList.jsx";
import Comment from "../../components/Comment.jsx";
import { getArticleDetail, postLikeArticle,getArticleList } from "../../api/service";
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "./../../store/actionCreators.js";

import "./ArticleDetail.less"

class ArticleDetail extends Component {
	constructor(props) {
		super(props);
		this.state = {
            btnLoading: false,
            isLoadEnd: false,
            isLoading: false,
            articleId: Number(this.props.match.params.id),
            content: "",
            detail: {
                id: 0,
                title: "",
                excerpt: "",
                keyword: "",
                cover: "",
                markdown: "",
                created_at: "",
                modified_at: "",
                tags_info: [],
                catalog_info: {} ,
                views: 0,
                comments: 0,
                words: 100,
                likes: 0,
                author: "我的",
            },
            cacheTime: 0,
            times: 0, 
            likeTimes: 0 
        }
	}

	async handleSearch() {
        this.setState({ isLoading: true });
        try {
        	const data = await getArticleDetail(this.state.articleId);
            this.setState({ detail: data.data });
            const article = await markdown.marked(this.state.detail.markdown);
            const detail = this.state.detail;
            detail.html = article.content;
            detail.toc = article.toc;
            this.setState({ detail: detail });
  
            document.title = this.state.detail.title;
            document.querySelector("#keywords").setAttribute("content", this.state.detail.keyword);
            document.querySelector("#description")
                .setAttribute("content", this.state.detail.excerpt);
        } catch (e) {
            console.error(e);
        }
        this.setState({isLoading: false});
    }

    async likeArticle() {
        if (!this.state.detail.id) {
            message.warning("该文章不存在");
            return;
        }

        if (this.state.likeTimes > 0) {
            message.warning("您已经点过赞了！悠着点吧!");
            return;
        }

        const user_id = this.props.storeUser.id;
        if (user_id === 0) {
            message.warning("登录才能点赞，请先登录!");
            return;
        }
        if (!this.props.storeUser.is_active) {
            message.warning("请先激活账号!");
            return;
        }

        let params = {
            article: this.state.detail.id,
            user: user_id
        };
        this.setState({isLoading: true});
        try {
            await postLikeArticle(params);
            let detail = this.state.detail;
            detail.likes++;
            this.setState({
                likeTimes: this.state.likeTimes+1,
                detail: detail
            });
            message.success("操作成功!");
        } catch (e) {
            console.error(e);
        }
        this.setState({ isLoading: false });
    }

    getCommentList() {
        this.refs.CommentList.getArticleCommentList();
    }
   
    componentDidMount() {
    	let articleId = 0;
        if (this.props.match.path === "/about") {
            articleId = 1;
        } else {
            articleId = Number(this.props.match.params.id);
        }        

        this.setState({ articleId: articleId });
        this.state.articleId = articleId;
        this.handleSearch();
    }

    componentWillunmount() {
        document.title = "我的博客网站";
        document
            .getElementById("keywords")
            .setAttribute("content", "我的博客网站");
        document
            .getElementById("description")
            .setAttribute(
                "content",
                "我的博客网址"
            );
    }
    
    render() {
        return (
            <div className="view-content">
		        <div className="article clearfix">
			        {   !this.state.isLoading ?
			            (<>
                            <div  className="article-left fl">
    			                <div className="header">
    			                    <h1 className="title">{ this.state.detail.title }</h1>
    			                    <div className="author">
    			                        <div className="avatar">
    			                            <img alt="我的头像" className="auth-logo" src="../../assets/avatar.png" />		                        
    			                        </div>
    			                        <div className="info">
    			                            <span className="name">
    			                                <span>{ this.state.detail.author }</span>
    			                            </span>
    			                            <div data-author-follow-button="" props-data-classes="user-follow-button-header" />
    			                            <div className="meta">
    			                                <span className="publish-time">
    			                                    { this.state.detail.created_at? timestampToTime(this.state.detail.created_at, true) : ""}
    			                                </span>
    			                                <span className="wordage">字数 { this.state.detail.words }</span>
    			                                <span className="views-count">阅读 { this.state.detail.views }</span>
    			                                <span className="comments-count">评论 { this.state.detail.comments }</span>
    			                                <span className="likes-count">喜欢 { this.state.detail.likes }</span>
    			                            </div>
    			                        </div>
    			                        <div className="tags" title="标签">
    			                            { this.state.detail.tags_info.map(tag => (<Tag className="tag" key={ tag.id }> { tag.name } </Tag>)) }
    			                        </div>
    			                        <span className="clearfix" />
    			                    </div>
    			                </div>
    			                <div className="content">
    			                    <div id="content" className="article-detail" dangerouslySetInnerHTML={{ __html:this.state.detail.html }}></div>
    			                </div>
    			                <div className="heart">
    			                    <Button loading={ this.state.isLoading } icon={ <HeartFilled /> } size="large" type="danger" onClick={ this.likeArticle.bind(this) }>
    			                        点赞
    			                    </Button>
    			                </div>

                                <Comment articleId={ this.state.articleId } 
                                    forArticle={ true } showDialog={ false } 
                                    onOk={ this.getCommentList.bind(this) } />
    			                <CommentList ref="CommentList" 
                                    articleId={ this.state.articleId } 
                                    numbers={ this.state.detail.comments } />
    			            </div>
                            <div className="article-right fr anchor"
                               dangerouslySetInnerHTML={{ __html:this.state.detail.toc }}>
                            </div>
                        </>
                        ) : 
                        (<div  className="article-left fl">
                            <Loading tips="拼命加载中------"/>
                         </div>
                        )
			        }
		        </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ArticleDetail);
