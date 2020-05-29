<!--单选题-->
<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      单选题（{{singleData.score}}分）
    </h2>
    <div class="question_con">
      <question-header :BaseData="singleData" :currentIndex="currentIndex"></question-header>
      <div class="choose_wrapper">
        <!-- 查看页面 -->
        <div
          v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)"
          v-for="(option,index) in detailsData.option"
          :key="index"
          class="choose_btn radio"
          :class="{checked:detailsData.userAnswer.length>0 && option.id == detailsData.userAnswer[0]}"
        >
          <div class="check_icon"></div>
          <div class="check_content">
            <div v-html="option.mark" class="check_mark"></div>
            <div class="check_title">
              <div v-html="option.title" class="check_title_item" :title="(option.title).replace(/<[^<>]+?>/g,'')"></div>
            </div>
          </div>
          <img
            src="../../static/images/right_icon.png"
            class="right_wrong choose_wrong"
            v-if="detailsData.userAnswer[0] && option.id == detailsData.userAnswer[0] && detailsData.userAnswer[0]==detailsData.rightAnswer[0].id"
          >
          <img
            src="../../static/images/wrong_icon.png"
            class="right_wrong choose_wrong"
            v-if="!detailsData.userAnswer[0] && (option.id == detailsData.rightAnswer[0].id) || detailsData.userAnswer[0] && option.id == detailsData.userAnswer[0] && detailsData.userAnswer[0]!=detailsData.rightAnswer[0].id"
          >
        </div>
        <!-- 答题页面 -->
        <div
          v-for="option in singleData.option"
          :key="option.id"
          class="choose_btn radio"
          v-if="(flag == 'answer' || (flag == 'wrong' && showWrong==1)) ||  flag=='preview'"
          :class="{checked: checkIndex === option.id}"
          @click="radioChoose(option.id)"
        >
          <div class="check_icon"></div>
          <div class="check_content">
            <div v-html="option.mark" class="check_mark"></div>
            <div class="check_title">
              <div v-html="option.title" class="check_title_item" :title="(option.title).replace(/<[^<>]+?>/g,'')"></div>
            </div>
          </div>
        </div>
      </div>
      <!--显示正确答案-->
      <base-right
        v-if="(flag == 'details' || (flag == 'wrong' && showWrong ==2)) || flag=='preview'"
        @closeRight="displayAnswer"
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer">正确答案：{{detailsData.rightAnswer[0].mark}}</div>
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
export default {
  props: {
    singleData: Object,
    flag: String,
    wrongFlag: Number,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      detailsData: {}, // 查看详情页面数据
      currentIndex: 0,
      question: {},
      cost: 0,
      showWrong: 0,
      canAjax: true,
      showAnswer: true,
      checkIndex: null,
      values: [],
      cancelSubjectFlag: true,
      isComplete: false // 是否完成答题
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
    this.detailsData = this.singleData;
  },
  mounted() {
    if (this.detailsData.userAnswer.length > 0) {
      this.radioChoose(this.detailsData.userAnswer[0]);
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.singleData.qid);
    },
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.singleData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    repeatFun() {
      this.isComplete = false;
      this.checkIndex = null;
      this.showWrong = 1;
    },
    // 展开答案
    displayAnswer() {
      this.showAnswer = !this.showAnswer;
    },
    radioChoose(id) {
      this.checkIndex = id;
      this.values[0] = id;
      if (this.values.length) {
        this.isComplete = true;
      } else {
        this.isComplete = false;
      }
      this.$emit("sendAnswer", this.values, this.isComplete, this.bindIndex);
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
    }
  }
};
</script>
