import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import VideoStyleEditing from './videostyleediting';
import utils from './utils';
import { isObject, identity } from 'lodash-es';

import '../../theme/videostyle.css';

export default class VideoStyleUI extends Plugin {
    static get requires() {
        return [ VideoStyleEditing ];
    }

    static get pluginName() {
        return 'VideoStyleUI';
    }

    get localizedDefaultStylesTitles() {
        const t = this.editor.t;

        return {
            'Wrap text': t( 'Wrap text' ),
            'Break text': t( 'Break text' ),
            'In line': t( 'In line' ),
            'Full size video': t( 'Full size video' ),
            'Side video': t( 'Side video' ),
            'Left aligned video': t( 'Left aligned video' ),
            'Centered video': t( 'Centered video' ),
            'Right aligned video': t( 'Right aligned video' )
        };
    }

    init() {
        const plugins = this.editor.plugins;
        const toolbarConfig = this.editor.config.get( 'video.toolbar' ) || [];

        const definedStyles = translateStyles(
            plugins.get( 'VideoStyleEditing' ).normalizedStyles,
            this.localizedDefaultStylesTitles
        );

        for ( const styleConfig of definedStyles ) {
            this._createButton( styleConfig );
        }

        const definedDropdowns = translateStyles(
            [ ...toolbarConfig.filter( isObject ), ...utils.getDefaultDropdownDefinitions( plugins ) ],
            this.localizedDefaultStylesTitles
        );

        for ( const dropdownConfig of definedDropdowns ) {
            this._createDropdown( dropdownConfig, definedStyles );
        }
    }

    _createDropdown( dropdownConfig, definedStyles ) {
        const factory = this.editor.ui.componentFactory;

        factory.add( dropdownConfig.name, locale => {
            let defaultButton;

            const { defaultItem, items, title } = dropdownConfig;
            const buttonViews = items
                .filter( itemName => definedStyles.find( ( { name } ) => getUIComponentName( name ) === itemName ) )
                .map( buttonName => {
                    const button = factory.create( buttonName );

                    if ( buttonName === defaultItem ) {
                        defaultButton = button;
                    }

                    return button;
                } );

            if ( items.length !== buttonViews.length ) {
                utils.warnInvalidStyle( { dropdown: dropdownConfig } );
            }

            const dropdownView = createDropdown( locale, SplitButtonView );
            const splitButtonView = dropdownView.buttonView;

            addToolbarToDropdown( dropdownView, buttonViews );

            splitButtonView.set( {
                label: getDropdownButtonTitle( title, defaultButton.label ),
                class: null,
                tooltip: true
            } );

            splitButtonView.bind( 'icon' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
                const index = areOn.findIndex( identity );

                return ( index < 0 ) ? defaultButton.icon : buttonViews[ index ].icon;
            } );

            splitButtonView.bind( 'label' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
                const index = areOn.findIndex( identity );

                return getDropdownButtonTitle( title, ( index < 0 ) ? defaultButton.label : buttonViews[ index ].label );
            } );

            splitButtonView.bind( 'isOn' ).toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) );

            splitButtonView.bind( 'class' )
                .toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) ? 'ck-splitbutton_flatten' : null );

            splitButtonView.on( 'execute', () => {
                if ( !buttonViews.some( ( { isOn } ) => isOn ) ) {
                    defaultButton.fire( 'execute' );
                } else {
                    dropdownView.isOpen = !dropdownView.isOpen;
                }
            } );

            dropdownView.bind( 'isEnabled' )
                .toMany( buttonViews, 'isEnabled', ( ...areEnabled ) => areEnabled.some( identity ) );

            return dropdownView;
        } );
    }

    _createButton( buttonConfig ) {
        const buttonName = buttonConfig.name;

        this.editor.ui.componentFactory.add( getUIComponentName( buttonName ), locale => {
            const command = this.editor.commands.get( 'videoStyle' );
            const view = new ButtonView( locale );

            view.set( {
                label: buttonConfig.title,
                icon: buttonConfig.icon,
                tooltip: true,
                isToggleable: true
            } );

            view.bind( 'isEnabled' ).to( command, 'isEnabled' );
            view.bind( 'isOn' ).to( command, 'value', value => value === buttonName );
            view.on( 'execute', this._executeCommand.bind( this, buttonName ) );

            return view;
        } );
    }

    _executeCommand( name ) {
        this.editor.execute( 'videoStyle', { value: name } );
        this.editor.editing.view.focus();
    }
}

function translateStyles( styles, titles ) {
    for ( const style of styles ) {
        if ( titles[ style.title ] ) {
            style.title = titles[ style.title ];
        }
    }

    return styles;
}

function getUIComponentName( name ) {
    return `videoStyle:${ name }`;
}

function getDropdownButtonTitle( dropdownTitle, buttonTitle ) {
    return ( dropdownTitle ? dropdownTitle + ': ' : '' ) + buttonTitle;
}
