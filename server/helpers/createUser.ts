import { UserCreation } from '../passport';

import { User } from '../models';
import { generateAvatar } from './generateAvatar';

export const createUser: UserCreation = async ({ id, username, displayName }) => {
    const [firstName = '', lastName = ''] = (displayName || '').split(/\s+/);

    const user = await User.findOrCreate<User>({
        where: { id },
        defaults: {
            id,
            username,
            firstName,
            lastName,
            avatar: `data:image/png;base64,${await generateAvatar(id.toString())}`,
            isUsedBot: true
        }
    });
};
