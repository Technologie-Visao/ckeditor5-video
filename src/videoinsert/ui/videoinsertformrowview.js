import { View } from 'ckeditor5/src/ui';

import '../../../theme/videoinsertformrowview.css';

export default class videoUploadFormRowView extends View {
    constructor( locale, options = {} ) {
        super( locale );

        const bind = this.bindTemplate;

        this.set( 'class', options.class || null );

        this.children = this.createCollection();

        if ( options.children ) {
            options.children.forEach( child => this.children.add( child ) );
        }

        this.set( '_role', null );

        this.set( '_ariaLabelledBy', null );

        if ( options.labelView ) {
            this.set( {
                _role: 'group',
                _ariaLabelledBy: options.labelView.id
            } );
        }

        this.setTemplate( {
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-form__row',
                    bind.to( 'class' )
                ],
                role: bind.to( '_role' ),
                'aria-labelledby': bind.to( '_ariaLabelledBy' )
            },
            children: this.children
        } );
    }
}
