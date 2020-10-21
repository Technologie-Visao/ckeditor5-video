import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoLoadObserver from './videoloadobserver';

import {
	viewFigureToModel,
	modelToViewAttributeConverter
} from './converters';

import { toVideoWidget } from './utils';

import VideoInsertCommand from './videoinsertcommand';

export default class VideoEditing extends Plugin {
	static get pluginName() {
		return 'VideoEditing';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		editor.editing.view.addObserver( VideoLoadObserver );

		// Configure schema.
		schema.register( 'video', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'src' ]
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'video',
			view: ( modelElement, { writer } ) => createVideoViewElement( writer )
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'video',
			view: ( modelElement, { writer } ) => toVideoWidget( createVideoViewElement( writer ), writer, t( 'video widget' ) )
		} );

		conversion.for( 'downcast' ).add( modelToViewAttributeConverter( 'src' ) );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'video',
					attributes: {
						src: true
					}
				},
				model: ( viewVideo, { writer } ) => writer.createElement( 'video', { src: viewVideo.getAttribute( 'src' ) } )
			} )
			.add( viewFigureToModel() );

		editor.commands.add( 'videoInsert', new VideoInsertCommand( editor ) );
	}
}

export function createVideoViewElement( writer ) {
	const emptyElement = writer.createEmptyElement( 'video' );
	const figure = writer.createContainerElement( 'figure', { class: 'video' } );

	writer.insert( writer.createPositionAt( figure, 0 ), emptyElement );

	return figure;
}
