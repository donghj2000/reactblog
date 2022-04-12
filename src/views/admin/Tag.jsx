import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Table, Space, Form, Button, Input, Popconfirm, Modal, message} from "antd";
import { PlusOutlined,SearchOutlined,DeleteOutlined,EditOutlined } from "@ant-design/icons";
import { addTag, deleteTag, getTagList, saveTag } from "../../api/service";
import { timestampToTime } from "../../utils";

const { Column, ColumnGroup } = Table;

class Tag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tagList: [],
            params: {
                name: undefined,
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
            tag: {
                id: 0,
                name: ""
            }
        }
    }

    onTextChange(event) {
        let params = this.state.params;
        let tag = this.state.tag;
        if (event.target.name == "tagName") {
            tag.name = event.target.value;
        } else {
            params.name = event.target.value;
        }
        this.setState({
            tag,
            params
        });
    }

    handleSearch(){
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
            const data = await getTagList(this.state.params);
            let pagination = this.state.pagination;
            pagination.total = data.data.count;
            this.setState({
                tagList: data.data.results,
                pagination: pagination
            });
        } catch (e) {
            console.error(e);
        }
        this.setState({ isLoading: false });
    }

    async deleteObject(index, row) {
        await deleteTag (row.id);
        message.success("删除成功"),
        await this.handleSearch();
    }

    showEditDialog (index, row) {
        this.setState({
            tag: row,
            dialogTitle: "修改标签",
            showDialog: true
        });
    }

    showAddDialog() {
        this.setState({
            tag: {},
            dialogTitle: "新增标签",
            showDialog: true
        });
    }

    handleCancel() {
        this.setState({
            tag: {},
            dialogTitle: "",
            showDialog: false
        });
    }

    async saveCatalog() {
        this.setState({ isLoading: true });
        const method = this.state.tag.id ? "put" : "post";
        try {
            await saveTag(method, this.state.tag);
            await this.handleSearch();
            this.setState({ showDialog: false });
        } catch (e) {
            console.error(e);
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

    componentDidMount() {
        this.handleSearch();
    }

    render() {
        return (
		<div>
            <div>
                <Form className="demo-form-inline" layout="inline" style={{ margin: "10px" }}>
                    <Form.Item label="名称">
                        <Input value={ this.state.params.name } placeholder="名称"
                            ref="paramTagName" name="paramTagName"
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
            </div>
            <div className="button-container" style={{ margin: "10px" }}> 
                <Button type="primary" icon={ <PlusOutlined /> }
                    onClick={ ()=>this.showAddDialog() }>
                    新增
                </Button>
            </div>

            <Table ref="tagTable" dataSource={ this.state.tagList } 
                style={{ width:"100%" }}
                loading={ this.state.isLoading }
                pagination={ this.state.pagination }
                onChange={ this.handleTableChange.bind(this) }
             >
                <Column title="ID" dataIndex="id" key="id" width="80" />
                <Column title="名称" dataIndex="name" key="name" width="200"/>
                <Column title="修改时间" dataIndex="modified_at" key="modified_at" 
                    render={ (text, record, index) => timestampToTime(record.modified_at, true) }/>
                <Column fixed="right" title="操作" key="action" width="200"
                    render={(text, record, index) => (
                        <Space size="small">
                            <Popconfirm placement="left" title="确定删除该文章吗？" 
                                onConfirm={ ()=>this.deleteObject(index,record) } 
                                okText="Yes" cancelText="No"
                            >
                                <Button icon={ <DeleteOutlined />} size="small" type="text">
                                    删除
                                </Button>
                            </Popconfirm>
                            <Button icon={ <EditOutlined /> } size="small" type="text" 
                                onClick={ ()=>this.showEditDialog(index, record) }>
                                编辑
                            </Button>
                        </Space>
                      )}
                />
            </Table>

            <Modal
                  visible={ this.state.showDialog }
                  title={ this.state.dialogTitle }
                  onCancel={ ()=>this.handleCancel() }
                  footer={[
                    <Button key="back" onClick={ ()=>this.handleCancel() }>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" 
                        loading={ this.state.isLoading } 
                        onClick={ ()=>this.saveCatalog() }>
                        确定
                    </Button>,
                  ]}
                >
                <Form.Item label="标签名称">
                    <Input ref="tagName" name="tagName" 
                        value={ this.state.tag ? this.state.tag.name: "" } 
                        onChange={ this.onTextChange.bind(this) }/>
                </Form.Item>
            </Modal>
        </div>
        )
    }
}
export default Tag;
