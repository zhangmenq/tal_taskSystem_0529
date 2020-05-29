<!--音频-->
import func from './vue-temp/vue-editor-bridge';
<template>
    <div class="audio_box" >
        <audio :src="audioData.url" :id="audioid" hidden></audio>
        <a href="javascript:;" :class="playFlag?'playing':''" @click="playAudio"></a>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    props: {
        audioData: Object
    },
    data () {
        return {
            playFlag: false,
            audioid: 'myAudio_'
        }
    },
    methods:{
        playAudio(){
            var audio = document.getElementById('myAudio')
            if(audio.src == this.audioData.url){
                if(this.playFlag){
                    audio.pause()
                    this.playFlag = false
                }else{
                    audio.play()
                    this.playFlag = true
                }
            }else{
                this.playFlag = false
                audio.src = this.audioData.url
                audio.play()
                this.playFlag = true
            }
        }
    },
    created(){
        this.audioid = this.audioid + this.audioData.id
    },
    mounted(){
        var that = this
        var audio = document.getElementById('myAudio')
        audio.addEventListener('ended', function(){
            that.playFlag = false
        })

    },
    components: {}
}
</script>

<style scoped lang="less">
    .audio_box{
        padding: 10px 0;
        a{
            display: block;
            width: 80px;
            height: 80px;
            margin: 0 auto;
            background: url("../../static/images/audio_btn.png") no-repeat 0 0;
            background-size: 100%;
        }
        a.playing{
            background: url("../../static/images/audio_btn_playing.png") no-repeat 0 0;
            background-size: 100%;
        }
    }
</style>
