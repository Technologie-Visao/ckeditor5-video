CKEditor 5 video feature
========================================

[![npm version](https://badge.fury.io/js/%40visao%2Fckeditor5-video.svg)](https://www.npmjs.com/package/@visao/ckeditor5-video)

This package implements the video feature for CKEditor 5. The feature is introduced in a granular form implemented by a couple of plugins.
It was strongly inspired from the ckeditor5-image package.

## Demo

- See `sample/app.js`

## Documentation

## Installation
Add this to your custom build or inside your project.

- With npm

`npm install --save-dev @visao/ckeditor5-video`


-With yarn

`yarn add -D @visao/@visao/ckeditor5-video    `
- Works pretty much just like Image upload. 

## Plugins

#### Video Plugin 
- Plugin to parse videos in the editor
- Mandatory for the other plugins VideoRelated plugins
    
```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [Video],
        video: {}
    } )

```

#### VideoUpload Plugin 
- Plugin to upload video files via toolbar upload prompt or drag and drop functionalities 
- Specify allowed media(mime) types. Default => `['mp4', 'webm', 'ogg']`
- Allow multiple file upload or not, Default => `true`
- Add the `videoUpload` toolbar option to access the file repository 
- Must provide an `UploadAdapter`. 
See [ckeditor5 documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/upload-adapter.html)
- The use of the Video plugin is mandatory for this plugin to work
    
```
function VideoUploadAdapterPlugin( editor ) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new VideoUploadAdapter(loader);
    };
}

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [Video, VideoUpload],
        extraPlugins: [VideoUploadAdapterPlugin],
        toolbar: ['videoUpload'],
        video: {
            upload: {
                types: ['mp4'],
                allowMultipleFiles: false,
            }
        }
    } )
```

#### VideoToolbar Plugin
- Balloon toolbar for different Video plugin plugins
- See VideoResizing and VideoStyle sections for examples

#### VideoResizing Plugin 
- Plugin for resizing the video in the editor
- Should work just like image resize. See the ck-editor 5 documentation for more examples.
```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [Video, VideoToolbar, VideoResize] or [Video, VideoToolbar, VideoResizeEditing, VideoResizeHandles],
        video: {
            resizeUnit: 'px'
            // Configure the available video resize options.
            resizeOptions: [
                {
                    name: 'videoResize:original',
                    value: null,
                    label: 'Original',
                    icon: 'original'
                },
                {
                    name: 'videoResize:50',
                    value: 50,
                    label: '50',
                    icon: 'medium'
                },
                {
                    name: 'videoResize:75',
                    value: '75',
                    label: '75',
                    icon: 'large'
                }
            ],
            toolbar: [
                'videoResize',
                '|',
                'videoResize:50',
                'videoResize:75',
                'videoResize:original'
            ]
        },
    } )
```

#### VideoStyle Plugin
- Plugin for styling the video plugins.
- Should work just like image resize. See the ck-editor 5 documentation for more examples.
- Predefined styles are:
  - `full`
  - `side`
  - `alignLeft`
  - `alignCenter`
  - `alignRight`
```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [Video, VideoToolbar, VideoStyle]
        video: {
            styles: [
                'alignLeft', 'alignCenter', 'alignRight'
            ],
            toolbar: ['videoStyle:alignLeft', 'videoStyle:alignCenter', 'videoStyle:alignRight']
        },
    } )
```
  


## License

Licensed under the terms of 
[GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, 
please check the `LICENSE.md` file.
