import { Command } from 'ckeditor5/src/core';

export default class VideoStyleCommand extends Command {
    constructor( editor, styles ) {
        super( editor );

        this._defaultStyles = {
            videoBlock: false,
            videoInline: false
        };

        this._styles = new Map( styles.map( style => {
            if ( style.isDefault ) {
                for ( const modelElementName of style.modelElements ) {
                    this._defaultStyles[ modelElementName ] = style.name;
                }
            }

            return [ style.name, style ];
        } ) );
    }

    refresh() {
        const editor = this.editor;
        const videoUtils = editor.plugins.get( 'VideoUtils' );
        const element = videoUtils.getClosestSelectedVideoElement( this.editor.model.document.selection );

        this.isEnabled = !!element;

        if ( !this.isEnabled ) {
            this.value = false;
        } else if ( element.hasAttribute( 'videoStyle' ) ) {
            this.value = element.getAttribute( 'videoStyle' );
        } else {
            this.value = this._defaultStyles[ element.name ];
        }
    }

    execute( options = {} ) {
        const editor = this.editor;
        const model = editor.model;
        const videoUtils = editor.plugins.get( 'VideoUtils' );

        model.change( writer => {
            const requestedStyle = options.value;

            let videoElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );

            if ( requestedStyle && this.shouldConvertVideoType( requestedStyle, videoElement ) ) {
                this.editor.execute( videoUtils.isBlockVideo( videoElement ) ? 'videoTypeInline' : 'videoTypeBlock' );
                videoElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );
            }

            if ( !requestedStyle || this._styles.get( requestedStyle ).isDefault ) {
                writer.removeAttribute( 'videoStyle', videoElement );
            } else {
                writer.setAttribute( 'videoStyle', requestedStyle, videoElement );
            }
        } );
    }

    shouldConvertVideoType( requestedStyle, videoElement ) {
        const supportedTypes = this._styles.get( requestedStyle ).modelElements;

        return !supportedTypes.includes( videoElement.name );
    }
}
