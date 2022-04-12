import React, { Component, Fragment } from "react";
import ReactDom from "react-dom";
import { Tree, Layout } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Home from "./Home";
import { getCatalogTree } from "../../api/service";

import "antd/dist/antd.css";
import "./Catalog.less"

const { Sider, Content } = Layout;

class Catalog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			catalogs: [],
			articleParams: { 
				catalog: undefined,
				tags: undefined
			}
		};
	}

	changeNode(array) {
	    //旧key到新key的映射
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
	
    async getCatalogs() {
        const data = await getCatalogTree();
        let tmp = data.data;
        this.changeNode(tmp);
        this.state.catalogs = data.data;
        this.setState({ catalogs: data.data });
    }

    onSelect(selectedKeys, info) {
        if (selectedKeys.length != 0) {
        	let articleParams = this.state.articleParams;
        	articleParams.catalog = selectedKeys[0];
        	this.setState({
            	articleParams: articleParams
            });
            this.refs.Home.handleSearch(1);
        }
  	}

    componentDidMount() {
        this.getCatalogs();
        let height = window.innerHeight || document.documentElement.clientHeight;
        height = height - 200;
        this.setState({ height });
    }

    render() {
        return (
            <Layout className="catalog left view-content" >
                <Sider style={{ minHeight: this.state.height + "px" }} className="catalog-tree">
		            <Tree
				        showLine
				        switcherIcon={ <DownOutlined /> }
				        onSelect={ this.onSelect.bind(this) }
				        treeData={ this.state.catalogs } 
				    />
                </Sider>
                <Content className="article-list">
                    <Home articleParams={ this.state.articleParams } ref="Home"/>
                </Content>
            </Layout>
        )
    }
}
export default Catalog;
