<template>
<div class="main">
  <el-button v-show="!onProjectLoading" type="danger" :plain="true" class="quit" @click="quit()">Quit</el-button> 
  <transition name="fade">
   <div class="startup" v-show="!onProjectLoading">
      <template>

        <img class="logo" src="/static/images/cubelogo.png"/>
        <span class="title gap-less">Camicri Cube</span>
        {{version}}
        <div>
        <el-alert v-show="result.message"
          :title="result.message"
          :type="result.type"
          :closable="false">
        </el-alert>
        </div>

        <div v-show="!creating" class="gap">
          <el-select :disabled="projects.length==0" v-model="selected" placeholder="Getting projects...">
            <el-option
              v-for="p in projects"
              :key="p.name"
              :label="p.name"
              :value="p.name">
            </el-option>
          </el-select>
          <el-button @click="open" :disabled="projects.length==0">Open</el-button>
        </div>

        <template v-if="os=='LINUX'">
          <div v-show="creating" class="gap">
            <el-input v-model="project" placeholder="Project Name" style="width:200px"></el-input> <el-button @click="create">Create</el-button>
          </div>
          <hr class="long-hr">
          <el-button v-if="!creating" class="gap" type="primary" @click="creating=true;result.message=undefined">Start a new project</el-button>
        </template>

        <el-button v-if="creating" class="gap" type="primary" @click="creating=false;result.message=undefined">Open a project</el-button>
      </template>
   </div>
  </transition>
  <transition name="fade">
   <div class="startup" v-show="onProjectLoading">
     Cube is now loading your project. Please Wait.
     <div class="gap-less"></div>
     <el-progress type="circle" :text-inside="true" :stroke-width="18"  :percentage="percent" :width="200"></el-progress>
   </div>
  </transition>
</div>
</template>

<style>
.title {
  font-size: 1.5em;
}

.gap {
  margin: 30px;
}

.gap-less {
  margin : 10px;
}

.main {
  height: 700px;
  position: relative;
}

.quit {
  position: absolute;
}

.startup {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 100%;
   width: 100%;
}

.long-hr {
  width:100px;
}

.fade-enter-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>

<script>
import {EventBus} from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

import project from '@/api/project';
import repo from '@/api/repository';
import sys from '@/api/system';

export default {
  name: 'startup',

  data(){
    return {
      creating:false,
      result: {message:undefined,type:undefined},
      projects : {},
      project: '',
      selected : '',
      percent : 0,
      version : '',
      os : 'WINDOWS',
      onProjectLoading : false,
      evt : new Eventor(),
    }
  },

  async created() {
    let env = await sys.environmentData();
    this.os = env.operating_system;

    this.projects = await project.getProjects();
    if(this.projects.length > 0)
      this.selected = this.projects[0].name;
    else
      this.creating = true;

    this.initProjectEvents();
    this.initRepoEvents();
  },

  methods : {
    async create() {
      this.project = this.project.trim();

      if(this.project != '' && !this.project.includes(' ')) {
        this.result.message = 'Creating '+this.project+'...';
        this.result.type = 'info';

        const res = await project.createProject(this.project);

        if(res.success) {
          this.result.message = res.message;
          this.result.type = 'success';
          await this.reload(this.project);
          this.creating = false;
        } else {
          this.result.message = res.message;
          this.result.type = 'error';
        }
      } else {
        this.result.message = 'Invalid Name';
        this.result.type = 'error';
      }
    },

    destroyed() {
      this.evt.clear();
    },

    async reload(selected=undefined) {
      this.projects = await project.getProjects();
      if(!selected)
        this.selected = this.projects[0].name;
      else
        this.selected = selected;
    },

    async open() {
      await project.openProject(this.selected);
    },

    async quit() {
      sys.quit(); 
      EventBus.$emit('ws-quit');
    },
    async initProjectEvents() {
      this.evt.on('ws-project-open-done',async ()=>{
        this.onProjectLoading = true;
        await sys.sync_data();
        await repo.scan();
      });
    },
    
    async initRepoEvents() {
      this.evt.on('ws-repository-scan-started',()=>{});

      this.evt.on('ws-repository-scan-progress',(data)=>{
        this.percent = parseInt((data.current / data.max) * 100);
      });

      this.evt.on('ws-repository-scan-done',()=>{
        this.$router.push('main');
      });
    }
  }
}

</script>