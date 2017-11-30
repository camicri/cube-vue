<template>
<el-dialog
		:visible.sync="show"
		:show-close="false"
		:close-on-click-modal="false"
	>
<template slot="title">{{title}}</template>
<div class="message">{{message}}</div>
<div class="lister">

<el-card v-for="p in packages" :key="p.name" class="card" body-style="padding:5px">
  <div class="container">
    <img class='icon media-object' src="/static/images/package-x-generic.svg"/>
      <span class="name">{{p.name}}</span>
      <div class="info"><el-tag>{{p.size}}</el-tag></div>
  </div>
</el-card>

</div>

<span slot="footer" class="dialog-footer">
  <el-button @click="no" >Cancel</el-button>
  <el-button @click="yes" type="primary">Continue</el-button>
</span>
</el-dialog>
</template>

<style scoped>
.name {
  width:100%;
}

.info {
  width:100%;
  text-align: right;
  margin: 5px;
}

.message {
  min-width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.lister {
  height: 300px;
  overflow-y: auto;
}

.icon {
  margin: 5px;
}

.el-card {
  margin: 5px;
}
.container {
  display: flex;
  align-items: center;
}
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

export default {
  name : 'dependency-lister-modal',

  data() {
    return {
      show : false,
      title : '',
      message : '',
      yesHandler : {},
      noHandler : {},
      packages : [],
      noHandler : {},
      yesHandler : {},
      evt : new Eventor(),
    }
  },

  created() {
    this.evt.on('dependency-lister',(title, message, packages, yesHandler, noHandler)=>{ 
      this.show = true;
      this.title = title;
      this.message = message;
      this.packages = packages;
      this.yesHandler = yesHandler;
      this.noHandler = noHandler;
    });

    this.evt.on('dependency-lister-done',()=> {
      this.show = false;
      this.title = '';
      this.message = '';
      this.packages = [];
      this.yesHandler = {};
      this.noHandler = {};
    });
  },

  destroyed() {
    this.evt.clear();
  },

  methods : {
    no() {
      this.noHandler();
      this.show = false;
    },
    
    yes() {
      this.yesHandler();
      this.show = false;
    }
  }
}
</script>