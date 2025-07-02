// Type definitions for global objects

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }

  interface Global {
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
  }
}

// Global variable declarations
declare const process: NodeJS.Process;
declare const Buffer: typeof import('buffer').Buffer;

// Extend the global scope
declare global {
  // Add to Window interface
  interface Window {
    // Buffer and process for Node.js compatibility
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
    global: typeof globalThis;

    // Ethereum provider
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }

  // Add to globalThis
  var process: NodeJS.Process;
  var Buffer: typeof import('buffer').Buffer;
}

// Module declarations
declare module 'userop' {
  export interface UserOperation {
    sender: string;
    nonce: number;
    initCode: string;
    callData: string;
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    paymasterAndData: string;
    signature: string;
  }

  export interface ClientOptions {
    rpcUrl: string;
    entryPoint: string;
    [key: string]: unknown;
  }

  export class Client {
    constructor(options: ClientOptions);
    sendUserOperation(op: UserOperation): Promise<string>;
  }
  
  export const Presets: {
    SimpleAccount: unknown;
  };
}