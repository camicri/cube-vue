import axios from 'axios';
import globals from '@/utils/globals';

class Update {
  async updateProject() {
    const response = await axios.get(globals.baseURL+'/cmd/update/update-project');
    return response.data;
  }

  async updateProjectResult() {
    const response = await axios.get(globals.baseURL+'/cmd/update/get-update-project-result');
    return response.data;
  }

  async updateSystem() {
    const response = await axios.get(globals.baseURL+'/cmd/update/update-system');
    return response.data;
  }

  async updateSystemResult() {
    const response = await axios.get(globals.baseURL+'/cmd/update/get-update-result');
    return response.data;
  }
}

export default new Update();