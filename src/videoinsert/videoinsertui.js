import { Plugin } from 'ckeditor5/src/core';
import VideoInsertPanelView from './ui/videoinsertpanelview';
import { prepareIntegrations } from './utils';


export default class VideoInsertUI extends Plugin {
    static get pluginName() {
        return 'VideoInsertUI';
    }

    init() {
        const editor = this.editor;
        const componentCreator = locale => {
            return this._createDropdownView( locale );
        };


        editor.ui.componentFactory.add( 'insertVideo', componentCreator );
        editor.ui.componentFactory.add( 'videoInsert', componentCreator );
    }

    _createDropdownView( locale ) {
        const editor = this.editor;
        const videoInsertView = new VideoInsertPanelView( locale, prepareIntegrations( editor ) );
        const command = editor.commands.get( 'uploadVideo' );

        const dropdownView = videoInsertView.dropdownView;
        const splitButtonView = dropdownView.buttonView;

        splitButtonView.actionView = editor.ui.componentFactory.create( 'uploadVideo' );
        splitButtonView.actionView.extendTemplate( {
            attributes: {
                class: 'ck ck-button ck-splitbutton__action'
            }
        } );

        return this._setUpDropdown( dropdownView, videoInsertView, command );
    }

    _setUpDropdown( dropdownView, videoInsertView, command ) {
        const editor = this.editor;
        const t = editor.t;
        const insertButtonView = videoInsertView.insertButtonView;
        const insertVideoViaUrlForm = videoInsertView.getIntegration( 'insertVideoViaUrl' );
        const panelView = dropdownView.panelView;
        const videoUtils = this.editor.plugins.get( 'VideoUtils' );

        dropdownView.bind( 'isEnabled' ).to( command );

        dropdownView.buttonView.once( 'open', () => {
            panelView.children.add( videoInsertView );
        } );

        dropdownView.on( 'change:isOpen', () => {
            const selectedElement = editor.model.document.selection.getSelectedElement();

            if ( dropdownView.isOpen ) {
                videoInsertView.focus();

                if ( videoUtils.isVideo( selectedElement ) ) {
                    videoInsertView.videoURLInputValue = selectedElement.getAttribute( 'src' );
                    insertButtonView.label = t( 'Update' );
                    insertVideoViaUrlForm.label = t( 'Update video URL' );
                } else {
                    videoInsertView.videoURLInputValue = '';
                    insertButtonView.label = t( 'Insert' );
                    insertVideoViaUrlForm.label = t( 'Insert video via URL' );
                }
            }
        }, { priority: 'low' } );

        videoInsertView.delegate( 'submit', 'cancel' ).to( dropdownView );
        this.delegate( 'cancel' ).to( dropdownView );

        dropdownView.on( 'submit', () => {
            closePanel();
            onSubmit();
        } );

        dropdownView.on( 'cancel', () => {
            closePanel();
        } );

        function onSubmit() {
            const selectedElement = editor.model.document.selection.getSelectedElement();

            if ( videoUtils.isVideo( selectedElement ) ) {
                editor.model.change( writer => {
                    writer.setAttribute( 'src', videoInsertView.videoURLInputValue, selectedElement );
                    writer.removeAttribute( 'sizes', selectedElement );
                } );
            } else {
                editor.execute( 'insertVideo', { source: videoInsertView.videoURLInputValue } );
            }
        }

        function closePanel() {
            editor.editing.view.focus();
            dropdownView.isOpen = false;
        }

        return dropdownView;
    }
}
