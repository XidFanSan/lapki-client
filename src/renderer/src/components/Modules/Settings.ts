export interface CompilerSettings {
  host: string;
  port: number;
}

export interface FlasherSettings {
  remoteHost: string | null;
  remotePort: number | null;
  localHost: string;
  localPort: number;
}

export interface PlatfromDirectory {
  path: string;
}
export class Settings {
  static async get(key: string): Promise<any> {
    return await window.electron.ipcRenderer.invoke('settings:get', key);
  }

  static async set(key: string, value: any): Promise<any> {
    return await window.electron.ipcRenderer.invoke('settings:set', key, value);
  }

  static async getCompilerSettings(): Promise<CompilerSettings> {
    return await this.get(window.api.COMPILER_SETTINGS);
  }

  static async setCompilerSettings(value: CompilerSettings): Promise<CompilerSettings> {
    return await this.set(window.api.COMPILER_SETTINGS, value);
  }

  static async getPlatformPath(): Promise<PlatfromDirectory> {
    return await this.get(window.api.PLATFORMS_PATH_SETTINGS);
  }

  static async getFlasherSettings(): Promise<FlasherSettings> {
    return await this.get(window.api.FLASHER_SETTINGS);
  }

  static async setFlasherSettings(value: FlasherSettings): Promise<FlasherSettings> {
    return await this.set(window.api.FLASHER_SETTINGS, value);
  }
}
