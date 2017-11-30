<template>
  <div id="app">
    <div id="container">
      <el-card id="content">
        <transition name="fade">
          <router-view></router-view>
        </transition> 
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#content {
  width: 100%;
  height: 760px;
  max-width: 850px;
  margin:10px;
  border-radius: 0px;
  box-shadow: 0 0 0 0 ;
}

.fade-enter-active {
  transition: opacity .10s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>
