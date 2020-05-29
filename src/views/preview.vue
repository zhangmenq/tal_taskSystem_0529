<template>
    <div class="preview_con">
        <div class="main_left">
            <!-- 单选题 -->
            <single-choice :singleData="question"  v-if="question.type === '1' && question.option.length" flag="preview"  :bindIndex="index"></single-choice>
            <!-- 多选题 -->
            <complex-subject v-if="question.type === '2' && question.option.length" :compleData="question" flag="preview" :bindIndex="index"></complex-subject>
            <!-- 填空题 -->
            <fill-subject v-if="question.type === '3'  && question.drag.drag_title.length"  :fillData="question" flag="preview" :bindIndex="index"></fill-subject>
            <!-- 简答题 -->
            <short-answer-subject  v-if="question.type === '4'  && question.qid"  :shortAnswerData="question" flag="preview" :bindIndex="index"></short-answer-subject>
            <!-- 录音题 -->
             <record-subject v-if="question.type === '5'  && question.qid" :recordData="question" flag="preview" :bindIndex="index"></record-subject>
            <!-- 复合题 -->
            <read-subject  v-if="question.type === '6' && question.sub.length" :readData="question" flag="preview" :bindIndex="index" :sendInfo="info"></read-subject>
            <!-- 连线题 -->
            <line-subject v-if="question.type === '7' && question.option.length" :lineData="question" flag="preview" :bindIndex="index"></line-subject>
            <!-- 拖拽提 -->
            <drag-subject v-if="question.type === '8' && question.option.length" :dragData="question" flag="preview" :bindIndex="index"></drag-subject>
            <!-- 排序题 -->
            <sort-subject v-if="question.type=== '9' && question.option.length" :SortData="question" flag="preview" :bindIndex="index"></sort-subject>
            <!-- 写作题 -->
            <write-subject  v-if="question.type=== '10' && question.qid" :WriteData="question"  flag="preview" :bindIndex="index"></write-subject>
            <!-- 选词题 -->
            <choice-word-subject v-if="question.type=== '11' && question.option.length" :wordData="question" flag="preview" :bindIndex="index"></choice-word-subject>
            <!-- 改错题 -->
            <correction-subject v-if="question.type=== '12' && question.option.length" :correctionData="question" flag="preview" :bindIndex="index"></correction-subject>
            <div class="loading-container" v-if="loading">
                <loading></loading>
            </div>
        </div>
        <audio src="" id="myAudio"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
import singleChoice from '@/components/SingleChoice.vue'
import complexSubject from '@/components/ComplexSubject.vue'
import readSubject from '@/components/ReadSubject.vue'
import LineSubject from '@/components/LineSubject.vue'
import DragSubject from '@/components/DragSubject.vue'
import FillSubject from '@/components/FillSubject.vue'
import SortSubject from '@/components/SortSubject.vue'
import ChoiceWordSubject from '@/components/ChoiceWordSubject.vue'
import ShortAnswerSubject from '@/components/ShortAnswerSubject.vue'
import correctionSubject from '@/components/correctionSubject.vue'
import recordSubject from '@/components/RecordSubject.vue'
import WriteSubject from '@/components/WriteSubject.vue'
import Loading from '@/components/loading/loading'
import axios from '@/until/axios.js'
var qs = require('qs')
window.exerciseRecordId = 0
export default {
    metaInfo: {
        title: ' 作业系统--题目预览'
    },
    data () {
        return {
            info:{},
            index: 0,
            question: {},              //当前question
            loading: true              //是否显示loading加载中
        }
    },
    components: {
        singleChoice,
        complexSubject,
        readSubject,
        LineSubject,
        DragSubject,
        Loading,
        FillSubject,
        SortSubject,
        WriteSubject,
        ChoiceWordSubject,
        ShortAnswerSubject,
        correctionSubject,
        recordSubject
    },
    mounted(){
        let aid = this.$route.query.aid  //作业id
        let qid = this.$route.query.qid  //题目id
        this.getSingleQuestion(aid, qid)
    },
    methods:{
        //获取题目数据
        getSingleQuestion (aid, qid){
            let url = '/exercise/getSingleQuestion'
            let data = {
                'aid': aid,
                'qid': qid
            }
            axios.post(url, { ... data }).then(res => {
                if (res.code === 200){
                   this.question = res.data
                }
                this.loading = false
            }).catch( err => {
                this.$alert('服务器错误，请稍后再试', '提示', {
                    confirmButtonText: '知道了',
                })
                this.loading = false
            })
        }
    }
}
</script>

<style scoped lang="less">
    .border{
        border: 1px solid #eee;
    }
    .white_bg{
        background: #fff;
    }
    .preview_con{
        margin:0 auto;
        width: 95%;
    }
    .main_left{
        width: 906px;
        height: auto;
        overflow: hidden;
        margin: 20px auto;
        .border;
        .white_bg;
        padding-bottom: 30px;
    }
       @media screen and (min-width: 767px) and (max-width: 1025px) {
       .main_left{
         width: 100%;
       }
      }
</style>
