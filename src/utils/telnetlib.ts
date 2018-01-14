"use strict";

/**
 * This class is based on https://github.com/sonicdoe/teletype
 * ported to Typescript
 * and with tweaks to work properly with the Snapserver JsonRPC
 */

import * as net from "net";

const TELNET_EOL = "\r\n";

export class TelnetLib {
    private client: net.Socket;

    constructor(
        private host: string,
        private port: number,
        private timeout: number
    ) {}

    public exec(command: string, match: RegExp): Promise<string> {
        return this.lazyConnect().then((client) => {
            let promise;
            promise = this.readUntil(match);
            client.write(command + TELNET_EOL);

            return promise;
        });
    }

    public close() {
        return this.lazyConnect().then((client) => {
            client.end();
            client.destroy();
        });
    }

    private lazyConnect(): Promise<net.Socket> {
        return new Promise<net.Socket>((resolve: any, reject: any) => {
            if (this.client && !this.client.connecting) {
                return resolve(this.client);
            }

            if (!this.client) {
                this.client = net.connect({
                    host: this.host,
                    port: this.port
                });

                // “The TELNET protocol is based upon the notion of a virtual teletype,
                // employing a 7-bit ASCII character set.”
                // See https://tools.ietf.org/html/rfc206#page-2.
                this.client.setEncoding("ascii");
            }

            this.client.once("error", (err) => {
                reject(err);
            });

            this.client.once("connect", () => {
                this.client.removeListener("error", reject);
                resolve(this.client);
            });
        });
    }

    private readUntil(match: RegExp): Promise<string> {
        return this.lazyConnect().then((client) => {
            return new Promise<string>((resolve: any, reject: any) => {
                let dataBuffer: string;

                const onData = (data: string) => {
                    const lines = data.split(TELNET_EOL);
                    dataBuffer += data;

                    for (const line of lines) {
                        if (match.test(line) || line === "") {
                            resolve(
                                String(dataBuffer).replace("undefined", "")
                            );
                            client.removeListener("data", onData);
                            break;
                        }
                    }
                };

                client.on("data", onData);
            });
        });
    }
}

function errorTimedOut(message: string) {
    const err = new Error(message);
    err.name = "ETIMEDOUT";
    return err;
}
