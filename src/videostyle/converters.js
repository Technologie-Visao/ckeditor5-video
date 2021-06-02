import { first } from 'ckeditor5/src/utils';

export function modelToViewStyleAttribute( styles ) {
    return ( evt, data, conversionApi ) => {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        const newStyle = getStyleByName( data.attributeNewValue, styles );
        const oldStyle = getStyleByName( data.attributeOldValue, styles );

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
    const filteredStyles = styles.filter( style => !style.isDefault );

    return ( evt, data, conversionApi ) => {
        if ( !data.modelRange ) {
            return;
        }

        const viewFigureElement = data.viewItem;
        const modelVideoElement = first( data.modelRange.getItems() );

        if ( modelVideoElement && !conversionApi.schema.checkAttribute( modelVideoElement, 'videoStyle' ) ) {
            return;
        }

        for ( const style of filteredStyles ) {
            if ( conversionApi.consumable.consume( viewFigureElement, { classes: style.className } ) ) {
                conversionApi.writer.setAttribute( 'videoStyle', style.name, modelVideoElement );
            }
        }
    };
}

function getStyleByName( name, styles ) {
    for ( const style of styles ) {
        if ( style.name === name ) {
            return style;
        }
    }
}
