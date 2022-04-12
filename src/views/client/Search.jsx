import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Pagination } from 'antd';
import Loading from "../../components/Loading.jsx";
import { getSearchArticleList } from "../../api/service";
import ArticleList from "../../components/ArticleList.jsx";
import "antd/dist/antd.css";

class Search extends Component {
    constructor(props) {
        super(props);        
        this.state = {
            isLoading: false,
            articleList: [],
            total: 0,
            pageSizeOptions: [5,10,15,20,30,40,50,100],
            params: {
                text: "",
                page: 1,
                page_size: 10
            },
        }
    }
    
    async handleSearch() {
        this.setState({ isLoading: true });
        try {
            let data = null;
            let params = this.state.params;
            params.text = this.props.location.state.text;
            this.setState({ params });

            data = await getSearchArticleList(params);
            let articleList = data.data.results.map(obj => obj.object);
			articleList = articleList.filter(article=>{
                return article != null;
            });
            this.setState({ 
                articleList: articleList,
                total: data.data.count
            });
        } catch (e) {
            console.error(e);
        }
        this.setState({ isLoading: false });
    }  

    onShowSizeChange(currentPage, pageSize) {
        let params = this.state.params;
        params.page = currentPage;
        params.page_size = pageSize;
        this.setState({ params });
        this.handleSearch();
    }

    onChange(currentPage) {
        let params = this.state.params;
        params.page = currentPage;
        this.setState({ params });
        this.handleSearch();
    }

    componentWillReceiveProps(nextProps) {
        this.props=  nextProps;
        let params = this.state.params;
        params.page = 1;
        params.page_size = 10;
        this.setState({ params });
        this.handleSearch();
    }
 
    componentDidMount() {
        this.handleSearch();
    }
	
    render() {
        return (
            <div className="left clearfix view-content">
                {  !this.state.isLoading ?
                    (<>
                        {  this.state.params.text ?
                         (   this.state.total > 0 ?
                             (<h2> 
                                 搜索：<span style={{ color: 'red' }}>{ this.state.params.text }</span>
                                 . 共有 { this.state.total } 篇文章:
                              </h2>) : 
                             (<h1>
                                 哎呀，关键字：<span style={{ color: 'red' }}>{ this.state.params.text }</span> 没有找到结果，要不换个词再试试？
                             </h1>)
                         ) : ""
                        }
                        {   this.state.total > 0 ?
                            <>
                                <ArticleList articleList={ this.state.articleList } />
                                <div className="fr" style={{ margin: '30px' }}>
                                    <Pagination
                                        showQuickJumper 
                                        showSizeChanger
                                        current={ this.state.params.page }
                                        pageSize={ this.state.params.page_size }
                                        onShowSizeChange={ this.onShowSizeChange.bind(this) }
                                        onChange={ this.onChange.bind(this) }
                                        pageSizeOptions={ this.state.pageSizeOptions }
                                        total={ this.state.total }
                                    />
                                </div>
                            </>:""
                        }
                    </>
                    ) : 
                    (<Loading tips={ "拼命加载中---------------" } />)
                }
            </div>  
        )
    }
}

export default Search
