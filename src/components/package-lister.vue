<template>
  <div class="lister" id="lister" @scroll="scroll(this)">
    <package-card v-for="p in packages" :key="p.name" :pkg="p" :original="original"></package-card>
    <el-card v-show="loading" v-loading="loading"></el-card>
    <el-card v-if="packages.length==0">
      <template v-if="search!=''">No packages with keyword "{{search}}" found.</template>
      <template v-else>No packages found.</template>
    </el-card>
  </div>
</template>

<style scoped>
.lister {
  height:inherit;
  overflow-y: auto;
  padding: 5px;
}


</style>

<script>
import {EventBus} from '../utils/event-bus';
import Eventor from '../utils/eventor';
import PackageCard from '@/components/package-card';

import sys from '@/api/system'
import repo from '@/api/repository'

export default {
  name : 'package-lister',

  components : {
    'package-card' : PackageCard
  },

  props : ["type"],

  created() {
    this.evt.on('package-lister-section',(name)=>{
      this.loadPackages(name);
      EventBus.$emit('change-view','package-lister');
    });

    this.evt.on('package-lister-find',(name)=>{
      this.searchPackage(name);
      EventBus.$emit('change-view','package-lister');
    });

    this.loadPackages("available");
  },

  destroyed() {
    this.evt.clear();
  },

  mounted() {
    EventBus.$emit('package-lister-section','available','Available');
  },

  data() {
    return {
      search : '',
      packages : [],
      loading : false,
      section : '',
      original : false,
      evt : new Eventor(),
    }
  },

  methods : {
    async searchPackage(name) {
      this.search = name;
      this.packages = await repo.findPackageStartsWith(name);
      this.scrollTop();
    },

    async loadPackages (section) {
      this.search = '';
      
      if(this.section != section)
        this.section = section;
      else
        return;
      
      let response = [];

      switch(section) {
        case 'available' : response = await repo.getAvailablePackages(); break;
        case 'installed' : response = await repo.getInstalledPackages(); break;
        case 'upgradable' : response = await repo.getUpgradablePackages(); break;
        case 'downloaded' : response = await repo.getDownloadedPackages(); break;
        case 'marked-to-download' : response = await repo.getMarkedPackages('to-download'); break;
        case 'marked-to-install' : response = await repo.getMarkedPackages('to-install'); break;
        default : response = await repo.getSectionPackages(section); break;
      }

      this.packages = response;

      response = await sys.environmentData();
      this.original = response.original_computer;

      this.scrollTop();
    },

    async loadMore() {
      this.loading = true;
      let packages = await repo.getNext('current');
      this.packages.push(...packages);
      this.loading = false;
    },

    scroll(s) {
      let lister = document.getElementById('lister');
      if ((lister.scrollHeight - lister.clientHeight) <= (lister.scrollTop+10))
        this.loadMore();
    },

    scrollTop() {
      let lister = document.getElementById("lister");
      lister.scrollTop = 0;
    }
  }
}
</script>

