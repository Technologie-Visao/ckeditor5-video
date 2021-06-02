import { Plugin } from 'ckeditor5/src/core';
import VideoUpload from './videoupload';
import VideoInsertUI from './videoinsert/videoinsertui';

export default class VideoInsert extends Plugin {
    static get pluginName() {
        return 'VideoInsert';
    }

    static get requires() {
        return [ VideoUpload, VideoInsertUI ];
    }
}
