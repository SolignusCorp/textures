/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
}

declare module 'lucide-react';
declare module 'file-saver';
