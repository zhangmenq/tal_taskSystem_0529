<template>
  <div>
    <div class="task_wrapper">
      <iheader></iheader>
      <div class="content">
        <div class="task_name_box">
          <div class="task_right_rate">
            <div class="task_right_img">
              <img src="../../static/images/right_rate.png" alt>
              <div>正确率</div>
            </div>
            <div class="task_right_num">{{rightRate}}</div>
          </div>
          <div class="task_name_header" v-if="info.aid">
            <h4>{{info.exercise_name}}</h4>
            <div class="task_name_date">
              提交有效期：{{info.assignment_start_time |formatDate}}
              <span
                class="endtime"
              >{{info.end_time |formatDate}}</span>
            </div>
            <!-- <div class="task_time">作答时间：{{info.duration}}分钟<span class="right_rate">正确率：{{info.schedule}}%</span></div> -->
            <!-- <div class="task_time">正确率：{{rightPer}}</div> -->
            <!-- <div class="task_time"> 得分{{info.score}}（总分{{info.totalScore}}分）</div> -->
            <div class="btn_submit_box details_btn" v-if="info.aid && admin == 0">
              <router-link
                href="javascript:;"
                class="btn btn_wrong"
                v-if="repeatColor"
                :to="{name:'wrong',params:{id:info.aid,type:2}}"
              >错题练习</router-link>
              <a href="javascript:;" class="btn btn_wrong gray_btn" v-else>错题练习</a>
              <router-link
                href="javascript:;"
                class="btn btn_all"
                v-if="repeatNewColor"
                :to="{name:'wrong',params:{id:info.aid,type:1}}"
              >全部练习</router-link>
              <a href="javascript:;" class="btn btn_wrong gray_btn" v-else>全部练习</a>
            </div>
            <div class="btn_submit_box details_btn" v-else>
              <a href="javascript:;" class="btn btn_wrong gray_btn">错题练习</a>
              <a href="javascript:;" class="btn btn_wrong gray_btn">全部练习</a>
            </div>
          </div>
        </div>

        <div class="details_wrapper">
          <div
            class="subject_box"
             v-if="questions.length"
            v-for="(question, index) in questions"
            :key="index"
            :bindIndex="index"
          >
            <!-- 单选题 -->
            <single-choice
              :singleData="question"
              flag="details"
              v-if="question.type === '1' && question.option.length"
              :bindIndex="index"
            ></single-choice>
            <!-- 多选题 -->
            <complex-subject
              v-if="question.type === '2' && question.option.length"
              :compleData="question"
              flag="details"
              :bindIndex="index"
            ></complex-subject>
            <!-- 填空题 -->
            <fill-subject
              v-if="question.type === '3' &&  question.drag.drag_title.length"
              :fillData="question"
              flag="details"
              :bindIndex="index"
            ></fill-subject>
            <!-- 简答题 -->
            <short-answer-subject
              @sendShortAnswer="getwordAnswer"
              v-if="question.type === '4' && question.qid"
              :shortAnswerData="question"
              :admin="admin"
              :exerciseStatus="info.exerciseStatus"
              :bindIndex="index"
              flag="details"
            ></short-answer-subject>
            <!-- 录音题 -->
            <record-subject
              @sendRecodeAnswer="getwordAnswer"
              v-if="question.type === '5'  && question.qid"
              :recordData="question"
              :admin="admin"
              :exerciseStatus="info.exerciseStatus"
              :userAid="info.id"
              flag="details"
              :bindIndex="index"
            ></record-subject>
            <!-- 复合题 -->
            <read-subject
              @sendShortAnswer="getRedAnswer"
              v-if="question.type === '6' && question.sub.length"
              :readData="question"
              :admin="admin"
              :exerciseStatus="info.exerciseStatus"
              flag="details"
              :bindIndex="index"
            ></read-subject>
            <!-- 连线题 -->
            <line-subject
              v-if="question.type === '7' && question.option.length"
              :lineData="question"
              flag="details"
              :bindIndex="index"
            ></line-subject>
            <!-- 拖拽提 -->
            <drag-subject
              v-if="question.type === '8' && question.option.length"
              :dragData="question"
              flag="details"
              :bindIndex="index"
            ></drag-subject>
            <!-- 排序题 -->
            <sort-subject
              v-if="question.type=== '9' && question.option.length"
              :SortData="question"
              flag="details"
              :bindIndex="index"
            ></sort-subject>
            <!-- 写作题 -->
            <write-subject
              @sendWordAnswer="getwordAnswer"
              v-if="question.type=== '10' && question.qid"
              :WriteData="question"
              :admin="admin"
              :exerciseStatus="info.exerciseStatus"
              :bindIndex="index"
              flag="details"
            ></write-subject>
            <!-- 选词题 -->
            <choice-word-subject
              v-if="question.type=== '11' && question.option.length"
              :wordData="question"
              flag="details"
              :bindIndex="index"
            ></choice-word-subject>
            <!-- 改错题 -->
            <correction-subject
              v-if="question.type=== '12' && question.option.length"
              :correctionData="question"
              flag="details"
              :bindIndex="index"
            ></correction-subject>
          </div>
          <div class="submit_box" v-if="admin == 1 && info.exerciseStatus == 5">
            <a href="javascript:;" class="btn_common submit_btn" @click="submitscore">提交</a>
          </div>
        </div>
      </div>
      <audio src id="myAudio"></audio>
    </div>
    <div class="loading_container" v-if="loading">
      <loading></loading>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import iheader from "@/components/header.vue";
import LineSubject from "@/components/LineSubject.vue";
import DragSubject from "@/components/DragSubject.vue";
import SingleChoice from "@/components/SingleChoice.vue";
import ReadSubject from "@/components/ReadSubject.vue";
import ComplexSubject from "@/components/ComplexSubject.vue";
import FillSubject from "@/components/FillSubject.vue";
import ShortAnswerSubject from "@/components/ShortAnswerSubject.vue";
import ChoiceWordSubject from "@/components/ChoiceWordSubject.vue";
import correctionSubject from "@/components/correctionSubject.vue";
import recordSubject from "@/components/RecordSubject.vue";
import SortSubject from "@/components/SortSubject.vue";
import WriteSubject from "@/components/WriteSubject.vue";
import { formatDate } from "@/until/date.js";
import Loading from "@/components/loading/loading";
import axios from "@/until/axios.js";
export default {
  metaInfo: {
    title: " 作业系统--详情页"
  },
  data() {
    return {
      repeatColor: true, // 只有主观题的情况下，不允许查看错题
      repeatNewColor: true,
      loading: true,
      info: {},
      redQid: 0,
      isRedMakeGrade: false,
      singleRedAnswer: {
        qid: "",
        score: "",
        comment: ""
      },
      questionType: null,
      keys1: "",
      redAnswerData: [],
      redQuestion: [],
      redQuestionItme: [],
      questions: [],
      admin: 0, // 0是学生查看，1是老师打分
      rightPer: 0,
      gradeData: [], //主观题提交答案
      gradeAnswer: [], //当前要提交的答案
      questionIndex: 0, // 写作题下标
      submitFlag: false, //提交開館
      writeQuestion: {}
    };
  },
  components: {
    iheader,
    LineSubject,
    DragSubject,
    SingleChoice,
    ComplexSubject,
    ReadSubject,
    Loading,
    ShortAnswerSubject,
    ChoiceWordSubject,
    SortSubject,
    FillSubject,
    WriteSubject,
    correctionSubject,
    recordSubject
  },
  filters: {
    formatDate(time) {
      let date = new Date(Number(time) * 1000);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  created() {
  },
  mounted() {
    let aid = this.$route.params.id; //参数id
    this.getResultData(aid);
    this.repeatSubject(aid);
    this.repeatNewData(aid);
  },
  watch: {
    $route(to, from) {
      this.$router.go(0);
    }
  },
  computed: {
    allRedAnswer() {
      let data = {};
      for (let key in this.singleRedAnswer) {
        data = this.singleRedAnswer[key];
        return (this.gradeData[key] = data);
      }
    },
    rightRate() {
      return this.rightPer + "%";
    }
  },
  methods: {
    // 全部重做
    repeatNewData(aid) {
      let url = "/Exercise/exercises";
      let data = {
        aid: aid,
        type: 1
      };
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            if (res.data.hasOwnProperty("data")) {
              this.repeatNewColor = true;
            } else {
              this.repeatNewColor = false;
            }
          } else {
            this.repeatNewColor = false;
          }
        });
    },
    // 初始化数据
    repeatSubject(aid) {
      let url = "/Exercise/repeatErrorExercise";
      let data = {
        aid: aid,
        type: 2
      };
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            if (res.data.hasOwnProperty("data")) {
              this.repeatColor = true;
            } else {
              this.repeatColor = false;
            }
          } else {
            this.repeatColor = false;
          }
        });
    },
    initScore(data) {
      if (this.questions.length > 0) {
        for (let i = 0; i < this.questions.length; i++) {
          if (this.questions[i].type == "4" || this.questions[i].type == "10" || this.questions[i].type == "5" ) {
            this.$set(this.gradeData, i, {
              qid: this.questions[i].qid,
              score: "",
              comment: ""
            });
          }
        }
      }
    },
    // 获取结果页数据
    getResultData(id) {
      let url = "/Exercise/exerciseResult";
      axios.post(url, { aid: id }).then(res => {
        if (res.code === 200) {
          if (!res.data.hasOwnProperty("data")) {
            this.questions = [];
          } else {
            this.questions = res.data.data;
            this.admin = res.data.admin;
            this.info = res.data.info;
            this.rightPer = Number(res.data.info.accuracy);
            // this.rightPer = Math.round(res.data.data.info.right_num / res.data.data.data.length * 100) + '%'
            this.initScore();
          }
        } else if (res.code === 3009) {
          let url = location.href;
          location.href = process.env.API_ROOT + "/index/pclogin?touri=" + url;
        }
        this.loading = false;
      });
    },
    getwordAnswer(data, comment, index, type) {
      this.gradeData[index].score = data;
      this.gradeData[index].comment = comment;
      this.gradeData[index].questionType = type;
    },
    getRedAnswer(val, index) {
      this.gradeData[index] = val;
    },
    // 提交老师打分答案
    submitscore() {
      this.gradeAnswer = [];
      for (let i = 0; i < this.gradeData.length; i++) {
        if (this.gradeData[i]) {
          if (this.gradeData[i] instanceof Array) {
            for (let j = 0; j < this.gradeData[i].length; j++) {
              if (this.gradeData[i][j]) {
                this.gradeAnswer.push(this.gradeData[i][j]);
              }
            }
          } else {
            this.gradeAnswer.push(this.gradeData[i]);
          }
        }
      }
      for (let i = 0; i < this.gradeAnswer.length; i++) {
        // if (!this.gradeAnswer[i].score) {
        //   this.$alert("请输入评分", "提示", {
        //     confirmButtonText: "知道了"
        //   });
        //   this.submitFlag = false;
        //   return false;
        // } else 
        if (!this.gradeAnswer[i].comment) {
          this.$alert("请输入评语", "提示", {
            confirmButtonText: "知道了"
          });
          this.submitFlag = false;
          return false;
        } else {
          this.submitFlag = true;
        }
      }

      if (this.submitFlag) {
        this.submitData();
      }
    },
    submitData() {
      let data = {
        grade: this.gradeAnswer,
        aid: this.info.aid,
        userAid: this.info.id
      };
      let url = "/Exercise/addGrade";
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            this.$message({
              message: "提交成功",
              type: "success"
            });
            setTimeout(() => {
              location.reload();
            }, 1000);
          } else {
            this.$message({
              message: res.message,
              type: "error"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style scoped lang="less">
  .details_wrapper {
    padding: 20px 0;
    box-sizing: border-box;
    .subject_box {
      width: 100%;
      box-sizing: border-box;
      border-bottom: 1px solid #e3e3e3;
      background: #fff;
    }
  }
  .task_name_box {
    display: flex;
    flex-direction: row;
    position: relative;
    margin: 20px 0 0;
    .task_right_rate {
      border-radius: 10px;
      width: 330px;
      border: 1px solid #e3e3e3;
      background: #fbfcff;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .task_right_img {
        padding: 20px 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        align-content: center;
        border-right: 1px solid #e3e3e3;
        box-sizing: border-box;
        img {
          width: 50px;
          height: 52px;
        }
        div {
          font-size: 18px;
          color: #4277ec;
          margin-top: 10px;
          line-height: 18px;
        }
      }
      .task_right_num {
        padding: 20px 0;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
        line-height: 100%;
        background: #ffffff;
        border-radius: 10px;
        color: #000;
        font-size: 40px;
        font-weight: bold;
      }
    }
    .task_name_header {
      flex: 330px 1;
      margin-left: 20px;
      border-radius: 10px;
      padding: 20px;
      border: 1px solid #e3e3e3;
      background: #fff;
      box-sizing: border-box;
      h4 {
        width: 400px;
        word-break: break-all;
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
      .btn_submit_box {
        a:hover {
          color: #fff;
        }
        position: absolute;
        top: 50%;
        right: 30px;
        transform: translate(0, -50%);
        .btn {
          margin: 0 10px;
          display: inline-block;
          border-radius: 10px;
          font-size: 16px;
        }
        .btn_all {
          background: #4277ec;
        }
        .btn_wrong {
          background: #eca242;
        }
        .gray_btn {
          background: #e3e3e3;
          cursor: not-allowed;
        }
        p {
          text-align: center;
          color: #999;
          padding: 5px 0;
        }
      }
      @media screen and (min-width: 767px) and (max-width: 1025px) {
        .btn_submit_box {
          top: 40px;
        }
      }
      .btn_submit_box.btn_save {
        right: 190px;
      }
    }
  }
  .submit_box {
    font-size: 18px;
    padding: 30px;
    background: #fff;
  }
</style>

