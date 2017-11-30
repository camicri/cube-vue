<template>
<el-dialog
		:visible.sync="show"
		:show-close="false"
		:close-on-click-modal="false"
	>
    <template slot="title">{{title}}</template>
    <div class="table">
    <el-table
      :data="tableData"
      :show-header="false"
      :max-height="300"
      style="width: 100%">
      
      <el-table-column
        prop="name"
        label="Name"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="error_message"
        label="Message"
      >
      </el-table-column>
    </el-table>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="show=false" type="default">Close</el-button>
    </span>
</el-dialog>
</template>

<style scoped>
table, th, td {
  border-left: none;
  border-right: none;
}

.el-dialog {
    min-width: 700px;
}
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

export default {
    name : 'download-result-modal',

    created() {
        this.evt.on('download-result',(title, message, data)=>{
            this.show = true;
            this.title = title;
            this.message = message;
            this.tableData = data;
        });
    },

    destroyed() {
        this.evt.clear();
    },
    
    data() {
        return {
            title : '',
            message : '',
            show: false,
            tableData: [
            ],
            evt: new Eventor()
        }
    },
}
</script>