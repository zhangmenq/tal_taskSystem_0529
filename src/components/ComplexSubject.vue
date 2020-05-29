<!--多选题-->
<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      多选题（{{compleData.score}}分）
    </h2>
    <div class="question_con">
      <question-header v-if="compleData.qid" :BaseData="compleData" :currentIndex="currentIndex"></question-header>
      <!-- 详情页 -->
      <div class="choose_wrapper">
        <div
          v-for="(option,index) in detailsData.option"
          :key="index"
          v-if="flag == 'details' || (flag == 'wrong' && showWrong==2)"
          class="choose_btn checkbox"
          :class="{checked:detailsData.userAnswer.length>0 && detailsData.userAnswer.indexOf(option.id) >= 0}"
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
            v-if="detailsData.userAnswer.indexOf(option.id) >= 0 && rightAnswerIds.indexOf(option.id) >=0"
          >
          <img
            src="../../static/images/wrong_icon.png"
            class="right_wrong choose_wrong"
            v-if="(!detailsData.userAnswer && rightAnswerIds.indexOf(option.id) >= 0)|| (detailsData.userAnswer.indexOf(option.id) >= 0 && rightAnswerIds.indexOf(option.id) <0)"
          >
        </div>
        <!-- 答题页面 -->
        <div
          v-for="(option,index) in compleData.option"
          v-if="(flag == 'answer' || (flag == 'wrong' && showWrong==1)) || flag=='preview'"
          :key="index"
          class="choose_btn checkbox"
          :class="{checked: values.indexOf(option.id) >= 0}"
          @click="checkboxChoose(option.id)"
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
        v-if="(flag == 'details' || (flag == 'wrong' && showWrong==2)) || flag=='preview'"
        @closeRight="displayAnswer"
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer">
          正确答案：
          <span v-for="(item,index) in detailsData.rightAnswer" :key="item.id">
            {{item.mark}}
            <i v-if="detailsData.rightAnswer.length != (index+1)">,</i>
          </span>
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
import baseRight from "@/components/BaseRight.vue";
import QuestionHeader from "@/components/QuestionHeader.vue";
import axios from "@/until/axios.js";
export default {
  props: {
    compleData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      cancelSubjectFlag: true,
      detailsData: {}, // 查看详情页面数据
      currentIndex: 0,
      showWrong: 0,
      values: [],
      canAjax: true,
      rightAnswerIds: [],
      showAnswer: true,
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
    },
    checkData() {
      return this.detailsData;
    }
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
      if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
    this.detailsData = this.compleData;
  },
  mounted() {
    if (this.compleData.userAnswer.length > 0) {
      this.isComplete = true;
      this.values = this.compleData.userAnswer;
      this.$emit(
        "sendAnswer",
        this.compleData.userAnswer,
        this.isComplete,
        this.bindIndex
      );
    }
    // 处理正确答案
    if (this.flag == "details" || this.flag == "preview") {
      for (let i = 0; i < this.compleData.rightAnswer.length; i++) {
        this.rightAnswerIds.push(this.compleData.rightAnswer[i].id);
      }
    }
  },
  methods: {
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.compleData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.compleData.qid);
    },
    repeatFun() {
      this.isComplete = false;
      this.values = [];
      this.showWrong = 1;
    },
    // check
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
            // 处理正确答案
            if (this.detailsData.rightAnswer) {
              for (let i = 0; i < this.detailsData.rightAnswer.length; i++) {
                this.rightAnswerIds.push(this.detailsData.rightAnswer[i].id);
              }
            }
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
    checkboxChoose(id) {
      let ids = this.values.indexOf(id);
      if (ids >= 0) {
        this.values.splice(ids, 1);
      } else {
        this.values.push(id);
      }
      if (this.values.length > 0) {
        this.isComplete = true;
      } else {
        this.isComplete = false;
      }
      this.$emit("sendAnswer", this.values, this.isComplete, this.bindIndex);
    }
  }
};
</script>