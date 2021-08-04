import { Plugin } from 'ckeditor5/src/core';
import { WidgetResize } from 'ckeditor5/src/widget';
import VideoLoadObserver from '../video/videoloadobserver';

const RESIZABLE_VIDEOS_CSS_SELECTOR =
	'figure.video.ck-widget > video,' +
	'figure.video.ck-widget > a > video,' +
	'span.video-inline.ck-widget > video';

const VIDEO_WIDGETS_CLASSES_MATCH_REGEXP = /(video|video-inline)/;

const RESIZED_VIDEO_CLASS = 'video_resized';

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
			if ( !domEvent.target.matches( RESIZABLE_VIDEOS_CSS_SELECTOR) ) {
				return;
			}

			const domConverter = editor.editing.view.domConverter;
			const videoView = domConverter.domToView( domEvent.target );
			const widgetView = videoView.findAncestor( { classes: VIDEO_WIDGETS_CLASSES_MATCH_REGEXP } );

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
						return domConverter.viewToDom( mapper.toViewElement( videoModel.parent ) );
					},
					isCentered() {
						const videoStyle = videoModel.getAttribute( 'videoStyle' );

						return !videoStyle || videoStyle === 'block' || videoStyle === 'alignCenter';
					},

					onCommit( newValue ) {
						editingView.change( writer => {
							writer.removeClass( RESIZED_VIDEO_CLASS, widgetView );
						} );

						editor.execute( 'resizeVideo', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widgetView.hasClass( RESIZED_VIDEO_CLASS ) ) {
					editingView.change( writer => {
						writer.addClass( RESIZED_VIDEO_CLASS, widgetView );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		} );
	}
}
