export declare class AppController {
    getHealth(): {
        message: string;
        status: string;
        version: string;
        timestamp: string;
    };
    health(): {
        status: string;
        database: string;
        uptime: number;
    };
}
