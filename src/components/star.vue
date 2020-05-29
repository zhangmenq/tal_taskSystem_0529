<template>
    <div class="star">
      <span v-for="itemClass in itemClasses" class="star-item" :key="itemClass.id" :class="itemClass"></span>
    </div>
</template>

<script>
    const LENGTH = 5
    const CLS_ON = 'on'
    const CLS_HALF = 'half'
    const CLS_OFF = 'off'
    export default {
      props: {
        score: {
          type: Number //  通过分数计算星星的状态
        },
        totalScore:{
          type:String  // 题目总分数
        }
      },
      created () {
      },
      computed: {
        itemClasses () {
          let totalScore = Number(this.totalScore)
           let score = this.score * ( 5 /totalScore)
          // 存储星星状态的数组
          let result = []
          // 分数向下取整
          score = Math.ceil(score * 2) / 2
          // 如果余数不为0，则表示有小数，半个星星的状态
          let hasDecimal = score % 1 !== 0
          // 向下取整，总分为5分，整数是几就是几颗整的星星
          let integer = Math.floor(score)
          for (let i = 0; i < integer; i++) {
            result.push(CLS_ON)
          }
          // 半个星肯定最多一颗，有的话就直接放进去就可以
          if (hasDecimal) {
            result.push(CLS_HALF)
          }
          // 除此之外，如果这两种状态不够5，则将其他的放进去，直到有5颗的长度
          while (result.length < LENGTH) {
            result.push(CLS_OFF)
          }
          return result
        }
      }
    }
</script>

<style scoped >
  .star {
    font-size: 0;
  }
  .star .star-item{
    display:inline-block;
    width: 30px;
    height: 28px;
    margin-right: 20px;
  }
  .star-item:last-child{
    margin-right: 0
  }
 .star-item.on{
    background:url("../../static/images/star_on_icon.png") no-repeat;
    background-size: 100% 100%;
  }
 .star-item.half{
    background:url("../../static/images/star_half_icon.png") no-repeat;
    background-size: 100% 100%;
  }
 .star-item.off{
    background:url("../../static/images/star_off_icon.png") no-repeat;
    background-size: 100% 100%;
  }
</style>
