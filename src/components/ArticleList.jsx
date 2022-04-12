import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Tag } from "antd";
import { timestampToTime } from "../utils";
import "antd/dist/antd.css";
import "./ArticleList.less"

class ArticleList extends Component{
    constructor(props) {
        super(props);
    }  

    render() {
        return (
        <>
          <ul id="list" className="articles-list">
          {
            this.props.articleList.map(article=>{
                return (
                    <li key={ article.id } className="item">
                        <Link to={ `/articledetail/${article.id}` }>
                            <img data-src={ article.cover } alt="文章封面" className="wrap-img img-blur-done" 
                                    data-has-lazy-src="false" src="" />
                        </Link>

                        <div className="content">
                            <Link to={ `/articledetail/${article.id}` }>
                                <h4 className="title">{ article.title }</h4>
                                <p className="abstract">{ article.excerpt }</p>
                            </Link>
                            <div className="meta">
                                <span>查看 { article.views }</span>
                                <span>评论 { article.comments }</span>
                                <span>赞 { article.likes }</span>
                                { article.tags_info.map(tag =>  (
                                            <Link key={ tag.id } to="`/articles?tags=${tag.id}&catalog=`">
                                                <Tag>{ tag.name }</Tag>
                                            </Link>
                                        ))
                                }
                                { article.created_at?
                                  (<span className="time">{ timestampToTime(article.created_at, true) }</span>) : ""
                                }
                            </div>
                        </div>
                    </li>
                )
            })
          }
          </ul>
        </>
        )
    }
}

export default ArticleList;
