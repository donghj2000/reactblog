import React, { Component } from "react";
import Comment from "./Comment.jsx";
import { timestampToTime } from "../utils";
import { getArticleComments } from "../api/service";
import { Input, Button, Modal, message } from "antd";
import store from "./../store/index.js";
import "antd/dist/antd.css";
import "./CommentList.less";

class CommentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            comment_id: 0,
            comments: [],
            reply: 0,
            articleId: props.articleId
        }
    }

    handleCancel() {
        this.setState({ visible: false });
    }

    async getArticleCommentList() {
        try {
            const response = await getArticleComments(this.props.articleId);
            let comments = response.data.results.filter(comment=>{
                  return comment.reply == null;
            });
            this.setState({ comments: comments });
        } catch (e) {
            console.error(e);
        }
    }

    async handleOk() {
        this.setState({ visible: false });
        await this.getArticleCommentList();
    }

    showCommentModal(commentId, user, secondUser) {
        if (store.getState().user.id === 0) {
            message.warning("登录才能评论，请先登录!");
            return;
        }
        if (!store.getState().user.is_active) {
            message.warning("请先激活账号!");
            return;
        }
        // 添加三级评论(暂无)
        // if (secondUser) {
        //     this.setState({comment_id: commentId});
        // } else {
            //添加二级评论
            this.setState({comment_id: commentId});
        //}
        this.setState({ visible: true });
    }

    componentDidMount() {
        this.getArticleCommentList();
    }

    render() {
      return (
        <div className="comment-list">
            <div className="top-title">
                <span>{ this.props.numbers }条评论</span>
            </div>

            {
                this.state.comments.map(item=>{
                return (
                    <div className="item" key={item.id}>
                        <div className="item-header">
                            <div className="author">
                                <div className="avatar">
                                    {
                                        item.user_info.avatar?
                                        (<img src={ item.user_info.avatar } alt="默认图片"  />):
                                        (<img src="../assets/avatar.png"  alt="" />)
                                    }
                                </div>
                            </div>
                            <div className="info">
                                <div className="name">
                                    { item.user_info.name }
                                    { item.user_info.role === "Admin"?"(作者)":"" }
                                </div>
                                <div className="time">{ timestampToTime(item.created_at, true) }</div>
                            </div>
                        </div>
                        <div className="comment-detail">{ item.content }</div>
                        <div className="item-comment">
                            <div className="message"> 
                                <Button type="primary" 
                                    onClick={ ()=>this.showCommentModal(item.id, item.user_info.id) }>
                                    回复    
                                </Button>   
                            </div>
                        </div>
                        {
                            item.comment_replies.map(e=>{
                            return (
                                <div className="item-other" key={ e.id }>
                                    <div className="item-header">
                                        <div className="author">
                                            <div className="avatar">
                                            {
                                                e.user_info.avatar?
                                                (<img src={ e.user_info.avatar } alt="默认图片" />):
                                                (<img src="../assets/avatar.png" alt="" />)
                                            }
                                            </div>
                                        </div>
                                        <div className="info">
                                            <div className="name">
                                                { e.user_info.name }
                                                { e.user_info.role === "Admin"?"(作者)":"" }
                                            </div>
                                            <div className="time">
                                                { timestampToTime(e.created_at, true) }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="comment-detail">
                                        { e.content }
                                    </div>
                                </div>
                                )
                            })
                        }
                    </div>) 
                })
            } 

            <Comment 
                articleId={ this.props.articleId }
                forArticle={ false }
                reply={ this.state.comment_id }
                showDialog={ this.state.visible }
                onCancel={ this.handleCancel.bind(this) }
                onOk={ this.handleOk.bind(this) }
            />
        </div>
      )
    }
}
export default CommentList;
