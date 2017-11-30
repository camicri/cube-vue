import axios from 'axios';
import globals from '@/utils/globals';

class Project {
  async openProject(name) {
    const response = await axios.get(globals.baseURL+'/cmd/project/open-project?project='+name);
    return response.data;
  }

  async closeProject(name) {
    const response = await axios.get(globals.baseURL+'/cmd/project/close-project');
    return response.data;
  }

  async getProjects() {
    const response = await axios.get(globals.baseURL+'/cmd/project/get-projects');
    return response.data;
  }

  async createProject(name) {
    const response = await axios.get(globals.baseURL+'/cmd/project/create-project?project='+name);
    return response.data;
  }

  async cleanProject() {
    const response = await axios.get(globals.baseURL+'/cmd/project/clean-project');
    return response.data;
  }
}

export default new Project()