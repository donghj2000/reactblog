import React, { Component } from "react";
import Comment from "./Comment.jsx";
import { timestampToTime } from "../utils";
import { getArticleComments } from "../api/service";
import { setComParamsaction } from './../store/actionCreators.js';
import { Input, Button, Modal, message } from "antd";
import store from "./../store/index.js";
import "antd/dist/antd.css";


class ReplyTree extends Component {
    constructor(props) {
        console.log(props)
        super(props);
        this.state = {
            left:  props.level==0?0:40,
            level: props.level+1
        }
    }

    showCommentModal(commentId, user, secondUser) {
        if (store.getState().user.id === 0) {
            message.warning("登录才能评论，请先登录!");
            return;
        }
        store.dispatch(setComParamsaction({commentId: commentId, commentVisible: true}))
    }

    render() {
      return (
        <div>
            {
                this.props.replies.map(item=>{
                return (
                    <div className="item-recurse" key={item.id} style={{ left: this.state.left+"px" }}>
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
                                <Button type="primary" size={"small"}
                                    onClick={ ()=>this.showCommentModal(item.id, item.user_info.id) }>
                                    回复    
                                </Button>   
                        </div>
                        {
                            item.comment_replies.length > 0?
                            (<ReplyTree replies={ item.comment_replies } level={ this.state.level } />):""
                                                       
                        }
                    </div>) 
                })
            } 
        </div>
      )
    }
}

export default ReplyTree;
