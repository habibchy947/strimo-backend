import { IRequestUser } from "./req.user.interface";

declare global {
    namespace Express {
        interface Request {
            user: IRequestUser
        }
    }
}