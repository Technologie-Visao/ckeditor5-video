import { Plugin } from 'ckeditor5/src/core';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { LivePosition, LiveRange } from 'ckeditor5/src/engine';
import { Undo } from 'ckeditor5/src/undo';
import { global } from 'ckeditor5/src/utils';
import VideoUtils from './videoutils';

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const VIDEO_URL_REGEXP = new RegExp( String( /^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source +
    /\.(mp4|webm|ogg|ogv|avi|wmv|mkv|mpeg2|mov|MP4|WEBM|OGG|OGV|AVI|WMV|MKV|MPEG2|MOV)/.source +
    /(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source +
    /(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source ) );

export default class AutoVideo extends Plugin {
    static get requires() {
        return [ Clipboard, VideoUtils, Undo ];
    }

    static get pluginName() {
        return 'AutoVideo';
    }

    constructor( editor ) {
        super( editor );

        this._timeoutId = null;
        this._positionToInsert = null;
    }

    init() {
        const editor = this.editor;
        const modelDocument = editor.model.document;

        this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', () => {
            const firstRange = modelDocument.selection.getFirstRange();

            const leftLivePosition = LivePosition.fromPosition( firstRange.start );
            leftLivePosition.stickiness = 'toPrevious';

            const rightLivePosition = LivePosition.fromPosition( firstRange.end );
            rightLivePosition.stickiness = 'toNext';

            modelDocument.once( 'change:data', () => {
                this._embedVideoBetweenPositions( leftLivePosition, rightLivePosition );

                leftLivePosition.detach();
                rightLivePosition.detach();
            }, { priority: 'high' } );
        } );

        editor.commands.get( 'undo' ).on( 'execute', () => {
            if ( this._timeoutId ) {
                global.window.clearTimeout( this._timeoutId );
                this._positionToInsert.detach();

                this._timeoutId = null;
                this._positionToInsert = null;
            }
        }, { priority: 'high' } );
    }

    _embedVideoBetweenPositions(leftPosition, rightPosition ) {
        const editor = this.editor;
        const urlRange = new LiveRange( leftPosition, rightPosition );
        const walker = urlRange.getWalker( { ignoreElementEnd: true } );
        const selectionAttributes = Object.fromEntries( editor.model.document.selection.getAttributes() );
        const videoUtils = this.editor.plugins.get( 'VideoUtils' );

        let src = '';

        for ( const node of walker ) {
            if ( node.item.is( '$textProxy' ) ) {
                src += node.item.data;
            }
        }

        src = src.trim();

        if ( !src.match( VIDEO_URL_REGEXP ) ) {
            urlRange.detach();

            return;
        }

        this._positionToInsert = LivePosition.fromPosition( leftPosition );

        this._timeoutId = global.window.setTimeout( () => {
            const videoCommand = editor.commands.get( 'insertVideo' );

            if ( !videoCommand.isEnabled ) {
                urlRange.detach();

                return;
            }

            editor.model.change( writer => {
                this._timeoutId = null;

                writer.remove( urlRange );
                urlRange.detach();

                let insertionPosition;

                if ( this._positionToInsert.root.rootName !== '$graveyard' ) {
                    insertionPosition = this._positionToInsert.toPosition();
                }

                videoUtils.insertVideo( { ...selectionAttributes, src }, insertionPosition )

                this._positionToInsert.detach();
                this._positionToInsert = null;
            } );
        }, 100 );
    }
}
