import React, { Component } from "react";
import { Card, Tree, Drawer, Modal, Form, Button, Input, Tooltip, message} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { deleteCatalog, getCatalogTree, saveCatalog } from "../api/service";
import "antd/dist/antd.css";

class CatalogTree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            dialogTitle: "",
            btnLoading: false,
            catalog:{
                id: 0,
                name: "",
                parent: 0
            },
            catalogs:[],
            selectedKeys: [],
            NodeTreeItem: null
        }
    }

    onCloseDrawer = () => {
        this.setState({
            catalog:{},
            selectedKeys: [],
            NodeTreeItem: null
        });
        this.props.onClose(false);
    }

    onSelect = (selectedKeys, info) => {
        if (selectedKeys.length === 0) {
            selectedKeys.push(info.node.key+"");
        }
        this.setState({ NodeTreeItem:null });
    }

    onRightClick = ({event, node}) => {
        let selectedKeys = [];
        selectedKeys.push(node.key+"");
        var x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
        var y = event.currentTarget.offsetTop;
        this.setState({
            selectedKeys,
            NodeTreeItem: {
                pageX: x,
                pageY: y,
                key: node.key,
                title: node.title,
                parent: node.parent
            }
        });
    }

    getNodeTreeMenu() {
        const {pageX, pageY} = { ...this.state.NodeTreeItem };
        const tmpStyle = {
            position: "absolute",
            maxHeight: 40,
            textAlign: "center",
            left: `${pageX+30}px`,
            top: `${pageY+83}px`,
            display: "flex",
            flexDirection: "row"
        };
        const menu = (
            <div style={ tmpStyle }>
                <div style={{ alignSelf: "center", marginLeft: 10 }} 
                    onClick={ this.showAddDialog }>
                    <Tooltip  placement="bottom" title="??????">
                        <PlusOutlined />??????
                    </Tooltip >
                </div>

                <div style={{ alignSelf: "center", marginLeft: 10 }} 
                    onClick={ this.showEditDialog }>
                    <Tooltip  placement="bottom" title="??????">
                        <EditOutlined />??????
                    </Tooltip >
                </div>  

                <div style={{ alignSelf: "center", marginLeft: 10 }} 
                    onClick={ this.remove }>
                    <Tooltip  placement="bottom" title="??????">
                        <DeleteOutlined />??????
                    </Tooltip >
                </div>
            </div>
        );
        return (this.state.NodeTreeItem === null)? "" : menu;
    }

    showAddDialog = (event) => {
        event.stopPropagation();
        let catalog = this.state.catalog;
        catalog.id = undefined;
        catalog.name = undefined;
        catalog.parent = null;
        if (this.state.NodeTreeItem != null) {
            catalog.parent = this.state.NodeTreeItem.key;
        }
        this.setState({
            showDialog: true,
            catalog: catalog,
            dialogTitle: "????????????"
        });
    }

    showEditDialog = (event) => {
        event.stopPropagation();
        let catalog = this.state.catalog;
        catalog.id = this.state.NodeTreeItem.key;
        catalog.name = this.state.NodeTreeItem.title;
        catalog.parent = this.state.NodeTreeItem.parent;
        this.setState({
            showDialog: true,
            catalog: catalog,
            dialogTitle: "????????????"
        });
    }
    
    handleCancel = (event) => {
        event.stopPropagation();
        this.setState({ showDialog: false })
    }

    saveCatalog = async ()=> {
        this.setState({ btnLoading: true });
        try {
            const method = this.state.catalog.id ? "patch" : "post"
            await saveCatalog(method, this.state.catalog)
            this.setState({
                btnLoading: false,
                showDialog: false
            });
            message.success("????????????");
            await this.handleSearch()
            this.setState({ NodeTreeItem: null });
        } catch (e) {
            console.error(e)
            message.error("????????????");
            this.setState({ btnLoading: false });
        }
    }

    remove = async (event)=> {
        event.stopPropagation();
        await deleteCatalog(this.state.NodeTreeItem.key);
        message.success("????????????");
        await this.handleSearch();
        this.setState({ NodeTreeItem: null });
    }

    onTextChange(event) {
        let catalog = this.state.catalog;
        let NodeTreeItem = this.state.NodeTreeItem;
        catalog.name = event.target.value;
        this.setState({
            catalog,
        });
    }

    changeNode(array) {
        //???key??????key?????????
        var keyMap = {
            "id": "key",
            "name": "title"
        };
        
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            for (var key in obj) {
                if (key == "children") { 
                    this.changeNode(obj[key])
                }

                var newKey = keyMap[key];
                if (newKey) {
                    obj[newKey] = obj[key];
                    delete obj[key];
                }
            }
        }
    }

    async handleSearch() {
        const data = await getCatalogTree();
        let tmp = data.data;
        this.changeNode(tmp);
        this.setState({ catalogs: data.data });
    }

    componentDidMount() {
        this.handleSearch();
    }
    
    render() {
      return (
        <Card bordered = { false } >
            <Drawer
                visible={ this.props.visible }
                onClose={ this.onCloseDrawer }
                title="???????????? (????????????)"
                width={800}
            >
                <div className="drawer-content">
                    {   this.state.catalogs.length == 0?
                        <Button key="back" onClick={ this.showAddDialog }>
                            ???????????????
                        </Button>:
                        <>
                            <Tree
                                onSelect={ this.onSelect }
                                selectedKey={ this.state.selectedKeys }
                                onRightClick={ this.onRightClick }
                                defaultExpandAll
                                treeData={ this.state.catalogs }
                            >
                            </Tree>
                            { this.state.NodeTreeItem != null ? this.getNodeTreeMenu():"" }
                        </> 
                    }
                </div>
            </Drawer>
            
            <Modal
                  visible={ this.state.showDialog }
                  title={ this.state.dialogTitle }
                  onCancel={ this.handleCancel }
                  footer={[
                    <Button key="back" onClick={ this.handleCancel }>
                      ??????
                    </Button>,
                    <Button key="submit" type="primary" 
                        loading={ this.state.btnLoading } 
                        onClick={ this.saveCatalog }>
                      ??????
                    </Button>,
                  ]}
                >
                <Form.Item label="????????????">
                    <Input ref="articleTitle" name="title" 
                        value={ this.state.catalog.name } 
                        onChange={ this.onTextChange.bind(this) }/>
                </Form.Item>
            </Modal>
        </Card>
      )
    }
}

export default CatalogTree;
