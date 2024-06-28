import { Task } from "./task";

export interface List {
    id: number;
    name: string;
    tasks: Task[];
    projectId: number;
}
