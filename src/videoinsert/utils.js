import { LabeledFieldView, createLabeledInputText } from 'ckeditor5/src/ui';

export function prepareIntegrations( editor ) {
    const panelItems = editor.config.get( 'video.insert.integrations' );
    const videoInsertUIPlugin = editor.plugins.get( 'VideoInsertUI' );

    const PREDEFINED_INTEGRATIONS = {
        'insertVideoViaUrl': createLabeledInputView( editor.locale )
    };

    if ( !panelItems ) {
        return PREDEFINED_INTEGRATIONS;
    }

    // Prepares ckfinder component for the `openCKFinder` integration token.
    if ( panelItems.find( item => item === 'openCKFinder' ) && editor.ui.componentFactory.has( 'ckfinder' ) ) {
        const ckFinderButton = editor.ui.componentFactory.create( 'ckfinder' );
        ckFinderButton.set( {
            withText: true,
            class: 'ck-video-insert__ck-finder-button'
        } );

        // We want to close the dropdown panel view when user clicks the ckFinderButton.
        ckFinderButton.delegate( 'execute' ).to( videoInsertUIPlugin, 'cancel' );

        PREDEFINED_INTEGRATIONS.openCKFinder = ckFinderButton;
    }

    return panelItems.reduce( ( object, key ) => {
        if ( PREDEFINED_INTEGRATIONS[ key ] ) {
            object[ key ] = PREDEFINED_INTEGRATIONS[ key ];
        } else if ( editor.ui.componentFactory.has( key ) ) {
            object[ key ] = editor.ui.componentFactory.create( key );
        }

        return object;
    }, {} );
}

export function createLabeledInputView( locale ) {
    const t = locale.t;
    const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

    labeledInputView.set( {
        label: t( 'Insert video via URL' )
    } );
    labeledInputView.fieldView.placeholder = 'https://example.com/video.mp4';

    return labeledInputView;
}
