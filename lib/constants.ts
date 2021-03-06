import { ISFSocketConfig } from './SFSocket';

export const defaultConfig: ISFSocketConfig = {
  host: '',
  port: 80,
  path: '',
  unavailableTimeout: 10000,
  retryTimeout: 1000,
  useTLS: false,
};
