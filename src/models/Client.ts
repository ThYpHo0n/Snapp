import {ClientConfig} from "./ClientConfig";

export class Client {
    public id: string;
    public config: ClientConfig;
    public connected: boolean;
    public host: object;
    public lastSeen: object;
    public snapclient: object;
}
