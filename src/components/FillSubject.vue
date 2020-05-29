<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      填空题（{{fillData.score}}分）
    </h2>
    <div class="question_con">
      <question-header :BaseData="fillData" :currentIndex="currentIndex"></question-header>
      <!-- 填空題内容答题页面 -->
      <div>
        <span class="fill_box" v-for="(item,index) in fillData.drag.drag_title" :key="index">
          <span class="fill_text" v-html="item"></span>
          <span class="fill_answer" v-if="fillData.drag.drag_title.length!=(index+1)">
            <i class="answer_item">{{index+1}}</i>
          </span>
        </span>
      </div>
      <!--用户输入答案-->
      <div
        class="user_fill_answer"
        v-if="(flag == 'answer' || (flag == 'wrong' && showWrong==1)) ||flag=='preview'"
      >
        <div
          class="answer_input_item blue_border"
          v-for="(item,index) in fillData.drag.drag_title"
          :key="index"
          v-if="fillData.drag.drag_title.length!=(index+1)"
        >
          <span>{{index+1}}</span>
          <textarea
            placeholder="请输入您的答案"
            rows="2"
            maxlength="100"
            v-model="values[index]"
            @change="sendFillData"
            :title="values[index]"
          ></textarea>
        </div>
      </div>
      <!-- 用户显示答案 -->
      <div class="user_fill_answer" v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)">
        <div
          class="answer_input_item blue_border"
          v-for="(item,index) in detailsData.drag.drag_title"
          :key="index"
          v-if="detailsData.drag.drag_title.length!=(index+1)"
        >
          <span class="index_block">{{index+1}}</span>
          <textarea
            v-if="detailsData.userAnswer.length > 0"
            v-model="detailsData.userAnswer[index].title"
            :title="detailsData.userAnswer[index].title"
            maxlength="100"
            readonly
          ></textarea>
          <textarea v-else maxlength="100" readonly></textarea>
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
      <!--显示正确答案-->
      <base-right
        @closeRight="displayAnswer"
        v-if="(flag == 'details' || (flag == 'wrong' && showWrong ==2)) ||flag=='preview'"
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer && detailsData.rightAnswer ">
          <div
            class="answer_input_item gray_border"
            v-for="(item,index) in detailsData.rightAnswer"
            :key="index"
          >
            <span class="right_index_block">{{index+1}}</span>
            <div class="check_title_item">{{item.title}}</div>
          </div>
        </div>
      </base-right>
    </div>
    <div class="check_btn_box" v-if="showWrong == 1">
      <div class="cancel_btn" @click="cancelSubject" v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="checkAnswerFun">check</div>
    </div>
    <div class="check_btn_box" v-if="showWrong == 2">
      <div class="cancel_btn"  @click="cancelSubject" v-if="cancelSubjectFlag">取消错题</div>
      <div class="check_btn" @click="repeatFun">重做</div>
    </div>
  </div>
</template>

<script>
import baseRight from "@/components/BaseRight.vue";
import QuestionHeader from "@/components/QuestionHeader.vue";
import axios from "@/until/axios.js";
export default {
  components: {},
  props: {
    fillData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
      type: String
  },
  data() {
    return {
      isComplete: false, // 是否完成答题
      values: [],
      sendValues: [],
      currentIndex: 0,
      showAnswer: true,
      showWrong: 0,
      canAjax: true,
      detailsData: {},
         cancelSubjectFlag: true
    };
  },
  components: {
    QuestionHeader,
    baseRight
  },
  watch: {},
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.fillData.qid);
    },
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.fillData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    repeatFun() {
      this.values = [];
      this.isComplete = false
      this.showWrong = 1;
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
        answer: this.sendValues
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
    // 初始化值
    initValues() {
      if (this.fillData.userAnswer.length > 0) {
        for (let i = 0; i < this.fillData.drag.drag_title.length - 1; i++) {
          this.values[i] = this.fillData.userAnswer[i].title;
        }
        this.sendFillData();
      }
    },
    // 获取输入的值
    sendFillData() {
      let empty = null;
      for (let i = 0; i < this.values.length; i++) {
        this.$set(this.sendValues, i, {
          optionId: this.fillData.option[i].id,
          value: this.values[i]
        });
      }
      if (this.sendValues.length == this.values.length) {
        let valueFlag = true;
        this.sendValues.forEach((ele, index) => {
          if (ele.value == null) {
            valueFlag = false;
          }
        });
        this.isComplete = valueFlag;
      } else {
        this.isComplete = false;
      }
      this.$emit(
        "sendAnswer",
        this.sendValues,
        this.isComplete,
        this.bindIndex
      );
    }
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
        if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
    this.detailsData = this.fillData;
    for (let i = 0; i < this.fillData.drag.drag_title.length - 1; i++) {
      this.$set(this.sendValues, i, {
        optionId: 0,
        value: ""
      });
    }
    this.initValues();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
  .fill_text {
    color: #666;
    line-height: 26px;
    font-size: 16px;
    word-break: break-all;
  }
  .fill_answer {
    display: inline-block;
    width: 44px;
    border-bottom: 1px solid #666;
    height: 20px;
    padding: 4px 0 1px;
    text-align: center;
    box-sizing: content-box;
    .answer_item {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #333;
      border-radius: 100%;
      line-height: 20px;
      font-size: 12px;
      color: #fff;
    }
    .wrong_answer_item {
      color: #ee526b;
    }
  }
  .fill_content {
    padding: 10px 0;
  }
  .answer_input_item.blue_border {
    padding-right: 37px;
    border-color: #bdd3fd;
    span {
      border: 1px solid #c1d3f9;
      border-radius: 5px 0 0 5px;
      color: #4177eb;
      border-right: none;
      background: #ebf1ff;
      box-sizing: border-box;
    }
    textarea {
      height: 60px;
      border: 1px solid #c1d3f9;
      border-radius: 0 5px 5px 0;
      padding: 8px 20px;
      width: 100%;
      resize: none;
      font-size: 12px;
      line-height: 21px;
      background: none;
      box-sizing: border-box;
    }
  }
  .answer_input_item {
    padding: 10px 10px 10px 60px;
    margin-top: 20px;
    height: 60px;
    display: flex;
    align-items: center;
    word-break: break-all;
    justify-content: center;
    position: relative;
    span {
      display: block;
      width: 60px;
      height: 60px;
      position: absolute;
      left: 0;
      top:0;
      border-right-width: 1px;
      border-right-style: solid;
      text-align: center;
      font-size: 16px;
      line-height: 58px;
      border-radius:  5px 0 0  5px ;
    }
    .index_block{
      top:0;
    }
    .right_index_block{
      height: 58px;
    }
  }
  .answer_input_item.gray_border {
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    background: #fff;
    span {
      top: 0;
      border-color: #d8d8d8;
      background: #ececec;
      box-sizing: border-box;
    }
    .check_title_item {
      padding: 0 20px;
      font-size: 12px;
    }
  }
</style>