import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Table, Space, Form, Button, Input, Select, Popconfirm, message } from "antd";
import { PlusOutlined, SearchOutlined, ExpandOutlined,
         DeleteOutlined,EditOutlined, CheckOutlined, MinusOutlined } from "@ant-design/icons";
import { remoteSaveArticle, getArticleList } from "../../api/service";
import { timestampToTime } from "../../utils";
import EditArticle from "../../components/EditArticle.jsx";
import CatalogTree from "../../components/CatalogTree.jsx";
const { Column, ColumnGroup } = Table;
const { Option } = Select;

class Article extends Component {
    constructor(props) {
        super(props);
        this.state = {
            articleList: [],
            params: {
                search: undefined,
                status: undefined,
                page: 1,
                page_size: 10
            },
            pagination: {
                current: 1,
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [5,10,15,20,30,40,50,100],
                total: 0
            },
            
            isLoading: false,
            showDrawer: false,
            articleId: 0,
            showCatalogTree: false,

            statusDict: {
                Draft: '草稿',
                Published: '已发布',
                Deleted:'已删除',
            }
        }
    }

    handleSearch() {
        let params = this.state.params;
        let pagi = this.state.pagination;
        pagi.current = params.page = 1;
        this.setState({
            params: params,
            pagination: pagi
        });
        this.doSearch();
    }

    async doSearch() {
        this.setState({ isLoading: true });
        try {
            const data = await getArticleList(this.state.params);
            let pagination = this.state.pagination;
            pagination.total = data.data.count;
            this.setState({
                articleList: data.data.results,
                pagination: pagination
            });
        } catch (e) {
            console.error(e)
        }

        this.setState({ isLoading: false });
    }

    async publishArticle(index, row) {
        try {
            await remoteSaveArticle('patch', {id: row.id, status: "Published"});
            message.success("发布成功！");
            await this.handleSearch();
        } catch (e) {
            console.error(e);
        }
    }

    async offlineArticle(index, row) {
        try {
            await remoteSaveArticle('patch', {id: row.id, status: "Draft"});
            message.success("下线成功！");
            await this.handleSearch();
        } catch (e) {
            console.error(e);
        }
    }

    async deleteArticle(index, row) {
        try{
            await remoteSaveArticle('patch', {id: row.id, status: "Deleted"});
            message.success("删除成功！");
            await this.handleSearch();
        } catch (e) {
            console.error(e);
      }
    }

    showEditDrawer(index, row) {
        this.setState({
            showDrawer: true,
            articleId: row.id
        });
    }

    showAddDrawer() {
        this.setState({
            showDrawer: true,
            articleId: 0
        })
    }

    onTextChange(event) {
        let params = this.state.params;
        params.search = event.target.value;
        this.setState({ params });
    }

    onSelectChange(value) {
        let params = this.state.params;
        if (value === "All") {
            params.status = undefined;
        } else {
            params.status = value;
        }
        this.setState({ params });
    }

    handleTableChange = (pagination, filters, sorter) => {   
        let params = this.state.params;
        let pagi = this.state.pagination;
        pagi.current = params.page = pagination.current;
        pagi.pageSize = params.page_size = pagination.pageSize;
        this.setState({
            params: params,
            pagination: pagi
        });

        this.doSearch();
    }

    handleCloseDrawer(isOk) {
        this.setState({showDrawer: false});
        if (isOk) {
            this.handleSearch();
        }
    }

    componentDidMount() {
        this.handleSearch();
    }

    render() {
        return (
        <div>
            <Form layout="inline" style={{ marginTop : "10px" }}>
                <Form.Item label="标题">
                    <Input ref="title" value={ this.state.params.search } placeholder="文章标题"
                        onChange={ this.onTextChange.bind(this) } />
                </Form.Item>
                <Form.Item label="状态">
                    <Select value={ this.state.params.status } placeholder="状态" 
                        onChange={ this.onSelectChange.bind(this) }>
                        <Option value="Published">已发布</Option>
                        <Option value="Draft">草稿</Option>
                        <Option value="All">全部</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button loading={ this.state.isLoading } 
                        type="primary" icon={ <SearchOutlined /> }                       
                        onClick={ ()=>this.handleSearch() }>
                        查询
                    </Button>
                </Form.Item>
            </Form>
            <div className="button-container" style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                margin: "10px"
            }}>
                <Button type="primary" icon={ <PlusOutlined /> }
                    onClick={ ()=>this.showAddDrawer() }>
                    新增
                </Button>
                <Button type="primary" icon={ <ExpandOutlined /> } 
                    onClick={ ()=>this.setState({ showCatalogTree:true }) }>
                    分类管理
                </Button>
            </div>

            <Table ref="articleTable" dataSource={ this.state.articleList } 
                style={{ width: "100%" }} 
                loading={ this.state.isLoading }
                pagination={ this.state.pagination }
                onChange={ this.handleTableChange.bind(this) }
             >
                <Column title="ID" dataIndex="id" key="id" width="80" />
                <Column title="标题" dataIndex="title" key="title" width="200"/>
                <Column title="状态" dataIndex="status" key="status" width="100" 
                    render={ (text, record, index)=>this.state.statusDict[record.status] }
                />
                <Column title="分类" dataIndex="catalog_info" key="catalog_info"
                    render={ (text, record, index)=>(<span>{ record.catalog_info.name }</span>) }
                />
                <Column title="修改时间" dataIndex="modified_at" key="modified_at" 
                    render={ (text, record, index)=>timestampToTime(record.modified_at, true) } 
                />     
                <Column fixed="right" title="操作" dataIndex="id" key="id" width="200"
                    render={ (text, record, index)=>(
                        <Space size="small">
                            <Popconfirm placement="left" title="确定删除该文章吗？" 
                                onConfirm={ ()=>this.deleteArticle(index,record) } 
                                okText="Yes" cancelText="No"
                            >
                                <Button icon={ <DeleteOutlined />} size="small" type="text">
                                    删除
                                </Button>
                            </Popconfirm>
                            <Button icon={ <EditOutlined /> } size="small" type="text" 
                                onClick={ ()=>this.showEditDrawer(index, record) }>
                                编辑
                            </Button>
                            {
                                record.status === "Draft" ?
                                (<Button icon={ <CheckOutlined /> } size="small" type="text"
                                     onClick={ ()=>this.publishArticle(index,record) }>
                                    发布
                                </Button>):
                                (<Button icon={ <MinusOutlined /> } size="small" type="text"
                                     onClick={ ()=>this.offlineArticle(index, record) }>
                                    下线
                                </Button>)
                            }
                        </Space>
                      )}
                />
            </Table>

            <EditArticle ref="EditArticle"
                articleId={ this.state.articleId }
                visible={ this.state.showDrawer }
                onClose={ this.handleCloseDrawer.bind(this) }
            />
            <CatalogTree
                visible={ this.state.showCatalogTree }
                onClose={ ()=>this.setState({ showCatalogTree: false }) }
            />
        </div>
        )
    }
}
export default Article;
