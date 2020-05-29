// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Meta from 'vue-meta'
import 'babel-polyfill'
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css'
import '../static/css/layout.css'
import Comjs from '@/until/common.js'
import {
    Select,
    Dialog,
    Option,
    MessageBox,
    Message,
    Dropdown,
    DropdownMenu,
    DropdownItem
} from 'element-ui'
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.use(Meta)

Vue.config.productionTip = false
Vue.use(Meta)
Vue.use(Select)
Vue.use(Dialog)
Vue.use(Option)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$comjs = Comjs

// 判断浏览器类型
function checkBrowser(){
    var ua = navigator.userAgent.toLocaleLowerCase();
    var browserType=null;
    if (ua.match(/firefox/) != null) {
           browserType = "Firefox";
    }else if(ua.match(/MicroMessenger/i) !=null) {
         browserType = "micromessenger";
    }else if (ua.match(/chrome/) != null) {
    var is360 = _mime("type", "application/vnd.chromium.remoting-viewer");
    function _mime(option, value) {
                var mimeTypes = navigator.mimeTypes;
                for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                       return true;
                  }
                }
                return false;
            }
    if(is360){               
    browserType = '360';  
                 }else{  
                    browserType = "Chrome";  
                 }  
           
    }else if (ua.match(/safari/) != null) {
           browserType = "Safari";
    }else{
        browserType = "other"  
    }
    return browserType;
    }

    if((/Android|webOS|iPhone|BlackBerry/i.test(navigator.userAgent))) {
            let tips = '我们的作业系统目前仅支持在电脑端使用谷歌浏览器和火狐浏览器做题'
            MessageBox.alert(tips,'提示',{
                confirmButtonText: '确定',
                callback: action => {
                    location.reload();
                }
            });
        } else if(!((checkBrowser()=='Chrome') || (checkBrowser()=='Safari') ||(checkBrowser()=='Firefox'))){
            let tips = '我们的作业系统目前仅支持使用谷歌浏览器和火狐浏览器，你可在我们提供的下载链接中下载~'
            MessageBox.alert(tips, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                    window.location.href = 'http://service.hiworld.com/download'
                }
            })
        }
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})
