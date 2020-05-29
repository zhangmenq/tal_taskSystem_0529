<template>
  <div class="task_item">
    <h2 class="question_type">
       <i class="small">{{bindIndex + 1}}</i>
      <i class="big">{{Sort}}</i>
      写作题（{{WriteData.score}}分）</h2>
    <div class="question_con">
      <question-header :BaseData="WriteData" :currentIndex="currentIndex"></question-header>
      <!-- 写作题内容答题页面 -->
      <div class="answer_img" v-if="flag=='answer' ||flag=='preview'">
        <div
          class="answer_img_list"
          v-for="(item, index) in imglist"
          :key="index"
          @click="clickAnswerImg($event,index)"
        >
          <img :src="item">
          <div class="close_img" @click.stop="deleteImg(index)"></div>
        </div>
        <big-img v-if="showAnwserImg[current]" @clickit="viewAnswerImg" :imgSrc="imgAnswerSrc"></big-img>
      </div>
      <div class="upload_box" v-if="flag=='answer'">
        <div class="upload_btn" @click="showQrcode">点击上传图片</div>
        <p class="upload_tips">最多上传3张图片哦</p>
      </div>
      <!-- 查看 -->
      <div class="answer_img" v-if="flag=='details'">
        <div
          class="answer_img_list"
          v-for="(item, index) in WriteData.userAnswer[0]"
          :key="index"
          @click="clickAnswerImg($event,index)"
        >
          <img :src="item.imageAddress">
        </div>
        <big-img v-if="showAnwserImg[current]" @clickit="viewAnswerImg" :imgSrc="imgAnswerSrc"></big-img>
      </div>
      <div class="no_data_img" v-if="flag=='details' && !WriteData.userAnswer.length">
        <div>学生未作答</div>
      </div>
      <!-- 老师评分 -->
      <div class="result" v-if="flag=='details' && admin == 1  &&  exerciseStatus == 5">
        <div class="short_score">
          <input type="number" placeholder="请输入评分" v-model="score" @change="checkScore" step="0.01">
        </div>
        <div class="short_mark">
          <h3>请输入评语：</h3>
          <textarea
            rows="4"
            @input="descInput"
            v-model="comment"
            maxlength="300"
            @change="checkScore"
          ></textarea>
        </div>
      </div>
      <!-- 查看评分 -->
      <div class="result" v-if="flag=='details' &&  exerciseStatus == 3 ">
        <div class="short_score"></div>
        <div class="short_mark">
          <h3>老师评语：</h3>
          <div
            class="judeg_text"
            v-if="WriteData.rightAnswer.comment.length"
          >{{WriteData.rightAnswer.comment}}</div>
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
        :qid="WriteData.qid"
      ></analysis-dialog>
      <!-- 正确答案 -->
      <analysis-dialog
        :dialogTableVisible="showReferenceDialog"
        @closeDialog="closeReference"
        :anayData="referenceAnswer"
        :qid="WriteData.qid"
      ></analysis-dialog>
    </div>
  </div>
</template>

<script>
import audioSubject from "@/components/AudioSubject.vue";
import videoSubject from "@/components/VideoSubject.vue";
import axios from "@/until/axios.js";
import BigImg from "@/components/BigImage.vue";
import QuestionHeader from "@/components/QuestionHeader.vue";
import analysisDialog from "@/components/AnalysisDialog.vue";
export default {
  props: {
    WriteData: Object,
    flag: String,
    bindIndex: Number,
    admin: Number,
    exerciseStatus: Number,
    userAid: String
  },
  components: {
    BigImg,
    audioSubject,
    videoSubject,
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
      score: 0,
      comment: "",
      remnant: 0,
      timer: true,
      imglist: [],
      imgIds: []
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
    // 校验分数
    checkScore() {
      if (this.score > Number(this.WriteData.score)) {
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
      this.$emit("sendWordAnswer", this.score, this.comment, this.bindIndex,this.WriteData.type);
    },
    descInput() {
      let txtVal = this.comment.length;
      this.remnant = txtVal;
    },
    // 放大提交图片
    clickAnswerImg(e, index) {
      this.$set(this.showAnwserImg, index, true);
      // 获取当前图片地址
      this.current = index;
      this.imgAnswerSrc = e.target.currentSrc;
    },
    viewAnswerImg() {
      this.$set(this.showAnwserImg, this.current, false);
    },
    //显示二维码
    showQrcode() {
      this.timer = true;
      let src = this.WriteData.qrcode;
      this.getMyPic();
      this.$alert('<img src="' + src + '">', "扫描二维码上传图片", {
        showConfirmButton: false,
        dangerouslyUseHTMLString: true,
        center: true,
        callback: action => {
          this.timer = false;
        }
      });
    },
    //轮询获取上传的图片
    getMyPic() {
      let data = {
        userAid: this.userAid,
        qid: this.WriteData.qid
      };
      let url = "/Exercise/pollH5Image";
      axios
        .post(url, { ...data })
        .then(res => {
          if (res.code === 200) {
            if (res.data.imageAddress.length > 0 && this.imglist.toString() != res.data.imageAddress.toString()) {
              this.$msgbox.close();
              this.timer = false;
              this.imglist = res.data.imageAddress;
              this.imgIds = res.data.imageIds;
              this.$emit("sendAnswer", this.imgIds, true, this.bindIndex);
            }
            if (this.timer) {
              setTimeout(() => {
                this.getMyPic();
              }, 3000);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //删除图片
    deleteImg(index) {
      let deleteId = this.imgIds[index];
      let data = {
        imageId: deleteId,
        userAid: this.userAid,
        qid: this.WriteData.qid
      };
      let url = "/Exercise/updateH5Image";
      axios
        .post(url, { ...data })
        .then(res => {
          if (res.code === 200) {
            this.$alert("删除成功", "提示", {
              confirmButtonText: "知道了"
            });
            this.imglist.splice(index, 1);
            this.imgIds.splice(index, 1);
            this.$set(this.showAnwserImg, index, false);
          } else {
            this.$alert(res.data.message, "提示", {
              confirmButtonText: "知道了"
            });
          }
        })
        .catch(err => {
          this.$alert("服务器错误", "提示", {
            confirmButtonText: "知道了"
          });
          console.log(err);
        });
    }
  },
  created() {},
  mounted() {
    if (this.flag == "details" || this.flag == "preview") {
      if (this.WriteData.analysis.have > 0) {
        this.analysis = this.WriteData.analysis;
      }
      this.referenceAnswer = this.WriteData.rightAnswer.referenceAnswer;
    }
    if (this.WriteData.userAnswer.length > 0) {
      for (let i = 0; i < this.WriteData.userAnswer[0].length; i++) {
        this.imglist.push(this.WriteData.userAnswer[0][i].imageAddress);
        this.imgIds.push(this.WriteData.userAnswer[0][i].id);
      }
      this.$emit("sendAnswer", this.imgIds, true, this.bindIndex);
    }
    let txtVal = this.comment.length;
    this.remnant = txtVal;
  }
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
    padding: 0px 30px 20px 0;
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