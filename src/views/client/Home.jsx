import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";

import {
    getDocumentHeight,
    getQueryStringByName,
    getScrollTop,
    getWindowHeight,
    throttle,
} from "../../utils";

import Loading from "../../components/Loading.jsx";

import { getArticleList } from "../../api/service";
import ArticleList from "../../components/ArticleList.jsx";
const viewHeight = window.innerHeight || document.documentElement.clientHeight;
const lazyload = throttle(() => {
    const imgs = document.querySelectorAll("#list .item img");
    let num = 0;
    for (let i = num; i < imgs.length;i++) {
        let distance = viewHeight - imgs[i].getBoundingClientRect().top;
        let imgItem = imgs[i];
        if (distance >= 100) {
            let hasLaySrc = imgItem.getAttribute("data-has-lazy-src");
            if (hasLaySrc === "false") {
                imgItem.src = imgItem.getAttribute("data-src");
                imgItem.setAttribute("data-has-lazy-src", "true");
            }
            num = i + 1;
        }
    }
}, 1000);


class Home extends Component {
    constructor(props) {
        super(props);        
        this.state = {
            isLoadEnd: false,
            isLoading: false,
            articleList: [],
            total: 0,
            params: {
                status: "Published",
                page: 1,
                page_size: 10,
            },
        }
    }
    
    async handleSearch(type) {
        this.setState({ isLoading: true });
        try {
            let data, params;
            if (type == 1) {
                params = this.state.params;
                if (this.props.hasOwnProperty("articleParams") && 
                    this.props.articleParams.hasOwnProperty("catalog")) {
                    params.catalog = this.props.articleParams.catalog;
                }
                params.page = 1,
                this.state.articleList = [];
                this.state.total = 0;
                this.state.params = params;
                data = await getArticleList(params);
            } else {
                params = this.state.params;
                params.page++;
                data = await getArticleList(this.state.params);
            }

            let articleList = [...this.state.articleList, ...data.data.results];
                this.setState({
                    articleList: articleList,
                    total: data.data.count,
                    params: params});

            if (data.data.results.length === 0 ||
                this.state.total === this.state.articleList.length) {
                    this.setState({ isLoadEnd: true });
                    window.onscroll = null;
            }

            lazyload();
        } catch (e) {
            console.error(e);
        }
        this.setState({ isLoading: false });
    }
    
    searchByTag(tag_id) {
        let params = this.state.params;
        params.tag = tag_id;
        this.setState({ params: params });
        this.handleSearch(1)
    }
    
    componentDidMount() {
        window.onscroll = function() {          
            if (getScrollTop() + getWindowHeight() > getDocumentHeight() - 100) {
                if (this.state.isLoadEnd === false && this.state.isLoading === false) {
                    this.handleSearch(2);
                }
            }
        }.bind(this);

        document.addEventListener("scroll", lazyload);
        this.handleSearch(1);
    }
	
    render() {
        return (
            <div className="left clearfix view-content">
                 {  this.state.articleList ?
                    <ArticleList articleList={ this.state.articleList } onSearchByTag={(tag_id)=>this.searchByTag(tag_id)} /> : ""
			     }
                 <Loading tips={this.state.isLoading ? "拼命加载中---------------" :
                     (this.state.isLoadEnd ? "---------------我也是有底线的啦---------------" : "")}>
                 </Loading>              
            </div>  
        )
    }
}

export default Home
