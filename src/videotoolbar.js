import { Plugin } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import VideoUtils from './videoutils';
import { isObject } from 'lodash-es';

export default class VideoToolbar extends Plugin {
    static get requires() {
        return [ WidgetToolbarRepository, VideoUtils ];
    }

    static get pluginName() {
        return 'VideoToolbar';
    }

    afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
        const videoUtils = editor.plugins.get( 'VideoUtils' );

        widgetToolbarRepository.register( 'video', {
            ariaLabel: t( 'Video toolbar' ),
            items: normalizeDeclarativeConfig( editor.config.get( 'video.toolbar' ) || [] ),
            getRelatedElement: selection => videoUtils.getClosestSelectedVideoWidget( selection )
        } );
    }
}

function normalizeDeclarativeConfig( config ) {
    return config.map( item => isObject( item ) ? item.name : item );
}

