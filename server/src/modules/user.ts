import { BadRequest, NotFound } from "../middleware/error_handler";
import { fDb } from "../middleware/firebase";
import { hash } from "../middleware/security";
import jwt from "jsonwebtoken";
// const userDb = new Database("user");

const userColl = fDb.collection("users");


type TGender = "Male" | "Female";
interface IUserDoc {
    firstName: string;
    lastName: string;
    username: string;
    gender?: TGender;
    email: string;
    password: string;
    isEmailVerified: boolean;
    lastLogin: number;
}


export default class User {

    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    private isEmailVerified: boolean;
    private lastLogin: string;




    constructor(firstName: string, lastName: string, username: string, email: string, password: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = User.generatePassword(username, password);
        this.isEmailVerified = false;
        this.lastLogin = new Date().toDateString();
    }

    static generatePassword(username: string, password: string) {
        return hash(password + username, "sha512");
    }


    static async generateToken(data: string) {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(data, "temp", { algorithm: "HS512" }, (err, token) => {
                if (err) return reject(err);

                if (token) resolve(token);
            });
        })

    }


    static async getUser(username: string) {

        try {

            const docId = hash(username, 'md5');


            const user = await userColl.doc(docId).get();


            if (!user.exists) throw new NotFound("No matching user found");

            return User.fromJson(user.data());

        } catch (error) {

            throw new NotFound("No matching user found");

        }

    }


    static async login(username: string, pwd: string) {

        try {
            const user = await User.getUser(username);

            const password = User.generatePassword(user.username, pwd);

            if (password === user.password) throw new BadRequest("password is incorrect");

            const token = await User.generateToken(JSON.stringify(user));

            return { token, user };
        } catch (error) {
            console.log(error);
        }
    }



    async register() {
        // await userDb.create(this.username, this.toJson());
        console.log(this.toJson());

        const docId = hash(this.username, "md5");

        await userColl.doc(docId).set(this.toJson());


        return this.toJson();
    }


    toJson(): IUserDoc {
        return {
            firstName: String(this.firstName),
            lastName: this.lastName,
            username: this.username,
            email: this.email,
            password: this.password,
            isEmailVerified: this.isEmailVerified ?? false,
            lastLogin: Number(this.lastLogin ?? "")
        }
    }

    static fromJson(json: any) {

        const user = new User("", "", "", "", "");

        user.firstName = json.firstName;
        user.lastName = json.lastName;
        user.password = User.generatePassword(json.username, json.password);
        user.username = String(json.username).toLowerCase();
        user.email = String(json.email).toLowerCase();
        user.isEmailVerified = json.isEmailVerified ?? false;
        user.lastLogin = json.lastLogin ?? "";

        return user;
    }

}
