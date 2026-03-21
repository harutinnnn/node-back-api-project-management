import {AppContext} from "../types/app.context.type";
import {messages, users} from "../db/schema";
import {and, asc, eq, or} from "drizzle-orm";
import {Socket} from "socket.io";
import {alias} from "drizzle-orm/mysql-core";

export const socketApp = (context: AppContext, socket: Socket) => {

    socket.on('send_message', async data => {


        const emitUser = context.socketUsers.find(u => u.userId === data.userId);
        if (emitUser) {

            const sender = alias(users, "sender");
            const receiver = alias(users, "receiver");

            const [message] =  await context.db
                .select({
                    message: messages,
                    sender: sender,
                    receiver: receiver
                })
                .from(messages)
                .leftJoin(sender, eq(messages.senderId, sender.id))
                .leftJoin(receiver, eq(messages.receiverId, receiver.id))
                .where(eq(messages.id, data.id))


            context.io?.to(emitUser.socketId).emit('send_message', message);
            context.io?.to(emitUser.socketId).emit('send_notification', message);

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
