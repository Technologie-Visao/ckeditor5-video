import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';
import { insertVideo, isVideoAllowed } from "../video/utils";

function uploadVideo( model, fileRepository, file ) {
    const loader = fileRepository.createLoader( file );

    if ( !loader ) {
        return;
    }

    insertVideo( model, { uploadId: loader.id } );
}

export default class UploadVideoCommand extends Command {
    refresh() {
        const videoElement = this.editor.model.document.selection.getSelectedElement();
        const isVideo = videoElement && videoElement.name === 'video' || false;

        this.isEnabled = isVideoAllowed( this.editor.model ) || isVideo;
    }

    execute( options ) {
        if (!options.file && !options.files) {
            return;
        }

        const files = options.file ? toArray( options.file ) : toArray( options.files );

        const editor = this.editor;
        const model = editor.model;

        const fileRepository = editor.plugins.get( FileRepository );

        for ( const file of files ) {
            uploadVideo( model, fileRepository, file );
        }
    }
}
