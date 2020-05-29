<template>
  <div class="task_wrapper">
    <iheader></iheader>
    <!-- 导航 -->
    <div class="menu">
      <div class="header-tab content">
        <ul>
          <li v-for="(item,index) in tabs" :key="item+index" :class="{'active':item.id==taskInfo.type}" @click="getTaskList(0,item.id,isClick)">
            <router-link to="/index">{{item.name}}</router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="content task_content" v-if="taskInfo.taskList.length">
      <ul class="task_item" v-for="(item, index) in taskInfo.taskList" :key="item +index">
        <!-- status 0待完成，1是已完成，2是失效，3是进行中 -->
        <li class="task_course" :class="[{'task_course_doing':item.exerciseStatus==2},{'task_course_doned':item.exerciseStatus==3}]">
          <span>{{item.course_name}}</span>
          <i class="task_type" v-if="item.exerciseStatus==0 || item.exerciseStatus==1">待完成</i>
          <i class="task_type" v-if="item.exerciseStatus==2">进行中</i>
          <i class="task_type" v-if="item.exerciseStatus==3">已完成</i>
          <i class="task_type" v-if="item.exerciseStatus==4">已过期</i>
          <i class="task_type" v-if="item.exerciseStatus==5">批改中</i>
          <i class="task_type" v-if="item.exerciseStatus==6">已失效</i>
        </li>
        <li class="task_desrc">
          <span><i class="is_tofel" v-if="item.itembank_type == '1'"></i>{{item.exercise_name}}</span>
          <p class="text" v-if="item.exerciseStatus==3">提交有效期{{item.end_time | formatDate}}</p>
          <p class="text" v-if="item.exerciseStatus!=3">提交有效期{{item.assignment_start_time | formatDate}}</p>
          <div class="progress_bar" v-if="item.schedule>0">
            <span>已完成{{(item.schedule > 100 ? 100:item.schedule)}}%</span>
            <div class="progress_box">
              <div class="progress_active" :style="{width: (item.schedule > 100 ? 100:item.schedule) +'%'}"></div>
            </div>
          </div>
        </li>
        <!-- exerciseStatus//作业状态 0 作业未开始 1作业开始，未写 2 继续写 3 查看 4已过期 5待评分 6已失效 -->
        <!-- exerciseStatus 0未开始，1开始，2继续，3查看,4过期，5待评分 6已失效-->
        <li class="task_btn">
            <!-- 托福考試 -->
            <div class="task_btn_item" v-if="item.itembank_type && item.itembank_type =='1'">
                <div class="first_btn" >
                    <a class="btn_state btn_forbid" v-if="item.exerciseStatus==0">尚未开始</a>
                    <a class="btn_state btn_forbid" v-if="item.exerciseStatus==4">已过期</a>
                    <a  class="btn_state btn_forbid" v-if="item.exerciseStatus==6">已失效</a>
                    <a class="btn_state" v-if="item.exerciseStatus==5" @click="commentTips">批改中</a>
                    <a v-if="item.exerciseStatus==1" :href="item.kmf_exercise_url" class="btn_state">去答题</a>
                    <a v-if="item.exerciseStatus==2" :href="item.kmf_exercise_url" class="btn_state">继续答题</a>
                    <a v-if="item.exerciseStatus==3" :href="item.kmf_exercise_report_url" class="btn_state">查看</a>
                    <p v-if="item.finish_num > 0 ">{{item.finish_num}}人已提交</p>
                </div>
                <!-- subject_status 为1就是客观题，0是主观题 -->
                <a v-if="item.exerciseStatus==3 && item.subject_status ===1" :href="item.kmf_exercise_repeat_url" class="btn_state btn_study">全部练习</a>
          </div>
            <div class="first_btn" v-else>
              <a class="btn_state btn_forbid" v-if="item.exerciseStatus==0">尚未开始</a>
              <a class="btn_state btn_forbid" v-if="item.exerciseStatus==4">已过期</a>
              <router-link :to="{name:'details',params:{id:item.aid}}" class="btn_state" v-if="item.exerciseStatus==6">已失效</router-link>
              <a class="btn_state" v-if="item.exerciseStatus==5" @click="commentTips">批改中</a>
              <router-link :to="{name:'answer',params:{id:item.aid,type: 0}}" class="btn_state" v-if="item.exerciseStatus==1">去答题</router-link>
              <router-link :to="{name:'answer',params:{id:item.aid,type: 0}}" class="btn_state" v-if="item.exerciseStatus==2">继续答题</router-link>
              <router-link :to="{name:'details',params:{id:item.aid}}" class="btn_state" v-if="item.exerciseStatus==3">查看</router-link>
              <p v-if="item.finish_num > 0">{{item.finish_num}}人已提交</p>
            </div>
        </li>
      </ul>
      <p v-show="taskInfo.taskList.length>0 && !loadMoreTask" class="more_data">没有更多数据</p>
    </div>
    <div class="loading_container" v-if="loading">
      <loading></loading>
    </div>
    <div class="no_data" v-if="!taskInfo.taskList.length && !loading">
      <img src="../../static/images/no_data.png" alt="无数据">
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import iheader from "@/components/header.vue";
import Loading from "@/components/loading/loading";
import { formatDate } from "@/until/date.js";
import axios from "@/until/axios.js";
import { fetchPost } from "@/until/axios.js";
import apiConfig from "@/config";
export default {
  metaInfo: {
    title: " 作业系统--首页"
  },
  data () {
    return {
      tabs: [
        {
          name: "全部",
          id: 0
        },
        {
          name: "待完成",
          id: 1
        },
        {
          name: "批改中",
          id: 4
        },
        {
          name: "已完成",
          id: 2
        }
      ],
      loading: true,
      taskInfo: {
        // 作业列表信息
        pageSize: 9,
        type: 1, // 类型 '0'表示全部，1，表示待完成，2表示已完成
        taskList: []
      },
      scrollTop: 0, // 页面滚动高度,
      currentPage: 0, // 当前页码
      loadMoreTask: true, // 是否加载更多作业，监听该数据，变更为true时拉取更多数据
      isClick: true, // 是点击分页
      lock: false // 防止进入watch，第一次加载两组数数据
    };
  },
  components: {
    Loading,
    iheader
  },
  computed: {},
  mounted () {
    let type = this.$route.query.type || 1;
    this.taskInfo.type = type;
    this.getTaskList(0, type, false);

    let that = this;
    // 滚动到底部时
    window.onscroll = () => {
      let lastHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      let scrollTop =
        document.documentElement && document.documentElement.scrollTop; // 页面滚动高度
      let direction = that.scrollTop < scrollTop ? 1 : -1; // 鼠标滑动方向 1: 下 -1: 上
      that.scrollTop = scrollTop;
      if (
        lastHeight - 40 <=
        (document.documentElement.scrollTop || document.body.scrollTop) &&
        direction > 0 &&
        this.loadMoreTask
      ) {
        this.getTaskList(this.currentPage, this.taskInfo.type, false);
      }
    };
  },
  filters: {
    formatDate (time) {
      let date = new Date(Number(time) * 1000);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  methods: {
    // 获取作业列表数据
    getTaskList (curPage, type, flag) {
      this.isLoading = true;
      // 第一次请求，不让加载更多
      if (this.lock) {
        return;
      }
      this.lock = true;
      // 切换数据
      this.taskInfo.type = type;
      curPage += 1;
      let data = {
        type: this.taskInfo.type,
        page: curPage
      };
      let url = "/Exercise/myExercise";
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            //切换的时候，从零开始计算
            if (!res.hasOwnProperty("data")) {
              res.data = [];
            }
            if (res.data.length < this.taskInfo.pageSize) {
              this.loadMoreTask = false;
            }
            if (flag) {
              this.taskInfo.taskList = res.data;
              this.currentPage = 0;
              this.loadMoreTask = true;
            } else {
              this.taskInfo.taskList = this.taskInfo.taskList.concat(res.data);
            }
            this.currentPage++;
          } else if (res.code === 3009) {
            let url = location.href;
            // location.href =
            // process.env.API_ROOT + "/index/pclogin?touri=" + url;
            location.href = apiConfig.host + "/index/pclogin?touri=" + url;
          }
          // 等第一次请求完，再加载更多数据
          this.lock = false;
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.isLoading = false;
          this.lock = false;
        });
    },
    // 评分提示
    commentTips () {
      this.$alert("尚未批改完毕，请耐心等待", "提示", {
        confirmButtonText: "知道了"
      });
    }
  }
};
</script>

<style lang="less" scoped>
  .more_data {
    color: #666;
    text-align: center;
    margin-top: 20px;
  }
  .menu {
    .header-tab {
      padding: 20px 0;
      color: #fff;
      font-size: 16px;
      ul {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;
        width: 420px;
        cursor: pointer;
        li {
          flex: 1;
          text-align: center;
          height: 50px;
          line-height: 50px;
          background: #e5e5e5;
          a {
            color: #999;
          }
        }
        li:first-child {
          border-radius: 10px 0 0 10px;
        }
        li:last-child {
          border-radius: 0 10px 10px 0;
        }
        .active {
          background: #4277ec;
          a {
            color: #fff;
          }
        }
      }
    }
  }
  .common_btn {
    width: 130px;
    height: 50px;
    border-radius: 10px;
    line-height: 50px;
    text-align: center;
    background: #4277ec;
    font-size: 16px;
    color: #fff;
  }
  .task_wrapper {
    .task_content {
      box-sizing: border-box;
      .task_item {
        display: inline-block;
        vertical-align: top;
        width: 32%;
        height: 420px;
        border-radius: 10px;
        box-shadow: 0 5px 21px rgba(0, 0, 0, 0.06);
        padding: 0;
        margin: 0 2% 20px 0;
        .task_course {
          background: url("../../static/images/done.png") no-repeat;
          width: 100%;
          height: 160px;
          background-size: 100% 100%;
          border-radius: 10px 10px 0 0;
          position: relative;
          span {
            display: inline-block;
            padding: 60px 40px 0;
            font-size: 20px;
            color: #fff;
            line-height: 30px;
            text-align: center;
          }
          .task_type {
            position: absolute;
            left: 0;
            top: 20px;
            background: #fff;
            width: 52px;
            height: 30px;
            border-radius: 0 15px 15px 0;
            font-size: 12px;
            color: #333;
            padding-left: 6px;
            line-height: 30px;
            box-sizing: border-box;
          }
        }
        .task_course_doing {
          background: url("../../static/images/doned.png") no-repeat;
          background-size: 100% 100%;
          .task_type {
            background-color: #ff7e00;
            color: #fff;
          }
        }
        .task_course_doned {
          .task_type {
            background-color: #e24244;
            color: #fff;
          }
          background: url("../../static/images/doing.png") no-repeat;
          background-size: 100% 100%;
        }
        .task_desrc {
          border-bottom: 1px solid #f5f5f5;
          padding: 24px 30px 0;
          font-size: 16px;
          color: #333;
          line-height: 20px;
          height: 145px;
          box-sizing: border-box;
         .is_tofel{
            display: inline-block;
            width:46px;
            height:20px;
            margin-right: 4px;
            vertical-align: middle;
            background: url("../../static/images/is_tofel@2x.png") no-repeat;
         }
          .text {
            font-size: 12px;
            color: #999;
            margin-top: 12px;
            span {
              padding-left: 16px;
            }
          }
          .progress_bar {
            .text;
            position: relative;
            height: 12px;
            span {
              display: inline-block;
              vertical-align: top;
              padding-left: 0;
              line-height: 12px;
            }
            .progress_box {
              position: absolute;
              right: 2px;
              top: 4px;
              width: 74%;
              height: 4px;
              background: #efefef;
              .progress_active {
                position: absolute;
                left: 0;
                top: 0;
                z-index: 2;
                background: #4277ec;
                // width: 30%;
                height: 100%;
              }
            }
            @media screen and (min-width: 767px) and (max-width: 1025px) {
              .progress_box {
                width: 56%;
              }
            }
          }
        }
        .task_btn {
          padding-top: 20px;
          border-top: 1px solid #eee;
          .task_btn_item {
            padding: 0 44px;
            display: flex;
            justify-content: space-around;
          }
          .btn_state {
            cursor: pointer;
            .common_btn;
            display: block;
            margin: 0 auto;
          }
          .btn_study {
            background: #01b1c5;
          }
          p {
            font-size: 12px;
            color: #4277ec;
            line-height: 12px;
            margin-top: 10px;
            text-align: center;
          }
          .btn_forbid {
            cursor: not-allowed;
            background: #e5e5e5;
            color: #999;
          }
        }
      }
      .task_item:nth-child(3n) {
        margin-right: 0;
      }
    }
  }
</style>
