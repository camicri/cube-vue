import axios from 'axios';
import globals from '@/utils/globals';

class Download {
  async download(name) {
    if (name)
        name = name.replace(/\+/g,"%2b");
    const response = await axios.get(globals.baseURL+'/cmd/download/download-package?package='+name);
    return response.data;
  }

  async downloadPackageResult() {
    const response = await axios.get(globals.baseURL+'/cmd/download/get-download-package-result');
    return response.data;
  }

  async downloadRepositories() {
    const response = await axios.get(globals.baseURL+'/cmd/download/download-repository');
    return response.data;
  }

  async downloadRepositoriesResult() {
    const response = await axios.get(globals.baseURL+'/cmd/download/get-download-repository-result');
    return response.data;
  }

  async cancel() {
    this.onProgress = false;
    const response = await axios.get(globals.baseURL+'/cmd/download/stop-download');
    return response.data;
  }
}

export default new Download();