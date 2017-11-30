<template>
<el-menu default-active="2" class="el-menu-vertical-demo" :collapse="colapse" theme="dark">
  <el-submenu class="tile" index="1">
    <template slot="title">
      <icon v-if="original" name="cube" style="color:lightgreen"></icon>
      <icon v-else name="cube"></icon>
      <span slot="title">Cube</span>
    </template>
    <el-submenu index="repo">
      <span slot="title">Repository</span>
      <el-menu-item index="repo-reload" @click="commandSelected('repo-reload')">Reload Repositories</el-menu-item>
      <el-menu-item index="repo-download" @click="commandSelected('repo-download')">Download Repositories</el-menu-item>
    </el-submenu>
    <el-submenu index="dl">
      <span slot="title">Download</span>
      <el-menu-item index="dl-mark-upgrades" @click="commandSelected('dl-mark-upgrades')">Mark All Updates for Download</el-menu-item>
      <el-menu-item index="dl-unmark-all" @click="commandSelected('dl-unmark-all')">Unmark All for Download</el-menu-item>
      <el-menu-item index="dl-all-marked" @click="commandSelected('dl-all-marked')">Download All Marked Packages</el-menu-item>
    </el-submenu>
    <el-submenu v-if="original" index="in">
      <span slot="title">Install</span>
      <el-menu-item index="in-mark-downloaded" @click="commandSelected('in-mark-downloaded')">Mark All Downloaded for Installation</el-menu-item>
      <el-menu-item index="in-unmark-all" @click="commandSelected('in-unmark-all')">Unmark All for Installation</el-menu-item>
      <el-menu-item index="in-all-marked" @click="commandSelected('in-all-marked')">Install All Marked Packages</el-menu-item>
      <el-menu-item index="in-all-satisfied" @click="commandSelected('in-all-satisfied')">Install All Satisfied Downloaded Packages</el-menu-item>
    </el-submenu>
    <el-submenu v-if="original" index="system">
      <span slot="title">System</span>
      <el-menu-item index="update-project" @click="commandSelected('update-proj')">Update Project</el-menu-item>
      <el-menu-item index="update-computer" @click="commandSelected('update-comp')">Update Computer's Repositories</el-menu-item>
    </el-submenu>
    <el-submenu index="proj">
      <span slot="title">Project</span>
      <el-menu-item index="proj-clean" @click="commandSelected('proj-clean')">Clean Project</el-menu-item>
      <el-menu-item index="proj-close" @click="commandSelected('proj-close')">Close Project</el-menu-item>
    </el-submenu>
    <el-menu-item index="settings" @click="commandSelected('settings')">
      Settings
    </el-menu-item>
    <el-menu-item index="about" @click="commandSelected('about')">
      About
    </el-menu-item>
    <el-menu-item index="quit" @click="commandSelected('quit')">
      Quit
    </el-menu-item>
  </el-submenu>

  <el-submenu index="all" class="tile">
    <template slot="title">
      <icon name="asterisk"></icon>
      <span slot="title">All</span>
    </template>
    <el-menu-item @click="sectionChanged(m)" v-for="m in mainList" :key="m.name" :index="m.name">
      {{m.description}}
      <el-tag class="size" type="gray">{{m.count.toLocaleString()}}</el-tag>
    </el-menu-item>
  </el-submenu>
  
  <el-menu-item  class="tile" @click="sectionChanged(s)" v-for="s in sections" :index="s.name" :key="s.name">
    <i><icon :name="s.fontIcon"></icon></i>
    <span slot="title">
      {{s.description}}
      <el-tag class="size" type="gray">{{s.count.toLocaleString()}}</el-tag>
    </span>
  </el-menu-item>

</el-menu>
</template>

<style scoped>
img {
    height: 24px;
    width: 24px;
}

.tile {
  height: 60px;
}

.size {
  margin:5px;
  min-width:50px;
  text-align:center;
}

.fa-icon {
  width: auto;
  height: 2em;
}
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

import sys from '@/api/system';
import repo from '@/api/repository';

export default {
  name: 'controls',

  created() {
    this.loadData();

    this.evt.on('refresh',()=>{
      this.loadData();
    })
  },

  destroyed() {
    this.evt.clear();
  },

  data() {
    return {
      colapse: true,
      original: false,
      mainList:[],
      sections : [],
      evt : new Eventor(),
    }
  },

  methods : {
    async loadData() {
      this.mainList = await repo.getMainList();
      this.sections = await repo.getSectionList();
      this.sections = this.sections.slice(1,11);

      for(let s of this.sections)
        s.fontIcon = this.getFontIcon(s.name);

      var res = await sys.environmentData();
      this.original = res.original_computer;
    },

    clicked(main,sub) {
      this.$emit('selected', main,sub);
    },

    commandSelected(command) {
      EventBus.$emit('command-selected',command);
    },

    sectionChanged(section) {
      EventBus.$emit('package-lister-section',section.name,section.description);
    },
    
    getFontIcon(name) {
      switch(name) {
        case 'educ' : return 'flask';
        case 'admin' : return 'gear';
        case 'desktop' : return 'laptop';
        case 'devel' : return 'code';
        case 'doc' : return 'book';
        case 'games' : return 'gamepad';
        case 'graphics' : return 'paint-brush';
        case 'sound' : return 'film';
        case 'utils' : return 'wrench';
        case 'web' : return 'globe';
        case 'lib' : return 'puzzle-piece';
      }
    }
  }
}
</script>