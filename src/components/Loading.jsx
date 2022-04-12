import React, { Component } from "react";
import "antd/dist/antd.css";

class Loading extends Component {
    render() {
      return (
        <div style={{   
        	width: "1200px",
        	height: "600px",
        	fontSize: "30px",
        	textAlign: "center",
  			padding: "50px" }}> 
	        { this.props.tips }
	    </div>
      )
    }
}

export default Loading;