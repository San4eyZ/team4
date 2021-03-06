import { action, observable } from 'mobx';
import RPC from '../utils/rpc-client';

class UserModel {
    public static fromJSON(user) {
        const userModel = new UserModel(user.id);
        userModel.update(user);

        return userModel;
    }

    @observable public isFetching;

    public id: number;

    public username: string;

    @observable public firstName: string;

    @observable public lastName: string;

    @observable public bio: string;

    @observable public avatar: string;

    constructor(userId) {
        this.id = userId;
    }

    get displayName() {
        const name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
        return name || this.username;
    }

    @action
    public async fetch() {
        if (this.isFetching) {
            return;
        }

        this.setFetching(true);

        try {
            const user: any = await RPC.request('getUserInfo', {
                userId: this.id,
                subscribe: true
            });

            this.update(user);
        } finally {
            this.setFetching(false);
        }
    }

    @action
    public update(user) {
        this.username = user.username;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.avatar = user.avatar;
        this.bio = user.bio;
    }

    @action
    private setFetching(fetching: boolean) {
        this.isFetching = fetching;
    }
}

export default UserModel;
