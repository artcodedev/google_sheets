

export interface AnswersError {
    status: number
    message: string
}

export class Answers {

    public static ok(msg: string): AnswersError {
        return {status: 200, message: msg}
    }

    public static wrong(msg: string): AnswersError {
        return {status: 505, message: msg}
    }

    public static errorDB(msg: string): AnswersError {
        return {status: 402, message: msg}
    }

    public static notFound(msg: string): AnswersError  {
        return {status: 400, message: msg}
    }

    public static serverError(msg: string): AnswersError  {
        return {status: 500, message: msg}
    }

}