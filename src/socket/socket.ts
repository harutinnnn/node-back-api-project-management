import {AppContext} from "../types/app.context.type";
import {messages, users} from "../db/schema";
import {and, asc, eq, or} from "drizzle-orm";

export const socketApp = (context: AppContext) => {

    context.socket?.on('send_message', async data => {

        const emitUser = context.socketUsers.find(u => u.userId === data.userId);
        if (emitUser) {

            const [message] = await context.db
                .select({...messages, receiverName: users.name, receiverAvatar: users.avatar})
                .from(messages)
                .leftJoin(users, eq(messages.receiverId, users.id))
                .where(eq(messages.id, data.id))
                .orderBy(asc(messages.createdAt));

            console.log('emitUser.socketId',emitUser.socketId);
            context.io?.to(emitUser.socketId).emit('send_message', message);

        }

    })

    context.socket?.on('typing', data => {
        context.socket?.emit('typing', data)
    })


    context.socket?.on('stop typing', data => {
        context.socket?.emit('stop typing', data)
    })

}