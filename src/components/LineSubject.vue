<!--连线题-->
<template>
    <div class="task_item">
        <h2 class="question_type">
            <i class="small">{{bindIndex + 1}}</i>
            <i class="big">{{Sort}}</i>
            连线题（{{lineData.score}}分）
        </h2>
        <div class="question_con">
            <question-header :BaseData="lineData" :currentIndex="currentIndex"></question-header>
            <div class="choose_wrapper">
                <!-- 查看页面 -->
                <div class="line_list" v-for="(line,index) in detailsData.line" :key="line+index" v-if="flag == 'details' || (flag == 'wrong' && showWrong ==2)">
                    <div class="line_list_left">
                        <div class="line_item">
                            <i class="scroll_style" v-html="(index +1) + '. '+ line.line_title" :title="(line.line_title).replace(/<[^<>]+?>/g,'')"></i>
                        </div>
                        <div class="select_box line_box">
                            <el-select v-if="detailsData.userAnswer.length > 0" v-model="detailsData.userAnswer[index].mark">
                                <el-option v-for="item in detailsData.option" :key="item.id" :label="item.mark" :value="item.id" disabled="disabled"></el-option>
                            </el-select>
                            <el-select v-else v-model="label">
                                <el-option v-for="item in detailsData.option" :key="item.id" :label="item.mark" :value="item.id" disabled="disabled"></el-option>
                            </el-select>
                        </div>
                        <img src="../../static/images/right_icon.png" class="drag_statue" v-if="detailsData.userAnswer.length>0 &&detailsData.userAnswer[index].id==detailsData.rightAnswer[index].id">
                        <img src="../../static/images/wrong_icon.png" class="drag_statue" v-else>
                    </div>
                    <div class="line_list_right">
                        <div class="line_item_answer" v-if="detailsData.option[index]">
                            <span v-html="detailsData.option[index].mark"></span>
                            <i class="scroll_style" v-html="detailsData.option[index].title" :title="(detailsData.option[index].title).replace(/<[^<>]+?>/g,'')"></i>
                        </div>
                    </div>
                </div>
                <!-- 答题页面 -->
                <div class="line_list" v-for="(line,index) in lineData.line" :key="line+index" v-if="(flag == 'answer' || (flag == 'wrong' && showWrong==1)) ||flag=='preview'">
                    <div class="line_list_left">
                        <div class="line_item">
                            <i class="scroll_style" v-html="(index +1) + '. '+ line.line_title" :title="(line.line_title).replace(/<[^<>]+?>/g,'')"></i>
                        </div>
                        <div class="select_box">
                            <el-select v-model="values[index]" @change="sendLineData" placeholder="请选择">
                                <el-option v-for="item in lineData.option" :key="item.id" :label="item.mark" :value="item.id"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="line_list_right">
                        <div class="line_item_answer" v-if="lineData.option[index]">
                            <span v-html="lineData.option[index].mark"></span>
                            <i class="scroll_style" v-html="lineData.option[index].title" :title="(detailsData.option[index].title).replace(/<[^<>]+?>/g,'')"></i>
                        </div>
                    </div>
                </div>
                <!--显示正确答案-->
                <base-right @closeRight="displayAnswer" v-if="(flag == 'details' || (flag == 'wrong' && showWrong ==2)) || flag=='preview'" :anayData="detailsData.analysis" :qid="detailsData.qid">
                    <div class="right_answer_main" v-show="showAnswer">
                        <div class="line_list" v-for="(line,index) in detailsData.line" :key="line+index">
                            <div class="line_list_left">
                                <div class="line_item">
                                    <i class="scroll_style" v-html="(index +1) + '. '+ line.line_title"></i>
                                </div>
                                <div class="select_box">
                                    <el-select v-model="detailsData.rightAnswer[index].mark" placeholder="请选择">
                                        <el-option v-for="item in lineData.option" :key="item.id" :label="item.mark" :value="item.id" disabled="disabled"></el-option>
                                    </el-select>
                                </div>
                            </div>
                            <div class="line_list_right">
                                <div class="line_item_answer" v-if="detailsData.option[index]">
                                    <span v-html="detailsData.option[index].mark"></span>
                                    <i class="scroll_style" v-html="detailsData.option[index].title" :title="(detailsData.option[index].title).replace(/<[^<>]+?>/g,'')"></i>
                                </div>
                            </div>
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

<script type="text/ecmascript-6">
import baseRight from "@/components/BaseRight.vue";
import QuestionHeader from "@/components/QuestionHeader.vue";
import axios from "@/until/axios.js";
export default {
    props: {
        lineData: Object,
        flag: String,
        bindIndex: Number,
        parentQid: String,
        type: String
    },
    data () {
        return {
            label: "请选择",
            detailsData: {},
            values: [],
            isComplete: false, // 是否完成答题
            sendValues: [],
            currentIndex: 0,
            showAnswer: true,
            showWrong: 0,
            cancelSubjectFlag: true
        };
    },
    components: {
        QuestionHeader,
        baseRight
    },
    computed: {
        Sort () {
            return this.bindIndex + 1 + "." + " ";
        }
    },
    created () {
        this.detailsData = this.lineData;
        if (this.flag == "wrong") {
            this.showWrong = 1;
            if (this.type == 1) {
                this.cancelSubjectFlag = false
            }
        }
    },
    mounted () {
        if (this.detailsData.userAnswer.length > 0) {
            this.sendValues = [];
            this.values = this.detailsData.userAnswer;
            if (this.detailsData.userAnswer.length > 0) {
                this.sendLineData();
            }
        }
    },
    methods: {
        // 取消错题
        cancelSubject () {
            this.$emit("cancelsubjet", this.lineData.qid);
        },
        //check答案
        checkAnswerFun () {
            if (this.isComplete) {
                this.submitWrong(this.lineData.qid);
            } else {
                this.$alert("请选择完整的答案", "提示", {
                    confirmButtonText: "知道了"
                });
                return false;
            }
        },
        // 重做
        repeatFun () {
            this.isComplete = false;
            this.values = [];
            this.showWrong = 1;
        },
        // 展开答案
        displayAnswer () {
            this.showAnswer = !this.showAnswer;
        },
        // 提交check
        submitWrong (qid) {
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
        //获取值
        sendLineData () {
            this.sendValues = [];
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i]) {
                    this.sendValues.push(
                        this.detailsData.line[i].id + "_" + this.values[i]
                    );
                }
            }
            if (this.sendValues.length == this.detailsData.line.length) {
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
    }
};
</script>

<style lang="less">
    .line_item {
        margin-right: 10px;
        width: 70%;
        height: 70px;
        border: 1px solid #bdd3fd;
        border-radius: 3px;
        background: #fbfcff;
        padding-left: 29px;
        position: relative;
        font-size: 16px;
        word-break: break-all;
        box-sizing: border-box;
        .drag_content_text {
            // display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            word-break: break-all;
            -ms-flex-line-pack: center;
            align-content: center;
            padding: 5px 10px;
            margin: 6px 5px;
            line-height: 23px;
            height: 46px;
            overflow-x: hidden;
            overflow-y: auto;
        }
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
    }
    .line_list {
        .el-input__suffix-inner {
            .el-input__icon {
                line-height: 32px;
                width: 14px;
            }
        }
        .el-input--suffix .el-input__inner {
            line-height: 70px;
            width: 86px;
            height: 70px;
            padding-left: 10px;
            box-sizing: border-box;
        }
        .el-select .el-input .el-select__caret {
            color: #767778;
        }
        .el-select:hover .el-input__inner {
            border-color: #c1d3f9;
        }
        .el-select .el-input__inner {
            border-color: #c1d3f9;
            border: 1px solid #c1d3f9;
        }
        .el-input__suffix {
            right: 0;
            width: 28px;
            background: #ecf1fe;
            border: 1px solid #c1d3f9;
            box-sizing: border-box;
            border-radius: 0 3px 3px 0;
        }
        .el-select .el-input.is-focus .el-input__inner {
            border-color: #c1d3f9;
        }
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        color: #666;
        position: relative;
        margin: 10px 0;
        .line_list_left {
            .line_item {
                padding-left: 0;
                background: #ecf1fe;
            }
            padding-left: 0;
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            flex-direction: row;
            padding-right: 70px;
            box-sizing: border-box;
        }
        // @media screen and (min-width: 767px) and (max-width: 1025px) {
        //   .line_list_left {
        //     width: 33%;
        //   }
        // }
        .select_box {
            width: 86px;
            height: 70px;
            box-sizing: border-box;
        }
        .line_box {
            height: 100%;
        }
        .line_list_right {
            width: 40%;
            font-size: 18px;
            .line_item_answer {
                .line_item;
                .drag_content_text {
                    color: #999;
                    display: flex;
                }
                width: 100%;
                margin-right: 0;
                backface-visibility: #ecf1fe;
                span {
                    color: #999;
                }
            }
        }
    }
    .right_anser {
        background: rgba(66, 119, 236, 0.05);
    }
    .wrong_anser {
        background: rgba(236, 66, 94, 0.05);
    }
    .drag_statue {
        width: 20px;
        height: 16px;
        left: 10px;
        top: 0;
        // transform: translate(0, -50%);
        position: relative;
    }
    .line_right_answer {
        padding: 0 6%;
    }
    .right_answer_main {
        .line_list {
            .el-select .el-input__inner {
                border-color: #d8d8d8 !important;
            }

            .el-input__suffix {
                border-color: #d8d8d8 !important;
                background: #f4f4f4;
            }
            .el-input--suffix .el-input__inner {
                padding-left: 24px;
            }
            .line_list_left {
                padding-right: 0px;
                .line_item {
                    background: #f4f4f4;
                    border-color: #d8d8d8;
                }
            }
            .line_list_right {
                .line_item_answer {
                    background: #f4f4f4;
                    border-color: #d8d8d8;
                    span {
                        border-color: #d8d8d8;
                    }
                }
            }
        }
    }
</style>