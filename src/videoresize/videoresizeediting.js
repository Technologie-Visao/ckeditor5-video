import { Plugin } from 'ckeditor5/src/core';
import ResizeVideoCommand from './resizevideocommand';

export default class VideoResizeEditing extends Plugin {
	static get pluginName() {
		return 'VideoResizeEditing';
	}

	constructor( editor ) {
		super( editor );

		editor.config.define( 'video', {
			resizeUnit: '%',
			resizeOptions: [ {
				name: 'resizeVideo:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'resizeVideo:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'resizeVideo:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'resizeVideo:75',
				value: '75',
				icon: 'large'
			} ]
		} );
	}

	init() {
		const editor = this.editor;
		const resizeVideoCommand = new ResizeVideoCommand( editor );

		this._registerSchema();
		this._registerConverters();

		editor.commands.add( 'resizeVideo', resizeVideoCommand );
		editor.commands.add( 'videoResize', resizeVideoCommand );
	}

	_registerSchema() {
		this.editor.model.schema.extend( 'video', { allowAttributes: 'width' } );
		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );
	}

	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate video's attribute to the video tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:width:video', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, figure );
					viewWriter.addClass( 'video_resized', figure );
				} else {
					viewWriter.removeStyle( 'width', figure );
					viewWriter.removeClass( 'video_resized', figure );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'figure',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'width',
					value: viewElement => viewElement.getStyle( 'width' )
				}
			} );
	}
}
