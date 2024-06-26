import { ipcMain, ipcRenderer } from 'electron';

import {
  handleSaveIntoFolder,
  handleFileOpen,
  handleFileSave,
  handleFileSaveAs,
  handleScreenShotSaveAs,
  handleBinFileOpen,
  searchPlatforms,
  handleOpenPlatformFile,
  handleGetFileMetadata,
} from './handlers';

/**
 * В этом файле происходит типизация IPC
 */

const channelPrefix = 'File';

const handlers = {
  saveIntoFolder: handleSaveIntoFolder,
  openFile: handleFileOpen,
  saveFile: handleFileSave,
  saveAsFile: handleFileSaveAs,
  saveAsScreenShot: handleScreenShotSaveAs,
  openBinFile: handleBinFileOpen,
  getPlatforms: searchPlatforms,
  openPlatformFile: handleOpenPlatformFile,
  getMetadata: handleGetFileMetadata,
};

/**
 * Функция для main процесса, оборачивает хэндлеры в события
 */
export const initFileHandlersIPC = () => {
  for (const name in handlers) {
    ipcMain.handle(channelPrefix + ':' + name, (_event, ...args) => handlers[name](...args));
  }
};

const convertToIPC = <T extends (...args: any) => any>(channel: string) => {
  const res = (...args: unknown[]) => ipcRenderer.invoke(channel, ...args);

  return res as (...args: Parameters<T>) => Promise<ReturnType<T>>;
};

type Handlers = typeof handlers;
type FileHandlers = {
  [K in keyof Handlers]: (...args: Parameters<Handlers[K]>) => Promise<ReturnType<Handlers[K]>>;
};

/**
 * Хэндлеры для preload процесса, тоже обычные функции оборачиваются в события только которые будут вызываться в renderer
 */
export const fileHandlers = Object.fromEntries(
  Object.entries(handlers).map(([name, fn]) => {
    const channel = channelPrefix + ':' + name;
    return [name, convertToIPC<typeof fn>(channel)];
  })
) as FileHandlers;
