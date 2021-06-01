import { Plugin } from 'ckeditor5/src/core';
import { WidgetResize } from 'ckeditor5/src/widget';
import VideoLoadObserver from '../video/videoloadobserver';

export default class VideoResizeHandles extends Plugin {
	static get requires() {
		return [ WidgetResize ];
	}

	static get pluginName() {
		return 'VideoResizeHandles';
	}

	init() {
		const command = this.editor.commands.get('resizeVideo');
		this.bind('isEnabled').to(command);

		this._setupResizerCreator();
	}

	_setupResizerCreator() {

		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( VideoLoadObserver );
		this.listenTo( editingView.document, 'videoLoaded', ( evt, domEvent ) => {
			if ( !domEvent.target.matches( 'figure.video.ck-widget > video, figure.video.ck-widget > a > video' ) ) {
				return;
			}

			const videoView = editor.editing.view.domConverter.domToView( domEvent.target );
			const widgetView = videoView.findAncestor( 'figure' );
			let resizer = this.editor.plugins.get( WidgetResize ).getResizerByViewElement( widgetView );

			if ( resizer ) {
				resizer.redraw();

				return;
			}


			const mapper = editor.editing.mapper;
			const videoModel = mapper.toModelElement( widgetView );

			resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'video.resizeUnit' ),

					modelElement: videoModel,
					viewElement: widgetView,
					editor,
					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'video' );
					},
					getResizeHost( domWidgetElement ) {
						return domWidgetElement;
					},
					isCentered() {
						const videoStyle = videoModel.getAttribute( 'videoStyle' );

						return !videoStyle || videoStyle === 'full' || videoStyle === 'alignCenter';
					},

					onCommit( newValue ) {
						editor.execute( 'resizeVideo', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widgetView.hasClass( 'video_resized' ) ) {
					editingView.change( writer => {
						writer.addClass( 'video_resized', widgetView );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		} );
	}
}
