import React from 'react';
import { observer } from 'mobx-react';

import RPC from '../../utils/rpc-client';
import { Events } from '../../../shared/events';
import chatsStore from '../../domain/chats-store';
import sound from './notification.mp3';

@observer
class Notificator extends React.Component {
    private audioPlayer: HTMLAudioElement;

    public componentDidMount() {
        RPC.addListener(Events.NEW_MESSAGE, this.playSound);
    }

    public componentWillUnmount() {
        RPC.removeListener(Events.NEW_MESSAGE, this.playSound);
    }

    public render(): React.ReactNode {
        return (
            <audio
                style={{ display: 'none' }}
                ref={audio => (this.audioPlayer = audio)}
                src={sound}
                autoPlay={false}
                controls={false}
            />
        );
    }

    private playSound = message => {
        const chat = chatsStore.currentChat;
        if (chat && chat.id !== message.chatId) {
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.play();
        }
    };
}

export default Notificator;
