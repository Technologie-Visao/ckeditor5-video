import Command from '@ckeditor/ckeditor5-core/src/command';
import { isVideo } from '../video/utils';

export default class VideoStyleCommand extends Command {
    constructor( editor, styles ) {
        super( editor );

        this.defaultStyle = false;

        this.styles = styles.reduce( ( styles, style ) => {
            styles[ style.name ] = style;

            if ( style.isDefault ) {
                this.defaultStyle = style.name;
            }

            return styles;
        }, {} );
    }

    refresh() {
        const element = this.editor.model.document.selection.getSelectedElement();

        this.isEnabled = isVideo( element );

        if ( !element ) {
            this.value = false;
        } else if ( element.hasAttribute( 'videoStyle' ) ) {
            const attributeValue = element.getAttribute( 'videoStyle' );
            this.value = this.styles[ attributeValue ] ? attributeValue : false;
        } else {
            this.value = this.defaultStyle;
        }
    }

    execute( options ) {
        const styleName = options.value;

        const model = this.editor.model;
        const videoElement = model.document.selection.getSelectedElement();

        model.change( writer => {
            // Default style means that there is no `videoStyle` attribute in the model.
            if ( this.styles[ styleName ].isDefault ) {
                writer.removeAttribute( 'videoStyle', videoElement );
            } else {
                writer.setAttribute( 'videoStyle', styleName, videoElement );
            }
        } );
    }
}
