<template>
<el-card class="box-card">
  <div class="container" @mouseenter="showMarker=true" @mouseleave="showMarker=false">
    <img id='icon' class='media-object' onerror="this.src='/static/images/package-x-generic.svg'" :src='"https://apps.ubuntu.com/site_media/icons/2015/03/"+p.name+".png"'/>
    <div class="info">
      <div>{{p.name}}</div>
      <div class="description">{{p.description | toSentence}}</div>
    </div>
    <el-button @click="mark" v-show="(showMarker||p.marked) && p.status!='Installed'" type="success" class="mark el-icon-check"></el-button>
    <el-button v-if="p.status=='Available'" @click="view()" class="action" type="primary">Download</el-button>
    <el-button v-else-if="p.status=='Upgradable'" @click="view()" class="action" type="warning">Update</el-button>
    <el-button v-else-if="p.status=='Installed'" @click="view()" class="action" type="success">Installed</el-button>
    <el-button v-else-if="p.status=='Downloaded' && !original" @click="view()" class="action" type="default">Downloaded</el-button>
    <el-button v-else-if="p.status=='Downloaded' && original" @click="view()" class="action" type="warning">Install</el-button>
  </div>
</el-card>
</template>

<style scoped>
.description {
  font-size:12px;
}
.mark {
    border-radius: 40px;
    padding: 10px;
    min-width:40px;
}
.action {
    min-width: 110px;
}

.el-card {
    margin-bottom:5px;
}
.container {
    display: flex;
    align-items: center;
}
.icon {
    box-sizing: border-box;
}
.info {
    margin: 10px;
    box-sizing: border-box;
    width: 100%;
}
.media-object {
    width: 48px;
    height: 48px;
    min-width: 48px;
    max-width: 48px;
}
</style>

<script>
import {EventBus} from '../utils/event-bus';
import repo from '../api/repository';

export default {
  name: 'package-card',
  props : {
    pkg : {
      type:Object,
      required: true,
  },
    original : {
      type: Boolean,
      required: true,
    }
  },

  data() {
    return {
      p : {},
      showMarker : false,
    }
  },

  created() {
    this.p = this.pkg
    EventBus.$on('refresh',this.refresh);
  },

  destroyed() {
    EventBus.$off('refresh',this.refresh);
  },

  filters: {
    toSentence(val) {
      if (val !== undefined)
        val = val.charAt(0).toUpperCase() + val.slice(1);
      return val
    }
  },
  
  methods : {
    async refresh() {
      let info = await repo.findPackage(this.p.name)
      if(info !== undefined) {
        this.p.status = info.status;
        this.p.version = info.version;
        this.p.installed_version = info.installed_version;
        this.p.marked = info.marked;
      }
    },

    view() {
      EventBus.$emit('package-viewer',this.pkg.name);
    },

    async mark() {
      let type = '';

      if(this.p.status == 'Available' || this.p.status == 'Upgradable')
        type = 'to-download';
      else if(this.p.status == 'Downloaded' && this.original)
        type = 'to-install';

      if (this.p.marked)
        await repo.unmarkPackage(type,this.p.name);
      else
        await repo.markPackage(type,this.p.name);

      EventBus.$emit('refresh');
    }
  }
}

</script>