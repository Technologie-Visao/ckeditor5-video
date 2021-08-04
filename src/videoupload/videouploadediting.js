import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter } from 'ckeditor5/src/engine';
import { Notification } from 'ckeditor5/src/ui';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { FileRepository } from 'ckeditor5/src/upload';
import { env } from 'ckeditor5/src/utils';
import VideoUtils from '../videoutils';
import UploadVideoCommand from './uploadvideocommand';
import { fetchLocalVideo, isLocalVideo, createVideoTypeRegExp } from './utils';

const DEFAULT_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg'];


export default class VideoUploadEditing extends Plugin {
    static get requires() {
        return [ FileRepository, Notification, ClipboardPipeline, VideoUtils ];
    }

    static get pluginName() {
        return 'VideoUploadEditing';
    }

    constructor( editor ) {
        super( editor );

        editor.config.define('video.upload', {
            types: DEFAULT_VIDEO_EXTENSIONS,
            allowMultipleFiles: true,
        });

        this._uploadVideoElements = new Map();
    }

    init() {
        const editor = this.editor;
        const doc = editor.model.document;
        const conversion = editor.conversion;
        const fileRepository = editor.plugins.get( FileRepository );
        const videoUtils = editor.plugins.get( 'VideoUtils' );
        const videoTypes = createVideoTypeRegExp( editor.config.get( 'video.upload.types' ) );
        const uploadVideoCommand = new UploadVideoCommand( editor );

        editor.commands.add( 'uploadVideo', uploadVideoCommand );
        editor.commands.add( 'videoUpload', uploadVideoCommand );

        conversion.for( 'upcast' )
            .attributeToAttribute( {
                view: {
                    name: 'video',
                    key: 'uploadId'
                },
                model: 'uploadId'
            } );

        this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
            if ( isHtmlIncluded( data.dataTransfer ) ) {
                return;
            }

            const videos = Array.from( data.dataTransfer.files ).filter( file => {
                if ( !file ) {
                    return false;
                }

                return videoTypes.test( file.type );
            } );

            if ( !videos.length ) {
                return;
            }

            evt.stop();

            editor.model.change( writer => {
                if ( data.targetRanges ) {
                    writer.setSelection( data.targetRanges.map( viewRange => editor.editing.mapper.toModelRange( viewRange ) ) );
                }

                editor.model.enqueueChange( 'default', () => {
                    editor.execute( 'uploadVideo', { file: videos } );
                } );
            } );
        } );

        this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', ( evt, data ) => {
            const fetchableVideos = Array.from( editor.editing.view.createRangeIn( data.content ) )
                .filter( value => isLocalVideo( videoUtils, value.item ) && !value.item.getAttribute( 'uploadProcessed' ) )
                .map( value => { return { promise: fetchLocalVideo( value.item ), videoElement: value.item }; } );

            if ( !fetchableVideos.length ) {
                return;
            }

            const writer = new UpcastWriter( editor.editing.view.document );

            for ( const fetchableVideo of fetchableVideos ) {
                writer.setAttribute( 'uploadProcessed', true, fetchableVideo.videoElement );

                const loader = fileRepository.createLoader( fetchableVideo.promise );

                if ( loader ) {
                    writer.setAttribute( 'src', '', fetchableVideo.videoElement );
                    writer.setAttribute( 'uploadId', loader.id, fetchableVideo.videoElement );
                }
            }
        } );

        editor.editing.view.document.on( 'dragover', ( evt, data ) => {
            data.preventDefault();
        } );

        doc.on( 'change', () => {
            const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } ).reverse();
            const insertedVideosIds = new Set();

            for ( const entry of changes ) {
                if ( entry.type === 'insert' && entry.name !== '$text' ) {
                    const item = entry.position.nodeAfter;
                    const isInsertedInGraveyard = entry.position.root.rootName === '$graveyard';

                    for ( const videoElement of getVideosFromChangeItem( editor, item ) ) {
                        const uploadId = videoElement.getAttribute( 'uploadId' );

                        if ( !uploadId ) {
                            continue;
                        }

                        const loader = fileRepository.loaders.get( uploadId );

                        if ( !loader ) {
                            continue;
                        }

                        if ( isInsertedInGraveyard ) {
                            if ( !insertedVideosIds.has( uploadId ) ) {
                                loader.abort();
                            }
                        } else {
                            insertedVideosIds.add( uploadId );
                            this._uploadVideoElements.set( uploadId, videoElement );

                            if ( loader.status == 'idle' ) {
                                this._readAndUpload( loader );
                            }
                        }
                    }
                }
            }
        } );

        this.on( 'uploadComplete', ( evt, { videoElement, data } ) => {
            const urls = data.urls ? data.urls : data;

            this.editor.model.change( writer => {
                writer.setAttribute( 'src', urls.default, videoElement );
            } );
        }, { priority: 'low' } );
    }

    afterInit() {
        const schema = this.editor.model.schema;

        if ( this.editor.plugins.has( 'VideoBlockEditing' ) ) {
            schema.extend( 'videoBlock', {
                allowAttributes: [ 'uploadId', 'uploadStatus' ]
            } );
        }

        if ( this.editor.plugins.has( 'VideoInlineEditing' ) ) {
            schema.extend( 'videoInline', {
                allowAttributes: [ 'uploadId', 'uploadStatus' ]
            } );
        }
    }

    _readAndUpload( loader ) {
        const editor = this.editor;
        const model = editor.model;
        const t = editor.locale.t;
        const fileRepository = editor.plugins.get( FileRepository );
        const notification = editor.plugins.get( Notification );
        const videoUtils = editor.plugins.get( 'VideoUtils' );
        const videoUploadElements = this._uploadVideoElements;

        model.enqueueChange( 'transparent', writer => {
            writer.setAttribute( 'uploadStatus', 'reading', videoUploadElements.get( loader.id ) );
        } );

        return loader.read()
            .then( () => {
                const promise = loader.upload();
                const videoElement = videoUploadElements.get( loader.id );

                if ( env.isSafari ) {
                    const viewFigure = editor.editing.mapper.toViewElement( videoElement );
                    const viewVideo = videoUtils.findViewVideoElement( viewFigure );

                    editor.editing.view.once( 'render', () => {
                        if ( !viewVideo.parent ) {
                            return;
                        }

                        const domFigure = editor.editing.view.domConverter.mapViewToDom( viewVideo.parent );

                        if ( !domFigure ) {
                            return;
                        }

                        const originalDisplay = domFigure.style.display;

                        domFigure.style.display = 'none';

                        domFigure._ckHack = domFigure.offsetHeight;

                        domFigure.style.display = originalDisplay;
                    } );
                }

                model.enqueueChange( 'transparent', writer => {
                    writer.setAttribute( 'uploadStatus', 'uploading', videoElement );
                } );

                return promise;
            } )
            .then( data => {
                model.enqueueChange( 'transparent', writer => {
                    const videoElement = videoUploadElements.get( loader.id );

                    writer.setAttribute( 'uploadStatus', 'complete', videoElement );

                    this.fire( 'uploadComplete', { data, videoElement } );
                } );

                clean();
            } )
            .catch( error => {
                if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
                    throw error;
                }

                if ( loader.status === 'error' && error ) {
                    notification.showWarning( error, {
                        title: t( 'Upload failed' ),
                        namespace: 'upload'
                    } );
                }

                model.enqueueChange( 'transparent', writer => {
                    writer.remove( videoUploadElements.get( loader.id ) );
                } );

                clean();
            } );

        function clean() {
            model.enqueueChange( 'transparent', writer => {
                const videoElement = videoUploadElements.get( loader.id );

                writer.removeAttribute( 'uploadId', videoElement );
                writer.removeAttribute( 'uploadStatus', videoElement );

                videoUploadElements.delete( loader.id );
            } );

            fileRepository.destroyLoader( loader );
        }
    }
}

export function isHtmlIncluded( dataTransfer ) {
    return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}

function getVideosFromChangeItem( editor, item ) {
    const videoUtils = editor.plugins.get( 'VideoUtils' );

    return Array.from( editor.model.createRangeOn( item ) )
        .filter( value => videoUtils.isVideo( value.item ) )
        .map( value => value.item );
}
