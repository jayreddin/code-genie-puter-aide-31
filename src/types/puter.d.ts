
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string, options?: any) => Promise<{
          message: {
            content: string;
            [key: string]: any;
          };
          [key: string]: any;
        }>;
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
        img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
        txt2speech: (text: string, language?: string, testMode?: boolean) => Promise<HTMLAudioElement>;
      };
      fs: {
        read: (path: string) => Promise<Blob>;
        write: (path: string, data?: string | File | Blob, options?: object) => Promise<any>;
        mkdir: (path: string, options?: object) => Promise<any>;
        delete: (path: string, options?: object) => Promise<any>;
        copy: (source: string, destination: string, options?: object) => Promise<any>;
        move: (source: string, destination: string, options?: object) => Promise<any>;
        readdir: (path: string) => Promise<any[]>;
        rename: (path: string, newName: string) => Promise<any>;
        space: () => Promise<{ capacity: number; used: number }>;
        stat: (path: string) => Promise<any>;
        upload: (items: any, dirPath?: string, options?: object) => Promise<any[]>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string | number | boolean) => Promise<boolean>;
        del: (key: string) => Promise<boolean>;
        list: (pattern?: string, returnValues?: boolean) => Promise<string[] | Array<{ key: string; value: string }>>;
        flush: () => Promise<boolean>;
        incr: (key: string, amount?: number) => Promise<number>;
        decr: (key: string, amount?: number) => Promise<number>;
      };
      randName: (separator?: string) => string;
    };
  }
}

export {};
