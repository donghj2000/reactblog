import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Link } from "react-router-dom";
import { Table, Form, Button, Input, Select, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getMessageList, getUserList } from "../../api/service";
import { timestampToTime } from "../../utils";
const { Column, ColumnGroup } = Table;
const { Option } = Select;

class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            showContent: "",
            messageList: [],
            params: {
                search: undefined,
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
            isLoading: false
        }
    }

    onTextChange(event) {
        let params = this.state.params;
        params.search = event.target.value;
        this.setState({ params });
    }
    handleSearch (){
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
            const data = await getMessageList(this.state.params);
            let pagination = this.state.pagination;
            pagination.total = data.data.count;
            this.setState({
                messageList: data.data.results,
                pagination: pagination,
            })
        } catch (e) {
            console.error(e)
        }
        this.setState({ isLoading: false });
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

    showMsgDetail(row) {
        this.setState({
            showDialog: true,
            showContent: row.content
        });
    }

    componentDidMount() {
        this.doSearch();
    }

    render() {
        return (
            <div>
                <Form layout="inline" style={{ margin:"10px" }}>
                    <Form.Item label="内容/姓名/手机/邮箱">
                        <Input ref="name" value={ this.state.params.search }
                            onChange={ this.onTextChange.bind(this) } />
                    </Form.Item>

                    <Form.Item>
                        <Button loading={ this.state.isLoading } 
                            type="primary" icon={ <SearchOutlined /> }                       
                            onClick={ ()=>this.handleSearch() }>
                            查询
                        </Button>
                    </Form.Item>
                </Form>

                <Table ref="commentTable" dataSource={ this.state.messageList } 
                    style={{ width:"100%" }}
                    loading={ this.state.isLoading }
                    pagination={ this.state.pagination }
                    onChange={ this.handleTableChange.bind(this) }
                >
                    <Column title="ID" dataIndex="id" key="id" width="80" />
                    <Column title="姓名" dataIndex="name" key="name" width="50" />
                    <Column title="邮箱" dataIndex="email" key="email" width="50" />
                    <Column title="手机" dataIndex="phone" key="phone" width="50" />
                    <Column title="留言时间" dataIndex="created_at" key="created_at" width="80" 
                        render={ (text, record, index)=>timestampToTime(record.created_at, true) } />
                    <Column title="内容" dataIndex="content" key="content" width="300" 
                        render={(text, record, index)=>record.content.substring(0, 15) + 
                                (record.content.length > 15 ? ".....":"") } />
                    <Column fixed="right" title="操作" key="id" width="200"
                        render={ (text, record, index) => (
                            <Button size="small" type="text" 
                                onClick={ ()=>this.showMsgDetail(record) }
                            >
                                详情
                            </Button>) }
                    />
                </Table>

                <Modal
                  visible={ this.state.showDialog }
                  title={ "详情" }
                  onCancel={ ()=>this.setState({ showDialog: false, showContent: "" }) }
                  footer={[
                    <Button type="primary"  
                        onClick={ ()=>this.setState({ showDialog: false, showContent: "" }) }>
                      确定
                    </Button>,
                  ]}
                >
                    <div>
                        { this.state.showContent }
                    </div>
                </Modal>
            </div>  
        )
    }
}
export default Message;
