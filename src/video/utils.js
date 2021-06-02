import { findOptimalInsertionPosition, checkSelectionOnObject, isWidget, toWidget } from 'ckeditor5/src/widget';

export function toVideoWidget( viewElement, writer) {
	writer.setCustomProperty( 'video', true, viewElement );

	return toWidget( viewElement, writer, {} );
}

export function isVideoWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'video' ) && isWidget( viewElement );
}

export function getSelectedVideoWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isVideoWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

export function isVideo( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'video' );
}

export function insertVideo( model, attributes = {}, insertPosition = null ) {
	model.change( writer => {
		const videoElement = writer.createElement( 'video', attributes );

		const insertAtSelection = insertPosition || findOptimalInsertionPosition( model.document.selection, model );

		model.insertContent( videoElement, insertAtSelection );

		if ( videoElement.parent ) {
			writer.setSelection( videoElement, 'on' );
		}
	} );
}

export function isVideoAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isVideoAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema ) &&
		isInOtherVideo( selection );
}

export function getViewVideoFromWidget( figureView ) {
	const figureChildren = [];

	for ( const figureChild of figureView.getChildren() ) {
		figureChildren.push( figureChild );

		if ( figureChild.is( 'element' ) ) {
			figureChildren.push( ...figureChild.getChildren() );
		}
	}

	return figureChildren.find( viewChild => viewChild.is( 'element', 'video' ) );
}

function isVideoAllowedInParent( selection, schema, model ) {
	const parent = getInsertVideoParent( selection, model );

	return schema.checkChild( parent, 'video' );
}

function isInOtherVideo( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'video' ) );
}

function getInsertVideoParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
