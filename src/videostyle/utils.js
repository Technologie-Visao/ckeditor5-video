import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
    objectFullWidth,
    objectInline,
    objectLeft,	objectRight, objectCenter,
    objectBlockLeft, objectBlockRight
} = icons;

const DEFAULT_OPTIONS = {
    inline: {
        name: 'inline',
        title: 'In line',
        icon: objectInline,
        modelElements: [ 'videoInline' ],
        isDefault: true
    },

    alignLeft: {
        name: 'alignLeft',
        title: 'Left aligned video',
        icon: objectLeft,
        modelElements: [ 'videoBlock', 'videoInline' ],
        className: 'video-style-align-left'
    },

    alignBlockLeft: {
        name: 'alignBlockLeft',
        title: 'Left aligned video',
        icon: objectBlockLeft,
        modelElements: [ 'videoBlock' ],
        className: 'video-style-block-align-left'
    },

    alignCenter: {
        name: 'alignCenter',
        title: 'Centered video',
        icon: objectCenter,
        modelElements: [ 'videoBlock' ],
        className: 'video-style-align-center'
    },

    alignRight: {
        name: 'alignRight',
        title: 'Right aligned video',
        icon: objectRight,
        modelElements: [ 'videoBlock', 'videoInline' ],
        className: 'video-style-align-right'
    },

    alignBlockRight: {
        name: 'alignBlockRight',
        title: 'Right aligned video',
        icon: objectBlockRight,
        modelElements: [ 'videoBlock' ],
        className: 'video-style-block-align-right'
    },

    block: {
        name: 'block',
        title: 'Centered video',
        icon: objectCenter,
        modelElements: [ 'videoBlock' ],
        isDefault: true
    },

    side: {
        name: 'side',
        title: 'Side video',
        icon: objectRight,
        modelElements: [ 'videoBlock' ],
        className: 'video-style-side'
    }
};

const DEFAULT_ICONS = {
    full: objectFullWidth,
    left: objectBlockLeft,
    right: objectBlockRight,
    center: objectCenter,
    inlineLeft: objectLeft,
    inlineRight: objectRight,
    inline: objectInline
};

const DEFAULT_DROPDOWN_DEFINITIONS = [ {
    name: 'videoStyle:wrapText',
    title: 'Wrap text',
    defaultItem: 'videoStyle:alignLeft',
    items: [ 'videoStyle:alignLeft', 'videoStyle:alignRight' ]
}, {
    name: 'videoStyle:breakText',
    title: 'Break text',
    defaultItem: 'videoStyle:block',
    items: [ 'videoStyle:alignBlockLeft', 'videoStyle:block', 'videoStyle:alignBlockRight' ]
} ];

function normalizeStyles( config ) {
    const configuredStyles = config.configuredStyles.options || [];

    const styles = configuredStyles
        .map( arrangement => normalizeDefinition( arrangement ) )
        .filter( arrangement => isValidOption( arrangement, config ) );

    return styles;
}

function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
    if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
        return {
            options: [
                'inline', 'alignLeft', 'alignRight',
                'alignCenter', 'alignBlockLeft', 'alignBlockRight',
                'block', 'side'
            ]
        };
    } else if ( isBlockPluginLoaded ) {
        return {
            options: [ 'block', 'side' ]
        };
    } else if ( isInlinePluginLoaded ) {
        return {
            options: [ 'inline', 'alignLeft', 'alignRight' ]
        };
    }

    return {};
}

function getDefaultDropdownDefinitions( pluginCollection ) {
    if ( pluginCollection.has( 'VideoBlockEditing' ) && pluginCollection.has( 'VideoInlineEditing' ) ) {
        return [ ...DEFAULT_DROPDOWN_DEFINITIONS ];
    } else {
        return [];
    }
}

function normalizeDefinition( definition ) {
    if ( typeof definition === 'string' ) {
        if ( !DEFAULT_OPTIONS[ definition ] ) {
            definition = { name: definition };
        }
        else {
            definition = { ...DEFAULT_OPTIONS[ definition ] };
        }
    } else {
        definition = extendStyle( DEFAULT_OPTIONS[ definition.name ], definition );
    }

    if ( typeof definition.icon === 'string' ) {
        definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
    }

    return definition;
}

function isValidOption( option, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
    const { modelElements, name } = option;

    if ( !modelElements || !modelElements.length || !name ) {
        warnInvalidStyle( { style: option } );

        return false;
    } else {
        const supportedElements = [ isBlockPluginLoaded ? 'videoBlock' : null, isInlinePluginLoaded ? 'videoInline' : null ];

        if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
            logWarning( 'video-style-missing-dependency', {
                style: option,
                missingPlugins: modelElements.map( name => name === 'videoBlock' ? 'VideoBlockEditing' : 'VideoInlineEditing' )
            } );

            return false;
        }
    }

    return true;
}

function extendStyle( source, style ) {
    const extendedStyle = { ...style };

    for ( const prop in source ) {
        if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
            extendedStyle[ prop ] = source[ prop ];
        }
    }

    return extendedStyle;
}

function warnInvalidStyle( info ) {
    logWarning( 'video-style-configuration-definition-invalid', info );
}

export default {
    normalizeStyles,
    getDefaultStylesConfiguration,
    getDefaultDropdownDefinitions,
    warnInvalidStyle,
    DEFAULT_OPTIONS,
    DEFAULT_ICONS,
    DEFAULT_DROPDOWN_DEFINITIONS
};
