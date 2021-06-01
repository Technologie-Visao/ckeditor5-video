import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView, DropdownButtonView, Model, createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import { CKEditorError, Collection } from 'ckeditor5/src/utils';
import VideoResizeEditing from "./videoresizeediting";

const RESIZE_ICONS = {
	small: icons.objectSizeSmall,
	medium: icons.objectSizeMedium,
	large: icons.objectSizeLarge,
	original: icons.objectSizeFull
};

export default class VideoResizeButtons extends Plugin {
	static get requires() {
		return [ VideoResizeEditing ];
	}

	static get pluginName() {
		return 'VideoResizeButtons';
	}

	constructor( editor ) {
		super( editor );

		this._resizeUnit = editor.config.get( 'video.resizeUnit' );
	}

	init() {
		const editor = this.editor;
		const options = editor.config.get( 'video.resizeOptions' );
		const command = editor.commands.get( 'resizeVideo' );

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._registerVideoResizeButton( option );
		}

		this._registerVideoResizeDropdown( options );
	}

	_registerVideoResizeButton( option ) {
		const editor = this.editor;
		const { name, value, icon } = option;
		const optionValueWithUnit = value ? value + this._resizeUnit : null;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( 'resizeVideo' );
			const labelText = this._getOptionLabelValue( option, true );

			if ( !RESIZE_ICONS[ icon ] ) {
				throw new CKEditorError(
					'videoresizebuttons-missing-icon',
					editor,
					option
				);
			}

			button.set( {
				// Use the `label` property for a verbose description (because of ARIA).
				label: labelText,
				icon: RESIZE_ICONS[ icon ],
				tooltip: labelText,
				isToggleable: true
			} );

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( this );
			button.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( optionValueWithUnit ) );

			this.listenTo( button, 'execute', () => {
				editor.execute( 'resizeVideo', { width: optionValueWithUnit } );
			} );

			return button;
		} );
	}

	_registerVideoResizeDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const originalSizeOption = options.find( option => !option.value );

		// Register dropdown.
		const componentCreator = locale => {
			const command = editor.commands.get( 'resizeVideo' );
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton = dropdownView.buttonView;

			dropdownButton.set( {
				tooltip: t( 'Resize video' ),
				commandValue: originalSizeOption.value,
				icon: RESIZE_ICONS.medium,
				isToggleable: true,
				label: this._getOptionLabelValue( originalSizeOption ),
				withText: true,
				class: 'ck-resize-video-button'
			} );

			dropdownButton.bind( 'label' ).to( command, 'value', commandValue => {
				if ( commandValue && commandValue.width ) {
					return commandValue.width;
				} else {
					return this._getOptionLabelValue( originalSizeOption );
				}
			} );
			dropdownView.bind( 'isOn' ).to( command );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, this._getResizeDropdownListItemDefinitions( options, command ) );

			dropdownView.listView.ariaLabel = t( 'Video resize list' );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, { width: evt.source.commandValue } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		};

		editor.ui.componentFactory.add( 'resizeVideo', componentCreator );
		editor.ui.componentFactory.add( 'videoResize', componentCreator );
	}

	_getOptionLabelValue( option, forTooltip ) {
		const t = this.editor.t;

		if ( option.label ) {
			return option.label;
		} else if ( forTooltip ) {
			if ( option.value ) {
				return t( 'Resize video to %0', option.value + this._resizeUnit );
			} else {
				return t( 'Resize video to the original size' );
			}
		} else {
			if ( option.value ) {
				return option.value + this._resizeUnit;
			} else {
				return t( 'Original' );
			}
		}
	}

	_getResizeDropdownListItemDefinitions( options, command ) {
		const itemDefinitions = new Collection();

		options.map( option => {
			const optionValueWithUnit = option.value ? option.value + this._resizeUnit : null;
			const definition = {
				type: 'button',
				model: new Model( {
					commandName: 'resizeVideo',
					commandValue: optionValueWithUnit,
					label: this._getOptionLabelValue( option ),
					withText: true,
					icon: null
				} )
			};

			definition.model.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( optionValueWithUnit ) );

			itemDefinitions.add( definition );
		} );

		return itemDefinitions;
	}
}

function getIsOnButtonCallback( value ) {
	return commandValue => {
		if ( value === null && commandValue === value ) {
			return true;
		}

		return commandValue && commandValue.width === value;
	};
}
