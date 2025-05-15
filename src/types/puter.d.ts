
interface PuterAI {
  chat: (message: string, options?: any) => Promise<{ [key: string]: any; message: { [key: string]: any; content: string; } }>;
  txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
  img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
  txt2speech: (text: string, language?: string, testMode?: boolean) => Promise<HTMLAudioElement>;
}

interface PuterFS {
  read: (path: string) => Promise<Blob>;
  write: (path: string, data?: any, options?: any) => Promise<any>;
  delete: (path: string, options?: any) => Promise<boolean>;
  mkdir: (path: string, options?: any) => Promise<any>;
  readdir: (path: string) => Promise<any[]>;
  copy: (source: string, destination: string, options?: any) => Promise<any>;
  move: (source: string, destination: string, options?: any) => Promise<any>;
}

interface PuterKV {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<boolean>;
  del: (key: string) => Promise<boolean>;
  list: (pattern?: string, returnValues?: boolean) => Promise<any[]>;
  flush: () => Promise<boolean>;
  incr: (key: string, amount?: number) => Promise<number>;
  decr: (key: string, amount?: number) => Promise<number>;
}

interface PuterAuth {
  signIn: () => Promise<boolean>;
  signOut: () => void;
  isSignedIn: () => boolean;
  getUser: () => Promise<{
    uuid: string;
    username: string;
    email_confirmed: boolean;
  }>;
}

interface PuterUI {
  authenticateWithPuter: () => Promise<boolean>;
}

interface Puter {
  ai: PuterAI;
  fs: PuterFS;
  kv: PuterKV;
  randName: () => string;
  auth: PuterAuth;
  ui: PuterUI;
}

interface Window {
  puter: Puter;
}
