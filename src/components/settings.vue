<template>
  <div class="viewer">
    <el-card class="card" body-style="padding:0px"> 
      <div class="container">
        <div class="heading">
          <el-button type="primary" @click="back" class="back el-icon-arrow-left"></el-button>
          <div class="title">Cube Settings</div>
        </div>

        <div class="content">

          <el-tabs v-model="active">
            <div class="status" v-if="status"><el-alert :closable="false" class="alert" :title="status.message" :type="status.type"></el-alert></div>
            
            <el-tab-pane label="Installer" name="installer">
              <span slot="label">Installer</span>
              <el-form :model="installerForm">
                <el-form-item label="Default Installer">
                  <el-select v-model="installerForm.installer">
                    <el-option v-for="i in installerForm.installers" :key="i" :label="i" :value="i"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="Apt Get Parameters">
                  <el-input v-model="installerForm.aptgetParameters"></el-input>
                </el-form-item>

                <el-form-item label="DPKG Parameters">
                  <el-input v-model="installerForm.dpkgParameters"></el-input>
                </el-form-item>

                <el-form-item>
                  <span slot="label" style="text-align:left">
                    <p>Installation Terminals</p>
                    <p>Separate terminals with semicolon. The first available terminal on the list will be used</p>
                  </span>
                  <el-input v-model="installerForm.terminals"></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="Downloader" name="downloader">
              <el-form :model="downloaderForm">
                <el-form-item label="Default Downloader">
                  <el-select v-model="downloaderForm.downloader">
                    <el-option v-for="d in downloaderForm.downloaders" :key="d" :label="d" :value="d"></el-option>
                  </el-select>
                </el-form-item>
                
                <el-form-item label="Axel Parameters">
                  <el-input v-model="downloaderForm.axelParameters"></el-input>
                </el-form-item>

                <el-form-item label="Aria2 Parameters">
                  <el-input v-model="downloaderForm.aria2Parameters"></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="Repository" name="repository">
              <el-form>
                <el-form-item>
                  <span slot="label" style="text-align:center">
                    <p>A text editor will open your sources.list. Please download repositories after making modifications.</p>
                  </span>
                  <div class="controls"><el-button @click="editSourcesList" type="primary" style="width:50%">Edit sources.list</el-button></div>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="Server" name="server">
              <el-form :model="serverForm">
                <el-form-item label="Port Number" prop="port" 
                :rules="[{ type: 'number', message: 'Port must be a number'}]"
                >
                  <el-input type="port" v-model.number="serverForm.port"></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
          </el-tabs>

          <div class="controls"><el-button @click="save" type="primary">Save</el-button><el-button @click="reset">Reset</el-button></div>
          </div>
        </div>
    </el-card>
  </div>
</template>

<style scoped>
.title {
  font-size: 1em;
}

.alert {
  width:300px;
}

.controls {
  width:100%;
  text-align: center;
}

.el-tabs {
  margin-top:10px;
}

.el-tab-pane {
   padding:50px;
   height:370px;
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

.status {
  position: absolute;
  width:100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.viewer {
  width:100%;
  height: inherit;
}

.card {
  height: inherit;
  padding: 0px;
}

.container {
  position: relative;
}

</style>

<script>
import { EventBus } from '@/utils/event-bus';

import conf from '@/api/configuration'

export default {
  name : 'settings',

  data() {
    return {
      installerForm: {
        installer : '',
        installers : [],
        aptgetParameters : '',
        dpkgParameters : '',
        terminals : '',
      },
      downloaderForm: {
        downloader : '',
        downloaders : [],
        axelParameters : '',
        aria2Parameters : '',
      },
      serverForm: {
        port: '',
      },
      active : "installer",
      status : undefined,
    }
  },

  async created() {
    await this.load();
  },

  methods : {
    async load() {
      const res = await conf.configurationEntries();
      
      this.installerForm.installers = res.installers.split(',');
      this.installerForm.installer = res.default_installer;
      this.installerForm.aptgetParameters = res.apt_get_parameters;
      this.installerForm.dpkgParameters = res.dpkg_parameters;
      this.installerForm.terminals = res.terminals;

      this.downloaderForm.downloaders = res.downloaders.split(',');
      this.downloaderForm.downloader = res.default_downloader;
      this.downloaderForm.axelParameters = res.axel_downloader_parameters;
      this.downloaderForm.aria2Parameters = res.aria2c_downloader_parameters;

      this.serverForm.port = parseInt(res.server_port);
    },

    async save() {
      let entries = '';
	    
	    entries += 'default_installer=' + this.installerForm.installer;
	    entries += '&apt_get_parameters=' + this.installerForm.aptgetParameters;
	    entries += '&dpkg_parameters=' + this.installerForm.dpkgParameters;
	    entries += '&terminals=' + this.installerForm.terminals;

      entries += '&default_downloader=' + this.downloaderForm.downloader;
	    entries += '&axel_downloader_parameters=' + this.downloaderForm.axelParameters;
	    entries += '&aria2c_downloader_parameters=' + this.downloaderForm.aria2Parameters;

	    entries += '&server_port=' + this.serverForm.port;

      const res = await conf.saveConfigurationEntries(entries);

      if(res.success) {
        this.status = {
          type : 'success',
          message : res.message
        }
      } else {
        this.status = {
          type : 'error',
          message : res.message
        }
      }

      setTimeout(()=>{
        this.status = undefined;
      },5000);

      this.load();
    },

    async reset() {
      const res = await conf.resetConfigurationEntries();
      
      if(res.success) {
        this.status = {
          type : 'success',
          message : res.message
        }
      } else {
        this.status = {
          type : 'error',
          message : res.message
        }
      }

      setTimeout(()=>{
        this.status = undefined;
      },5000);

      this.load();
    },
    async editSourcesList() {
      await conf.openSourcesList();
    },

    async back() {
      EventBus.$emit('change-view','previous');
    }
  }
}
</script>