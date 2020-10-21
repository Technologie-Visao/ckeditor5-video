import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import UploadVideoCommand from "./uploadvideocommand";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";
import {
    createVideoMediaTypeRegExp,
    fetchLocalVideo,
    getVideosFromChangeItem,
    isHtmlIncluded,
    isLocalVideo
} from "./utils";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import env from "@ckeditor/ckeditor5-utils/src/env";
import {getViewVideoFromWidget} from "../video/utils";

const DEFAULT_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg'];


export default class VideoUploadEditing extends Plugin {
    static get requires() {
        return [FileRepository, Notification, Clipboard];
    }

    constructor(editor) {
        super(editor);

        editor.config.define('video.upload', {
            types: DEFAULT_VIDEO_EXTENSIONS,
            allowMultipleFiles: true,
        });
    }

    init() {
        const editor = this.editor;
        const doc = editor.model.document;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const fileRepository = editor.plugins.get(FileRepository);
        const videoTypes = createVideoMediaTypeRegExp(editor.config.get('video.upload.types'));

        // Setup schema to allow uploadId and uploadStatus for videos.
        schema.extend('video', {
            allowAttributes: ['uploadId', 'uploadStatus']
        });

        editor.commands.add('uploadVideo', new UploadVideoCommand(editor))

        // Register upcast converter for uploadId.
        conversion.for('upcast')
            .attributeToAttribute({
                view: {
                    name: 'video',
                    key: 'uploadId'
                },
                model: 'uploadId'
            });

        this.listenTo(editor.editing.view.document, 'clipboardInput', (evt, data) => {
            // Skip if non empty HTML data is included.
            // https://github.com/ckeditor/ckeditor5-upload/issues/68
            if (isHtmlIncluded(data.dataTransfer)) {
                return;
            }

            const videos = Array.from(data.dataTransfer.files).filter(file => {
                // See https://github.com/ckeditor/ckeditor5-image/pull/254.
                if (!file) {
                    return false;
                }

                return videoTypes.test(file.type);
            });

            const ranges = data.targetRanges.map(viewRange => editor.editing.mapper.toModelRange(viewRange));

            editor.model.change(writer => {
                // Set selection to paste target.
                writer.setSelection(ranges);

                if (videos.length) {
                    evt.stop();

                    // Upload videos after the selection has changed in order to ensure the command's state is refreshed.
                    editor.model.enqueueChange('default', () => {
                        editor.execute('videoUpload', {file: videos});
                    });
                }
            });
        });


        this.listenTo(editor.plugins.get(Clipboard), 'inputTransformation', (evt, data) => {
            const fetchableVideos = Array.from(editor.editing.view.createRangeIn(data.content))
                .filter(value => isLocalVideo(value.item) && !value.item.getAttribute('uploadProcessed'))
                .map(value => {
                    return {promise: fetchLocalVideo(value.item), videoElement: value.item};
                });

            if (!fetchableVideos.length) {
                return;
            }

            const writer = new UpcastWriter(editor.editing.view.document);

            for (const fetchableVideo of fetchableVideos) {
                // Set attribute marking that the video was processed already.
                writer.setAttribute('uploadProcessed', true, fetchableVideo.videoElement);

                const loader = fileRepository.createLoader(fetchableVideo.promise);

                if (loader) {
                    writer.setAttribute('src', '', fetchableVideo.videoElement);
                    writer.setAttribute('uploadId', loader.id, fetchableVideo.videoElement);
                }
            }
        });

        // Prevents from the browser redirecting to the dropped video.
        editor.editing.view.document.on('dragover', (evt, data) => {
            data.preventDefault();
        });


        // Upload placeholder videos that appeared in the model.
        doc.on('change', () => {
            const changes = doc.differ.getChanges({includeChangesInGraveyard: true});

            for (const entry of changes) {
                if (entry.type === 'insert' && entry.name !== '$text') {
                    const item = entry.position.nodeAfter;
                    const isInGraveyard = entry.position.root.rootName === '$graveyard';

                    for (const video of getVideosFromChangeItem(editor, item)) {
                        // Check if the video element still has upload id.
                        const uploadId = video.getAttribute('uploadId');

                        if (!uploadId) {
                            continue;
                        }

                        // Check if the video is loaded on this client.
                        const loader = fileRepository.loaders.get(uploadId);

                        if (!loader) {
                            continue;
                        }

                        if (isInGraveyard) {
                            // If the video was inserted to the graveyard - abort the loading process.
                            loader.abort();
                        } else if (loader.status === 'idle') {
                            // If the video was inserted into content and has not been loaded yet, start loading it.
                            this._readAndUpload(loader, video);
                        }
                    }
                }
            }
        });
    }

    _readAndUpload(loader, videoElement) {
        const editor = this.editor;
        const model = editor.model;
        const t = editor.locale.t;
        const fileRepository = editor.plugins.get(FileRepository);
        const notification = editor.plugins.get(Notification);

        model.enqueueChange('transparent', writer => {
            writer.setAttribute('uploadStatus', 'reading', videoElement);
        });

        return loader.read()
            .then(() => {
                const promise = loader.upload();

                // Force re–paint in Safari. Without it, the video will display with a wrong size.
                // https://github.com/ckeditor/ckeditor5/issues/1975
                /* istanbul ignore next */
                if (env.isSafari) {
                    const viewFigure = editor.editing.mapper.toViewElement(videoElement);
                    const viewVideo = getViewVideoFromWidget(viewFigure);

                    editor.editing.view.once('render', () => {
                        // Early returns just to be safe. There might be some code ran
                        // in between the outer scope and this callback.
                        if (!viewVideo.parent) {
                            return;
                        }

                        const domFigure = editor.editing.view.domConverter.mapViewToDom(viewVideo.parent);

                        if (!domFigure) {
                            return;
                        }

                        const originalDisplay = domFigure.style.display;

                        domFigure.style.display = 'none';

                        // Make sure this line will never be removed during minification for having "no effect".
                        domFigure._ckHack = domFigure.offsetHeight;

                        domFigure.style.display = originalDisplay;
                    });
                }

                model.enqueueChange('transparent', writer => {
                    writer.setAttribute('uploadStatus', 'uploading', videoElement);
                });

                return promise;
            })
            .then(data => {
                model.enqueueChange('transparent', writer => {
                    writer.setAttributes({uploadStatus: 'complete', src: data.default}, videoElement);
                });

                clean();
            })
            .catch(error => {
                // If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
                // it might be generic error and it would be real pain to find what is going on.
                if (loader.status !== 'error' && loader.status !== 'aborted') {
                    throw error;
                }

                // Might be 'aborted'.
                if (loader.status === 'error' && error) {
                    notification.showWarning(error, {
                        title: t('Upload failed'),
                        namespace: 'upload'
                    });
                }

                clean();

                // Permanently remove video from insertion batch.
                model.enqueueChange('transparent', writer => {
                    writer.remove(videoElement);
                });
            });

        function clean() {
            model.enqueueChange('transparent', writer => {
                writer.removeAttribute('uploadId', videoElement);
                writer.removeAttribute('uploadStatus', videoElement);
            });

            fileRepository.destroyLoader(loader);
        }
    }
}
