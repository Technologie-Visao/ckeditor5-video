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
import VideoToolbar from "../src/videotoolbar";
import VideoStyle from "../src/videostyle";
import VideoInsert from "../src/videoinsert";

class VideoUploadAdapter {
    constructor( loader ) {
        this.loader = loader;
    }

    upload() {
        const uploadVideo = async (file) => {
            this.loader.uploaded = false;
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.loader.uploaded = true;
                    resolve({ default: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4' });
                }, 2000);
            });
        };

        return this.loader.file.then((file) => uploadVideo(file));
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
        plugins: [ Essentials, Paragraph, Bold, Italic, Heading, List, VideoToolbar, Video, VideoUpload, VideoResize, VideoStyle, VideoInsert ],
        extraPlugins: [VideoUploadAdapterPlugin],
        toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'videoUpload' ],
        video: {
            upload: {
                types: ['mp4'],
                allowMultipleFiles: false,
            },
            styles: [
                'alignLeft', 'alignCenter', 'alignRight'
            ],

            // Configure the available video resize options.
            resizeOptions: [
                {
                    name: 'videoResize:original',
                    label: 'Original',
                    icon: 'original'
                },
                {
                    name: 'videoResize:50',
                    label: '50',
                    icon: 'medium'
                },
                {
                    name: 'videoResize:75',
                    label: '75',
                    icon: 'large'
                }
            ],

            // You need to configure the video toolbar, too, so it shows the new style
            // buttons as well as the resize buttons.
            toolbar: [
                'videoStyle:alignLeft', 'videoStyle:alignCenter', 'videoStyle:alignRight',
                '|',
                'videoResize:50',
                'videoResize:75',
                'videoResize:original'
            ]
        }
    } )
    .then( editor => {
        CKEditorInspector.attach( editor );

        window.editor = editor;
    } )
    .catch( error => {
        console.error( error.stack );
    } );
