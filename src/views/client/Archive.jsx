import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Timeline, message } from "antd";
import { Link } from 'react-router-dom'
import Loading from "../../components/Loading";

import {
    getDocumentHeight,
    getQueryStringByName,
    getScrollTop,
    getWindowHeight,
    timestampToTime,
} from "../../utils";
import { getArchiveList } from "../../api/service";
import "./Archive.less"
const viewHeight = window.innerHeight || document.documentElement.clientHeight;

class Archive extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoadEnd: false,
			isLoading: false,
			articleList: [],
			total: 0,
			params: {
				page: 1,
				page_size: 10
			}
		}
	}

	async handleSearch() {
      this.setState({ isLoading: true });
      let params = this.state.params;
      try {
        const data = await getArchiveList(params);
        let receivedYearListCnt = data.data.results.length; //本次收到的文章分布在几个年份里
        //如果本次接收到的第一条文章的年份和上次收到的最后一条的相同，则合并到一个列表里
        if (this.state.articleList.length > 0 &&
            this.state.articleList[this.state.articleList.length - 1].year ==
            data.data.results[0].year ) 
        {
            this.state.articleList[this.state.articleList.length - 1].list = 
            [...this.state.articleList[this.state.articleList.length - 1].list, 
             ...data.data.results[0].list];
            data.data.results.shift();
        }

        const articleList = [...this.state.articleList, ...data.data.results];
        params.page++;
        this.setState({
        	  total: data.data.count,
            articleList: articleList,
        	  params: params
        });
        let received = 0;
        this.state.articleList.forEach(item => {
        	  received += item.list.length;
        });
        if (receivedYearListCnt == 0 || this.state.total <= received) {
            window.onscroll = null;
            this.setState({ isLoadEnd: true });
        }
      } catch (e) {
          console.error(e);
      }
      this.setState({ isLoading: false });
    }

    componentDidMount() {
        window.onscroll = function() {         
            if (getScrollTop() + getWindowHeight() > getDocumentHeight() - 100) {
                if (this.state.isLoadEnd === false && this.state.isLoading === false) {
                    this.handleSearch();
                }
            }
        }.bind(this);

        this.handleSearch();
    }

    render() {
  		  const list = this.state.articleList.map((article, i) => (
  		  <Timeline.Item key={ i }>
          <h3 className="year">{ article.year }</h3>
          {
              article.list.map((item, i) => (
                  <Timeline.Item key={item.id}> 
          			      <Link to={ `/articledetail/${item.id}` }>
                          <h3 className="title">{ item.title }</h3>
                      </Link>
                      <p>{ timestampToTime(item.created_at, true) }</p>
                  </Timeline.Item>
              ))
          }
  		  </Timeline.Item>
  		));

  		return (
  		  <div className="archive left view-content">
  		    <Timeline mode="left">{ list }</Timeline>
          <Loading tips={ this.state.isLoading?"拼命加载中---------------":
              (this.state.isLoadEnd?"---------------我也是有底线的啦---------------":"") }>
          </Loading> 
  		  </div>
  		  );
    }
}
export default Archive;
