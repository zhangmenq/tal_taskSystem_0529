<!--拖拽题-->
<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      拖拽题（{{dragData.score}}分）
    </h2>
    <div class="question_con">
      <!-- 题干内容 -->
      <question-header :BaseData="dragData" :currentIndex="currentIndex"></question-header>
      <!-- 题目内容 -->
      <div class="drag_content">
        <ul class="exam_box clearfix">
          <li v-for="option in dragData.option" :key="option.id">
            <span>{{option.mark}}</span>
            <i class="drag_content_text" :title="(option.title).replace(/<[^<>]+?>/g,'')">{{option.title}}</i>
          </li>
        </ul>
        <!-- 查看页面 -->
        <span class="exam_text" v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)">
          <span
            class="exam_list"
            v-for="(dragText,index) in detailsData.drag.drag_title"
            :key="index"
          >
            <span v-html="dragText"></span>
            <span class="select_status" v-if="detailsData.drag.drag_title.length!=(index+1)">
              <span class="select_box">
                <el-select
                  v-model="detailsData.userAnswer[index].mark"
                  v-if="detailsData.userAnswer.length>0"
                >
                  <el-option label="请选择" value="0" disabled="disabled"></el-option>
                  <el-option
                    v-for="item in detailsData.option"
                    :key="item.value"
                    :label="item.mark"
                    :value="item.title"
                    disabled="disabled"
                  ></el-option>
                </el-select>
                <el-select v-else v-model="label">
                  <!-- <el-option label="请选择" value="0" disabled="disabled"></el-option> -->
                  <el-option
                    v-for="item in detailsData.option"
                    :key="item.value"
                    :label="item.mark"
                    :value="item.title"
                    disabled="disabled"
                  ></el-option>
                </el-select>
              </span>
              <img
                src="../../static/images/right_icon.png"
                class="state_img"
                v-if="detailsData.userAnswer.length>0 && detailsData.userAnswer[index].id==detailsData.rightAnswer[index].id"
              >
              <img src="../../static/images/wrong_icon.png" class="state_img" v-else>
            </span>
          </span>
        </span>
        <!-- 答题页面 -->
        <span
          class="exam_text"
          v-if="flag == 'answer' || (flag == 'wrong' && showWrong ==1) || flag=='preview'"
        >
          <span class="exam_list" v-for="(dragText,index) in dragData.drag.drag_title" :key="index">
            <span v-html="dragText"></span>
            <span class="select_status" v-if="dragData.drag.drag_title.length!=(index+1)">
              <span class="select_box">
                <el-select v-model="values[index]" @change="sendDragData">
                  <el-option label="请选择" value="0"></el-option>
                  <el-option
                    v-for="item in dragData.option"
                    :key="item.id"
                    :label="item.mark"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </span>
            </span>
          </span>
        </span>
      </div>

      <!--显示正确答案-->
      <base-right
        @closeRight="displayAnswer"
        v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)||flag=='preview'"
        :anayData="detailsData.analysis"
        :qid="detailsData.qid"
      >
        <div class="right_answer_main" v-if="showAnswer ">
          <span
            class="exam_list"
            v-for="(dragText,index) in detailsData.drag.drag_title"
            :key="index"
          >
            <span v-html="dragText"></span>
            <span
              class="color_text"
              v-if="detailsData.rightAnswer && detailsData.drag.drag_title.length!=(index+1)"
            >{{detailsData.rightAnswer[index].title}}</span>
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
import QuestionHeader from "@/components/QuestionHeader.vue";
import baseRight from "@/components/BaseRight.vue";
import axios from "@/until/axios.js";
export default {
  props: {
    dragData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      label: "请选择",
      detailsData: {},
      currentIndex: 0,
      options: [],
      isComplete: false, // 是否完成答题
      values: [],
      sendValues: [],
      showAnswer: true,
      showWrong: 0,
      canAjax: true,
      cancelSubjectFlag: true
    };
  },
  created() {
    this.detailsData = this.dragData;
    if (this.flag == "wrong") {
      this.showWrong = 1;
      if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
  },
  mounted() {
    this.initValues();
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.dragData.qid);
    },
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.dragData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    repeatFun() {
      this.isComplete = false;
      this.values = [];
      this.showWrong = 1;
    },
    // 展开答案
    displayAnswer() {
      this.showAnswer = !this.showAnswer;
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
    //初始化值
    initValues() {
      this.values = [];
      for (let i = 0; i < this.dragData.drag.drag_title.length - 1; i++) {
        if (this.dragData.userAnswer.length > 0) {
          this.values[i] = this.dragData.userAnswer[i].id;
        } else {
          this.values[i] = "0";
        }
      }
      if (this.dragData.userAnswer.length > 0) {
        this.sendDragData();
      }
    },
    //获取值
    sendDragData() {
      for (let i = 0; i < this.values.length; i++) {
        this.sendValues[i] = this.values[i];
      }

      if (
        this.sendValues.indexOf("0") == -1 &&
        this.sendValues.length == this.values.length
      ) {
        this.isComplete = true;
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
  components: {
    QuestionHeader,
    baseRight
  }
};
</script>

<style lang="less">
  .drag_content {
    color: #666;
    position: relative;
    word-break: break-all;
    .exam_box {
      margin: 15px auto 0;
      li {
        display: block;
        float: left;
        width: 32%;
        margin: 0 2% 20px 0;
        height: 70px;
        border: 1px solid #bdd3fd;
        border-radius: 3px;
        background: #fbfcff;
        padding-left: 29px;
        position: relative;
        font-size: 16px;
        span {
          display: block;
          width: 29px;
          height: 68px;
          position: absolute;
          left: 0;
          right: 0;
          border-right: 1px solid #bdd3fd;
          background: #fff;
          border-top-left-radius: 3px;
          border-bottom-left-radius: 3px;
          line-height: 68px;
          text-align: center;
        }
        i.drag_content_text {
          display: block;
          // align-items: center;
          // word-break: break-all;
          // align-content: center;
          padding: 5px 10px;
          margin: 6px 5px;
          line-height: 23px;
          height: 46px;
          overflow-x: hidden;
          overflow-y: auto;
        }
        i.drag_content_text::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        i.drag_content_text::-webkit-scrollbar-thumb {
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.1);
        }
        i.drag_content_text::-webkit-scrollbar-track {
          border-radius: 0;
          background: rgba(0, 0, 0, 0.05);
        }
      }
      li:nth-child(3n) {
        margin-right: 0;
      }
    }
    .exam_text {
      position: relative;
      font-size: 16px;
      line-height: 28px;
      .select_status {
        display: inline-block;
        margin: 0 10px;
      }
    }
    .select_box {
      display: inline-block;
      width: 76px;
      height: 24px;
      font-size: 16px;
      line-height: 24px;
      background: #fff;
    }
    .state_img {
      vertical-align: middle;
      margin-right: 10px;
      width: 20px;
      height: 16px;
    }
    .el-input__suffix-inner {
      .el-input__icon {
        line-height: 24px;
        width: 16px;
      }
    }
    .el-input__suffix {
      right: 0;
      width: 16px;
      border-left: 1px solid #333;
    }
    .el-input--suffix .el-input__inner {
      padding-right: 18px;
      line-height: 24px;
      height: 24px;
    }
    .el-select .el-input .el-select__caret {
      color: #333;
    }
    .el-select:hover .el-input__inner {
      border-color: #333;
    }
    .el-select .el-input__inner {
      border-color: #333;
      padding-left: 8px;
    }
  }
  .drag_right_answer {
    padding-top: 20px;
    font-size: 16px;
    line-height: 28px;
    color: #666;
    .select_status {
      color: #5187ff;
    }
  }
  .color_text {
    color: #5188ff;
  }
</style>