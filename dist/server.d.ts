import * as http from 'http';
export declare const handleRequest: (req: http.IncomingMessage) => Promise<string>;
export declare const fileResponse: (res: http.ServerResponse, filename: string) => Promise<void>;
export declare const startServer: () => Promise<void>;
//# sourceMappingURL=server.d.ts.map