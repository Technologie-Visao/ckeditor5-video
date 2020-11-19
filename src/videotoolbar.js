import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedVideoWidget } from './video/utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

export default class VideoToolbar extends Plugin {
    static get requires() {
        return [ WidgetToolbarRepository ];
    }

    static get pluginName() {
        return 'VideoToolbar';
    }

    afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

        widgetToolbarRepository.register( 'video', {
            ariaLabel: t( 'Video toolbar' ),
            items: editor.config.get( 'video.toolbar' ) || [],
            getRelatedElement: getSelectedVideoWidget
        } );
    }
}
