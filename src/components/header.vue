<template>
  <div class="header">
    <div class="content">
      <div class="header_top">
        <h1><img src="../../static/images/logo.png"></h1>
        <div class="header_con_link">
          <a :href="examUrl">学习诊断站</a>
          <a href="/" class="cur">巩固加油站</a>
        </div>
        <div class="header_avatar_box" @mouseover="showMenu" @mouseout="hideMenu">
          <img :src="userInfo.wxAvatar">
          <p>{{userInfo.wxNickname}}同学，您好！</p>
          <div class="header_avatar_menu" v-if="showNav">
            <a :href="myCenterUrl" class="user">个人资料</a>
            <a :href="layoutUrl" class="logout">退出</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import axios from "@/until/axios.js";
import apiConfig from "@/config";
export default {
  data() {
    return {
      showNav: false,
      myCenterUrl: "",
      layoutUrl: "",
      examUrl: "",
      userInfo: {}
    };
  },
  created() {
    // let root = process.env.API_ROOT;
    let root = apiConfig.host;
    let examRoot = root.replace(/service/, "exam");
    this.myCenterUrl = root + "/user/pcupdate";
    this.layoutUrl = root + "/index/logout?toUri=%2Findex%2Fpclogin";
    this.examUrl = examRoot;
    this.getUserInfo();
  },
  methods: {
    showMenu() {
      this.showNav = true;
    },
    hideMenu() {
      this.showNav = false;
    },
    //获取用户信息
    getUserInfo() {
      let url = "/exercise/getUserInfo";
      axios
        .post(url)
        .then(res => {
          if (res.code == 200) {
            this.userInfo = res.data;
          } else if (res.code == 3009) {
            let url = encodeURIComponent(location.href);
            // location.href = process.env.API_ROOT + '/index/pclogin?touri=' + url
            location.href = apiConfig.host + "/index/pclogin?touri=" + url;
          }
        })
        .catch(err => {
          //
        });
    }
  }
};
</script>
