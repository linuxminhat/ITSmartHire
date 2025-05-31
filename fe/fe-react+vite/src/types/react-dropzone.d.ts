declare module 'react-dropzone' {
    import * as React from 'react';
    export interface DropzoneOptions {
        onDrop?: (acceptedFiles: File[], fileRejections: any[]) => void;
        multiple?: boolean;
        accept?: { [mime: string]: string[] } | string[];
        maxFiles?: number;
        noClick?: boolean;
    }

    export function useDropzone(options?: DropzoneOptions): {
        getRootProps: () => React.HTMLAttributes<HTMLElement>;
        getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
        isDragActive: boolean;
    };
}
