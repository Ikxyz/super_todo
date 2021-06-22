import { NextFunction, Request, Response } from "express";
import { SuccessResult } from "../middleware/response";
import _try, { _trySync } from "../middleware/try_catch";
import { Todo } from "../modules/todo";


const todo = new Todo();

export class TodoController {


    /**
     * Handles Creation of todo
     * @param req Request
     * @param res Response
     * @param next NextFunction
     * @returns void
     */
    static async create(req: Request, res: Response, next: NextFunction) {

        const { title, author, dueAt } = req.body;

        const _todo = new Todo(author, title, dueAt);

        const [err, data] = await _try(function () {
            _todo.add()
        });

        if (err) return next(err);

        res.send(new SuccessResult("todo added", 201, data));
    }


    /**
     * Handler fetching list of todo
     * @param req Request
     * @param res Response
     * @param next NextFUnction
     * @returns void
     */
    static async get(req: Request, res: Response, next: NextFunction) {


        const { id }: any = req.params;

        const data = await todo.get(id || "");

        return res.send(new SuccessResult("success", 200, data));

    }

    static async getByAuthor(req: Request, res: Response, next: NextFunction) {


        const { author }: any = req.params;

        const data = await todo.getByAuthor(author || "");

        return res.send(new SuccessResult("success", 200, data));

    }



    static async getAll(req: Request, res: Response, next: NextFunction) {
        const data = await todo.list()
        return res.send(new SuccessResult("success", 200, data));

    }


}