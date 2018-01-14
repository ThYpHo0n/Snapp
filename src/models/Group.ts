import {Client} from "./Client";

export class Group {
    public id: string;
    public clients: Client[];
    public muted: boolean;
    public name: string;
    public stream_id: string;
}
