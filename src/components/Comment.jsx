import React, { Component } from 'react';
import { Input, Button, Modal, message} from 'antd';
import { connect } from 'react-redux';
import { addComment } from "../api/service";
import { mapStateToProps, mapDispatchToProps } from './../store/actionCreators.js';
import "antd/dist/antd.css";
const { TextArea } = Input;

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnLoading: false,
            content: "",
            cacheTime: 0, 
            times: 0
        }
    }

    handleTextChange(event) {
        this.setState({ content: event.target.value });
    }
    
    handleCancel = async () => {
        this.props.onCancel();
        return false;
    }

    handleOk = async () => {
        if (!this.props.articleId) {
            message.error("该文章不存在");
            return;
        }
        if (this.state.times > 2) {
            message.warning("您今天评论的次数已经用完，明天再来评论吧！");
            return;
        }

        let now = new Date();
        let nowTime = now.getTime();
        if (nowTime - this.state.cacheTime < 4000) {
            message.warning("您评论太过频繁，1分钟后再来评论吧！");
            return;
        }
        if (!this.state.content) {
            message.error("评论内容不能为空！");
            return;
        }
        if (this.props.storeUser.id === 0) {
            message.warning("登录才能评论，请先登录!");
            return;
        }
        if (!this.props.storeUser.is_active) {
            message.warning("请先激活账号!");
            return;
        }
       
        let user_id = this.props.storeUser.id;
        this.setState({ btnLoading: true });
        try {
            let reply = undefined;
            if (this.props.reply !== undefined) {
                reply = this.props.reply;
            }
            await addComment({
                    article: this.props.articleId,
                    user: user_id,
                    reply: reply,
                    content: this.state.content
                });
            this.setState({
                btnLoading: false,
                times: this.state.times + 1,
                cacheTime: nowTime,
                content: ""
            });
            message.success("评论成功！");
            this.props.onOk();
        } catch (e) {
            message.error("评论失败，请重试哦！");
            this.setState({ btnLoading: false });
            console.error(e);
        }
    }

    render() {
        return this.props.forArticle ?  
            (<div className="comment">
                <TextArea 
                    value={ this.state.content }
                    placeholder="文明社会，理性评论"
                    onChange={ this.handleTextChange.bind(this) }
                    rows={4} 
                />
                <Button type="primary" 
                    loading={ this.state.btnLoading } 
                    onClick={ ()=>this.handleOk() }>
                    发送
                </Button>
            </div>):
            (<Modal
                  visible={ this.props.showDialog }
                  title="Title"
                  onCancel={ this.handleCancel }
                  footer={[
                    <Button key="back" onClick={ ()=>this.handleCancel() }>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" 
                        loading={ this.state.btnLoading } 
                        onClick={ ()=>this.handleOk() }>
                        确定
                    </Button>
                  ]}
                >
                <TextArea 
                    value={ this.state.content }
                    placeholder="文明社会，理性评论"
                    onChange={ this.handleTextChange.bind(this) }
                    rows={4} />
            </Modal>
            )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
