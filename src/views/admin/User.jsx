import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Table, Space, Form, Button, Input, Select, Popconfirm, message } from "antd";
import { CheckOutlined, StopOutlined, SearchOutlined } from "@ant-design/icons";
import { timestampToTime } from "../../utils";
import { getUserList, saveUser } from "../../api/service";
import UserDetail from "../../components/UserDetail.jsx";
const { Column, ColumnGroup } = Table;
const { Option } = Select;

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userList: [],
            params: {
                username: "",
                is_active: undefined,
                is_superuser: false,
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
            showDialog: false,
            userId: 0
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
            const data = await getUserList(this.state.params);
            let pagination = this.state.pagination;
            pagination.total = data.data.count;
            this.setState({
                isLoading: false,
                userList: data.data.results,
                pagination: pagination
            })
        } catch (e) {
            console.error(e)
        }
        this.setState({ isLoading: false });
    }

    onTextChange(event) {
        let params = this.state.params;
        params.username = event.target.value;
        this.setState({params});
    }

    onSelectChange(value) {
        let params = this.state.params;
        if (value === "All") {
            params.is_active = undefined;
        } else if(value === "1") {
            params.is_active = true;
        } else {
            params.is_active = false;
        }
        this.setState({ params });
    }

    async disableUser(index, row) {
        try {
            await saveUser("patch", { id: row.id, is_active: false });
            message.success("禁用成功");
        } catch (e) {
            console.error(e);
        } 
        await this.handleSearch()
    }

    async enableUser(index, row) {
        try{
            await saveUser("patch", { id: row.id, is_active: true });
            message.success("启用成功！");
        } catch (e) {
            console.error(e);
        } 

        await this.handleSearch()
    }

    showUserDetail(row) {
        this.setState({
            userId: row.id,
            showDialog: true
        });
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
    }

    render() {
        return (
        <div>
            <Form layout="inline" style={{ margin: "10px" }}>
                <Form.Item label="账号">
                    <Input ref="username" value={ this.state.params.username } placeholder="账号"
                        onChange={ this.onTextChange.bind(this) } />
                </Form.Item>
                <Form.Item label="状态">
                    <Select placeholder="状态" 
                        onChange={ this.onSelectChange.bind(this) }>
                        <Option value="1">正常</Option>
                        <Option value="0">禁用</Option>
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

            <Table ref="userTable" dataSource={ this.state.userList } 
                style={{ width: "100%" }}
                loading={ this.state.isLoading }
                pagination={ this.state.pagination }
                onChange={ this.handleTableChange.bind(this) }
             >
                <Column title="ID" dataIndex="id" key="id" width="80" />
                <Column title="账号" dataIndex="username" key="username" width="200"/>
                <Column title="角色" dataIndex="is_superuser" key="is_superuser" width="200" 
                    render={(text, record, index)=>record.is_superuser?"管理员":"读者"}/>
                <Column title="昵称" dataIndex="nickname" key="nickname" width="200" />
                <Column title="状态" dataIndex="is_active" key="is_active" width="200" 
                    render={(text, record, index)=>record.is_active?"正常":"禁用"} />
                <Column title="注册时间" dataIndex="created_at" key="created_at" 
                    render={ (text, record, index)=>timestampToTime(record.created_at, true) } />
                <Column fixed="right" title="操作" key="action" width="200"
                    render={(text, record, index) => (
                        <Space size="small">
                            {   record.is_active ? 
                                (<Popconfirm placement="left" title="确定禁用该用户吗？" 
                                     onConfirm={ () => this.disableUser(index,record) } 
                                     okText="Yes" cancelText="No"
                                 >
                                    <Button icon={ <StopOutlined /> } size="small" type="text">
                                        禁用
                                    </Button>
                                </Popconfirm>):
                                (<Button icon={ <CheckOutlined /> } size="small" type="text" onClick={ ()=>this.enableUser(index, record) }>
                                    启用
                                </Button>)
                            }
                            <Button size="small" type="text" onClick={ ()=>this.showUserDetail(record) }>
                                详情
                            </Button>
                        </Space>
                    )}
                />
            </Table>

            <UserDetail
                userId={ this.state.userId } 
                visible={ this.state.showDialog }
                onClose={ ()=>this.setState({ showDialog: false }) }
            />
        </div>
        )
    }
}
export default User;
