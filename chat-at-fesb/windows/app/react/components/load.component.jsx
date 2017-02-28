import React, {Component} from 'react'
import {ipcRenderer} from 'electron'

class LoadForm extends Component {
    constructor(props) {
        super(props)
        this.state = {value: ''}
        this.handleCloseClick = this.handleCloseClick.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleLoadClick = this.handleLoadClick.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)        
    }
    render() {
        const {show, title, placeholder, buttonText} = this.props
        return (
            <div  className={'cns-container ' + (show ? 'visible' : '')}>
                <div id="close" onClick={this.handleCloseClick}>
                    &times;
                </div>  
                <div className="row">
                    <h1>{title}</h1>
                </div>     
                <div className="page">           
                    <div className="row border">            
                        <input autoFocus id="inputBox" className="col-8-12" type="password" placeholder={placeholder} onChange={this.handleChange} onKeyPress={this.handleKeyPress}/>
                        <div className="load-button col-4-12" onClick={this.handleLoadClick}>{buttonText}</div>
                    </div>
                </div>      
            </div>   
        );
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        })
    }

    handleCloseClick() {
        ipcRenderer.send(this.props.ipcCloseMsg)
    }

    handleLoadClick() {
        this.ipcSend()
    }

    handleKeyPress(event) {
        if(event.key == 'Enter') {
            this.ipcSend()
            event.preventDefault()
        }        
    }

    ipcSend() {
        const value = this.state.value.trim()
        if ( value != '') {
            ipcRenderer.send(this.props.ipcButtonMsg, value)
        }                
    }    
}

export default LoadForm