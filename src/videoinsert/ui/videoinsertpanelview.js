import { icons } from 'ckeditor5/src/core';
import { ButtonView, View, SplitButtonView, ViewCollection, submitHandler, createDropdown, FocusCycler } from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

import VideoInsertFormRowView from './videoinsertformrowview';

import '../../../theme/videoinsert.css';


export default class VideoInsertPanelView extends View {
    constructor( locale, integrations ) {
        super( locale );

        const { insertButtonView, cancelButtonView } = this._createActionButtons( locale );

        this.insertButtonView = insertButtonView;

        this.cancelButtonView = cancelButtonView;

        this.dropdownView = this._createDropdownView( locale );

        this.set( 'videoURLInputValue', '' );

        this.focusTracker = new FocusTracker();

        this.keystrokes = new KeystrokeHandler();

        this._focusables = new ViewCollection();

        this._focusCycler = new FocusCycler( {
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',

                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        } );

        this.set( '_integrations', new Collection() );

        if ( integrations ) {
            for ( const [ integration, integrationView ] of Object.entries( integrations ) ) {
                if ( integration === 'insertVideoViaUrl' ) {
                    integrationView.fieldView.bind( 'value' ).to( this, 'videoURLInputValue', value => value || '' );

                    integrationView.fieldView.on( 'input', () => {
                        this.videoURLInputValue = integrationView.fieldView.element.value.trim();
                    } );
                }

                integrationView.name = integration;

                this._integrations.add( integrationView );
            }
        }

        this.setTemplate( {
            tag: 'form',

            attributes: {
                class: [
                    'ck',
                    'ck-video-insert-form'
                ],

                tabindex: '-1'
            },

            children: [
                ...this._integrations,
                new VideoInsertFormRowView( locale, {
                    children: [
                        this.insertButtonView,
                        this.cancelButtonView
                    ],
                    class: 'ck-video-insert-form__action-row'
                } )
            ]
        } );
    }

    render() {
        super.render();

        submitHandler( {
            view: this
        } );

        const childViews = [
            ...this._integrations,
            this.insertButtonView,
            this.cancelButtonView
        ];

        childViews.forEach( v => {
            // Register the view as focusable.
            this._focusables.add( v );

            // Register the view in the focus tracker.
            this.focusTracker.add( v.element );
        } );

        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo( this.element );

        const stopPropagation = data => data.stopPropagation();

        // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
        // keystroke handler would take over the key management in the URL input. We need to prevent
        // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
        this.keystrokes.set( 'arrowright', stopPropagation );
        this.keystrokes.set( 'arrowleft', stopPropagation );
        this.keystrokes.set( 'arrowup', stopPropagation );
        this.keystrokes.set( 'arrowdown', stopPropagation );

        // Intercept the "selectstart" event, which is blocked by default because of the default behavior
        // of the DropdownView#panelView.
        // TODO: blocking "selectstart" in the #panelView should be configurable per–drop–down instance.
        this.listenTo( childViews[ 0 ].element, 'selectstart', ( evt, domEvt ) => {
            domEvt.stopPropagation();
        }, { priority: 'high' } );
    }

    getIntegration( name ) {
        return this._integrations.find( integration => integration.name === name );
    }

    _createDropdownView( locale ) {
        const t = locale.t;
        const dropdownView = createDropdown( locale, SplitButtonView );
        const splitButtonView = dropdownView.buttonView;
        const panelView = dropdownView.panelView;

        splitButtonView.set( {
            label: t( 'Insert video' ),
            icon: icons.image,
            tooltip: true
        } );

        panelView.extendTemplate( {
            attributes: {
                class: 'ck-video-insert__panel'
            }
        } );

        return dropdownView;
    }

    _createActionButtons( locale ) {
        const t = locale.t;
        const insertButtonView = new ButtonView( locale );
        const cancelButtonView = new ButtonView( locale );

        insertButtonView.set( {
            label: t( 'Insert' ),
            icon: icons.check,
            class: 'ck-button-save',
            type: 'submit',
            withText: true,
            isEnabled: this.videoURLInputValue
        } );

        cancelButtonView.set( {
            label: t( 'Cancel' ),
            icon: icons.cancel,
            class: 'ck-button-cancel',
            withText: true
        } );

        insertButtonView.bind( 'isEnabled' ).to( this, 'videoURLInputValue', value => !!value );
        insertButtonView.delegate( 'execute' ).to( this, 'submit' );
        cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

        return { insertButtonView, cancelButtonView };
    }

    focus() {
        this._focusCycler.focusFirst();
    }
}
