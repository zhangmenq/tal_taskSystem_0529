<template>
  <div class="task_item_header">
    <!-- 公共题干 -->
    <h4 class="clearfix">
      <div v-html="BaseData.title"></div>
    </h4>
    <p class="sub" v-if="BaseData.desc" v-html="BaseData.desc"></p>
    <audio-subject
      v-if="BaseData.audio.length>0"
      :audioData="{url:BaseData.audio[0],id:BaseData.qid}"
    ></audio-subject>
    <video-subject
      v-if="BaseData.video.length>0"
      :videoData="{url:BaseData.video[0],id:BaseData.qid}"
    ></video-subject>
    <div class="img_title imge_common" v-if="BaseData.image.length > 0">
      <div
        class="img_box"
        v-for="(img,index) in imgData"
        :key="index"
        @click="clickImg($event,index,img)"
      >
        <img :src="img" class="thumbnail_img">
      </div>
      <big-img v-if="showImg[imgIndex]" @clickit="viewImg" :imgSrc="imgSrc"></big-img>
    </div>
  </div>
</template>

<script>
import audioSubject from "@/components/AudioSubject.vue";
import videoSubject from "@/components/VideoSubject.vue";
import BigImg from "@/components/BigImage.vue";
export default {
  components: {
    audioSubject,
    videoSubject,
    BigImg
  },
  props: {
    BaseData: Object,
    currentIndex: Number
  },
  data() {
    return {
      imgSrc: "",
      showImg:[],
      imgIndex:''
    };
  },
  watch: {},
  computed: {
      // 过滤前10张图片
      imgData () {
          if(this.BaseData.image.length > 10) {
              return this.BaseData.image.slice(0, 10)
          } else{
               return this.BaseData.image
          }
      }
  },
  methods: {
    // 放大图片
    clickImg(e, index,img) {
      // 获取当前图片地址
      this.imgIndex = index;
      this.imgSrc = img || e.target.currentSrc
    //   this.imgSrc = e.target.currentSrc;
       this.$set(this.showImg, index, true);
    },
     viewImg() {
      this.$set(this.showImg,this.imgIndex, false);
    }
  },
  created() {
    this.imgIndex = this.currentIndex
  },
  mounted() {}
};
</script>
