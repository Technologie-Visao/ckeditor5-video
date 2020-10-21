import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import videoUploadIcon from '../../theme/icons/video.svg';
import {createVideoMediaTypeRegExp} from "./utils";
import FileDialogButtonView from "@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview";

export default class VideoUploadUI extends Plugin {
    init() {
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add( 'videoUpload', locale => {
            const view = new FileDialogButtonView( locale );
            const command = editor.commands.get('uploadVideo');
            const videoTypes = editor.config.get('video.upload.types');
            const videoMediaTypesRegExp = createVideoMediaTypeRegExp(videoTypes);

            view.set({
                acceptedType: videoTypes.map(type => `video/${type}`).join(','),
                allowMultipleFiles: editor.config.get('video.upload.allowMultipleFiles')
            });

            view.buttonView.set({
                label: t('Upload Video'),
                icon: videoUploadIcon,
                tooltip: true
            });

            view.buttonView.bind('isEnabled').to(command);

            view.on('done', (evt, files) => {
                const videosToUpload = Array.from(files).filter(file => videoMediaTypesRegExp.test(file.type));

                if (videosToUpload.length) {
                    editor.execute('uploadVideo', { files: videosToUpload });
                }
            });

            return view;
        });
    }
}
