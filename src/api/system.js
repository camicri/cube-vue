import axios from 'axios';
import globals from '@/utils/globals';

class System {

  _env_data = undefined;
  _cube_data = undefined;

  async sync_data() {
    await this.environmentData(true);
    await this.cubeData(true);
  }

  async environmentData(on_demand=false) {

    if(this._env_data === undefined || on_demand)
    {
      this._env_data = await axios.get(globals.baseURL+'/cmd/system/get-environment-data');
      this._env_data = this._env_data.data;
    }
  
    return this._env_data;
  }

  async cubeData(on_demand=false) {
    if(this._cube_data === undefined || on_demand)
    {
      this._cube_data = await axios.get(globals.baseURL+'/cmd/system/get-cube-data');
      this._cube_data = this._cube_data.data;
    }
    return this._cube_data;
  }

  async status() {
    const response = await axios.get(globals.baseURL+'/cmd/system/get-status');
    return response.data;
  }

  async quit() {
    const response = await axios.get(globals.baseURL+'/cmd/bye');
    return response.data;
  }
}

export default new System();