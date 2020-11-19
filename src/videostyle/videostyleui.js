import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { normalizeVideoStyles } from './utils';
import '../../theme/videostyle.css';

export default class VideoStyleUI extends Plugin {
    static get pluginName() {
        return 'VideoStyleUI';
    }

    get localizedDefaultStylesTitles() {
        const t = this.editor.t;

        return {
            'Full size video': t( 'Full size video' ),
            'Side video': t( 'Side video' ),
            'Left aligned video': t( 'Left aligned video' ),
            'Centered video': t( 'Centered video' ),
            'Right aligned video': t( 'Right aligned video' )
        };
    }

    init() {
        const editor = this.editor;
        const configuredStyles = editor.config.get( 'video.styles' );

        const translatedStyles = translateStyles( normalizeVideoStyles( configuredStyles ), this.localizedDefaultStylesTitles );

        for ( const style of translatedStyles ) {
            this._createButton( style );
        }
    }

    _createButton( style ) {
        const editor = this.editor;

        const componentName = `videoStyle:${ style.name }`;

        editor.ui.componentFactory.add( componentName, locale => {
            const command = editor.commands.get( 'videoStyle' );
            const view = new ButtonView( locale );

            view.set( {
                label: style.title,
                icon: style.icon,
                tooltip: true,
                isToggleable: true
            } );

            view.bind( 'isEnabled' ).to( command, 'isEnabled' );
            view.bind( 'isOn' ).to( command, 'value', value => value === style.name );

            this.listenTo( view, 'execute', () => {
                editor.execute( 'videoStyle', { value: style.name } );
                editor.editing.view.focus();
            } );

            return view;
        } );
    }
}

function translateStyles( styles, titles ) {
    for ( const style of styles ) {
        // Localize the titles of the styles, if a title corresponds with
        // a localized default provided by the plugin.
        if ( titles[ style.title ] ) {
            style.title = titles[ style.title ];
        }
    }

    return styles;
}
