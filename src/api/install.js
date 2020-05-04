import axios from 'axios';
import globals from '@/utils/globals';

class Install {
  async install(name) {
    if (name)
        name = name.replace(/\+/g,"%2b");
    const response = await axios.get(globals.baseURL+'/cmd/install/install-package?package='+name);
    return response.data;
  }

  async installResult() {
    const response = await axios.get(globals.baseURL+'/cmd/install/install-package-result');
    return response.data;
  }
}

export default new Install();