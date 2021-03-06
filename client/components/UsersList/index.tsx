import React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import b_ from 'b_';
import classNames from 'classnames';
import BasicUserInfo from '../UserInfo/Basic';
import Search from './Search';

import UserModel from '../../domain/user-model';
import uiStore from '../../domain/ui-store';

import './UsersList.css';
const b = b_.with('users');

interface Props {
    users: UserModel[];

    emptyMessage?: string;
    className?: string;
    searchType?: 'plain' | 'box';
    disableSearch?: boolean;
    selected?: number[];
    onClick?: (id: number) => void;
}

@observer
class ContactsList extends React.Component<Props> {
    @observable private query: string = '';

    @computed
    private get filteredUsers(): UserModel[] {
        if (!this.query) {
            return this.props.users;
        }

        return this.props.users.filter(({ username, firstName, lastName }) =>
            [username, firstName, lastName].some(
                word => word && word.toLowerCase().includes(this.query.toLocaleLowerCase())
            )
        );
    }

    public render(): React.ReactNode {
        const {
            selected = [],
            onClick,
            users,
            disableSearch,
            className = '',
            searchType = 'box',
            emptyMessage = 'Список пользователей пуст'
        } = this.props;

        const dark = uiStore.isDark;

        if (users.length === 0) {
            return <p className={`${b('empty', { dark })} text`}>{emptyMessage}</p>;
        }

        return (
            <div className={classNames(className, b({ dark }))}>
                {users.length !== 0 &&
                    !disableSearch && (
                        <Search
                            searchType={searchType}
                            query={this.query}
                            onChangeQuery={this.onQueryChange}
                        />
                    )}
                <div className={b('list')}>
                    {this.filteredUsers.map(user => (
                        <BasicUserInfo
                            key={user.id}
                            user={user}
                            className={b('contact')}
                            onClick={onClick}
                            selected={selected.includes(user.id)}
                            selectable={true}
                        />
                    ))}
                </div>
            </div>
        );
    }

    @action
    private onQueryChange = (query: string) => {
        this.query = query;
    };
}

export default ContactsList;
