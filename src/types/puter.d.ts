
// Type definitions for puter.js
interface PuterAI {
  chat: (message: string, options?: { model?: string, stream?: boolean }) => Promise<{
    message: {
      content: string;
    }
  }>;
  txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
  img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
  txt2speech: (text: string, language?: string, testMode?: boolean) => Promise<HTMLAudioElement>;
}

interface PuterFS {
  read: (path: string) => Promise<Blob>;
  write: (path: string, data: string | File | Blob, options?: object) => Promise<any>;
  delete: (path: string, options?: object) => Promise<boolean>;
  mkdir: (path: string, options?: object) => Promise<any>;
  readdir: (path: string) => Promise<any[]>;
  copy: (source: string, destination: string, options?: object) => Promise<any>;
  move: (source: string, destination: string, options?: object) => Promise<any>;
}

interface PuterKV {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<boolean>;
  del: (key: string) => Promise<boolean>;
  list: (pattern?: string, returnValues?: boolean) => Promise<string[] | Array<{key: string, value: any}>>;
  flush: () => Promise<boolean>;
  incr: (key: string, amount?: number) => Promise<number>;
  decr: (key: string, amount?: number) => Promise<number>;
}

interface PuterAuth {
  signIn: () => Promise<any>;
  signOut: () => void;
  isSignedIn: () => boolean;
  getUser: () => Promise<{uuid: string, username: string, email_confirmed: boolean}>;
}

interface PuterUI {
  authenticateWithPuter: () => Promise<boolean>;
}

interface Puter {
  ai: PuterAI;
  fs: PuterFS;
  kv: PuterKV;
  auth: PuterAuth;
  ui: PuterUI;
  randName: () => string;
  appID?: string;
  env?: string;
  print?: (text: string) => void;
  exit?: () => void;
}

declare global {
  interface Window {
    puter: Puter;
  }
}

export {};
