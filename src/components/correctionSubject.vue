<!--改错题-->
<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      改错题（{{correctionData.score}}分）
    </h2>
    <div class="question_con">
      <!-- 题干内容 -->
      <question-header :BaseData="correctionData" :currentIndex="currentIndex"></question-header>
      <!-- 答题页 -->
      <div v-if="flag == 'answer' || (flag == 'wrong' && showWrong ==1) || flag=='preview'">
        <p class="sub">
          <span
            v-for="(sub, index) in subs"
            :key="index"
            @dblclick="getword(index)"
            @click="cancelWord(index)"
            :class="sub.isActive?'red':''"
          >{{sub.word}}</span>
        </p>
        <div class="correction_con">
          <div class="c_item" v-for="(chooseWord, index) in chooseWords" :key="index">
            <div class="word_box">{{chooseWord}}</div>
            <span class="c_select_box">
              <el-select v-model="values[index].error" @change="chooseError" placeholder="请选择错误类型">
                <el-option
                  v-for="(error, index) in errors"
                  :label="error"
                  :value="error"
                  :key="index"
                ></el-option>
              </el-select>
            </span>
          </div>
        </div>
      </div>

      <!-- 查看页 -->
      <div v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)">
        <p class="sub">
          <span
            v-for="(sub, index) in subs"
            :key="index"
            :class="sub.isActive?'red':''"
          >{{sub.word}}</span>
        </p>
        <div class="correction_con">
          <div class="c_item" v-for="(chooseWord, index) in chooseWords" :key="index">
            <div class="word_box">{{chooseWord}}</div>
            <span class="c_select_box">
              <el-select v-model="values[index].error">
                <el-option
                  v-for="(error, index) in errors"
                  :label="error"
                  :value="error"
                  :key="index"
                  disabled="disabled"
                ></el-option>
              </el-select>
            </span>
            <img
              src="../../static/images/wrong_icon.png"
              class="right_wrong"
              v-if="detailsData.userAnswer.length==0 || detailsData.userAnswer.length > 0 && detailsData.userAnswer[index].contrast!=detailsData.rightAnswer[index].contrast"
            >
            <img
              src="../../static/images/right_icon.png"
              class="right_wrong"
              v-if="detailsData.userAnswer.length > 0  && detailsData.userAnswer[index].contrast==detailsData.rightAnswer[index].contrast"
            >
          </div>
        </div>
      </div>
      <!--显示正确答案-->
      <base-right
        @closeRight="displayAnswer"
        v-if="(flag == 'details' || (flag == 'wrong' && showWrong ==2))||flag=='preview'"
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer && detailsData.rightAnswer ">
          <p class="sub">
            <span
              v-for="(sub, index) in detailsData.drag.drag_title"
              :key="index"
              :class="{'blue':sub.flag != 0}"
            >{{sub.word}}</span>
          </p>
        </div>
      </base-right>
    </div>
    <div class="check_btn_box" v-if="showWrong == 1">
      <div class="cancel_btn" @click="cancelSubject" v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="checkAnswerFun">check</div>
    </div>
    <div class="check_btn_box" v-if="showWrong == 2">
      <div class="cancel_btn" @click="cancelSubject" v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="repeatFun">重做</div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import QuestionHeader from "@/components/QuestionHeader.vue";
import baseRight from "@/components/BaseRight.vue";
import axios from "@/until/axios.js";
import { error } from "util";
export default {
  props: {
    correctionData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      cancelSubjectFlag: true,
      detailsData: {},
      showAnswer: true,
      showWrong: 0,
      showImg: [],
      currentIndex: 0,
      imgSrc: "",
      question: {},
      checkIndex: null,
      cost: 0,
      subs: [],
      errors: [],
      isComplete: false, // 是否完成答题
      values: [],
      chooseWords: []
    };
  },
  components: {
    QuestionHeader,
    baseRight
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
      if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
    this.detailsData = this.correctionData;
  },
  mounted() {
    let titles = this.correctionData.drag.drag_title;
    let options = this.correctionData.option;
    //处理题目信息
    for (let i = 0; i < titles.length; i++) {
      let obj = titles[i];
      obj.isActive = false;
      this.subs.push(obj);
    }
    //处理错误原因选择列表
    for (let i = 0; i < options.length; i++) {
      if (this.errors.indexOf(options[i].title) == -1) {
        this.errors.push(options[i].title);
      }
    }
    //处理有用户答案的情况
    if (this.correctionData.userAnswer.length > 0) {
      for (let i = 0; i < this.correctionData.userAnswer.length; i++) {
        let value = {
          optionId: this.correctionData.userAnswer[i].id,
          word: this.correctionData.userAnswer[i].title,
          error: this.correctionData.userAnswer[i].error
        };
        this.values.push(value);
        this.chooseWords.push(this.correctionData.userAnswer[i].title);
        this.subs[this.correctionData.userAnswer[i].id].isActive = true;
      }
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.correctionData.qid);
    },
    //check答案
    checkAnswerFun() {
      this.submitWrong(this.correctionData.qid);
    },
    repeatFun() {
      this.chooseWords = [];
      for (let i = 0; i < this.subs.length; i++) {
        this.subs[i].isActive = false;
      }
      this.showWrong = 1;
    },
    submitWrong(qid) {
      let parentQid;
      if (this.parentQid) {
        parentQid = Number(this.parentQid);
      } else {
        parentQid = 0;
      }
      let aid = this.$route.params.id;
      let subType = this.$route.params.type;
      let data = {
        aid: aid,
        qid: qid,
        parentQid: parentQid,
        subType: subType,
        answer: this.values
      };
      let url = "/Exercise/checkAnswer";
      this.canAjax = false;
      axios
        .post(url, {
          ...data
        })
        .then(res => {
          if (res.code === 200) {
            this.$message({
              message: "check成功",
              type: "success"
            });
            this.detailsData = res.data;
            this.showWrong = 2;
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
    // 展开答案
    displayAnswer() {
      this.showAnswer = !this.showAnswer;
    },
    //双击选择单词
    getword(index) {
      if (this.chooseWords.length >= this.correctionData.option.length) {
        return;
      }
      let chooseWord = this.subs[index].word;
      let flag = this.subs[index].flag;
      let isActive = this.subs[index].isActive;
      if (!isActive) {
        this.subs[index].isActive = true;
        if (flag != 0) {
          for (let i = 0; i < this.subs.length; i++) {
            if (this.subs[i].flag == flag && index != i) {
              if (i > index) {
                chooseWord = chooseWord + " ... " + this.subs[i].word;
              } else {
                chooseWord = this.subs[i].word + " ... " + chooseWord;
              }
              this.subs[i].isActive = true;
            }
          }
        }
        this.chooseWords.push(chooseWord);
        let chooseAnswer = {
          word: chooseWord,
          optionId: index,
          error: ""
        };
        this.values.push(chooseAnswer);
        this.sendAnswers();
      }
    },
    //单击取消选择
    cancelWord(index) {
      let chooseWord = this.subs[index].word;
      let flag = this.subs[index].flag;
      let isActive = this.subs[index].isActive;
      if (isActive) {
        this.subs[index].isActive = false;
        for (let i = 0; i < this.subs.length; i++) {
          if (this.subs[i].flag == flag && flag != 0 && index != i) {
            if (i > index) {
              chooseWord = chooseWord + " ... " + this.subs[i].word;
            } else {
              chooseWord = this.subs[i].word + " ... " + chooseWord;
            }
            this.subs[i].isActive = false;
          }
        }
        let wordIndex = this.chooseWords.indexOf(chooseWord);
        this.chooseWords.splice(wordIndex, 1);
        this.values.splice(wordIndex, 1);
        this.sendAnswers();
      }
    },
    //选择错误原因
    chooseError() {
      this.sendAnswers();
    },
    //发送答案
    sendAnswers() {
      let isComplete = false;
      if (this.values.length > 0) {
        isComplete = true;
      } else {
        isComplete = false;
      }
      if (isComplete) {
        this.$emit("sendAnswer", this.values, isComplete, this.bindIndex);
      }
    }
  }
};
</script>
<style lang="less">
  .tips {
    font-size: 14px;
    color: #999;
    font-weight: normal;
  }
  .red {
    color: red;
  }
  .blue {
    color: #4277ec;
  }
  .correction_con {
    padding-top: 5px;
    .c_item {
      height: 34px;
      position: relative;
      padding-right: 268px;
      margin-top: 20px;
      .word_box {
        border: 1px solid #bdd3fd;
        border-radius: 3px;
        line-height: 32px;
        padding: 0 20px;
      }
      .c_select_box {
        display: block;
        width: 212px;
        height: 34px;
        position: absolute;
        right: 36px;
        top: 0;
        .el-input__suffix-inner {
          .el-input__icon {
            line-height: 32px;
            width: 32px;
          }
        }
        .el-input__suffix {
          right: 0;
          width: 32px;
          border-left: 1px solid #bdd3fd;
        }
        .el-input--suffix .el-input__inner {
          padding-right: 34px;
          line-height: 32px;
          height: 34px;
        }
        .el-select .el-input .el-select__caret {
          color: #333;
        }
        .el-select:hover .el-input__inner {
          border-color: #bdd3fd;
        }
        .el-select .el-input__inner {
          border-color: #bdd3fd;
          padding-left: 20px;
        }
      }
    }
  }
</style>