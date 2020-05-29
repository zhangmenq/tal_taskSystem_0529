<!--选项卡-->
<template>
 <div class="header">
     <div class="header-tab">
         <ul>
            <li v-for="(item, index) in tabs" :key="item.id"
             :class="{'active': idx===index}"
             @click="changeTab(index)">
             <router-link to="/index">{{item}}</router-link>
             </li>
         </ul>
     </div>
 </div>
</template>

<script type="text/ecmascript-6">
export default {
    props:['type'],
    data() {
        return {
            idx:1,  // 默认显示1
            tabs:['全部','待完成','批改中','已完成']
        }
    },
    components: {

    },
    methods: {
        changeTab (index) {
            this.idx = index
        }
    }
}
</script>

<style scoped lang="less">
.header{
    .header-tab{
        padding: 30px 30px 20px 30px;
        color:#fff;
        font-size: 16px;
        ul{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50px;
            width: 420px;
            cursor: pointer;
            li{
                flex: 1;
                text-align: center;
                height: 50px;
                line-height: 50px;
                background: #d9d9d9;
                a{
                    color:#fff;
                }
            }
            li:first-child{
                 border-radius: 10px 0 0 10px;  
            }
            li:last-child{
                 border-radius: 0 10px 10px 0; 
            }
            .active{
                background:#4277ec;
            }
        }
    }
}
</style>
