export function createVideoMediaTypeRegExp(types) {
    const regExpSafeNames = types.map(type => type.replace('+', '\\+'));
    return new RegExp(`^video\\/(${regExpSafeNames.join('|')})$`);
}

export function isHtmlIncluded( dataTransfer ) {
    return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}

export function fetchLocalVideo( video ) {
    return new Promise( ( resolve, reject ) => {
        const videoSrc = video.getAttribute( 'src' );

        // Fetch works asynchronously and so does not block browser UI when processing data.
        fetch( videoSrc )
            .then( resource => resource.blob() )
            .then( blob => {
                const mimeType = getVideoMimeType( blob, videoSrc );
                const ext = mimeType.replace( 'video/', '' );
                const filename = `video.${ ext }`;
                const file = new File( [ blob ], filename, { type: mimeType } );

                resolve( file );
            } )
            .catch( reject );
    } );
}

export function isLocalVideo( node ) {
    if ( !node.is( 'element', 'video' ) || !node.getAttribute( 'src' ) ) {
        return false;
    }

    return node.getAttribute( 'src' ).match( /^data:video\/\w+;base64,/g ) ||
        node.getAttribute( 'src' ).match( /^blob:/g );
}

function getVideoMimeType( blob, src ) {
    if ( blob.type ) {
        return blob.type;
    } else if ( src.match( /data:(video\/\w+);base64/ ) ) {
        return src.match( /data:(video\/\w+);base64/ )[ 1 ].toLowerCase();
    } else {
        // Fallback to 'mp4' as common extension.
        return 'video/mp4';
    }
}

export function getVideosFromChangeItem( editor, item ) {
    return Array.from( editor.model.createRangeOn( item ) )
        .filter( value => value.item.is( 'element', 'video' ) )
        .map( value => value.item );
}
