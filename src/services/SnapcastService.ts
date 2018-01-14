import {Group} from "./../models/Group";
import {Stream} from "./../models/Stream";
import {TelnetLib} from "./../utils/telnetlib";

export class SnapCastService {
    private readonly matcher: RegExp = /[\n\r]/g;
    private client: TelnetLib;

    constructor(host: string, port: number, timeout: number) {
        this.client = new TelnetLib(host, port, timeout);
    }

    public getStatus(): Promise<string> {
        return this.client.exec(
            '{ "id": "1", "jsonrpc": "2.0", "method": "Server.GetStatus" }',
            this.matcher
        );
    }

    public getStreams(): Promise<Stream[]> {
        return this.client
            .exec(
                '{ "id": "2", "jsonrpc": "2.0", "method": "Server.GetStatus" }',
                this.matcher
            )
            .then((result) => {
                const groups: Stream[] = JSON.parse(result).result.server
                    .streams;
                return groups;
            });
    }

    public getGroups(): Promise<Group[]> {
        return this.client
            .exec(
                '{ "id": "2", "jsonrpc": "2.0", "method": "Server.GetStatus" }',
                this.matcher
            )
            .then((result) => {
                const groups: Group[] = JSON.parse(result).result.server.groups;
                return groups;
            });
    }

    public disconnect() {
        this.client.close();
    }
}
