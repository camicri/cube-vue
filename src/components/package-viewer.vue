<template>
  <div class="viewer">
    <el-card v-if="pkg !== undefined" class="card" body-style="padding:0px">
      <div class="container">
        <div class="heading">
          <el-button type="primary" @click="back" class="back el-icon-arrow-left"></el-button>
        </div>
        <div class="content">
          <el-row>
            <div class="header">
              <div class="icon-holder">
                <img class='icon imgload' onerror="this.src='/static/images/package-x-generic.svg'" :src='"https://apps.ubuntu.com/site_media/icons/2015/03/"+pkg.name+".png"' />
              </div>
              <div class="info">
                <div class="title">{{pkg.name | toSentence}}</div>
                <div v-if="!onProgress" class="description">{{pkg.description | toSentence }}</div>
                <div v-else class="progress">
                  <el-progress :percentage="progress" :show-text="false" :stroke-width="20"></el-progress>
                </div>

                <div class="tags">
                  <el-tag v-if="size != '0 bytes'">
                    <span v-if="loading" class="el-icon-loading"></span>
                    <span v-else-if="size != '0 bytes'">{{size}}</span>
                    <span v-else>Unknown size</span>
                  </el-tag>
                  <el-tag color="#6bba21">{{pkg.version}}</el-tag>
                </div>

              </div>
              <div class="controls">
                <el-button v-if="onProgress" size="large" @click="cancel()">Cancel</el-button>
                <template v-else>
                  <el-button v-if="pkg.status=='Available' || (pkg.status=='Downloaded' && dependsType == 'unsatisfied')" @click="download()" class="action" type="primary" size="large">Download</el-button>
                  <el-button v-else-if="pkg.status=='Upgradable'" class="action" type="warning" @click="download()" size="large">Update</el-button>
                  <el-button v-else-if="pkg.status=='Installed'" class="action" type="success" size="large">Installed</el-button>
                  <el-button v-else-if="pkg.status=='Downloaded' && dependsType == 'satisfied' && !original" class="action" type="default" size="large">Downloaded</el-button>
                  <el-button v-else-if="pkg.status=='Downloaded' && dependsType == 'satisfied' && original" @click="install()" class="action" type="warning" size="large">Install</el-button>
                </template>
              </div>
            </div>
          </el-row>
          <el-row>
            <el-col :span="9">
              <div class="dep-title">
                <span v-if="loading">Getting package dependencies...</span>
                <span v-if="depends.length > 0 && dependsType=='unsatisfied'">{{depends.length}} package{{depends.length>1?'s':''}} to be downloaded</span>
                <span v-if="depends.length > 0 && dependsType=='satisfied'">{{depends.length}} package{{depends.length>1?'s':''}} to be installed</span>
                <span v-if="depends.length == 0 && !loading">All dependencies satisfied.</span>
              </div>

              <div id="dependency_lister" class="dependencies" v-loading="loading">
                <div>
                  <div :id="pkg.name+'_'+p.name" class="dep-item" v-for="p in depends" :key="p.name">
                    <img class='dep-icon imgload' :src="'/static/images/package-x-generic.svg'" />
                    <div>
                      {{p.name}}
                      <template v-if="currDownloading&&currDownloading.name===p.name">
                        ({{p.size}})
                        <el-progress :percentage="currDownloading.percent" style="width:150px" :show-text="false"></el-progress>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

            </el-col>
            <el-col :span="15">
              <div class="screenshot">
                <img class="image imgload" onerror="this.src='/static/images/package-x-generic.svg'" :src="'https://screenshots.debian.net/screenshot/'+pkg.name" />
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.back {
  width: 50px;
  font-size:12px;
  padding:10px;
  border-radius:0px;
  margin-right: 10px;
}

.heading {
  position: absolute;
  display: flex;
  align-items: center;
}

.container {
  position: relative;
}

.content {
  padding: 20px;
}

.viewer {
  width: 100%;
  height: inherit;
}

.card {
  height: inherit;
}

.icon-holder {
  border-radius: 100px;
  border: 1px solid grey;
  min-width: 150px;
  min-height: 150px;
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 64px;
  height: 64px;
}

.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.info {
  width: 100%;
  margin: 5px;
}

.title {
  font-size: 1.5em;
}

.description {
  font-size: 0.75em;
}

.progress {
  margin-bottom: 5px;
}

.controls {
  width: 250px;
  height: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
}

.controls > .el-button {
  min-width: 110px;
}

.screenshot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.screenshot .image {
  min-width: 128px;
  min-height: 128px;
  max-width: 95%;
  max-height: 90%;
}

.dependencies {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 350px;
  margin: 10px;
}

.dep-title {
  margin-top: 20px;
}

.dep-item {
  padding: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.dep-icon {
  width: 32px;
  height: 32px;
  margin: 5px;
}

.media-object {
  width: 64px;
  height: 64px;
}
</style>


<script>
import { EventBus } from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

import sys from '@/api/system';
import repo from '@/api/repository';
import download from '@/api/download';
import install from '@/api/install';

export default {
  name: 'package-viewer',

  filters: {
    toSentence(val) {
      if (val !== undefined)
        val = val.charAt(0).toUpperCase() + val.slice(1);
      return val
    }
  },

  data() {
    return {
      pkg: undefined,
      currDownloading: undefined,
      depends: [],
      dependsType: 'unsatisfied',
      loading: false,
      size: 'Unknown size',
      onProgress: false,
      progress: 0,
      original: false,
      evt: new Eventor(),
    }
  },
  async created() {

    this.currDownloading = undefined;

    this.evt.on('package-viewer', (name) => {
      this.load(name);
      EventBus.$emit('change-view', 'package-viewer');
    });

    this.evt.on('refresh', () => {
      if (this.pkg !== undefined)
        this.onRefresh();
    })

    /* Downloader Event */
    this.evt.on('ws-download-package-started', (data) => {
      if (this.pkg.name == data.main_package) {
        this.progress = 0;
        this.onProgress = true;
      }
    });

    this.evt.on('ws-download-package-progress', (data) => {
      if (this.pkg.name == data.main_package) {
        this.onProgress = true;
        this.progress = parseInt(data.overall_percent);

        if (this.currDownloading !== undefined && this.currDownloading.name == data.package) {
          this.currDownloading.percent = data.percent;
        } else {
          this.currDownloading = {
            name: data.package,
            percent: data.percent,
          };
          this.scrollToDependency(data.package);
        }
      }
    });

    this.evt.on('ws-download-package-done', (data) => {
      if (this.pkg.name == data.main_package) {
        this.progress = 0;
        this.onProgress = false;
        this.currDownloading = undefined;
        document.getElementById('dependency_lister').scrollTop = 0;

        /* Check download status */
        download.downloadPackageResult().then((res) => {
          if (res.failed.length > 0) {
            EventBus.$emit('download-result', 'Failed to download', 'The following packages failed to be downloaded', res.failed);
          }
        });
      }
    });
  },
  destroyed() {
    this.evt.clear();
  },
  methods: {
    async load(name) {
      this.onProgress = false;
      this.currDownloading = undefined;

      if(this.pkg !== undefined && this.pkg.name != name) {
        /* Reset images */
        for (let img of document.getElementsByClassName("imgload"))
          img.src = "/static/images/package-x-generic.svg"
      }

      this.pkg = await repo.findPackage(name);

      let response = await sys.environmentData();
      this.original = response.original_computer;

      await this.loadDependencies();
    },
    async loadDependencies() {
      this.loading = true;
      this.depends = [];
      this.size = '0 bytes';

      let depends = await repo.getDependencies(this.pkg.name);

      if (depends.unsatisfied.length > 0) {
        this.dependsType = "unsatisfied";
        this.depends = depends.unsatisfied;
        this.size = depends.unsatisfied_size;
      } else if (depends.unsatisfied.length == 0 && depends.satisfied.length > 0) {
        this.dependsType = "satisfied";
        this.depends = depends.satisfied;
        this.size = depends.satisfied_size;
      }

      this.loading = false;
    },
    async onRefresh() {
      let p = await repo.findPackage(this.pkg.name);
      this.pkg.status = p.status;
      this.pkg.version = p.version;
      this.pkg.installed_version = p.installed_version;

      await this.loadDependencies()
    },
    back() {
      EventBus.$emit("change-view", "package-lister");
    },
    scrollToDependency(name) {
      let top = document.getElementById(this.pkg.name + "_" + name);
      document.getElementById('dependency_lister').scrollTop = top.offsetTop - 100;
    },
    async download() {
      await download.download(this.pkg.name);
    },
    async cancel() {
      const res = await download.cancel();
      console.log(JSON.stringify(res));
    },
    async install() {
      await install.install(this.pkg.name);
    },
  }
}
</script>