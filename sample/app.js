// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import List from '@ckeditor/ckeditor5-list/src/list';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import VideoUpload from "../src/videoupload";
import Video from "../src/video";
import VideoResize from "../src/videoresize";

class VideoUploadAdapter {
    constructor( loader ) {
        this.loader = loader;
    }

    upload() {
        const uploadImage = async (file) => {
            this.loader.uploaded = false;
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.loader.uploaded = true;
                    resolve({ default: '' });
                }, 2000);
            });
        };

        return this.loader.file.then((file) => uploadImage(file));
    }

    abort() {
        return Promise.reject();
    }
}

function VideoUploadAdapterPlugin( editor ) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new VideoUploadAdapter(loader);
    };
}

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, Paragraph, Bold, Italic, Heading, List, Video, VideoUpload, VideoResize ],
        extraPlugins: [VideoUploadAdapterPlugin],
        toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'videoUpload' ],
        video: {
            upload: {
                types: ['mp4'],
                allowMultipleFiles: false,
            }
        }
    } )
    .then( editor => {
        CKEditorInspector.attach( editor );

        window.editor = editor;
    } )
    .catch( error => {
        console.error( error.stack );
    } );
