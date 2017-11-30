import axios from 'axios';
import globals from '@/utils/globals';

class Configuration {
  async configurationEntries() {
    const response = await axios.get(globals.baseURL+'/cmd/configuration/get-configuration-entries');
    return response.data;
  }

  async saveConfigurationEntries(entries) {
    const response = await axios.get(globals.baseURL+'/cmd/configuration/save-configuration-entries?'+entries);
    return response.data;
  }

  async resetConfigurationEntries() {
    const response = await axios.get(globals.baseURL+'/cmd/configuration/reset-configuration-entries');
    return response.data;
  }

  async openSourcesList() {
    const response = await axios.get(globals.baseURL+'/cmd/configuration/open-sources-list-file');
    return response.data;
  }
}

export default new Configuration();