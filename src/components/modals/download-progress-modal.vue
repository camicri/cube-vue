<template>
<el-dialog
  :visible.sync="show"
  :show-close="false"
  :close-on-click-modal="false"
	>
    <template slot="title">{{title}}</template>
    <template v-if="main_progress!==undefined">
        <div>
          <el-progress :show-text="false" :stroke-width="18" :percentage="main_progress" style="margin-bottom:5px"></el-progress>
        </div>
        <div class="sub">
          <div class="sub-message"><span> {{sub_message}} <el-tag v-if="size" type="primary">{{size}}</el-tag> <el-tag v-if="rate" type="primary">{{rate}}</el-tag></span></div>
          <el-progress :show-text="false" :stroke-width="10" :percentage="sub_progress"></el-progress>
        </div>
    </template>
    <template v-else>
      <div class="loading"><span class="el-icon-loading"></span></div>
    </template>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel()" type="danger">Cancel</el-button>
    </span>
</el-dialog>
</template>

<style scoped>
.el-dialog {
    max-width: 500px;
}

.loading {
    width: 100%;
    text-align: center;
    font-size: 6em;
}

.sub {
    margin-top: 20px;
}

.sub-message {
    font-size: 1.2em;
    margin-bottom: 5px;
    word-wrap: break-word;
}

</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

export default {
  name : 'download-progress-modal',

  created() {
    this.evt.on('download-progress',(title, message, progress, sub_message, sub_progress, size, rate)=>{
      this.show = true;
      this.title = title;
      this.main_message = message;
      this.main_progress = progress,
      this.sub_message = sub_message;
      this.sub_progress = sub_progress;
      this.size = size;
      this.rate = rate;
    });

    this.evt.on('download-progress-done',()=>{
      this.show = false;
      this.title = '';
      this.main_message = '';
      this.main_progress = 0;
      this.sub_message = '';
      this.sub_progress = 0;
      this.size = '';
      this.rate = '';
    });      
  },

  destroyed() {
    this.evt.clear();
  },

  data() {
    return {
      title : '',
      main_message : '',
      main_progress : 0,
      sub_message : '',
      sub_progress : 0,
      size : '',
      rate : '',
      show: false,
      evt : new Eventor()
    }
  },
  
  methods : {
    cancel() {
      EventBus.$emit('download-progress-cancel');
    }
  }
}
</script>