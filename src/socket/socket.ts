import {AppContext} from "../types/app.context.type";
import {messages, users} from "../db/schema";
import {asc, eq} from "drizzle-orm";
import {Socket} from "socket.io";

export const socketApp = (context: AppContext, socket: Socket) => {

    socket.on('send_message', async data => {

        console.log('send_message',data);

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

    socket.on('typing', data => {

        console.log('typing',data);

        const emitUser = context.socketUsers.find(u => u.userId === data?.userId);
        if (emitUser) {
            context.io?.to(emitUser.socketId).emit('typing', data);
        }
    })


    socket.on('stop typing', data => {

        console.log('stop typing',data);
        const emitUser = context.socketUsers.find(u => u.userId === data?.userId);
        if (emitUser) {
            context.io?.to(emitUser.socketId).emit('stop typing', data);
        }
    })

}
