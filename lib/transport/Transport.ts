import { UndescribedCallbackFunction } from '../types';
import Connection from '../connection/Connection';
import TransportConnection, { ITransportHooks } from './TransportConnection';
import { ISFSocketConfig, ISFSocketEvent } from '../SFSocket';
import { NamesDict } from '../eventdispatcher/events';

export interface IRunner {
  abort: () => void;
}

export interface ITransport {
  connect(callback: UndescribedCallbackFunction): IRunner;
}

export default class Transport implements ITransport {
  hooks: ITransportHooks;

  name: string;

  options: ISFSocketConfig;

  constructor(name: string, options: ISFSocketConfig) {
    this.options = options || {};

    const scheme = `ws${options.useTLS ? 's' : ''}`;
    const host = `${options.host}:${options.port}`;
    // eslint-disable-next-line max-len
    const paramStr = options.queryParams ? Object.entries(options.queryParams).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&') : null;

    const url = `${scheme}://${host}/${options.path}${paramStr ? (`?${paramStr}`) : ''}`;

    this.hooks = {
      url,
      isInitialized() {
        return !!window.WebSocket;
      },
      getSocket(socketUrl) {
        return new WebSocket(socketUrl);
      },
    };
    this.name = name;
  }

  connect(callback: UndescribedCallbackFunction) {
    let connected = false;

    const transport = new TransportConnection(
      this.hooks, this.name,
    );

    const onInitialized = () => {
      transport.unbind(NamesDict.INITIALIZED, onInitialized);
      transport.connect();
    };

    const unbindListeners = () => {
      transport.unbind(NamesDict.INITIALIZED, onInitialized);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(NamesDict.OPEN, onOpen);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(NamesDict.ERROR, onError);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(NamesDict.CLOSED, onClosed);
    };

    const onOpen = () => {
      connected = true;
      unbindListeners();
      const result = new Connection('', transport);
      callback(null, result);
    };

    const onError = () => {
      // Note errors are bound and handled above
    };

    const onClosed = (closeEvent: ISFSocketEvent) => {
      unbindListeners();
      callback(closeEvent);
    };

    transport.bind(NamesDict.INITIALIZED, onInitialized);
    transport.bind(NamesDict.OPEN, onOpen);
    transport.bind(NamesDict.ERROR, onError);
    transport.bind(NamesDict.CLOSED, onClosed);

    transport.initialize();

    return {
      abort: () => {
        if (connected) {
          return;
        }
        unbindListeners();
        transport.close();
      },
    };
  }
}
