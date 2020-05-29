<template>
  <div class="wrapper">
    <el-dialog title="试题解析" :visible.sync="isShow"  width="71%"
  @close="handleClose">
       <div class="anaysis_main">
        <audio-subject
          v-if="anayData.audio && anayData.audio.length>0"
          :audioData="{url:anayData.audio[0],id:qid}"
        ></audio-subject>
        <div class="text" v-html="anayData.text"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import audioSubject from "@/components/AudioSubject.vue";
export default {
  components: {
      audioSubject
  },
  props: ['dialogTableVisible','anayData','qid'],
  data() {
    return {
    };
  },
  computed: {
      isShow:{
          get:function() {
               return this.dialogTableVisible
          },
          set:function() {

          }
      }
  },
  methods: {
      handleClose() {
          this.$emit('closeDialog',false)
      }
  },
  created() {},
  mounted() {}
};
</script>
<style>
.el-dialog__header{
    border:1px solid #eeeeee;
    background: #fbfbfb;
}
.el-dialog__title{
    color:#000;
    font-weight: bold;
}
.el-dialog__body{
    padding: 30px 30px 40px 30px;
}
</style>
