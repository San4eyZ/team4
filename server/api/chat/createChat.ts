import { Request } from '../../rpc/request';
import { Response } from '../../rpc/response';
import { Chat, Members, User } from '../../models';
import { v4 as uuid } from 'uuid';
import { Events } from '../../../shared/events';

interface Params {
    type: 'dialog' | 'room';
    members: number[];
    name?: string;
}

export default async function createChat(request: Request<Params>, response: Response) {
    const { type, members, name } = request.params;
    let chat = await Chat.create({
        id: uuid(),
        name,
        ownerId: type === 'room' ? request.user : null,
        type
    });

    if (!members.includes(request.user)) {
        members.push(request.user);
    }

    await Members.bulkCreate<Members>(
        members.map(userId => ({
            userId,
            chatId: chat.id
        }))
    );

    chat = (await Chat.findById(chat.id, {
        include: [
            {
                model: User
            }
        ]
    }))!;

    await Promise.all(members.map(userId => request.server.subscribeUser(userId, chat.id)));

    response.notification(chat.id, Events.NEW_CHAT, chat);
    response.success(chat);
}
