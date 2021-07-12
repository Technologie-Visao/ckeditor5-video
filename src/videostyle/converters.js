import { first } from 'ckeditor5/src/utils';

export function modelToViewStyleAttribute( styles ) {
    return ( evt, data, conversionApi ) => {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        const newStyle = getStyleDefinitionByName( data.attributeNewValue, styles );
        const oldStyle = getStyleDefinitionByName( data.attributeOldValue, styles );

        const viewElement = conversionApi.mapper.toViewElement( data.item );
        const viewWriter = conversionApi.writer;

        if ( oldStyle ) {
            viewWriter.removeClass( oldStyle.className, viewElement );
        }

        if ( newStyle ) {
            viewWriter.addClass( newStyle.className, viewElement );
        }
    };
}

export function viewToModelStyleAttribute( styles ) {
    const nonDefaultStyles = {
        videoInline: styles.filter( style => !style.isDefault && style.modelElements.includes( 'videoInline' ) ),
        videoBlock: styles.filter( style => !style.isDefault && style.modelElements.includes( 'videoBlock' ) )
    };

    return ( evt, data, conversionApi ) => {
        if ( !data.modelRange ) {
            return;
        }

        const viewElement = data.viewItem;
        const modelVideoElement = first( data.modelRange.getItems() );

        if ( !modelVideoElement ) {
            return;
        }

        for ( const style of nonDefaultStyles[ modelVideoElement.name ] ) {
            if ( conversionApi.consumable.consume( viewElement, { classes: style.className } ) ) {
                conversionApi.writer.setAttribute( 'videoStyle', style.name, modelVideoElement );
            }
        }
    };
}

function getStyleDefinitionByName( name, styles ) {
    for ( const style of styles ) {
        if ( style.name === name ) {
            return style;
        }
    }
}
