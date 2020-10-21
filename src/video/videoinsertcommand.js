import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertVideo, isVideoAllowed } from './utils';

export default class VideoInsertCommand extends Command {
	refresh() {
		this.isEnabled = isVideoAllowed( this.editor.model );
	}

	execute( options ) {
		const model = this.editor.model;

		model.change( writer => {
			const sources = Array.isArray( options.source ) ? options.source : [ options.source ];

			for ( const src of sources ) {
				insertVideo( writer, model, { src } );
			}
		} );
	}
}
