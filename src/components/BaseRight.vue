<template>
  <div class="box">
    <div class="right_answer_box">
      <h4>
        <a href="javascript:;" class="up_arr" :class="{'down_arr':showArr}" @click="clickme">正确答案</a>
        <a href="javascript:;" @click="anaylisFun" v-if="anayData.have > 0">试题解析</a>
      </h4>
      <transition name="fade">
        <slot></slot>
      </transition>
    </div>
    <!-- 试题解析 -->
    <analysis-dialog
      v-if="anayData.have > 0"
      :dialogTableVisible="showDialog"
      @closeDialog="closeDialog"
      :anayData="anayData"
      :qid="qid"
    ></analysis-dialog>
  </div>
</template>

<script>
import analysisDialog from "@/components/AnalysisDialog.vue";
import audioSubject from "@/components/AudioSubject.vue";
export default {
  components: {
    analysisDialog,
    audioSubject
  },
  props: ["anayData", "qid"],
  data() {
    return {
      showArr: false,
      showDialog: false,
      analysis: {}
    };
  },
  watch: {},
  computed: {},
  methods: {
    clickme() {
      this.$emit("closeRight");
      this.showArr = !this.showArr;
    },
    // 弹出试题解析
    anaylisFun() {
      this.showDialog = true;
    },
    // 关闭弹窗
    closeDialog(val) {
      this.showDialog = val;
    }
  },
  created() {},
  mounted() {
    if (this.anayData.have > 0) {
      this.analysis = this.anayData;
    }
  }
};
</script>