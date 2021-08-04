import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

export default class UploadVideoCommand extends Command {
    refresh() {
        const editor = this.editor;
        const videoUtils = editor.plugins.get( 'VideoUtils' );
        const selectedElement = editor.model.document.selection.getSelectedElement();

        this.isEnabled = videoUtils.isVideoAllowed() || videoUtils.isVideo( selectedElement );
    }

    execute( options ) {
        if (!options.file && !options.files) {
            return;
        }

        const files = options.file ? toArray( options.file ) : toArray( options.files );
        const selection = this.editor.model.document.selection;
        const videoUtils = this.editor.plugins.get( 'VideoUtils' );
        const selectionAttributes = Object.fromEntries( selection.getAttributes() );

        files.forEach( ( file, index ) => {
            const selectedElement = selection.getSelectedElement();

            if ( index && selectedElement && videoUtils.isVideo( selectedElement ) ) {
                const position = this.editor.model.createPositionAfter( selectedElement );

                this._uploadVideo( file, selectionAttributes, position );
            } else {
                this._uploadVideo( file, selectionAttributes );
            }
        } );
    }

    _uploadVideo( file, attributes, position ) {
        const editor = this.editor;
        const fileRepository = editor.plugins.get( FileRepository );
        const loader = fileRepository.createLoader( file );
        const videoUtils = editor.plugins.get( 'VideoUtils' );

        if ( !loader ) {
            return;
        }

        videoUtils.insertVideo( { ...attributes, uploadId: loader.id }, position );
    }
}
