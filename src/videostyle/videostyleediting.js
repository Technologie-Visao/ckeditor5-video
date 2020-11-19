import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoStyleCommand from './videostylecommand';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import { normalizeVideoStyles } from './utils';

export default class VideoStyleEditing extends Plugin {
    static get pluginName() {
        return 'VideoStyleEditing';
    }
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const data = editor.data;
        const editing = editor.editing;

        // Define default configuration.
        editor.config.define( 'video.styles', [ 'full', 'side' ] );

        // Get configuration.
        const styles = normalizeVideoStyles( editor.config.get( 'video.styles' ) );

        // Allow videoStyle attribute in video.
        schema.extend( 'video', { allowAttributes: 'videoStyle' } );

        // Converters for videoStyle attribute from model to view.
        const modelToViewConverter = modelToViewStyleAttribute( styles );
        editing.downcastDispatcher.on( 'attribute:videoStyle:video', modelToViewConverter );
        data.downcastDispatcher.on( 'attribute:videoStyle:video', modelToViewConverter );

        // Converter for figure element from view to model.
        data.upcastDispatcher.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );

        // Register videoStyle command.
        editor.commands.add( 'videoStyle', new VideoStyleCommand( editor, styles ) );
    }
}
