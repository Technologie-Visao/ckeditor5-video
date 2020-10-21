import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';

export default class VideoResizeHandles extends Plugin {
	static get requires() {
		return [ WidgetResize ];
	}

	static get pluginName() {
		return 'VideoResizeHandles';
	}

	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'videoResize' );

		this.bind( 'isEnabled' ).to( command );

		editor.editing.downcastDispatcher.on( 'insert:video', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			const resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'video.resizeUnit' ),

					modelElement: data.item,
					viewElement: widget,
					editor,

					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'video' );
					},
					getResizeHost( domWidgetElement ) {
						return domWidgetElement;
					},
					// TODO consider other positions.
					isCentered() {
						const videoStyle = data.item.getAttribute( 'videoStyle' );

						return !videoStyle || videoStyle === 'full' || videoStyle === 'alignCenter';
					},

					onCommit( newValue ) {
						editor.execute( 'videoResize', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widget.hasClass( 'video_resized' ) ) {
					editor.editing.view.change( writer => {
						writer.addClass( 'video_resized', widget );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		}, { priority: 'low' } );
	}
}
