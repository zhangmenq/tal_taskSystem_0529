<!--阅读题（复合题）-->
<template>
  <div class="read_box task_item">
    <h2 class="question_type">{{Sort}}复合题</h2>
    <div class="question_con">
      <!-- 题干内容 -->
      <question-header :BaseData="readData" :currentIndex="currentIndex"></question-header>
      <div class="read_tab">
        <i class="tab_arr left_arr" :class="[leftArr ? '': 'unclick']" @click="scrollBar('left')"></i>
        <i
          class="tab_arr right_arr"
          :class="[rightArr ? '': 'unclick']"
          @click="scrollBar('right')"
        ></i>
        <div class="tab_link_box" id="tab_link_box">
          <div
            class="tab_link_scroll clearfix"
            :style="{width: scrollWidth + 'px', marginLeft: '-' + scrollLeft + 'px'}"
          >
            <a
              href="javascript:;"
              @click="tabChange(index)"
              :class="[{'complete':finishIds.indexOf(readData.sub[index].qid)>-1},{'cur':tabIndex === index}]"
              v-for="(tab,index) in readData.sub.length"
              :key="index"
            >
              {{tab}}
              <span></span>
            </a>
          </div>
        </div>
      </div>
      <!-- 查看页面 -->
      <div class="read_questions" v-if="flag=='details'">
        <div
          v-if="readData.sub.length"
          v-for="(question, index) in readData.sub"
          :key="index"
          :style="{display:tabIndex === index?'block':'none'}"
        >
          <single-choice
            :singleData="question"
            v-if="question.type === '1' && question.option.length"
            :bindIndex="index"
            flag="details"
          ></single-choice>
          <complex-subject
            v-if="question.type === '2'  && question.option.length"
            :compleData="question"
            :bindIndex="index"
            flag="details"
          ></complex-subject>
          <!-- 填空题 -->
          <fill-subject
            v-if="question.type === '3'  && question.drag.drag_title.length"
            :fillData="question"
            :bindIndex="index"
            flag="details"
          ></fill-subject>
          <!-- 简答题 -->
          <short-answer-subject
            @sendShortAnswer="getwordAnswer"
            v-if="question.type === '4'  && question.qid"
            :shortAnswerData="question"
            :admin="admin"
            :exerciseStatus="exerciseStatus"
            :bindIndex="index"
            flag="details"
          ></short-answer-subject>
          <!-- 录音题 -->
          <record-subject
            @sendRecodeAnswer="getwordAnswer"
            v-if="question.type === '5'  && question.qid"
            :recordData="question"
            flag="details"
            :admin="admin"
            :exerciseStatus="exerciseStatus"
            :bindIndex="index"
          ></record-subject>
          <!-- 连线题 -->
          <line-subject
            v-if="question.type === '7' && question.option.length"
            :lineData="question"
            :bindIndex="index"
            flag="details"
          ></line-subject>
          <!-- 拖拽提 -->
          <drag-subject
            v-if="question.type === '8' && question.option.length"
            :dragData="question"
            :bindIndex="index"
            flag="details"
          ></drag-subject>
          <!-- 排序题 -->
          <sort-subject
            v-if="question.type=== '9' && question.option.length"
            :SortData="question"
            :bindIndex="index"
            flag="details"
          ></sort-subject>
          <!-- 写作题 -->
          <write-subject
            @sendWordAnswer="getwordAnswer"
            v-if="question.type=== '10' && question.qid"
            :WriteData="question"
            :admin="admin"
            :exerciseStatus="exerciseStatus"
            :bindIndex="index"
            flag="details"
          ></write-subject>
          <!-- 选词题 -->
          <choice-word-subject
            v-if="question.type=== '11' && question.option.length"
            :wordData="question"
            :bindIndex="index"
            flag="details"
          ></choice-word-subject>
          <!-- 改错题 -->
          <correction-subject
            v-if="question.type=== '12' && question.option.length"
            :correctionData="question"
            flag="details"
            :bindIndex="index"
          ></correction-subject>
        </div>
      </div>
      <!-- 答题页面 -->
      <div class="read_questions" v-if="flag=='answer' || flag=='preview' || flag=='wrong'">
        <div
          v-if="readData.sub.length"
          v-for="(question, index) in readData.sub"
          :key="index"
          :style="{display:tabIndex === index?'block':'none'}"
        >
          <single-choice
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            :singleData="question"
            v-if="question.type === '1' && question.option.length && showFlag.length > 0"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></single-choice>
          <complex-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type === '2'  && question.option.length && showFlag.length > 0"
            :compleData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></complex-subject>
          <!-- 填空题 -->
          <fill-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type === '3'  && question.drag.drag_title.length && showFlag.length > 0"
            :fillData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></fill-subject>
          <!-- 简答题 -->
          <short-answer-subject
            @sendAnswer="getReadAnswer"
            v-if="question.type === '4'  && question.qid && showFlag.length > 0"
            :shortAnswerData="question"
            :flag="showFlag"
            :bindIndex="index"
          ></short-answer-subject>
          <!-- 录音题 -->
          <record-subject
            @sendAnswer="getReadAnswer"
            v-if="question.type === '5'  && question.qid && showFlag.length > 0"
            :recordData="question"
            :userAid="sendInfo.id"
            :flag="showFlag"
            :bindIndex="index"
          ></record-subject>
          <!-- 连线题 -->
          <line-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type === '7' && question.option.length && showFlag.length > 0"
            :lineData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></line-subject>
          <!-- 拖拽提 -->
          <drag-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type === '8' && question.option.length && showFlag.length > 0"
            :dragData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></drag-subject>
          <!-- 排序题 -->
          <sort-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type=== '9' && question.option.length && showFlag.length > 0"
            :SortData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></sort-subject>
          <!-- 写作题 -->
          <write-subject
            @sendAnswer="getReadAnswer"
            v-if="question.type=== '10' && question.qid && showFlag.length > 0"
            :WriteData="question"
            :userAid="sendInfo.id"
            :flag="showFlag"
            :bindIndex="index"
          ></write-subject>
          <!-- 选词题 -->
          <choice-word-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type=== '11' && question.option.length && showFlag.length > 0"
            :wordData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></choice-word-subject>
          <!-- 改错题 -->
          <correction-subject
            @sendAnswer="getReadAnswer"
            @cancelsubjet="cancelsubjet"
            v-if="question.type=== '12' && question.option.length && showFlag.length > 0"
            :correctionData="question"
            :flag="showFlag"
            :type="type"
            :bindIndex="index"
            :parentQid="readData.qid"
          ></correction-subject>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import QuestionHeader from "@/components/QuestionHeader.vue";
import singleChoice from "@/components/SingleChoice.vue";
import complexSubject from "@/components/ComplexSubject.vue";
import LineSubject from "@/components/LineSubject.vue";
import DragSubject from "@/components/DragSubject.vue";
import FillSubject from "@/components/FillSubject.vue";
import SortSubject from "@/components/SortSubject.vue";
import ChoiceWordSubject from "@/components/ChoiceWordSubject.vue";
import ShortAnswerSubject from "@/components/ShortAnswerSubject.vue";
import correctionSubject from "@/components/correctionSubject.vue";
import WriteSubject from "@/components/WriteSubject.vue";
import recordSubject from "@/components/RecordSubject.vue";
import axios from "@/until/axios.js";
var qs = require("qs");
export default {
  props: {
    readData: Object,
    flag: String,
    sendInfo: Object,
    bindIndex: Number,
    admin: Number,
    exerciseStatus: Number,
    type: String
  },
  data() {
    return {
      showFlag: "",
      currentIndex: 0,
      answerRed: {
        qid: "",
        score: "",
        comment: ""
      },
      answer: [],
      isQid: 0,
      isMarkGrade: false, // 判断复合题简答题是否打分
      question: {},
      writeQuestion: {},
      tabIndex: 0,
      canAjax: true,
      scrollWidth: 0,
      scrollLeft: 0,
      leftArr: false,
      rightArr: false,
      finishIds: [],
      redGradeData: [],
      itemValues: [], //小题答案
      sendValues: [], // 复合题提交答案
      allIsComplete: [], //所以子题是否答完题目
      isComplete: false // 是否完成答题
    };
  },
  components: {
    singleChoice,
    complexSubject,
    DragSubject,
    LineSubject,
    FillSubject,
    SortSubject,
    ChoiceWordSubject,
    ShortAnswerSubject,
    WriteSubject,
    correctionSubject,
    QuestionHeader,
    recordSubject
  },
  mounted() {
    this.showFlag = this.flag;
    this.initRedScore();
    this.initTab();
    if (this.readData.length) {
      this.initredAnswer();
    }
    this.question = this.readData.sub[0];
    let questions = this.readData.sub;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].userAnswer.length > 0) {
        this.finishIds.push(questions[i].qid);
      }
    }
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  methods: {
    // 取消错题
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
          this.cancelWrongFun(qid, this.sendInfo.aid);
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
            this.$emit("cancelSubject", aid);
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
    //题目滚动
    initTab() {
      this.scrollWidth = this.readData.sub.length * 40;
      let parentWith = document.getElementById("tab_link_box").clientWidth || 698;
      if (this.scrollWidth > parentWith) {
        this.rightArr = true;
      }
    },
    //滚动题目序号
    scrollBar(str) {
      let parentWith = document.getElementById("tab_link_box").clientWidth;
      if (str == "right") {
        if (!this.rightArr) return;
        this.scrollLeft = this.scrollLeft + 40;
        this.leftArr = true;
        if (this.scrollLeft + parentWith >= this.scrollWidth) {
          this.rightArr = false;
        }
      } else {
        if (!this.leftArr) return;
        this.scrollLeft = this.scrollLeft - 40;
        this.rightArr = true;
        if (this.scrollLeft == 0) {
          this.leftArr = false;
        }
      }
    },
    // 初始化可换体提交
    initredAnswer() {
      this.getReadAnswer(this.itemValues, this.isComplete, this.bindIndex);
    },
    // 初始化主观题提交答案
    initRedScore() {
      let canInit = false;
      if (this.readData.sub.length > 0) {
        for (let i = 0; i < this.readData.sub.length; i++) {
          if (
            this.readData.sub[i].type == "4" ||
            this.readData.sub[i].type == "10" || this.readData.sub[i].type == "5"
          ) {
            this.$set(this.redGradeData, i, {
              qid: this.readData.sub[i].qid,
              score: "",
              comment: ""
            });
            canInit = true;
          }
        }
        if (canInit) {
          this.$emit("sendShortAnswer", this.redGradeData, this.bindIndex);
        }
      }
    },
    tabChange(index) {
      if (
        this.answer[this.tabIndex] != undefined &&
        this.answer[this.tabIndex].length != 0
      ) {
        if (this.allIsComplete[this.tabIndex]) {
          if (
            this.finishIds.indexOf(this.readData.sub[this.tabIndex].qid) == -1
          ) {
            this.finishIds.push(this.readData.sub[this.tabIndex].qid);
          }
          if (this.flag != "wrong") {
            this.setSubmitData();
          }
        }
      }
      this.tabIndex = index;
      this.question = this.readData.sub[this.tabIndex];
      this.$emit("sendChildIndex", this.tabIndex);
    },
    // 获取主观题评分
    getwordAnswer(data, comment, index, type) {
      this.redGradeData[index].score = data;
      this.redGradeData[index].comment = comment;
      this.redGradeData[index].questionType = type;
      this.$emit("sendShortAnswer", this.redGradeData, this.bindIndex);
    },
    // 复合题主观题打分数据提交
    submitAnswer() {
      this.redgradeAnswer = [];
      for (let i = 0; i < this.redGradeData.length; i++) {
        if (this.answerRed.qid != "") {
          this.$set(this.redGradeData, i, {
            qid: this.readData.sub[i].qid,
            score: data,
            comment: comment
          });
          this.isMarkGrade = false;
          if (!this.redGradeData[i].score) {
            this.$alert("请输入评分", "提示", {
              confirmButtonText: "知道了"
            });
          } else if (!this.redGradeData[i].comment) {
            this.$alert("请输入评语", "提示", {
              confirmButtonText: "知道了"
            });
            return false;
          } else {
            this.answerRed = this.redGradeData[i];
            this.isQid = this.redGradeData[i].qid;
            this.isMarkGrade = true;
          }
          this.$emit(
            "sendShortAnswer",
            this.answerRed,
            this.isMarkGrade,
            this.bindIndex,
            this.isQid
          );
        }
      }
    },
    //获取复合题答案
    getReadAnswer(val, isComplete, bindIndex) {
      this.answer[bindIndex] = val;
      this.allIsComplete[bindIndex] = isComplete;
      this.itemValues = val;
      let data = {};
      if (this.readData.sub[bindIndex].userAnswer.length > 0) {
        data = {
          qid: this.readData.sub[bindIndex].qid,
          questionType: this.readData.sub[bindIndex].type,
          answer: this.itemValues
        };
        this.sendValues[bindIndex] = data;
        this.allIsComplete[bindIndex] = isComplete;
      } else {
        data = {
          qid: this.readData.sub[bindIndex].qid,
          questionType: this.readData.sub[bindIndex].type,
          answer: this.itemValues
        };
        this.sendValues[bindIndex] = data;
        this.allIsComplete[bindIndex] = isComplete;
      }
      this.$emit(
        "sendReadAnswer",
        this.sendValues,
        this.allIsComplete,
        this.bindIndex
      );
    },
    //复合题单题提交
    setSubmitData() {
      let parentQid = this.readData.qid;
      if (this.canAjax) {
        let aid = this.$route.params.id;
        let subType = this.$route.params.type;
        let exerciseRecordId = this.sendInfo.exercise_record_id;
        let data = {
          aid: aid,
          finish: 0,
          qid: this.question.qid,
          subType: subType,
          questionType: this.question.type,
          cost: 0,
          exerciseRecordId: exerciseRecordId,
          answer: this.answer[this.tabIndex],
          parentQid: parentQid
        };
        let url = "/Exercise/add";
        this.canAjax = false;
        axios
          .post(url, { ...data })
          .then(res => {
            if (res.code === 200) {
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.schedule =
                Math.round(
                  (this.finishIds.length / this.questions.length) * 100
                ) + "%";
              if (isJump == 1) {
                location.href = "/";
              } else if (isJump == 2) {
                this.nextQuestion(this.questionIndex);
              }
            } else {
              this.$message({
                message: res.data.message,
                type: "error"
              });
            }
            this.canAjax = true;
          })
          .catch(err => {
            //
            this.canAjax = true;
          });
      }
    }
  }
};
</script>

<style scoped lang="less">
  .read_box {
    .read_article {
      box-sizing: border-box;
      border: 1px solid #eee;
      margin: 10px 30px;
      padding: 20px;
      max-height: 300px;
      border-radius: 5px;
      color: #666;
      overflow-x: hidden;
      overflow-y: auto;
      p {
        padding: 5px 0;
      }
    }
  }
  .read_tab {
    padding: 0 57px 0 47px;
    position: relative;
    border: 1px solid #bdd3fd;
    background: #fbfcff;
    i {
      display: block;
      width: 38px;
      height: 58px;
      position: absolute;
      top: 0;
      cursor: pointer;
      background-color: #ebf1ff;
      background-image: url(../../static/images/tab_arr_ico.png);
      background-repeat: no-repeat;
    }
    i.left_arr {
      left: 0;
      border-right: 1px solid #bdd3fd;
      background-position: 0 0;
    }
    i.right_arr {
      right: 0;
      border-left: 1px solid #bdd3fd;
      background-position: 0 -58px;
    }
    i.left_arr.unclick {
      background-position: -38px 0;
    }
    i.right_arr.unclick {
      background-position: -38px -58px;
    }
    a {
      display: block;
      float: left;
      width: 30px;
      height: 30px;
      box-sizing: border-box;
      border: 1px solid #d8d8d8;
      text-align: center;
      line-height: 28px;
      position: relative;
      margin-left: 10px;
    }
    a.cur {
      border-color: #5187ff;
      color: #5187ff;
      span {
        display: block;
        width: 4px;
        height: 4px;
        background: #5187ff;
        border-radius: 100%;
        position: absolute;
        bottom: -10px;
        left: 12px;
      }
    }
    a.complete {
      border-color: #5187ff;
      background: #5187ff;
      color: #fff;
    }
    .tab_link_box {
      height: 58px;
      padding: 14px 0;
      overflow: hidden;
      .tab_link_scroll {
      }
    }
  }
</style>








