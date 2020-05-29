<template>
  <div id="app" class="container">
    <keep-alive>
      <router-view></router-view>
   </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="less">
@import '../static/css/common.less';
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

