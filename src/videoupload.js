import { Plugin } from 'ckeditor5/src/core';
import VideoUploadUI from "./videoupload/videouploadui";
import VideoUploadEditing from "./videoupload/videouploadediting";
import VideoUploadProgress from "./videoupload/videouploadprogress";

export default class VideoUpload extends Plugin {
    static get requires() {
        return [VideoUploadEditing, VideoUploadUI, VideoUploadProgress];
    }
}
