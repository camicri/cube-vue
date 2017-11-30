import axios from 'axios';
import globals from '@/utils/globals';

class Repository {
  async scan() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/scan-repositories');
    return response.data
  }

  async getMainList() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-main-lists');
    return response.data
  }

  async getSectionList() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-sections');
    return response.data
  }

  async getAvailablePackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-available-packages');
    return response.data
  }

  async getInstalledPackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-installed-packages');
    return response.data
  }

  async getDownloadedPackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-downloaded-packages');
    return response.data
  }

  async getUpgradablePackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-upgradable-packages');
    return response.data
  }

  async getSectionPackages(section) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-section-packages?section='+section);
    return response.data
  }

  async getMarkedPackages(type,count=10) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-marked-packages?type='+type+'&&count='+count);
    return response.data
  }

  async getNext(type, count=10) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-next?type='+type+'&&count='+count);
    return response.data;
  }

  async findPackage(name) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/find-package?package='+name);
    if (response.data.length > 0)
      return response.data[0]
    else
      return undefined;
  }

  async findPackageStartsWith(name) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/find-package-starts-with?package='+name);
    return response.data;
  }

  async getDependencies(name,type) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-package-dependencies?package='+name+((type!==undefined)?"&&type="+type:""));
    return response.data;
  }

  async getSatisfiedDownloadedPackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-satisfied-downloaded-packages');
    return response.data;
  }

  async getCleanupPackages() {
    const response = await axios.get(globals.baseURL+'/cmd/repository/get-cleanup-packages');
    return response.data;
  }

  async markPackage(type,name) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/mark-package?type='+type+'&&package='+name);
    return response.data;
  }

  async unmarkPackage(type,name) {
    const response = await axios.get(globals.baseURL+'/cmd/repository/unmark-package?type='+type+'&&package='+name);
    return response.data;
  }
}

export default new Repository()