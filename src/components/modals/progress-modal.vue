<template>
<el-dialog
		:visible.sync="show"
		:show-close="false"
		:close-on-click-modal="false"
	>
  <template slot="title">
    <center>{{title}}</center>
  </template>
	<div  class="progress">
    <span v-if="!progress" class="el-icon-loading"></span>
    <el-progress v-else type="circle" :text-inside="true" :stroke-width="18" :percentage="progress"></el-progress>
  </div>  
</el-dialog>
</template>

<style>
.el-dialog {
  max-width: 500px;
}

.progress {
  width: 100%;
  text-align: center;
  font-size:6em;
}
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

export default {
  name : 'progress-modal',

  created() {
    this.evt.on('progress',(title, message, progress)=>{
      this.show = true;
      this.title = title;
      this.message = message;
      this.progress = progress;
    });

    this.evt.on('progress-done',()=>{
      this.show = false;
      this.title = '';
      this.message = '';
      this.progress = 0;
    });
  },

  destroyed() {
    this.evt.clear();
  },
  
  data() {
    return {
      title : '',
      message : '',
      progress : 0,
      show : false,
      evt : new Eventor(),
    }
  }
}
</script>