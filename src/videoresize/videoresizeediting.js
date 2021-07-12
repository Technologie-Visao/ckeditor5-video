import { Plugin } from 'ckeditor5/src/core';
import VideoUtils from "../videoutils";
import ResizeVideoCommand from './resizevideocommand';

export default class VideoResizeEditing extends Plugin {
	static get requires() {
		return [ VideoUtils ];
	}

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
		this._registerConverters( 'videoBlock' );
		this._registerConverters( 'videoInline' );

		editor.commands.add( 'resizeVideo', resizeVideoCommand );
		editor.commands.add( 'videoResize', resizeVideoCommand );
	}

	_registerSchema() {
		if ( this.editor.plugins.has( 'VideoBlockEditing' ) ) {
			this.editor.model.schema.extend( 'videoBlock', { allowAttributes: 'width' } );
		}

		if ( this.editor.plugins.has( 'VideoInlineEditing' ) ) {
			this.editor.model.schema.extend( 'videoInline', { allowAttributes: 'width' } );
		}
	}

	_registerConverters( videoType ) {
		const editor = this.editor;

		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( `attribute:width:${ videoType }`, ( evt, data, conversionApi ) => {
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
					name: videoType === 'videoBlock' ? 'figure' : 'video',
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
