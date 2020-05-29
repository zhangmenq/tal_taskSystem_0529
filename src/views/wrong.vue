<template>
  <div class="task_wrapper">
    <iheader></iheader>
    <div class="content">
      <div class="task_name_box" v-if="info.aid">
        <h4>{{info.exercise_name}}</h4>
        <div class="task_name_date">
          提交有效期：{{info.assignment_start_time | formatDate}}
          <span
            class="endtime"
          >{{info.assignment_end_time | formatDate}}</span>之前完成
        </div>
        <div class="btn_box">
          <router-link :to="{name:'details',params:{id:aid}}" class="btn blue_btn">返回</router-link>
        </div>
      </div>
      <div class="task_main clearfix">
        <div class="main_left" v-if="questions.length">
          <div
            v-for="(question, index) in questions"
            :key="index"
            :style="{display:questionIndex === index?'block':'none'}"
          >
            <!-- 单选题 -->
            <single-choice
              @sendAnswer="getAnswer"
              :singleData="question"
              v-if="question.type === '1' && question.option.length"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></single-choice>
            <!-- 多选题 -->
            <complex-subject
              @sendAnswer="getAnswer"
              v-if="question.type === '2' && question.option.length"
              :compleData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></complex-subject>
            <!-- 填空题 -->
            <fill-subject
              @sendAnswer="getAnswer"
              v-if="question.type === '3'  && question.drag.drag_title.length"
              :fillData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></fill-subject>
            <!-- 复合题 -->
            <read-subject
              @sendReadAnswer="getReadAnswer"
              @sendChildIndex="getChildIndex"
              v-if="question.type === '6' && question.sub.length"
              :readData="question"
              :sendInfo="info"
              @cancelSubject="cancelSubject"
              flag="wrong"
              :type="type"
              :bindIndex="index"
            ></read-subject>
            <!-- 连线题 -->
            <line-subject
              @sendAnswer="getAnswer"
              v-if="question.type === '7' && question.option.length"
              :lineData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></line-subject>
            <!-- 拖拽提 -->
            <drag-subject
              @sendAnswer="getAnswer"
              v-if="question.type === '8' && question.option.length"
              :dragData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></drag-subject>
            <!-- 排序题 -->
            <sort-subject
              @sendAnswer="getAnswer"
              v-if="question.type=== '9' && question.option.length"
              :SortData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></sort-subject>
            <!-- 选词题 -->
            <choice-word-subject
              @sendAnswer="getAnswer"
              v-if="question.type=== '11' && question.option.length"
              :wordData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></choice-word-subject>
            <!-- 改错题 -->
            <correction-subject
              @sendAnswer="getAnswer"
              v-if="question.type=== '12' && question.option.length"
              :correctionData="question"
              flag="wrong"
              :type="type"
              @cancelsubjet="cancelsubjet"
              :bindIndex="index"
            ></correction-subject>
          </div>
          <div class="loading-container" v-if="loading">
            <loading></loading>
          </div>
        </div>
        <div class="main_right">
          <div class="right_box">
            <h4>— 答题进度 —</h4>
            <div class="progress clearfix">
              <div class="pro_bar">
                <div class="percentage" :style="{width: schedule}"></div>
              </div>
              <span class="pro_text">已完成{{(schedule)}}</span>
            </div>
          </div>
          <div class="right_box">
            <h4>— 题目列表 —</h4>
            <div class="questions_list_box">
              <!--题目序号列表-->
              <a
                href="javascript:;"
                v-for="(question, index) in questions"
                :key="index"
                class="ql_item"
                :class="[{'cur':finishIds.indexOf(question.qid)>-1},{'active':questionIndex === index}]"
                @click="changeQuestion(index)"
              >{{index+1}}</a>
            </div>
          </div>
          <div class="right_btn_box">
            <a
              href="javascript:;"
              class="question_btn click"
              v-if="questionIndex > 0"
              @click="changeQuestion(questionIndex - 1)"
            >上一题</a>
            <a href="javascript:;" class="question_btn unclick_btn" v-if="questionIndex == 0">上一题</a>
            
            <a
              href="javascript:;"
              class="question_btn click"
              @click="changeQuestion(questionIndex + 1)"
              v-if="questionIndex < questions.length-1"
            >下一题</a>
            <a
              href="javascript:;"
              class="question_btn unclick_btn"
              v-if="questionIndex == questions.length-1"
            >下一题</a>
          </div>
        </div>
      </div>
    </div>
    <audio src id="myAudio"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import iheader from "@/components/header.vue";
import NavTab from "@/components/NavTab.vue";
import singleChoice from "@/components/SingleChoice.vue";
import complexSubject from "@/components/ComplexSubject.vue";
import readSubject from "@/components/ReadSubject.vue";
import LineSubject from "@/components/LineSubject.vue";
import DragSubject from "@/components/DragSubject.vue";
import FillSubject from "@/components/FillSubject.vue";
import SortSubject from "@/components/SortSubject.vue";
import ChoiceWordSubject from "@/components/ChoiceWordSubject.vue";
import ShortAnswerSubject from "@/components/ShortAnswerSubject.vue";
import correctionSubject from "@/components/correctionSubject.vue";
import WriteSubject from "@/components/WriteSubject.vue";
import Loading from "@/components/loading/loading";
import { formatDate } from "@/until/date.js";
import axios from "@/until/axios.js";
var qs = require("qs");
window.exerciseRecordId = 0;
export default {
  metaInfo: {
    title: " 作业系统--答题页"
  },
  data() {
    return {
      type: "",
      aid: 0,
      newData: { type: "3" }, // 新题型数据
      questionIndex: 0, //当前题目索引
      questions: [], //获取到的questions
      question: {}, //当前question
      finishIds: [], //完成的id集
      info: {}, //试卷完成的百分比
      schedule: 0, //完成百分比
      cost: 0, //耗时
      answer: [], //当前要提交的答案
      childIndex: 0,
      allIsComplete: [], // 是否所以组件都答完题
      loading: true, //是否显示loading加载中
      canAjax: true,
      wrongFlag: -1
    };
  },
  components: {
    iheader,
    NavTab,
    singleChoice,
    complexSubject,
    readSubject,
    LineSubject,
    DragSubject,
    Loading,
    FillSubject,
    SortSubject,
    WriteSubject,
    ChoiceWordSubject,
    ShortAnswerSubject,
    correctionSubject
  },
  created() {
    this.aid = this.$route.params.id; //参数id
    this.type = this.$route.params.type; //参数type
    this.getQuestionData(this.aid, this.type); //获取重做题
  },
  mounted() {
    // 关闭浏览器给提示
    let UnloadConfirm = {};
    UnloadConfirm.MSG_UNLOAD =
      "作业尚未保存，离开后可能会导致数据丢失\n\n您确定要离开吗？";
    UnloadConfirm.set = function(a) {
      window.onbeforeunload = function(b) {
        b = b || window.event;
        b.returnValue = a;
        return a;
      };
    };
    UnloadConfirm.clear = function() {
      fckDraft.delDraftById();
      window.onbeforeunload = function() {};
    };
    UnloadConfirm.set(UnloadConfirm.MSG_UNLOAD);
  },
  filters: {
    formatDate(time) {
      let date = new Date(Number(time) * 1000);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  watch: {
    $route(to, from) {
      this.$router.go(0);
    }
  },
  methods: {
    // 取消复合题错题
    cancelSubject(aid) {
      let url = "/Exercise/removeErrorQuestion";
      this.getQuestionData(aid, this.type);
    },
    // 取消错题
    cancelsubjet(qid) {
      this.$confirm(
        "取消后，该题不会出现在错题列表中，是否取消该错题?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.cancelWrongFun(qid, this.aid);
        })
        .catch(() => {});
    },
    // 调取取消错题接口
    cancelWrongFun(qid, aid) {
      let data = {
        aid: aid,
        qid: qid
      };
      let url = "/Exercise/removeErrorQuestion";
      this.canAjax = false;
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            this.$message({
              message: "取消成功",
              type: "success"
            });
            this.getQuestionData(aid, this.type);
          } else {
            this.$message({
              message: res.data.message,
              type: "error"
            });
          }
          this.canAjax = true;
        })
        .catch(err => {
          this.canAjax = true;
        });
    },
    // 获取普通题目答案
    getAnswer(data, isComplete, bindIndex) {
      this.answer[bindIndex] = data;
      this.allIsComplete[bindIndex] = isComplete;
    },
    // 获取复合题题目答案
    getReadAnswer(data, isComplete, bindIndex) {
      this.answer[bindIndex] = data;
      this.allIsComplete[bindIndex] = isComplete;
    },
    //获取复合题索引
    getChildIndex(childIndex) {
      this.childIndex = childIndex;
    },
    //获取题目列表
    getQuestionData(aid, type) {
      this.loading = true;
      let url = "";
      if (type == 1) {
        url = "/Exercise/exercises";
      } else {
        url = "/Exercise/repeatErrorExercise";
      }
      let data = {
        aid: aid,
        type: type
      };
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            if (!res.data.hasOwnProperty("data")) {
              this.questions = [];
            } else {
              this.questions = res.data.data;
              this.question = this.questions[this.questionIndex];
            }
            this.info = res.data.info;
          } else if (res.code === 3009) {
            let url = location.href;
            location.href = process.env.API_ROOT + "/index/pclogin?touri=" + url;
          } else if (res.code === 5004) {
            // 跳转回首页
            this.$router.push({ name: "/index", query: { type: 1 } });
          } else {
            this.$alert("数据出错了", "提示", {
              confirmButtonText: "知道了"
            });
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.$alert("服务器错误，请稍后再试", "提示", {
            confirmButtonText: "知道了"
          });
          this.loading = false;
        });
    },
    //根据索引切换题目
    changeQuestion(index) {
      //检测是否完成
      if (this.question.type == 6) {
        if (this.answer[this.questionIndex] != undefined) {
          if (
            this.answer[this.questionIndex][this.childIndex] != undefined &&
            this.answer[this.questionIndex][this.childIndex].length != 0
          ) {
            if (this.allIsComplete[this.questionIndex][this.childIndex]) {
              if (
                this.finishIds.indexOf(this.question.qid) == -1 &&
                this.allIsComplete[this.questionIndex].length ==
                  this.question.sub.length
              ) {
                let isAll = true;
                let subComplete = this.allIsComplete[this.questionIndex];
                for (let i = 0; i < subComplete.length; i++) {
                  if (subComplete[i] == undefined) {
                    isAll = false;
                  }
                }
                if (isAll) {
                  this.finishIds.push(this.question.qid);
                }
              }
            }
          }
        }
      } else {
        if (
          this.answer[this.questionIndex] != undefined &&
          this.answer[this.questionIndex].length != 0
        ) {
          if (this.allIsComplete[this.questionIndex]) {
            if (this.finishIds.indexOf(this.question.qid) == -1) {
              this.finishIds.push(this.question.qid);
            }
          }
        }
      }
      this.schedule =
        Math.round((this.finishIds.length / this.questions.length) * 100) + "%";
      this.questionIndex = index;
      this.question = this.questions[index];
    },
    //公用的提示框
    DiagloShow(text, btnText, btnCancle, callback) {
      this.$confirm(text, "提示", {
        confirmButtonText: btnText,
        cancelButtonText: btnCancle
      })
        .then(() => {
          //确定回调
          if (typeof callback == "function") {
            callback();
          }
        })
        .catch(err => {
          //取消
          let idx = this.finishIds.indexOf(
            this.questions[this.questionIndex].qid
          );
          this.finishIds.splice(idx, 1);
        });
    }
  }
};
</script>

<style scoped lang="less">
  .border {
    border: 1px solid #eee;
  }
  .white_bg {
    background: #fff;
  }
  .task_name_box {
    position: relative;
    margin: 20px 0 0;
    padding: 18px 30px;
    border: 1px solid #bdd3fd;
    background: #ebf1ff;
    h4 {
      font-size: 20px;
      font-weight: bold;
      line-height: 30px;
    }
    .task_name_date {
      margin-top: 10px;
      line-height: 22px;
      font-size: 12px;
      color: #666;
      span.endtime {
        margin-left: 20px;
      }
    }
    .btn_box {
      a:hover {
        color: #fff;
      }
      position: absolute;
      top: 18px;
      right: 30px;
      .btn {
        border-radius: 10px;
        font-size: 16px;
      }
      p {
        text-align: center;
        color: #999;
        padding: 5px 0;
      }
    }
    .btn_box.btn_save {
      right: 190px;
    }
  }
  .task_main {
    margin: 20px 0 0;
    padding-bottom: 30px;
  }
  .main_left {
    width: 906px;
    height: auto;
    overflow: hidden;
    float: left;
    .border;
    .white_bg;
    padding-bottom: 30px;
  }
  .main_right {
    float: right;
    width: 272px;
  }
  @media screen and (min-width: 767px) and (max-width: 1025px) {
    .main_left {
      width: 72%;
    }
    .main_right {
      width: 25%;
    }
  }
  .right_box {
    padding: 30px 0;
    margin-bottom: 20px;
    .white_bg;
    .border;
    h4 {
      font-size: 16px;
      text-align: center;
      color: #666;
    }
    .progress {
      color: #666;
      margin-top: 25px;
      font-size: 12px;
      padding: 0 25px;
      .pro_bar {
        width: 150px;
        height: 8px;
        background: #d9d9d9;
        float: left;
        margin-top: 5px;
        border-radius: 4px;
      }
      @media screen and (min-width: 767px) and (max-width: 1025px) {
        .pro_bar {
          width: 100%;
        }
        .pro_text {
          text-align: center;
          float: none;
          display: block;
          margin-top: 10px;
        }
      }
      .percentage {
        height: 8px;
        background: #2f77f4;
        border-radius: 4px;
      }
      span {
        float: right;
      }
    }
    .questions_list_box {
      padding: 20px 9px 0 19px;
      display: flex;
      flex-wrap: wrap;
      .ql_item {
        display: block;
        width: 62px;
        margin: 10px 20px 0 0;
        background: #fff;
        line-height: 30px;
        text-align: center;
        color: #bbb;
        border-radius: 3px;
        .border;
      }
      .ql_item:nth-child(3n) {
        margin: 10px 0 0;
      }
      .ql_item:hover,
      .ql_item.cur {
        background: #4177eb;
        color: #fff;
      }
      .ql_item.active {
        background: #fff;
        color: #4177eb;
        border: 1px solid #4177eb;
      }
    }
    @media screen and (min-width: 767px) and (max-width: 1023px) {
      .questions_list_box {
        padding: 20px 10px 0 10px;
        .ql_item {
          margin: 10px 5px 0 0;
        }
      }
    }
  }
  .right_btn_box {
    display: flex;
    .question_btn {
      color: #4177eb;
      display: block;
      flex: 1;
      margin-right: 20px;
      height: 48px;
      line-height: 48px;
      text-align: center;
      border-radius: 10px;
      border: 1px solid #eee;
      background: #fff;
    }
    .question_btn:last-child {
      margin-right: 0;
    }
    .question_btn.click {
      color: #4177eb;
    }
    .question_btn.click:hover {
      border-color: #4177eb;
    }
    .question_btn.unclick_btn {
      color: #d2d2d2;
    }
  }
  @media screen and (min-width: 767px) and (max-width: 1023px) {
    .right_btn_box {
      display: flex;
      .btn {
        margin-right: 10px;
      }
    }
  }
</style>