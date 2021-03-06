import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import React from 'react';
import Textarea from 'react-textarea-autosize';
import b_ from 'b_';
import ReactDropzone from 'react-dropzone';

import EmojiPicker from '../EmojiPicker';
import Button from '../Button';
import Recognition from './Recognition';
import Alarm from '../Alarm';

import ForwardedContainer from '../ForwardedMessage/Container';
import UploadPreview from './UploadPreview';
import SendIcon from './SendIcon';
import AttachIcon from './AttachIcon';
import EmojiIcon from './EmojiIcon';
import MapIcon from './MapIcon';
import Dropzone from '../Dropzone';
import AlarmIcon from './AlarmIcon';

import uiStore from '../../domain/ui-store';
import applicationStore from '../../domain/application-store';
import deathtimerStore from '../../domain/deathtimer-store';
import ChatsStore from '../../domain/chats-store';
import UploadStore from '../../domain/upload-store';
import { getImageFromFile, resizeImage } from '../../utils/image-utils';
import { withOutsideClickHandler } from '../../hocs/withOutsideClickHandler';
import createForwardMessage from '../../utils/createForwardMessage';
import { BASE_URL } from '../../config';

import getMapUrl from '../../utils/maps-url';

import './MessageInput.css';
const b = b_.with('message-input');

interface PickerProps {
    addSmile: (smile) => void;
    className?: string;
}

@observer
class MessageInput extends React.Component {
    @observable private preview: HTMLImageElement;
    @observable private showSmiles: boolean = false;
    @observable private showTimer: boolean = false;
    @observable private message: string = '';

    private messageInput: HTMLTextAreaElement;
    private imageCaptionInput: HTMLInputElement;
    private dropzone: ReactDropzone;

    private uploadStore: UploadStore = new UploadStore();
    private attachment: string;

    private emojiPicker: React.ComponentClass<PickerProps>;

    private alarmPicker: React.ComponentClass;

    public constructor(props) {
        super(props);

        this.emojiPicker = withOutsideClickHandler(EmojiPicker, this.onCloseSmiles);
        this.alarmPicker = withOutsideClickHandler(Alarm, this.onCloseTimer);
    }

    public onSend = async () => {
        const text = this.message.trim();

        if (!text) {
            if (uiStore.forwardMessage) {
                uiStore.setToast('Нельзя ответить на сообщение пустым текстом');
            }

            return;
        }
        let timeToDeath = null;

        if (deathtimerStore.isActive && deathtimerStore.timeToDeath) {
            timeToDeath = deathtimerStore.timeToDeath;
        }

        const forwarded = uiStore.forwardMessage
            ? createForwardMessage(uiStore.forwardMessage, true)
            : null;

        await ChatsStore.currentChat.sendMessage({ text, timeToDeath, forwarded });
        this.setMessage('');
        uiStore.setForwardMessage(null);
        this.messageInput.focus();
    };

    public onKeyUp = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.onSend();
        }
    };

    public componentDidMount() {
        deathtimerStore.getState();
    }

    public render() {
        const dark = uiStore.isDark;
        const offline = applicationStore.isOffline;
        const MessageInputAlarm = this.alarmPicker;
        const MessageInputEmojiPicker = this.emojiPicker;

        return (
            <section className={b({ dark })}>
                {this.renderForwardedContainer()}
                <div className={b('container')}>
                    {!offline && <Button
                        title="Прикрепить фотографию"
                        className={b('button', { dark })}
                        onClick={this.dropzoneOpen}
                    >
                        <AttachIcon className={`${b('icon')} ${b('attach-icon')}`} />
                    </Button>}
                    {navigator.geolocation && (
                        <Button
                            onClick={this.onClickLocation}
                            title="Отправить своё местоположение"
                            className={`${b('button', { dark })} ${b('button_map')}`}
                        >
                            <MapIcon className={`${b('icon')}`} />
                        </Button>
                    )}
                    <Textarea
                        maxLength={800}
                        maxRows={6}
                        style={{ padding: '10px' }}
                        className={b('message', { dark })}
                        placeholder="Введите сообщение..."
                        onKeyPress={this.onKeyUp}
                        onChange={this.onChangeText}
                        value={this.message}
                        inputRef={el => (this.messageInput = el) /* tslint:disable-line */}
                    />
                    <Recognition onChange={this.onSpeech} />
                    <div className={b('alarm')}>
                        <Button className={b('button', { dark })} onClick={this.onShowTimer}>
                            <AlarmIcon className={`${b('icon')} ${b('alarm-icon')}`} />
                        </Button>
                        {this.showTimer && <MessageInputAlarm />}
                    </div>
                    <div className={b('smiles')}>
                        <Button onClick={this.onShowSmiles} className={b('button', { dark })}>
                            <EmojiIcon className={`${b('icon')} ${b('emoji-icon')}`} />
                        </Button>
                        {this.showSmiles && (
                            <MessageInputEmojiPicker
                                className={b('smiles-picker')}
                                addSmile={this.onAddSmile}
                            />
                        )}
                    </div>
                    <Button
                        className={`${b('button', { dark })} ${b('send')}`}
                        onClick={this.onSend}
                    >
                        <SendIcon className={`${b('icon')} ${b('send-icon')}`} />
                    </Button>
                </div>
                <Dropzone
                    // tslint:disable-next-line
                    dropzoneRef={node => {
                        this.dropzone = node;
                    }}
                    className={b('dropzone')}
                    onWindowClassName={b('dropzone') + '_display'}
                    overClassName={b('dropzone') + '_over'}
                    onDrop={this.onDrop}
                    accept="image/jpeg, image/gif, image/png, image/webp, image/svg+xml"
                >
                    Перетащите фото рамером не более 20мб для отправки.
                </Dropzone>
                {this.preview && (
                    <UploadPreview
                        image={this.preview}
                        loading={this.uploadStore.isFetching}
                        error={this.uploadStore.isError}
                        closeHandler={this.onUploadCancel}
                        onSend={this.onImageSend}
                        // tslint:disable-next-line
                        inputRef={node => {
                            this.imageCaptionInput = node;
                        }}
                    />
                )}
            </section>
        );
    }

    private renderForwardedContainer() {
        if (!uiStore.forwardMessage || uiStore.displays.selectChat) {
            return null;
        }

        return (
            <div className={b('forwarded')}>
                <ForwardedContainer message={uiStore.forwardMessage} />
            </div>
        );
    }

    private onClickLocation = () =>
        navigator.geolocation.getCurrentPosition(this.onSendLocation, this.onErrorSendLocation);

    private onSendLocation = location => {
        const latitude = location.coords.latitude.toFixed(6);
        const longitude = location.coords.longitude.toFixed(6);

        const src = getMapUrl(latitude, longitude);
        const link = `https://yandex.ru/maps/?ll=${longitude},${latitude}&z=16&kgsystem=true`;

        let timeToDeath = null;

        if (deathtimerStore.isActive && deathtimerStore.timeToDeath) {
            timeToDeath = deathtimerStore.timeToDeath;
        }

        ChatsStore.currentChat.sendMessage({ text: link, attachment: src, timeToDeath });
    };

    private onErrorSendLocation = () => uiStore.setToast('Не удалось получить ваше местоположение');

    private onImageSend = async () => {
        const text = this.imageCaptionInput.value.trim();

        let timeToDeath = null;

        if (deathtimerStore.isActive && deathtimerStore.timeToDeath) {
            timeToDeath = deathtimerStore.timeToDeath;
        }

        try {
            this.imageCaptionInput.disabled = true;
            await ChatsStore.currentChat.sendMessage({
                text,
                attachment: this.attachment,
                timeToDeath
            });
            this.imageCaptionInput.value = '';
        } finally {
            this.imageCaptionInput.disabled = false;
            this.imageCaptionInput.focus();
            this.onUploadCancel();
        }
    };

    private dropzoneOpen = (): void => {
        this.dropzone.open();
    };

    private onDrop = (accepted: File[]): void => {
        let resize;

        if (accepted.length === 0) {
            uiStore.setToast('Формат загружаемого файла не поддерживается');
            return;
        }

        if (accepted[0].type === 'image/svg+xml') {
            resize = Promise.resolve(accepted[0]);
        } else {
            resize = resizeImage(accepted[0], 720);
        }

        resize
            .then(file =>
                getImageFromFile(file).then(image => {
                    this.uploadStore.upload(file).then(({ path }) => {
                        this.attachment = `${BASE_URL}${path}`;
                    });

                    if (this.preview) {
                        return;
                    }

                    runInAction(() => {
                        this.preview = image;
                    });
                })
            )
            .catch(() => uiStore.setToast('Загрузка файла не удалась'));
    };

    private onSpeech = (text: string) => {
        this.setMessage(`${this.message} ${text}`.trim());
    };

    private onChangeText = (event: React.FormEvent<HTMLTextAreaElement>) => {
        this.setMessage(event.currentTarget.value);
    };

    @action
    private onUploadCancel = (): void => {
        this.attachment = undefined;
        this.preview = undefined;
        this.uploadStore.clear();
    };

    @action
    private onShowSmiles = () => {
        this.showSmiles = true;
    };

    @action
    private onCloseSmiles = () => {
        this.showSmiles = false;
    };

    @action
    private setMessage = (value: string) => {
        this.message = value;
    };

    @action
    private onAddSmile = (text: string) => {
        this.message += text;
    };

    @action
    private onShowTimer = () => {
        this.showTimer = true;
        deathtimerStore.getState();
    };

    @action
    private onCloseTimer = () => {
        this.showTimer = false;
        deathtimerStore.saveState();
    };
}

export default MessageInput;
