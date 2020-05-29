<template>
  <div class="task_item">
    <h2 class="question_type">
      <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      排序题（{{SortData.score}}分）
    </h2>
    <div class="question_con">
      <question-header :BaseData="SortData" :currentIndex="currentIndex"></question-header>
      <div class="choose_sort_wrapper">
        <div
          class="sort_box"
          v-if="(flag == 'answer' || (flag == 'wrong' && showWrong ==1)) ||  flag=='preview'"
        >
          <div class="sort_mark">
            <div class="sort_mark_item" v-for="(item,index) in values" :key="index">{{index+1}}</div>
          </div>
          <div class="main mainText">
            <draggable
              v-model="values"
              :move="getdata"
              :options="{forceFallback: true }"
              @update="datadragEnd"
            >
              <transition-group>
                <div class="drag_list" v-for="(list,index) in values" :key="index">
                  <div
                    class="line_title_item"
                    :class="{'lineText':textOverFlowFlag[index]}"
                    :title="(list.title).replace(/<[^<>]+?>/g,'')"
                    v-html="list.title"
                  ></div>
                </div>
              </transition-group>
            </draggable>
          </div>
        </div>
        <!-- 查看页面 -->
        <div class="sort_box" v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)">
          <div class="sort_mark">
            <div class="sort_mark_item" v-for="(item,index) in values" :key="index">{{index+1}}</div>
          </div>
          <div class="main main_detalis">
            <div class="drag_list_details" v-for="(list,index) in initOption" :key="list.id">
              <div class="drag_list_item">
                <div class="check_title_item" v-html="list.title" :title="(list.title).replace(/<[^<>]+?>/g,'')"></div>
                <img
                  src="../../static/images/right_icon.png"
                  class="right_wrong sort_img"
                  v-if="detailsData.userAnswer.length>0 && detailsData.userAnswer[index].id==detailsData.rightAnswer[index].id"
                >
                <img src="../../static/images/wrong_icon.png" class="right_wrong sort_img" v-else>
              </div>
            </div>
          </div>
        </div>
        <!--显示正确答案-->
        <base-right
          @closeRight="displayAnswer"
          v-if="(flag == 'details' || (flag == 'wrong' && showWrong ==2))||  flag=='preview' "
          :anayData="detailsData.analysis"
          :qid="detailsData.qid"
        >
          <div class="right_answer_main" v-if="showAnswer && detailsData.rightAnswer ">
            <div
              class="answer_input_item gray_border"
              v-for="(item,index) in detailsData.rightAnswer"
              :key="item.id"
            >
              <span>{{Number(index)+1}}</span>
              <div class="check_title_item" v-html="item.title" :title="(item.title).replace(/<[^<>]+?>/g,'')"></div>
            </div>
          </div>
        </base-right>
      </div>
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
<script>
/* eslint-disable */
import QuestionHeader from "@/components/QuestionHeader.vue";
import draggable from "vuedraggable";
import baseRight from "@/components/BaseRight.vue";
import axios from "@/until/axios.js";
export default {
  props: {
    SortData: Object,
    flag: String,
    bindIndex: Number,
    parentQid: String,
    type: String
  },
  data() {
    return {
      textOverFlowFlag: [],
      isFF: null,
      currentIndex: 0,
      isComplete: true, // 是否完成答题
      dragElement: null,
      lock: true,
      newData: [],
      values: [],
      showWrong: 0,
      canAjax: true,
      detailsData: {},
      showAnswer: true,
      cancelSubjectFlag: true,
      initOption: [] // 查看页面数据
    };
  },
  created() {
    if (this.flag == "wrong") {
      this.showWrong = 1;
      if (this.type == 1) {
        this.cancelSubjectFlag = false;
      }
    }
    this.detailsData = this.SortData;
    this.initData();
    this.isFF = !!navigator.userAgent.match(/firefox/i);
    for (let i = 0; i < this.SortData.option.length; i++) {
      this.$set(this.textOverFlowFlag, i, false);
      if (this.SortData.option[i].title.length > 220) {
        this.$set(this.textOverFlowFlag, i, this.isFF);
      }
    }
  },
  components: {
    QuestionHeader,
    draggable,
    baseRight
  },
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
    }
  },
  mounted() {
    if (this.SortData.userAnswer.length > 0) {
      this.initOption = this.SortData.userAnswer;
    } else {
      this.initOption = this.SortData.option;
    }
  },
  methods: {
    // 取消错题
    cancelSubject() {
      this.$emit("cancelsubjet", this.SortData.qid);
    },
    //check答案
    checkAnswerFun() {
      if (this.isComplete) {
        this.submitWrong(this.SortData.qid);
      } else {
        this.$alert("请选择完整的答案", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
    },
    repeatFun() {
      this.values = this.SortData.option;
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
        answer: this.newData
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
            if (this.detailsData.userAnswer.length > 0) {
              this.initOption = this.detailsData.userAnswer;
            } else {
              this.initOption = this.detailsData.option;
            }
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
    getdata(evt) {
      evt.preventDefault();
    },
    datadragEnd(evt) {
      evt.preventDefault();
      this.newData = [];
      for (let i = 0; i < this.values.length; i++) {
        this.newData.push(this.values[i].id);
      }
      this.$emit("sendAnswer", this.newData, this.isComplete, this.bindIndex);
    },
    initData() {
      if (this.SortData.userAnswer && this.SortData.userAnswer.length > 0) {
        this.values = this.SortData.userAnswer;
        for (let j = 0; j < this.SortData.userAnswer.length; j++) {
          this.newData[j] = this.SortData.userAnswer[j].id;
        }
      } else {
        for (let i = 0; i < this.SortData.option.length; i++) {
          this.newData[i] = this.SortData.option[i].id;
        }
        this.values = this.SortData.option;
      }
      this.$emit("sendAnswer", this.newData, this.isComplete, this.bindIndex);
    }
  }
};
</script>

<style lang="less">
  .sort_box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .sort_mark {
      display: flex;
      flex-direction: column;
      margin-right: 10px;
      .sort_mark_item {
        line-height: 60px;
        text-align: center;
        width: 60px;
        height: 60px;
        color: #4277ec;
        border: 1px solid #c1d3f9;
        background: #ecf1fe;
        border-radius: 3px;
        box-sizing: border-box;
        margin-bottom: 20px;
      }
      .sort_mark_item:last-child {
        margin-bottom: 0;
      }
    }
  }
  .main {
    flex: 60px 1;
    overflow: hidden;
    cursor: pointer;
    box-sizing: border-box;
    .drag_list {
      padding: 10px 10px 10px 30px;
      height: 60px;
      margin-right: 40px;
      display: flex;
      border-radius: 3px;
      align-items: center;
      word-break: break-all;
      align-content: center;
      // overflow-y: auto;
      position: relative;
      border: 1px solid #c1d3f9;
      margin-bottom: 20px;
      transition: border 0.3s;
      box-sizing: border-box;
      .sort_img {
        right: 0px;
      }
      .line_title_item {
        max-height: 40px;
        overflow: hidden;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        /*! autoprefixer: off */
        -webkit-box-orient: vertical;
        /* autoprefixer: on */
      }
    }
    .drag_list:last-child {
      margin-bottom: 0;
    }
    .drag_list:hover {
      border: 1px solid #3370f6;
    }
    .list_answer {
      position: absolute;
      right: -20%;
      top: 50%;
      transform: translate(0, -50%);
      .img_common {
        vertical-align: middle;
        width: 17px;
        height: 17px;
      }
      .right_answer {
        font-size: 20px;
        color: #000;
        display: inline-block;
        vertical-align: middle;
      }
    }
    .list_right_answer {
      padding-right: 14%;
    }
    @media screen and (min-width: 767px) and (max-width: 1025px) {
      .drag_list {
        width: 80%;
      }
      .list_answer {
        right: -30%;
      }
      .list_right_answer {
        padding-right: 25%;
      }
    }
    .drag-title {
      font-weight: 400;
      line-height: 25px;
      margin: 10px 0;
      font-size: 22px;
      color: #1f2f3d;
    }
  }
  .main_detalis {
    .drag_list_details {
      padding-right: 40px;
      height: 60px;
      // overflow-y: auto;
      position: relative;
      border: none;
      margin-bottom: 20px;
      box-sizing: border-box;
      .drag_list_item {
        display: flex;
        align-items: center;
        word-break: break-all;
        align-content: center;
        height: 60px;
        padding: 10px 10px 10px 30px;
        border-radius: 3px;
        border: 1px solid #c1d3f9;
        transition: border 0.3s;
        box-sizing: border-box;
      }
      .sort_img {
        right: 0px;
      }
    }
    .drag_list_details:last-child {
      margin-bottom: 0;
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
      width: 59px;
      height: 58px;
      position: absolute;
      left: 0;
      top: 0;
      border-right-width: 1px;
      border-right-style: solid;
      text-align: center;
      font-size: 16px;
      line-height: 58px;
    }
  }
  .answer_input_item.gray_border {
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    background: #fff;
    span {
      border-color: #d8d8d8;
      background: #ececec;
    }
    .check_title_item {
      padding: 0 20px;
      font-size: 12px;
    }
  }
  /* 火狐hack实现多行文本显示... */
  .mainText {
    .drag_list {
      .lineText {
        position: relative;
        line-height: 20px;
        max-height: 40px; //设置最大高度，加上overflowhidden，正好是两行，使超出部分隐藏
        overflow: hidden;
      }
      .lineText::after {
        content: "...";
        position: absolute;
        bottom: 0;
        right: 0;
        padding-left: 20px; //以上三个属性，可以后续调整，看要把...放在哪个位置
        background: -webkit-linear-gradient(left, transparent, #fff 55%);
        background: -o-linear-gradient(right, transparent, #fff 55%);
        background: -moz-linear-gradient(right, transparent, #fff 55%);
        background: linear-gradient(
          to right,
          transparent,
          #fff 55%
        ); //背景色可写成渐变也可写成一样的颜色
      }
    }
  }
</style>