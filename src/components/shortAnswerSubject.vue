<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      简答题（{{shortAnswerData.score}}分）</h2>
    <div class="question_con">
      <question-header :BaseData="shortAnswerData" :currentIndex="currentIndex"></question-header>
      <div class="short_box">
        <div class="short_space" v-if="flag=='answer' ||flag=='preview' ">
          <textarea name id rows="6" v-model="value" @change="getContent" placeholder="请输入您的答案"></textarea>
        </div>
        <div class="display_result" v-if="flag=='details'">
          <div class="short_space">
            <textarea rows="6" v-model="shortAnswerData.userAnswer[0]" disabled></textarea>
          </div>
          <div class="display_result_list">
            <div class="display_result_item" v-if="admin == 1 && exerciseStatus == 5">
              <div class="short_score">
                <input
                  type="number"
                  placeholder="请输入评分:"
                  v-model="score"
                  @change="makeGrade"
                  step="0.01"
                >
              </div>
              <div class="short_mark">
                <h3>请输入评语:</h3>
                <textarea rows="4" v-model="comment" @change="checkScore"></textarea>
              </div>
            </div>
            <div class="display_result_item" v-if="exerciseStatus == 3">
              <div class="short_score"></div>
              <div class="short_mark">
                <h3>老师评语:</h3>
                <textarea rows="4" v-model="shortAnswerData.rightAnswer.comment" readonly></textarea>
              </div>
            </div>
            <!-- button -->
            <div class="display_btn">
              <div class="dislay_btn_item" v-if="analysis.have > 0" @click="showAnsyFun">试题解析</div>
              <div
                class="dislay_btn_item"
                v-if="referenceAnswer.have > 0"
                @click="showReferenceFun"
              >参考答案</div>
            </div>
          </div>
        </div>
        <div class="display_result_preview" v-if="flag=='preview' ">
          <div class="display_btn">
            <div class="dislay_btn_item" v-if="analysis.have > 0" @click="showAnsyFun">试题解析</div>
            <div
              class="dislay_btn_item"
              v-if="referenceAnswer.have > 0"
              @click="showReferenceFun"
            >参考答案</div>
          </div>
        </div>
      </div>
      <!-- 试题解析 -->
      <analysis-dialog
        :dialogTableVisible="showAnasyDialog"
        @closeDialog="closeDialog"
        :anayData="analysis"
        :qid="shortAnswerData.qid"
      ></analysis-dialog>
      <!-- 正确答案 -->
      <analysis-dialog
        :dialogTableVisible="showReferenceDialog"
        @closeDialog="closeReference"
        :anayData="referenceAnswer"
        :qid="shortAnswerData.qid"
      ></analysis-dialog>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import analysisDialog from "@/components/AnalysisDialog.vue";
import QuestionHeader from "@/components/QuestionHeader.vue";
export default {
  props: {
    shortAnswerData: Object,
    flag: String,
    bindIndex: Number,
    admin: Number,
    exerciseStatus: Number
  },
  data() {
    return {
      showAnasyDialog: false,
      showReferenceDialog: false,
      score: 0,
      teacher: false,
      question: {},
      checkIndex: null,
      cost: 0,
      isComplete: false, // 是否完成答题
      value: "",
      currentIndex: 0,
      analysis: {},
      referenceAnswer: {},
      comment: ""
    };
  },
  components: {
    QuestionHeader,
    analysisDialog
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
    }
    this.detailsData = this.SortData;
    if (this.shortAnswerData.userAnswer.length > 0) {
      this.value = this.shortAnswerData.userAnswer[0];
      this.getContent();
    }
  },
  mounted() {
    if (this.flag == "details" || this.flag == "preview") {
      if (this.shortAnswerData.analysis.have > 0) {
        this.analysis = this.shortAnswerData.analysis;
      }
      this.referenceAnswer = this.shortAnswerData.rightAnswer.referenceAnswer;
    }
  },
  methods: {
    // 弹出试题解析
    showAnsyFun() {
      this.showAnasyDialog = true;
    },
    // 弹出试题解析
    showReferenceFun() {
      this.showReferenceDialog = true;
    },
    // 关闭弹窗
    closeDialog(val) {
      this.showAnasyDialog = val;
    },
    closeReference(val) {
      this.showReferenceDialog = val;
    },
    getContent() {
      if (this.value.length > 0) {
        this.isComplete = true;
      } else {
        this.isComplete = false;
      }
      this.$emit("sendAnswer", this.value, this.isComplete, this.bindIndex);
    },
    // 老师打分
    makeGrade() {
      this.checkScore();
    },
    // 校验分数
    checkScore() {
      if (this.score > Number(this.shortAnswerData.score)) {
        this.$alert("评分不能大于题目分数", "提示", {
          confirmButtonText: "知道了"
        });
        this.score = "";
        return false;
      } else if (this.score < 0) {
        this.$alert("评分不能小于0", "提示", {
          confirmButtonText: "知道了"
        });
        this.score = "";
        return false;
      }
      if (this.comment.length < 0) {
        this.$alert("请输入评语", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
      this.$emit("sendShortAnswer", this.score, this.comment, this.bindIndex,this.shortAnswerData.type);
    }
  }
};
</script>
<style lang="less" scoped>
  .short_content {
    padding: 20px;
    background: #fbfbfb;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    border-radius: 10px;
    font-size: 20px;
    color: #666;
    line-height: 22px;
    margin-bottom: 30px;
  }

  .short_box {
    margin-top: 20px;
    .short_space {
      width: 100%;
      textarea {
        background: #fbfcff;
        word-break: break-all;
        width: 100%;
        border-radius: 10px;
        padding: 20px;
        box-sizing: border-box;
        border: 1px solid #c1d3f9;
        color: #333;
        font-size: 16px;
        border-radius: 3px;
        line-height: 24px;
      }
      margin-bottom: 20px;
    }
  }

  .display_result_list {
    position: relative;
    min-height: 60px;
    .display_btn {
      position: absolute;
      right: 0;
      top: 0;
      font-size: 0;
      .dislay_btn_item {
        width: 140px;
        height: 50px;
        line-height: 50px;
        border: 1px solid #c1d3f9;
        border-radius: 10px;
        background: #fbfcff;
        color: #4277ec;
        font-size: 18px;
        text-align: center;
        margin-left: 20px;
        display: inline-block;
        cursor: pointer;
      }
    }
  }
</style>

