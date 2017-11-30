<template>
  <div class="about">
    <el-card class="card" body-style="padding:0px">
      <div class="content">
        <div class="heading">
          <el-button type="primary" @click="back" class="back el-icon-arrow-left"></el-button>
          <div class="title"></div>
        </div>
      </div>

      <div class="body">
        
        <template v-if="show=='about'">
          <div>
            <img class="logo" src="/static/images/cubelogo.png"/>
          </div>
          <div class="app-name">{{cube.application_name}}</div>
          <div class="description">{{cube.short_description}}</div>
          <div class="version">v{{cube.application_version+'.'+cube.application_revision}}</div>
          <hr class="divider">
          
          <div class="links">
            <a title="Launchpad Page" target="_blank" :href="cube.launchpad_url">
              <img src="/static/images/launchpad.ico"/>
            </a>
            <a title="Facebook Page" target="_blank" :href="cube.facebook_url">
              <img src="/static/images/facebook.ico"/>
            </a>
          </div>
          
          <div class="author" v-for="a in cube.authors" :key="a.name">{{a.name}}</div>
        </template>
        <template v-if="show=='license'">
          <div class="license">
            <el-input :rows="15" :readonly="true" type="textarea" v-model="cube.license"></el-input>
          </div>
        </template>
      </div>

      <div class="footer">
        <el-button-group>
          <el-button size="large" :type="show=='about'?'primary':'default'" @click="show='about'">About</el-button>
          <el-button size="large" :type="show=='license'?'primary':'default'" @click="show='license'">License</el-button>
        </el-button-group>
      </div>
      
    </el-card>
  </div>
</template>

<style scoped>
.divider {
  width:150px;
  margin:20px;
}

.links {
  font-size:10px;
}

.license {
  width: 90%;
}

.author {
  font-size:12px;
  margin-top:20px
}

.version {
  font-size:12px;
  margin:2px;
}

.app-name {
  font-size:1.5em;
  margin:5px;
}

.description {
  font-size:1em;
  margin-top:0px
}

hr {
  margin-bottom:30px;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
}
.card {
  height: inherit;
  padding: 0px;
  height: 650px;
}

.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 500px;

}

.container {
  position: relative;
}

.back {
  width: 50px;
  font-size:12px;
  padding:10px;
  border-radius:0px;
  margin-right: 10px;
}

.heading {
  display: flex;
  align-items: center;
}

.title {
  font-size: 1em;
}

</style>

<script>
import {EventBus} from '@/utils/event-bus';
import sys from '@/api/system';

export default {
  name : 'about',

  async created() {
    this.cube = await sys.cubeData();
  },

  data() {
    return {
      cube : {},
      show : 'about',
    }
  },
  
  methods : {
    back() {
      EventBus.$emit('change-view', 'previous');
    }
  }
}

</script>