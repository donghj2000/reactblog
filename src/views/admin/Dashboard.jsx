import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import ReactDom from "react-dom";
import { Row, Col, Card } from "antd";
import { ReadOutlined, LikeOutlined, CommentOutlined, MessageOutlined } from "@ant-design/icons";
import { getNumbers, getTopArticleList } from "../../api/service";
import "./Dashboard.less"

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numbers: {
                views: 0,
                likes: 0,
                comments: 0,
                messages: 0
            },
            articleList: []
        }
    }

    async componentDidMount() {
        const data = await getTopArticleList();
        const numbers = await getNumbers();
        this.setState({
            articleList: data.data.results,
            numbers: numbers.data
        });
    }

    render() {
        return (
        <div>
            <div className="title">今日博客访问情况</div>
            <Row gutter="16" className="numbers">
              <Col span="6" className="el-col-6">
                <Card>
                  <div className="number-card">
                    <div>
                      <ReadOutlined className="number-icon" />
                    </div>
                    <div className="number-right">
                      <div className="number-num">{ this.state.numbers.views }</div>
                      <div>用户访问量</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span="6" className="el-col-6">
                <Card>
                  <div className="number-card">
                    <div>
                      <LikeOutlined className="number-icon" />
                    </div>
                    <div className="number-right">
                      <div className="number-num">{ this.state.numbers.likes }</div>
                      <div>点赞量</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span="6" className="el-col-6">
                <Card>
                  <div className="number-card">
                    <div>
                      <CommentOutlined className="number-icon" />
                    </div>
                    <div className="number-right">
                      <div className="number-num">{ this.state.numbers.comments }</div>
                      <div>评论量</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span="6" className="el-col-6">
                <Card>
                  <div className="number-card">
                    <div> 
                      <MessageOutlined className="number-icon" />
                    </div>
                    <div className="number-right">
                      <div className="number-num">{ this.state.numbers.messages }</div>
                      <div>留言量</div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            <div className="top-articles">
              <Card title="文章访问量TOP 10">
                <div className="article-list">
                  {
                      this.state.articleList.map((article,index)=>
                      (<Link to={ `/articledetail/${article.id}` } key={ article.id }>
                           <div className="article">
                               <span style={{ fontSize: "16px" }}>{ index + 1 + ". " + article.title }</span>
                               <span style={{ color: "#999999", fontSize: "16px"}}>{ article.views } / { article.likes }</span>
                           </div>
                       </Link>
                      ))
                  }
                </div>
              </Card>
            </div>
          </div>
        )
    }
}
export default Dashboard;
