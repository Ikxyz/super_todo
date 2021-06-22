import Database from "./database";
import { fDb } from '../middleware/firebase';



const todoColl = fDb.collection("todos");
// const todoDb = new Database("todo");


export class Todo {


    private id: string;

    private timestamp: number;


    constructor(public author = "", public title = "", public dueAt = "") {
        this.id = this.newId();
        this.timestamp = Date.now();
    }


    newId() {
        return String(Date.now()).split('').sort().join("") + String(Date.now()).substring(0, 5);
    }

    async get(id: string) {
        const doc = await todoColl.doc(id || "").get();
        return doc.data();
    }

    async getByAuthor(author: string) {
        const listOfDocs = await todoColl.where("author", "==", author).get();

        if (listOfDocs.empty) return [];

        return listOfDocs.docs.map((e) => e.data());
        // return todoDb.readWhere("author", author);
    }

    async list() {
        const listOfDoc = await todoColl.limit(10).get();

        if (listOfDoc.empty) return [];

        return listOfDoc.docs.map((e) => e.data());
        // return todoDb.readAll(10);
    }


    async add() {
        await todoColl.doc(this.id).set(this.toJson())
        // await todoDb.create(this.id, this.toJson());
    }


    toJson() {
        return {
            id: this.id,
            title: this.title,
            dueAt: this.dueAt,
            author: this.author,
            timestamp: this.timestamp,
        }
    }


}
