import axios from 'axios';
import globals from '@/utils/globals';

class Install {
  async install(name) {
    const response = await axios.get(globals.baseURL+'/cmd/install/install-package?package='+name);
    return response.data;
  }

  async installResult() {
    const response = await axios.get(globals.baseURL+'/cmd/install/install-package-result');
    return response.data;
  }
}

export default new Install();