import React, { Component } from "react";
import Comment from "./Comment.jsx";
import { timestampToTime } from "../utils";
import { getArticleComments } from "../api/service";
import { Input, Button, Modal, message } from "antd";
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './../store/actionCreators.js';
import "antd/dist/antd.css";
import "./CommentList.less";
import ReplyTree from "./ReplyTree.jsx";

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
        this.props.setStoreComParams({commentId: 0, commentVisible: false});
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
        this.props.setStoreComParams({commentId: 0, commentVisible: false});
        await this.getArticleCommentList();
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
                this.state.comments.length > 0?
                (<ReplyTree replies={ this.state.comments } level={0} />):""
            } 

            <Comment 
                articleId={ this.props.articleId }
                forArticle={ false }
                reply={ this.props.storeComParams.commentId }
                showDialog={ this.props.storeComParams.commentVisible }
                onCancel={ this.handleCancel.bind(this) }
                onOk={ this.handleOk.bind(this) }
            />
        </div>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentList);
