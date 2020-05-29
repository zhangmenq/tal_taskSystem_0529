import 'babel-polyfill'
import axios from 'axios'
import qs from 'qs'
import apiConfig from '@/config'
axios.defaults.withCredentials = true
// import cookie from './cookie.js'
// let webReponseTime = cookie.get('webReponseTime')
// 拦截request,设置全局请求为ajax请求
let countData = {
  url: null,
  post: null,
  method: 0,
  http_status: null,
  req_time: null,
  rsp_time: null,
  response_info: null
}
let axajFlag = true
let root = apiConfig.host
axios.interceptors.request.use(
  function(config) {
    // 发送请求前做些设置一个时间
    if (config.url === '/tongji/api') {
      axajFlag = false
    } else {
      axajFlag = true
    }
    countData.req_time = new Date().getTime()
    countData.post = JSON.stringify(config.data)
    countData.url = config.url
    config.timeout = 10000 // 超时设置
    config.url = root + config.url
    let cancelGroupName
    if (config.method === 'post') {
      countData.method = 1
      if (config.data && config.data.cancelGroupName) {
        // post请求ajax取消函数配置
        cancelGroupName = config.data.cancelGroupName
      }
      config.data = qs.stringify(config.data)
    } else {
      if (config.params && config.params.cancelGroupName) {
        // get请求ajax取消函数配置
        cancelGroupName = config.params.cancelGroupName
      }
    }
    if (cancelGroupName) {
      if (axios[cancelGroupName] && axios[cancelGroupName].cancel) {
        axios[cancelGroupName].cancel()
      }
      config.cancelToken = new CancelToken(c => {
        axios[cancelGroupName] = {}
        axios[cancelGroupName].cancel = c
      })
    }
    return config
  },
  err => {
    console.log(err, 'erquest')
    countData.req_time = new Date().getTime()
    countData.post = JSON.stringify(err.data)
    countData.url = err.url
    return Promise.reject(err)
  }
)
// 拦截响应response，并做一些错误处理
axios.interceptors.response.use(
  response => {
    countData.rsp_time = new Date().getTime()
    countData.response_info = response.request.responseText
    countData.http_status = response.request.status
    const data = response.data
    if (response.status === 200 && axajFlag) {
      tongji(countData)
    }
    return data
  },
  function(error) {
    // 这里是返回状态码不为200时候的错误处理
    countData.rsp_time = new Date().getTime()
    countData.response_info = error.request.responseText
    countData.http_status = error.request.status
    if (axajFlag) {
      tongji(countData)
    }
    return Promise.reject(error)
  }
)
// 返回一个Promise(发送post请求)
export function fetchPost(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, params)
      .then(
        response => {
          resolve(response)
        },
        err => {
          reject(err)
        }
      )
      .catch(error => {
        reject(error)
      })
  })
}
function tongji(data) {
  const countDataStr = JSON.stringify(data)
  const paramsData = {
    info: countDataStr
  }
  fetchPost('/tongji/api', paramsData)
    .then(
      res => {
        console.log('tongji success')
      },
      err => {
        console.log('tongji err')
        console.log(err)
      }
    )
    .catch(error => {
      console.log('tongji error')
      console.log(error)
    })
}
export default axios
