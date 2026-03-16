import {AppContext} from "../types/app.context.type";

export const socketApp = (context: AppContext) => {

    context.socket?.on('send_message', data => {

        console.log('data',data)

    })

}