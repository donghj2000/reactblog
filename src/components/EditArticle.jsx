import React, { Component } from "react";
import { Drawer, Form, Button, Input, Select, Space, Cascader, Upload, message} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { getArticleDetail, getCatalogTree, getTagList,remoteSaveArticle } from "../api/service";
import "antd/dist/antd.css";

//Markdown etitor
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it'
import 'react-markdown-editor-lite/lib/index.css';

import axios from "axios"
import { getCookie } from "./../utils/index.js";

MdEditor.use(Plugins.TabInsert, {
    tabMapValue: 1, // note that 1 means a '\t' instead of ' '.
});

const { Option } = Select;
const { TextArea } = Input;

class EditArticle extends Component {
    mdEditor = null;
    mdParser = null;
    constructor(props) {
        super(props);
        this.state = {
            articleId: 0,
            selectTags: [],
            article: {},
            catalogDefault: [],
            loading: false,
            visible: false,
            catalogTree: [],
            tags: [],
            catalogs: []
        };

        this.mdParser = new MarkdownIt();
        this.renderHTML = this.renderHTML.bind(this)
    }
    
    handleEditorChange = ({text, html}, event) => {
        let article = this.state.article;
        article.markdown = text;
        this.setState({ article });
    }

    handleImageUpload = (file) => {
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = () => {      
                //转为blob
                const blob = this.convertBase64UrlToBlob(reader.result)
                //上传,并改文件名
                let formData = new FormData()  // 创建form对象
                let config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': getCookie("csrftoken")
                    }
                }
                formData.append('file', blob, file.name);  //预留接口改文件名
                axios.post('/api/upload/cover', formData, config)
                .then((data)=>{
                    console.log(data);
                    resolve(data.data.url)
                });
            }
            reader.readAsDataURL(file)    
        });
    }

    convertBase64UrlToBlob = (urlData) => {  
        let arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {type:mime})
    }

    renderHTML(text) {
        return this.mdParser.render(text)
    }

    changeNode(array) {
        //旧key到新key的映射
        var keyMap = {
            "id": "value",
            "name": "label"
        };
        
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            for (var key in obj) {
                if (key=="children") { 
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

    onTextChange(event) {
        let article = this.state.article;
        article[event.target.name] = event.target.value;
        this.setState({ article });
    }
    
    onSelectChange(value) {
        let article = this.state.article;
        article.tags = value;
        this.setState({ article: article });
    }
    
    onCatalogChange(value) {
        let catalogs = [...this.state.catalogs, ...value];
        this.setState({ catalogs:catalogs });
    }

    async handleSearch() {
        if (this.state.articleId) {
            const data = await getArticleDetail(this.state.articleId);
            let article = data.data;
            article.tags = article.tags_info.map(tag=>tag.id);
            let catalogs=[];
            catalogs.push(article.catalog_info.id);

            let catalogDefault = [];
            catalogDefault.push(article.catalog_info.name);
            this.setState({
                article:  article,
                catalogs: catalogs,
                catalogDefault: catalogDefault
            });
        } else {
            this.setState({ article: {} });
        }
        const data = await getCatalogTree();
        let tmp = data.data;
        this.changeNode(tmp);
        this.setState({ catalogTree: data.data });

        if (!this.state.tags.length) {
            const tags = await getTagList({});
            this.setState({ tags: tags.data.results });
        }
    }

    handleClose() {
        this.setState({
            articleId: 0,
            selectTags: [],
            article: {},
            catalogDefault: [],
            loading: false,
            visible: false,
            catalogTree: [],
            tags: [],
            catalogs: []
        });
        this.props.onClose(false);
    }

    async saveArticle() {
        this.setState({ loading: true });
        try {
            if (this.state.catalogs.length) {
                this.state.article.catalog = this.state.catalogs[this.state.catalogs.length - 1]
            }
            if (this.props.articleId) {
                await remoteSaveArticle("put", this.state.article);
            } else {
                await remoteSaveArticle("post", this.state.article);
            }
            
            //清空state数据
            this.props.onClose(true);
        } catch (e) {
            console.error(e);
        }
        this.setState({ loading: false });
    }

    uploadSuccess = info => {
        if (info.file.status === "uploading") {
          this.setState({ loading: true });
          return;
        }
        if (info.file.status === "done") {
            let article = this.state.article;
            article.cover = info.file.response.url; 
            this.setState({
              article,
              loading: false
            })
        }
    }

    beforeUpload(file) {
        const isImage = ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type);
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
          message.error("上传图片只能是 JPG 格式!");
        }
        if (!isLt2M) {
          message.error("上传图片大小不能超过 2MB!");
        }

        return isImage && isLt2M;
    }
    
    updateMarkdown(editor, data, value) {
        let article = this.state.article;
        article.markdown = value;
        this.setState({ article });
    }

    componentWillReceiveProps(nextProps) {
        this.state.articleId = nextProps.articleId;
        this.handleSearch();
    }

    componentDidMount() {
        this.handleSearch();
    }

    render() {
      return (
        <Drawer
            visible={ this.props.visible }
            onClose={ ()=>this.handleClose() }
            title={ this.props.articleId? "修改文章" : "新增文章" }
            width={ 1000 }
        >
            <div className="article-form" >
                <Form >
                    <Form.Item label="标题">
                        <Input ref="articleTitle" name="title" 
                            value={ this.state.article.title } 
                            onChange={ this.onTextChange.bind(this) }/>
                    </Form.Item>

                    <Form.Item label="所属分类">
                        <Cascader 
                            defaultValue={ this.state.catalogDefault }
                            options={ this.state.catalogTree } 
                            onChange={ this.onCatalogChange.bind(this) } 
                            placeholder="请选择文章分类" 
                        />
                    </Form.Item>

                    <Form.Item label="标签">
                        <Select 
                            mode="multiple"
                            allowClear
                            placeholder="请选择文章标签" size="medium" 
                            value={ this.state.article.tags }
                            onChange={ this.onSelectChange.bind(this) }
                            style={{ width: "100%" }}>
                            {
                                this.state.tags.map(s=>
                                    (<Option value={ s.id } key={ s.id }>
                                        { s.name }
                                     </Option>))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item label="摘要">
                        <TextArea value={ this.state.article.excerpt } 
                            name="excerpt"
                            onChange={ this.onTextChange.bind(this) }
                            rows={4}
                        /> 
                    </Form.Item>

                    <Form.Item label="关键词">
                        <TextArea value={ this.state.article.keyword } 
                            name="keyword"
                            onChange={ this.onTextChange.bind(this) }
                            rows={2}
                        /> 
                    </Form.Item>

                    <Form.Item label="正文">
                        <MdEditor
                            ref={node => (this.mdEditor = node || undefined)}
                            value={ this.state.article.markdown }
                            style={{ height: '600px', width: '100%' }}
                            renderHTML={ this.renderHTML }
                            plugins={ null }
                            config={{
                              view: {
                                menu: true,
                                md: true,
                                html: true,
                                fullScreen: true,
                                hideMenu: true,
                              },
                              table: {
                                maxRow: 5,
                                maxCol: 6,
                              },
                              imageUrl: '',
                              syncScrollMode: ['leftFollowRight', 'rightFollowLeft'],
                            }}
                            onChange={ this.handleEditorChange }
                            onImageUpload={ this.handleImageUpload }
                        />   
                    </Form.Item>

                    <Form.Item label="封面">
                        <Upload
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={ false }
                            action="/api/upload/cover"
                            beforeUpload={ this.beforeUpload.bind(this) }
                            onChange={ this.uploadSuccess }
                        >
                            { this.state.article.cover ? 
                                <img src={ this.state.article.cover } alt="avatar" style={{ width: "100%" }} className="avatar" /> : 
                                <div>
                                    { this.state.loading ? 
                                        <LoadingOutlined /> : <PlusOutlined /> 
                                    }
                                </div>
                            }
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
            <div className="demo-drawer__footer">
                <Space size="middle">
                    <Button onClick={ this.handleClose.bind(this) } type="primary">
                        取消
                    </Button>
                    <Button loading={ this.state.loading } type="primary" 
                        onClick={ this.saveArticle.bind(this) } >
                        保存
                    </Button>
                </Space>
            </div>        
        </Drawer>
      )
    }
}

export default EditArticle;
