import { EventBus } from './event-bus';

class Eventor {
    handlers = [];

    on(event, handler) {
        this.handlers.push({event:event,handler:handler});
        EventBus.$on(event, handler);
    }

    clear() {
        for(var h of this.handlers) {
            EventBus.$off(h.event,h.handler);
        }
    }
}

export default Eventor;