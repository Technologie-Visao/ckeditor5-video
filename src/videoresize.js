import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import '../theme/videoresize.css';
import VideoResizeEditing from "./videoresize/videoresizeediting";
import VideoResizeHandles from "./videoresize/videoresizehandles";
import VideoResizeButtons from "./videoresize/videoresizebuttons";

export default class VideoResize extends Plugin {
    static get requires() {
        return [ VideoResizeEditing, VideoResizeHandles, VideoResizeButtons ];
    }

    static get pluginName() {
        return 'VideoResize';
    }
}

/**
 * The available options are `'px'` or `'%'`.
 *
 * Determines the size unit applied to the resized video.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					resizeUnit: 'px'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *
 *
 */

/**
 * The video resize options.
 *
 * Each option should have at least these two properties:
 *
 * * name: The name of the UI component registered in the global
 * representing the button a user can click to change the size of an video,
 * * value: An actual video width applied when a user clicks the mentioned button
 * For instance: `value: '50'` and `resizeUnit: '%'` will render as `'50%'` in the UI.
 *
 * **Resetting the video size**
 *
 * If you want to set an option that will reset video to its original size, you need to pass a `null` value
 * to one of the options. The `:original` token is not mandatory, you can call it anything you wish, but it must reflect
 * in the standalone buttons configuration for the video toolbar.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'videoResize:original',
 *						value: null
 *					},
 *					{
 *						name: 'videoResize:50',
 *						value: '50'
 *					},
 *					{
 *						name: 'videoResize:75',
 *						value: '75'
 *					} ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * **Resizing videos using a dropdown**
 *
 * With resize options defined, you can decide whether you want to display them as a dropdown or as standalone buttons.
 * For the dropdown, you need to pass only the `videoResize` token to the
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'videoResize:original',
 *						value: null
 *					},
 *					{
 *						name: 'videoResize:50',
 *						value: '50'
 *					},
 *					{
 *						name: 'videoResize:75',
 *						value: '75'
 *					} ],
 *					toolbar: [ 'videoResize', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * **Resizing videos using individual buttons**
 *
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'videoResize:original',
 *						value: null,
 *						icon: 'original'
 *					},
 *					{
 *						name: 'videoResize:25',
 *						value: '25',
 *						icon: 'small'
 *					},
 *					{
 *						name: 'videoResize:50',
 *						value: '50',
 *						icon: 'medium'
 *					},
 *					{
 *						name: 'videoResize:75',
 *						value: '75',
 *						icon: 'large'
 *					} ],
 *					toolbar: [ 'videoResize:25', 'videoResize:50', 'videoResize:75', 'videoResize:original', ... ],
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * **Customizing resize button labels**
 *
 * You can set your own label for each resize button. To do that, add the `label` property like in the example below.
 *
 * * When using the **dropdown**, the labels are displayed on the list of all options when you open the dropdown.
 * * When using **standalone buttons**, the labels will are displayed as tooltips when a user hovers over the button.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					resizeUnit: "%",
 *					resizeOptions: [ {
 *						name: 'videoResize:original',
 *						value: null,
 *						label: 'Original size'
 *						// Note: add the "icon" property if you're configuring a standalone button.
 *					},
 *					{
 *						name: 'videoResize:50',
 *						value: '50',
 *						label: 'Medium size'
 *						// Note: add the "icon" property if you're configuring a standalone button.
 *					},
 *					{
 *						name: 'videoResize:75',
 *						value: '75',
 *						label: 'Large size'
 *						// Note: add the "icon" property if you're configuring a standalone button.
 *					} ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * **Default value**
 *
 * The following configuration is used by default:
 *
 *		resizeOptions = [
 *			{
 *				name: 'videoResize:original',
 *				value: null,
 *				icon: 'original'
 *			},
 *			{
 *				name: 'videoResize:25',
 *				value: '25',
 *				icon: 'small'
 *			},
 *			{
 *				name: 'videoResize:50',
 *				value: '50',
 *				icon: 'medium'
 *			},
 *			{
 *				name: 'videoResize:75',
 *				value: '75',
 *				icon: 'large'
 *			}
 *		];
 *
 */
