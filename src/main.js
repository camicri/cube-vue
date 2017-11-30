// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import lodash from 'lodash'
import VueLodash from 'vue-lodash'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import 'vue-awesome/icons'
import AweIcon from 'vue-awesome/components/Icon'

import { EventBus } from './utils/event-bus'
import Eventor from './utils/eventor';

import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.use(VueLodash, lodash)

Vue.component('icon', AweIcon)

/* eslint-disable no-new */
var vm = new Vue({
  el: '#app',
  router,
  template: '<App v-if="show"></App>',
  components: { App },

  data: {
    ws: {},
    show: false,
    evt: new Eventor(),
  },

  created() {
    this.initWebsockets();
    this.initEvents();
  },

  destroyed() {
    this.evt.clear();
  },

  methods: {
    initWebsockets() {
      let location = process.env.NODE_ENV=='development'?"localhost:8081":window.location.host;

      this.ws = new WebSocket("ws://"+location+"/ws");

      this.ws.onopen = function () {
        EventBus.$emit('ws-connected');
        this.show = true;
      }.bind(this);

      this.ws.onmessage = function (evt) {
        EventBus.$emit('ws-received', evt.data);
      };

      this.ws.onerror = function (evt) {
        this.show = false;
      }.bind(this);

      this.ws.onclose = function () {
        EventBus.$emit('ws-close');
        this.show = false;
      };
    },

    initEvents() {
      this.evt.on('ws-connected', () => {
        console.log("Connected!")
      });

      this.evt.on('ws-send', (data) => {
        this.ws.send(data);
      });

      this.evt.on('ws-received', (data) => {
        console.log(data);
        let msg = JSON.parse(data);
        EventBus.$emit('ws-' + msg.event, msg.data);
        console.log('ws-' + msg.event);
      });

      this.evt.on('ws-close', (err) => {
        var handler = setTimeout(() => {
          console.log("Connecting...");
          if (this.ws.readyState != this.ws.CLOSED)
            clearTimeout(handler)
          else if (this.ws.readyState != this.ws.OPEN)
            this.initWebsockets();
        }, 5000)
      });

      this.evt.on('ws-quit',()=>{
        this.show = false;
        /* Wait a second to terminate */
        setTimeout(()=>{
          vm.$destroy();
        },1000);
      });
    }
  }
});