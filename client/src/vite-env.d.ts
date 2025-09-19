/// <reference types="vite/client" />

interface Window {
  Razorpay?: any;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
