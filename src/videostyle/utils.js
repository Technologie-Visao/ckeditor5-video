import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

const defaultStyles = {
    // This option is equal to the situation when no style is applied.
    full: {
        name: 'full',
        title: 'Full size video',
        icon: fullWidthIcon,
        isDefault: true
    },

    // This represents a side video.
    side: {
        name: 'side',
        title: 'Side video',
        icon: rightIcon,
        className: 'video-style-side'
    },

    // This style represents an video aligned to the left.
    alignLeft: {
        name: 'alignLeft',
        title: 'Left aligned video',
        icon: leftIcon,
        className: 'video-style-align-left'
    },

    // This style represents a centered video.
    alignCenter: {
        name: 'alignCenter',
        title: 'Centered video',
        icon: centerIcon,
        className: 'video-style-align-center'
    },

    // This style represents an video aligned to the right.
    alignRight: {
        name: 'alignRight',
        title: 'Right aligned video',
        icon: rightIcon,
        className: 'video-style-align-right'
    }
};

const defaultIcons = {
    full: fullWidthIcon,
    left: leftIcon,
    right: rightIcon,
    center: centerIcon
};

export function normalizeVideoStyles( configuredStyles = [] ) {
    return configuredStyles.map( _normalizeStyle );
}

function _normalizeStyle( style ) {
    // Just the name of the style has been passed.
    if ( typeof style == 'string' ) {
        const styleName = style;

        // If it's one of the defaults, just use it.
        if ( defaultStyles[ styleName ] ) {
            // Clone the style to avoid overriding defaults.
            style = Object.assign( {}, defaultStyles[ styleName ] );
        }
        // If it's just a name but none of the defaults, warn because probably it's a mistake.
        else {
            logWarning( 'image-style-not-found', { name: styleName } );

            // Normalize the style anyway to prevent errors.
            style = {
                name: styleName
            };
        }
    }
    // If an object style has been passed and if the name matches one of the defaults,
    // extend it with defaults – the user wants to customize a default style.
    // Note: Don't override the user–defined style object, clone it instead.
    else if ( defaultStyles[ style.name ] ) {
        const defaultStyle = defaultStyles[ style.name ];
        const extendedStyle = Object.assign( {}, style );

        for ( const prop in defaultStyle ) {
            if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
                extendedStyle[ prop ] = defaultStyle[ prop ];
            }
        }

        style = extendedStyle;
    }

    // If an icon is defined as a string and correspond with a name
    // in default icons, use the default icon provided by the plugin.
    if ( typeof style.icon == 'string' && defaultIcons[ style.icon ] ) {
        style.icon = defaultIcons[ style.icon ];
    }

    return style;
}
