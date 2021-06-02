import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';
import VideoEditing from "./video/videoediting";
import { isVideoWidget } from './video/utils';
import '../theme/video.css';

export default class Video extends Plugin {
    static get requires() {
        return [ VideoEditing, Widget];
    }

    static get pluginName() {
        return 'Video';
    }

    isVideoWidget( viewElement ) {
        return isVideoWidget( viewElement );
    }
}
