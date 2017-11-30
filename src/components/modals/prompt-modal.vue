<template>
<el-dialog
		:visible.sync="show"
		:show-close="false"
		:close-on-click-modal="false"
	>
  <template slot="title">{{title}}</template>
  {{message}}
  <span slot="footer" class="dialog-footer">
    <template v-if="type=='yes-no'">
      <el-button @click="no" >Cancel</el-button>
      <el-button @click="yes" type="primary">OK</el-button>
    </template>
      <el-button v-else @click="show=false" >Close</el-button>
  </span>
</el-dialog>
</template>

<style scoped>
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

export default {
  name : 'prompt-modal',

  data() {
    return {
      show : false,
      title : '',
      message : '',
      type : 'yes-no',
      yesHandler : {},
      noHandler : {},
      evt : new Eventor(),
    }
  },

  created() {
    this.evt.on('prompt',(title, message, type, yesHandler, noHandler)=>{ 
      this.show = true;
      this.title = title;
      this.message = message;
      this.type = type;
      this.yesHandler = yesHandler;
      this.noHandler = noHandler;
    });

    this.evt.on('prompt-done',()=> {
      this.show = false;
      this.title = '';
      this.message = '';
      this.type = 'yes-no';
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