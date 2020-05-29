<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      选词题（{{wordData.score}}分）
    </h2>
    <div class="question_con">
      <question-header :BaseData="wordData" :currentIndex="currentIndex"></question-header>
      <!-- 选词题内容答题页面 -->
      <div
        class="content_common fill_content"
        v-if="flag == 'answer' || (flag == 'wrong' && showWrong ==1) || flag=='preview'"
      >
        <span class="fill_word_box" v-for="(item,index) in wordData.drag.drag_title" :key="index">
          <span class="fill_text" v-html="item">{{item}}</span>
          <i class="answer_item" v-if=" wordData.drag.drag_title.length!=(index+1)">{{index+1}}</i>
          <span class="choice_answer" v-if=" wordData.drag.drag_title.length!=(index+1)">
            <span>(</span>
            <span class="choose_box">
              <a
                href="javascript:;"
                class="choose_radio"
                v-for="(option,idx) in wordData.option[index].title"
                :key="idx"
                @click="chooseWords(option,index,wordData.option[index].id)"
                :class="{'checked':values[index].value == option}"
              >
                <span class="choose_icon"></span>
                <span class="choose_label">{{option}}</span>
                <span v-if="idx<(wordData.option[index].title.length-1)" class="cut_icon">/</span>
              </a>
            </span>
            <span>)</span>
          </span>
        </span>
      </div>
      <!-- 查看页面 -->
      <div
        class="content_common fill_content"
        v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)"
      >
        <span
          class="fill_word_box"
          v-for="(item,index) in detailsData.drag.drag_title"
          :key="index"
        >
          <span class="fill_text" v-html="item">{{item}}</span>
          <i class="answer_item" v-if=" wordData.drag.drag_title.length!=(index+1)">{{index+1}}</i>
          <span class="choice_answer" v-if="detailsData.drag.drag_title.length!=(index+1)">
            <i>(</i>
            <span class="choose_box">
              <a
                href="javascript:;"
                class="choose_radio"
                v-for="(option,idx) in detailsData.option[index].title"
                :key="idx"
                :class="[{'checked': detailsData.userAnswer.length > 0 && 
                    (detailsData.rightAnswer[index].title ==  detailsData.userAnswer[index].title && option == detailsData.rightAnswer[index].title) },
                    {'wrong':option !=  detailsData.rightAnswer[index].title && (detailsData.userAnswer.length > 0 && option ==  detailsData.userAnswer[index].title) || detailsData.userAnswer.length==0 && option ==  detailsData.rightAnswer[index].title}]"
              >
                <span class="choose_icon"></span>
                <span class="choose_label">{{option}}</span>
                <span v-if="idx<(detailsData.option[index].title.length-1)" class="cut_icon">/</span>
              </a>
            </span>
            <i>)</i>
          </span>
        </span>
      </div>
      <!--显示正确答案-->
      <base-right
        @closeRight="displayAnswer"
        v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2) || flag=='preview' "
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer">
          <div class="right_content">
            <div class="right_label">正确答案：</div>
            <ul>
              <li v-for="(item,index) in  detailsData.rightAnswer" :key="item.id">
                <span>{{index+1}}</span>
                <span>选词 {{item.title}}</span>
              </li>
            </ul>
          </div>
        </div>
      </base-right>
    </div>
    <div class="check_btn_box" v-if="showWrong == 1">
      <div class="cancel_btn" @click="cancelSubject"  v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="checkAnswerFun">check</div>
    </div>
    <div class="check_btn_box" v-if="showWrong == 2">
      <div class="cancel_btn" @click="cancelSubject"  v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="repeatFun">重做</div>
    </div>
  </div>
</template>
<script>
import QuestionHeader from "@/components/QuestionHeader.vue";
import baseRight from "@/components/BaseRight.vue";
import axios from "@/until/axios.js";
export default {
  components: {},
  props: {
    wordData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      values: [],
      isComplete: false, // 是否完成答题
      allComplete: [], // 是否都选折
      imgSrc: "",
      currentIndex: 0,
      showAnswer: true,
      showWrong: 0,
      canAjax: true,
      detailsData: {},
      cancelSubjectFlag: true
    };
  },
  watch: {},
  components: {
    QuestionHeader,
    baseRight
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.wordData.qid);
    },
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.wordData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    repeatFun() {
      for (let i = 0; i < this.wordData.drag.drag_title.length - 1; i++) {
        this.$set(this.values, i, {
          optionId: 0,
          value: ""
        });
      }
      this.isComplete = false;
      this.showWrong = 1;
    },
    // 展开答案
    displayAnswer() {
      this.showAnswer = !this.showAnswer;
    },
    // 提交check
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
              message: "check失败",
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
    initData() {
      if (
        this.wordData.userAnswer.length > 0 &&
        this.wordData.userAnswer.length == this.values.length
      ) {
        for (let i = 0; i < this.wordData.userAnswer.length; i++) {
          this.$set(this.values, i, {
            optionId: this.wordData.userAnswer[i].id,
            value: this.wordData.userAnswer[i].title
          });
        }
        this.$emit("sendAnswer", this.values, true, this.bindIndex);
      } else {
        this.$emit("sendAnswer", this.values, false, this.bindIndex);
      }
    },
    chooseWords(option, index, id) {
      // 数组里面的值不能直接修改，vue检测不到
      this.$set(this.values, index, {
        optionId: id,
        value: option
      });
      let obj = {
        optionId: 0,
        value: ""
      };
      for (let i = 0; i < this.values.length; i++) {
        if (this.values[i].optionId != 0) {
          this.allComplete[i] = true;
        } else {
          this.allComplete[i] = false;
        }
      }
      if (
        this.allComplete.indexOf(false) == -1 &&
        this.allComplete.length == this.values.length
      ) {
        this.isComplete = true;
      } else {
        this.isComplete = false;
      }
      this.$emit("sendAnswer", this.values, this.isComplete, this.bindIndex);
    }
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
      if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
    this.detailsData = this.wordData;
    for (let i = 0; i < this.wordData.drag.drag_title.length - 1; i++) {
      this.$set(this.values, i, {
        optionId: 0,
        value: ""
      });
    }
    this.initData();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
  .fill_word_box {
    vertical-align: middle;
    word-break: break-all;
  }
  .cut_icon {
    padding: 0 10px 0 5px;
  }
  .fill_text {
    color: #666;
    line-height: 24px;
    font-size: 16px;
  }
  .choice_answer {
    font-size: 16px;
    color: #666;
    a {
      color: #666;
    }
    a:hover {
      color: #666;
    }
    .choose_radio {
      padding-top: 1px;
      font-size: 16px;
      .choose_icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background-image: url(../../static/images/common_word_icon.png);
        background-repeat: no-repeat;
        vertical-align: middle;
      }
      .choose_label {
        display: inline-block;
        vertical-align: middle;
        line-height: 24px;
        word-break: break-all;
      }
    }
    .checked {
      color: #333;
      .right;
      font-weight: bold;
    }
    .right {
      .choose_icon {
        background-image: url(../../static/images/right_word_icon.png);
      }
    }
    .wrong {
      font-weight: bold;
      color: #333;
      .choose_icon {
        background-image: url(../../static/images/wrong_word_icon.png);
      }
    }
    .right_answer {
      display: inline-block;
      color: #333;
      font-size: 16px;
      vertical-align: bottom;
    }
    .answer_item {
      border: none;
      text-align: center;
      height: 30px;
      line-height: 30px;
      color: #000;
      font-size: 18px;
      border-bottom: 1px dashed #666666;
      box-sizing: border-box;
    }
    .wrong_answer_item {
      color: #ee526b;
    }
  }
  .right_answer_main {
    .right_content {
      display: flex;
      flex-direction: row;
      .right_label {
        width: 100px;
        font-size: 20px;
      }
      ul {
        flex: 100px 1;
      }
    }
  }
</style>