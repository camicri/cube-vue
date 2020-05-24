<template>
  <div class="body">
    <div class="controls">
      <controls></controls>
    </div>

    <div class="content">
      <div class="search">
        <el-input v-model="name" class="search-box" :placeholder="'Search ' + searchSection + ' Packages'" icon="search" @click="searched(name)" @input="onInput">
        </el-input>
      </div>

      <template v-if="initialized">
        <div class="switcher">
          <transition name="fade">
            <package-lister v-show="currentView=='package-lister'"></package-lister>
          </transition>
          <transition name="fade">
            <package-viewer v-show="currentView=='package-viewer'"></package-viewer>
          </transition>
          <transition name="fade">
            <settings v-if="currentView=='settings'"></settings>
          </transition>
          <transition name="fade">
            <about v-if="currentView=='about'"></about>
          </transition>
        </div>
      </template>
    </div>

    <progress-modal></progress-modal>
    <prompt-modal></prompt-modal>
    <dependency-lister-modal></dependency-lister-modal>
    <download-progress-modal></download-progress-modal>
    <download-result-modal></download-result-modal>
  </div>
</template>

<style scoped>
.body {
  display: flex;
}

.switcher {
  height: 650px;
}

.fa-icon {
  width: auto;
  height: 1.75em;
}

.content {
  width: 100%;
  overflow-y: hidden;
  align-items: stretch;
  align-content: stretch;
  display: flex;
  margin-left: 20px;
  flex-direction: column;
}

.search {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin: 10px;
  box-sizing: border-box;
}

.search-box {
  width: 400px;
}

.fade-enter-active {
  transition: opacity .2s
}

.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>

<script>
import { EventBus } from '@/utils/event-bus';
import Eventor from '@/utils/eventor';

/* Modal Components */
import ProgressModal from '@/components/modals/progress-modal';
import PromptModal from '@/components/modals/prompt-modal';
import DependencyListerModal from '@/components/modals/dependency-lister-modal';
import DownloadProgressModal from '@/components/modals/download-progress-modal';
import DownloadResultModal from '@/components/modals/download-result-modal';

/* Components */
import Controls from '@/components/controls';
import PackageCard from '@/components/package-card';
import PackageLister from '@/components/package-lister';
import PackageViewer from '@/components/package-viewer';
import Settings from '@/components/settings';
import About from '@/components/about';

/* API */
import sys from '@/api/system';
import update from '@/api/update';
import repo from '@/api/repository';
import download from '@/api/download';
import install from '@/api/install';
import project from '@/api/project';

export default {
  name: 'main',
  components: {
    'progress-modal': ProgressModal,
    'prompt-modal': PromptModal,
    'dependency-lister-modal': DependencyListerModal,
    'download-progress-modal': DownloadProgressModal,
    'download-result-modal': DownloadResultModal,
    'controls': Controls,
    'package-card': PackageCard,
    'package-lister': PackageLister,
    'package-viewer': PackageViewer,
    'settings': Settings,
    'about': About,
  },

  data() {
    return {
      initialized: false,
      currentView: 'package-viewer',
      previousView: 'package-viewer',
      searchSection: 'Available',
      evt: new Eventor(),
    }
  },

  async created() {
    this.name = '';

    const res = await sys.status();
    if (res.system.project_opened == false) {
      this.$router.push('/');
      return;
    }

    this.initialized = true;

    /* Initialize Events */
    this.initMainEvents();
    this.initCommandEvents();
    this.initProjectEvents();
    this.initRepoEvents();
    this.initUpdateEvents();
    this.initDownloadEvents();
    this.initInstallEvents();
  },

  beforeDestroy(){
    this.evt.clear();
  },

  methods: {

    /*** Main Component Methods ***/
    onInput: _.debounce(function(e) {
      this.searched(e)
    }, 300),

    searched(name) {
      EventBus.$emit('package-lister-find', name.toLowerCase());
    },

    quit() {
      sys.quit();
      EventBus.$emit('ws-quit');
    },

    initMainEvents() {
      this.evt.on('change-view', (component) => {
        if(component === "previous")
        {
          let swap = this.previousView;
          this.previousView = this.currentView;
          this.currentView = swap;
        }
        else {
          this.previousView = this.currentView;
          this.currentView = component;
        }
      });

      this.evt.on('package-lister-section', (name, desc) => {
        this.searchSection = desc;
      });
    },


    /*** Controls Methods ***/
    initCommandEvents() {
      this.evt.on('command-selected', (command) => {
        switch (command) {
          /* Repository */
          case 'repo-reload': repo.scan(); break;
          case 'repo-download': download.downloadRepositories(); break;
          /* System */
          case 'update-proj': update.updateProject(); break;
          case 'update-comp': update.updateSystem(); break;
          /* Download */
          case 'dl-mark-upgrades': this.markPackages("all-upgradable"); break;
          case 'dl-unmark-all': this.unmarkPackages("all-to-download"); break;
          case 'dl-all-marked': this.downloadAllMarked(); break;
          /* Install */
          case 'in-mark-downloaded': this.markPackages("all-downloaded"); break;
          case 'in-unmark-all': this.unmarkPackages("all-to-install"); break;
          case 'in-all-marked': this.installAllMarked(); break;
          case 'in-all-satisfied': this.installAllSatisfied(); break;
          /* Project */
          case 'proj-clean': this.cleanProject(); break;
          case 'proj-close': this.closeProject(); break;
          /* MISC */
          case 'settings': EventBus.$emit('change-view','settings'); break;
          case 'about': EventBus.$emit('change-view','about'); break;
          case 'quit': this.quit(); break;
        }
      });
    },


    /*** Project Methods ***/
    initProjectEvents() {
      this.evt.on('ws-project-closed', ()=>{
        this.$router.push('/');
      });
    },

    async closeProject() {
      await project.closeProject();
    },

    async cleanProject() {
      EventBus.$emit('progress', 'Getting packages for cleanup...');
      const res = await repo.getCleanupPackages();
      EventBus.$emit('progress-done');

      if(res.cleanup.length == 0)
      {
        EventBus.$emit('prompt','Clean Project','No unnecessary packages to be removed.');
        return;
      }

      EventBus.$emit('dependency-lister', 'To be removed', 'A total of ' + res.cleanup_size + ' from ' + res.cleanup.length + ' unnecessary packages will be freed', res.cleanup, async () => {
        EventBus.$emit('progress', 'Cleaning...');
        const res = await project.cleanProject();
        EventBus.$emit('progress-done');

        if(res.success)
          EventBus.$emit('prompt','Clean Project','Successfully cleaned project.');
        else
          EventBus.$emit('prompt','Clean Project','Failed to clean project.');
      },
      () => {/* Cancel */});
    },


    /*** Markings Methods ***/
    async markPackages(type) {
      await repo.markPackage(type);
      EventBus.$emit('refresh');
    },

    async unmarkPackages(type) {
      await repo.unmarkPackage(type);
      EventBus.$emit('refresh');
    },

    async downloadAllMarked() {
      EventBus.$emit('progress', 'Getting package dependencies...');
      const res = await repo.getDependencies("", "all-marked-to-download");
      EventBus.$emit('progress-done');

      EventBus.$emit('dependency-lister', 'To be downloaded', 'A total of ' + res.unsatisfied_size + ' from ' + res.unsatisfied.length + ' packages will be downloaded', res.unsatisfied, async () => {
        /* Get all marked packages */
        let pkgs = '';
        for (let p of res.unsatisfied) {
          pkgs += p.name + ";";
        }
        await download.download(pkgs);
      }, () => {/* Cancel */});
    },


    /*** Installation Methods ***/
    initInstallEvents() {
      this.evt.on('ws-install-package-started',()=>{
        EventBus.$emit('progress','Installing Packages');
      });

      this.evt.on('ws-install-package-done',()=>{
        EventBus.$emit('progress-done');
      });

      this.evt.on('ws-install-package-failed',(data)=>{
        EventBus.$emit('progress-done');
        EventBus.$emit('prompt', 'Installation Failed',data.message);
      });
    },

    async installAllMarked() {
      EventBus.$emit('progress', 'Getting package dependencies...');
      const res = await repo.getDependencies("", "all-marked-to-install");
      EventBus.$emit('progress-done');

      if(res.unsatisfied.length > 0) {
        /* Mark packages for installation */
        EventBus.$emit('dependency-lister', 'Unsatisifed dependencies', 'These ' + res.unsatisfied.length + ' packages will be marked for download', res.unsatisfied, async () => {
          let pkgs = '';
          for (let p of res.unsatisfied) {
            pkgs += p.name + ";";
          }
          await repo.markPackage("to-download",pkgs);
          EventBus.$emit('refresh');
        }, () => {/*Cancel*/});

      } else {
        EventBus.$emit('dependency-lister', 'To be installed', 'These ' + res.satisfied.length + ' packages will be installed', res.satisfied, async () => {
          let pkgs = '';
          for (let p of res.satisfied) {
            pkgs += p.name + ";";
          }
          await install.install(pkgs);
        }, () => {/*Cancel*/});
      }
    },

    async installAllSatisfied() {
      EventBus.$emit('progress', 'Getting satisfied downloaded packages...');
      const res = await repo.getSatisfiedDownloadedPackages();
      EventBus.$emit('progress-done');

      EventBus.$emit('dependency-lister', 'To be installed', 'These ' + res.length + ' packages will be installed', res, async () => {
        let pkgs = '';
        for (let p of res) {
          pkgs += p.name + ";";
        }
        await install.install(pkgs);
      }, () => {/*Cancel*/});
    },


    /*** Download Functions ***/
    initDownloadEvents() {
      this.evt.on('ws-download-package-bulk-progress', (data) => {
        EventBus.$emit('download-progress', 'Downloading Packages', '', data.overall_percent, data.package, data.percent, data.size, data.transfer_rate.toLowerCase()!='(null)'?data.transfer_rate:undefined);
      });

      this.evt.on('ws-download-package-bulk-done', (data) => {
        EventBus.$emit('download-progress-done');
        /* Check download status */
        download.downloadPackageResult().then((res) => {
          if (res.failed.length > 0) {
            EventBus.$emit('download-result', 'Failed to Download', 'The following packages failed to be downloaded', res.failed);
          }
        });
      });

      this.evt.on('download-progress-cancel', async () => {
        await download.cancel();
      });
    },


    /*** Repository Methods ***/
    initRepoEvents() {
      this.evt.on('ws-repository-scan-started', () => { });

      this.evt.on('ws-repository-scan-progress', (data) => {
        EventBus.$emit('progress', 'Scanning Repositories', data.message, parseInt((data.current / data.max * 100)));
      });

      this.evt.on('ws-repository-scan-done', () => {
        EventBus.$emit('progress-done');
        EventBus.$emit('refresh');

        if (!this.initialized)
          this.initialized = true;
      });

      this.evt.on('ws-download-repository-started', (data) => {
        EventBus.$emit('download-progress', 'Downloading Repositories');
      });

      this.evt.on('ws-download-repository-progress', (data) => {
        EventBus.$emit('download-progress', 'Downloading Repositories', '', data.overall_percent, data.repository, data.percent, data.size, data.transfer_rate.toLowerCase() != '(null)' ? data.transfer_rate : undefined);
      });

      this.evt.on('ws-download-repository-done', (data) => {
        EventBus.$emit('download-progress-done');
        /* Check download status */
        download.downloadRepositoriesResult().then((res) => {
          if (res.failed.length > 0) {
            EventBus.$emit('download-result', 'Failed to Download', 'The following repositories failed to be downloaded', res.failed);
          }
        });
        EventBus.$emit('prompt','Update Computer\'s Repositories', 'Please update your original computer\'s repositories (Under CubeGet Icon => System) before installing new applications.');
      });

      this.evt.on('download-progress-cancel', () => {
        download.cancel();
      });
    },


    /*** Update Methods ***/
    initUpdateEvents() {
      this.evt.on('ws-update-project-started', () => {
        EventBus.$emit('progress', 'Updating Project Status');
      });

      this.evt.on('ws-update-project-done', () => {
        EventBus.$emit('progress-done');
      });

      this.evt.on('ws-update-project-failed', () => {
        EventBus.$emit('progress-done');
      });

      this.evt.on('ws-update-system-started', () => {
        EventBus.$emit('progress', 'Updating Computer\'s Repositories');
      });

      this.evt.on('ws-update-system-done', () => {
        EventBus.$emit('progress-done');
      });

      this.evt.on('ws-update-system-failed', () => {
        EventBus.$emit('progress-done');
      });
    }
  }
}
</script>