import Command from "@ckeditor/ckeditor5-core/src/command";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";
import {insertVideo, isVideoAllowed} from "../video/utils";

function uploadVideo( writer, model, fileRepository, file ) {
    const loader = fileRepository.createLoader( file );

    if ( !loader ) {
        return;
    }

    insertVideo( writer, model, { uploadId: loader.id } );
}

export default class UploadVideoCommand extends Command {
    execute( options ) {
        const editor = this.editor;
        const model = editor.model;

        const fileRepository = editor.plugins.get( FileRepository );

        model.change( writer => {
            const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

            for ( const file of filesToUpload ) {
                uploadVideo( writer, model, fileRepository, file );
            }
        } );
    }

    refresh() {
        const videoElement = this.editor.model.document.selection.getSelectedElement();
        const isVideo = videoElement && videoElement.name === 'video' || false;

        this.isEnabled = isVideoAllowed( this.editor.model ) || isVideo;
    }
}
