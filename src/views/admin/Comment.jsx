import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Link } from "react-router-dom";
import { Table, Form, Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getCommentList, getUserList } from "../../api/service";
import { timestampToTime } from "../../utils";
const { Column, ColumnGroup } = Table;
const { Option } = Select;

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commentList: [],
            params: {
                user: undefined,
                search: "",
                page: 1,
                page_size: 10
            } ,
            pagination: {
                current: 1,
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [5,10,15,20,30,40,50,100],
                total: 0
            },
            userList: [],
            isLoading: false
        }
    }

    onTextChange(event) {
        let params = this.state.params;
        params.search = event.target.value;
        this.setState({ params });
    }

    onSelectChange(value) {
        let params = this.state.params;
        params.user = value;
        this.setState({ params });
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
            const data = await getCommentList(this.state.params);
            let pagination = this.state.pagination;
            pagination.total = data.data.count;
            this.setState({
                commentList: data.data.results,
                pagination: pagination,
            })
        } catch (e) {
            console.error(e)
        }
        this.setState({ isLoading: false });
    }

    async getUsers() {
        try {
            const data = await getUserList({});
            this.setState({ userList: data.data.results });
        } catch (e) {
            console.error(e)
        }
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

    componentDidMount() {
        this.handleSearch();
        this.getUsers();
    }

    render() {
        return (
            <div>
                <Form layout="inline" style={{ margin:"10px" }}>
                    <Form.Item label="??????">
                        <Select placeholder="?????????" allowClear="true"
                            onChange={ (e)=>this.onSelectChange(e) }>
                            { this.state.userList ?
                                this.state.userList.map(item=>
                                    (<Option value={ item.id } key={ item.id }>
                                         { item.username? item.username : item.nickname }
                                    </Option>)) : ""
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item label="??????">
                        <Input ref="name" value={ this.state.params.search } placeholder="????????????"
                            onChange={ this.onTextChange.bind(this) } />
                    </Form.Item>

                    <Form.Item>
                        <Button loading={ this.state.isLoading } 
                            type="primary" icon={ <SearchOutlined /> }                       
                            onClick={ ()=>this.handleSearch() }>
                            ??????
                        </Button>
                    </Form.Item>
                </Form>

                <Table ref="commentTable" dataSource={ this.state.commentList } 
                    style={{ width:"100%" }}
                    loading={ this.state.isLoading }
                    pagination={ this.state.pagination }
                    onChange={ this.handleTableChange.bind(this) }
                >
                    <Column title="ID" dataIndex="id" key="id" width="80" />
                    <Column title="?????????" dataIndex="user_info" key="user_info.name" width="200"
                        render={ (text, record, index)=>(<span>{record.user_info.name}</span>) }
                    />
                    <Column title="????????????" dataIndex="content" key="content" width="100" />
                    <Column title="??????" dataIndex="article_info" key="article_info"
                        render={ (text, record, index)=>(<span>{record.article_info.title}</span>) }
                    />
                    <Column title="????????????" dataIndex="reply" key="reply" />
                    <Column title="????????????" dataIndex="modified_at" key="modified_at" 
                        render={ (text, record, index)=>timestampToTime(record.created_at, true) } 
                    />
                    <Column fixed="right" title="??????" key="action" width="200"
                        render={ (text, record, index) => (
                            <Link to={`/articledetail/${record.article_info.id}`}>
                                <h3 className="title">??????</h3>
                            </Link>) }
                    />
                </Table>
            </div>  
        )
    }
}
export default Comment;
