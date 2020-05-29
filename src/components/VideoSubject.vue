<template>
    <div class="video_box" >
        <video  :id="videoid" controls width="320" height="240" class="video_item" preload="metadata">
            <source :src="videoData.url" type="video/mp4">
        </video>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    props: {
        videoData: Object
    },
    data () {
        return {
            videoid: 'myVideo_'
        }
    },
    methods:{},
    created(){
        this.videoid = this.videoid + this.videoData.id
    },
    mounted(){},
    components: {}
}
</script>

<style scoped lang="less">
    .video_box{
        padding: 10px 0;
        width: 100%;
        box-sizing: border-box;
        .video_item{
            display: block;
            margin: 0 auto;
            background: #000;
        }
    }
</style>
