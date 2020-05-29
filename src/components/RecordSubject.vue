<!--录音题-->
<template>
  <div class="task_item">
    <h2 class="question_type"><i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      录音题（{{recordData.score}}分）</h2>
    <div class="question_con">
      <question-header :BaseData="recordData" :currentIndex="currentIndex"></question-header>
      <!-- 录音答题页面 -->
      <div v-if="flag=='answer' ||flag=='preview'">
        <div class="answer_audio_box">
          <audio-subject v-if="audioData.url" :audioData="audioData"></audio-subject>
        </div>
        <div class="upload_box">
          <div class="upload_btn" @click="showQrcode">点击上传录音</div>
        </div>
      </div>
      <!-- 录音题查看页面 -->
      <div v-if="flag=='details'">
        <div class="answer_audio_box">
          <audio-subject v-if="audioData.url" :audioData="audioData"></audio-subject>
         <div class="no_data_img" v-else>
            <div>学生未作答</div>
         </div>
        </div>
      </div>
      <!-- 老师评分 -->
      <div class="result" v-if="flag=='details' && admin == 1 && exerciseStatus == 5"> 
        <div class="short_score">
          <input type="number" placeholder="请输入评分" v-model="scoreData" @change="makeGrade" step="0.01">
        </div>
        <div class="short_mark">
          <h3>请输入评语：</h3>
          <textarea
            rows="4"
            v-model="comment"
            maxlength="300"
            @change="checkScore"
          ></textarea>
        </div>
      </div>
      <!-- 查看评分 -->
      <div class="result" v-if="flag=='details' && exerciseStatus == 3 ">
        <div class="short_score"></div>
        <div class="short_mark">
          <h3>老师评语：</h3>
          <div
            class="judeg_text"
            v-if="recordData.rightAnswer.comment.length"
          >{{recordData.rightAnswer.comment}}</div>
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
      <!-- 试题解析 -->
      <analysis-dialog
        :dialogTableVisible="showAnasyDialog"
        @closeDialog="closeDialog"
        :anayData="analysis"
        :qid="recordData.qid"
      ></analysis-dialog>
      <!-- 正确答案 -->
      <analysis-dialog
        :dialogTableVisible="showReferenceDialog"
        @closeDialog="closeReference"
        :anayData="referenceAnswer"
        :qid="recordData.qid"
      ></analysis-dialog>
    </div>
  </div>
</template>

<script>
import audioSubject from "@/components/AudioSubject.vue";
import axios from "@/until/axios.js";
import QuestionHeader from "@/components/QuestionHeader.vue";
import analysisDialog from "@/components/AnalysisDialog.vue";
import { clearTimeout } from "timers";
export default {
  props: {
    recordData: Object,
    flag: String,
    bindIndex: Number,
    userAid: String,
    admin: Number,
    exerciseStatus: Number
  },
  components: {
    audioSubject,
    QuestionHeader,
    analysisDialog
  },
  data() {
    return {
      showAnasyDialog: false,
      showReferenceDialog: false,
      analysis: {},
      referenceAnswer: {},
      showAnwserImg: [],
      currentIndex: 0,
      current: 0,
      imgAnswerSrc: "",
      scoreData: 0,
      comment: "",
      remnant: 0,
      timer: true,
      audioData: {},
      audioIds: []
    };
  },
  watch: {},
  computed: {
    Sort() {
      return this.bindIndex + 1 + "." + " ";
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
      // 老师打分
    makeGrade() {
      this.checkScore();
    },
    // 校验分数
    checkScore() {
      if (this.scoreData > Number(this.recordData.score)) {
        this.$alert("评分不能大于题目分数", "提示", {
          confirmButtonText: "知道了"
        });
        this.scoreData = "";
        return false;
      } else if (this.scoreData < 0) {
        this.$alert("评分不能小于0", "提示", {
          confirmButtonText: "知道了"
        });
        this.scoreData = "";
        return false;
      }
      if (this.comment.length < 0) {
        this.$alert("请输入评语", "提示", {
          confirmButtonText: "知道了"
        });
        return false;
      }
         this.$emit("sendRecodeAnswer", this.scoreData, this.comment, this.bindIndex,this.recordData.type);
    },
    //显示二维码
    showQrcode() {
      this.timer = true;
      this.getMyAudio();
      let src = this.recordData.qrcode;
      this.$alert('<img src="' + src + '">', "扫描二维码上传录音", {
        showConfirmButton: false,
        dangerouslyUseHTMLString: true,
        center: true,
        callback: action => {
          this.timer = false;
        }
      });
    },
    //轮询获取上传的图片
    getMyAudio() {
      let data = {
        userAid: this.userAid,
        qid: this.recordData.qid
      };
      let url = "/Exercise/pollH5Record";
      axios
        .post(url, { ...data })
        .then(res => {
          if (res.code === 200) {
            if (res.data.audioAddress.length > 0 && this.audioData.url != res.data.audioAddress[0]) {
              this.$msgbox.close();
              this.timer = false;
              var obj = {url: res.data.audioAddress[0], id: this.recordData.qid}
              this.audioData = obj
              this.audioIds = res.data.audioId;
              this.$emit("sendAnswer", this.audioIds, true, this.bindIndex);
            }
            if (this.timer) {
              setTimeout(() => {
                this.getMyAudio();
              }, 3000);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  created() {
    if (this.flag == "details" || this.flag == "preview") {
      if (this.recordData.analysis.have > 0) {
        this.analysis = this.recordData.analysis;
      }
      this.referenceAnswer = this.recordData.rightAnswer.referenceAnswer;
    }
    if (this.recordData.userAnswer.length > 0) {
      this.audioList = this.recordData.userAnswer;
      let arr = [this.recordData.userAnswer[0].id];
      this.audioIds = arr;
      this.audioData.url = this.recordData.userAnswer[0].audioAddress;
      this.audioData.id = this.recordData.qid;
      this.$emit("sendAnswer", this.audioIds, true, this.bindIndex);
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
  .result {
    position: relative;
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
  .result {
    margin-bottom: 30px;
    p {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      line-height: 40px;
    }
    .score_label {
      padding-bottom: 20px;
      .score_num {
        width: 40%;
        height: 50px;
        padding: 10px;
        border: 1px solid #e5e5e5;
        box-sizing: border-box;
        border-radius: 10px;
      }
    }
  }
  .fill_text {
    color: #666;
    line-height: 30px;
    font-size: 20px;
    display: inline-block;
    vertical-align: bottom;
  }
  .answer_img {
    width: 100%;
    padding: 0 30px 20px 0 ;
    box-sizing: border-box;
    font-size: 0;
    .answer_img_list {
      position: relative;
      display: inline-block;
      width: 30%;
      img {
        width: 100%;
        height: 168px;
      }
    }
    .answer_img_list:nth-child(2) {
      margin: 0 5%;
    }
  }
  .upload_box {
    .upload_btn {
      width: 320px;
      height: 70px;
      margin: 40px auto 0;
      text-align: center;
      line-height: 70px;
      border-radius: 35px;
      background: #3370f6;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .upload_tips {
      margin-top: 10px;
      color: #999;
      text-align: center;
    }
  }
  .write_article {
    padding: 0 30px;
    font-size: 20px;
    color: #666;
  }
  .fill_answer {
    display: inline-block;
    .right_answer {
      display: inline-block;
      color: #000;
      font-size: 20px;
      vertical-align: bottom;
    }
    .answer_item {
      border: none;
      text-align: center;
      height: 30px;
      line-height: 30px;
      color: #000;
      font-size: 20px;
      border-bottom: 1px dashed #666666;
      box-sizing: border-box;
    }
    .wrong_answer_item {
      color: #ee526b;
    }
  }
</style>
