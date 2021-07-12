import { Command } from 'ckeditor5/src/core';

export default class ResizeVideoCommand extends Command {
	refresh() {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const element = videoUtils.getClosestSelectedVideoElement( editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !element || !element.hasAttribute( 'width' ) ) {
			this.value = null;
		} else {
			this.value = {
				width: element.getAttribute( 'width' ),
				height: null
			};
		}
	}

	execute( options ) {
		const editor = this.editor;
		const model = editor.model;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const videoElement = videoUtils.getClosestSelectedVideoElement(model.document.selection);

		this.value = {
			width: options.width,
			height: null
		};

		if ( videoElement ) {
			model.change( writer => {
				writer.setAttribute( 'width', options.width, videoElement );
			} );
		}
	}
}
