import { SFSocket } from './SFSocket';
import { NamesDict as eventNames } from './eventdispatcher/events';

const makeSocketOptions = (wsUrl: string) => {
  const url = new URL(wsUrl);
  const urlProtocol = url.protocol ? url.protocol.replace(':', '') : null;

  if (url.hostname && url.port && urlProtocol) {
    return {
      host: url.hostname, // host: 'localhost',
      port: url.port, // port: '8080',
      path: urlProtocol, // path: 'ws',
    };
  }

  return null;
};

export { SFSocket, makeSocketOptions, eventNames };
export default SFSocket;
