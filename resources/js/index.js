document.addEventListener('alpine:init', () => {
    Alpine.data(
        "grapesjs",
        ({ state, statePath, readOnly, tools, minHeight, container, plugins, settings }) => ({
            instance: null,
            state: state,
            tools: tools,
            plugins: plugins,
            settings: settings,
            init() {
                let enabledTools = {};

                let allSettings = {
                    height: minHeight + 'px',
                    container: container ? container : ".filament-grapesjs .grapesjs-wrapper",
                    showOffsets: true,
                    fromElement: true,
                    noticeOnUnload: false,
                    storageManager: false,
                    loadHtml: state,
                    plugins: plugins,
                    ...settings
                }
                this.instance =  grapesjs.init( allSettings );

                var pn = this.instance.Panels;
                var modal = this.instance.Modal;
                var cmdm = this.instance.Commands;

                cmdm.add('canvas-clear', function() {
                    if(confirm('Are you sure to clean the canvas?')) {
                        this.instance.runCommand('core:canvas-clear')
                        setTimeout(function(){ localStorage.clear()}, 0)
                    }
                });

                // Add info command
                var mdlClass = 'gjs-mdl-dialog-sm';
                var infoContainer = document.getElementById('info-panel');

                cmdm.add('open-info', function() {
                    var mdlDialog = document.querySelector('.gjs-mdl-dialog');
                    mdlDialog.className += ' ' + mdlClass;
                    infoContainer.style.display = 'block';
                    modal.setTitle('About this demo');
                    modal.setContent(infoContainer);
                    modal.open();
                    modal.getModel().once('change:open', function() {
                        mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
                    })
                });

                pn.addButton('options', {
                    id: 'open-info',
                    className: 'fa fa-question-circle',
                    command: function() { this.instance.runCommand('open-info') },
                    attributes: {
                        'title': 'About',
                        'data-tooltip-pos': 'bottom',
                    },
                });

                [['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
                    ['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
                    ['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']]
                    .forEach(function(item) {
                        pn.getButton('options', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
                    });
                [['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
                    .forEach(function(item) {
                        pn.getButton('views', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
                    });
                var titles = document.querySelectorAll('*[title]');

                for (var i = 0; i < titles.length; i++) {
                    var el = titles[i];
                    var title = el.getAttribute('title');
                    title = title ? title.trim(): '';
                    if(!title)
                        break;
                    el.setAttribute('data-tooltip', title);
                    el.setAttribute('title', '');
                }


                // Store and load events
                this.instance.on('storage:load', function(e) { console.log('Loaded ', e) });
                this.instance.on('storage:store', function(e) { console.log('Stored ', e) });

                this.instance.on('load', function() {
                    var $ = grapesjs.$;

                    // Show borders by default
                    pn.getButton('options', 'sw-visibility').set({
                        command: 'core:component-outline',
                        'active': true,
                    });

                    // Load and show settings and style manager
                    var openTmBtn = pn.getButton('views', 'open-tm');
                    openTmBtn && openTmBtn.set('active', 1);
                    var openSm = pn.getButton('views', 'open-sm');
                    openSm && openSm.set('active', 1);

                    // Remove trait view
                    pn.removeButton('views', 'open-tm');

                    // Add Settings Sector
                    var traitsSector = $('<div class="gjs-sm-sector no-select">'+
                        '<div class="gjs-sm-sector-title"><span class="icon-settings fa fa-cog"></span> <span class="gjs-sm-sector-label">Settings</span></div>' +
                        '<div class="gjs-sm-properties" style="display: none;"></div></div>');
                    var traitsProps = traitsSector.find('.gjs-sm-properties');
                    traitsProps.append($('.gjs-traits-cs'));
                    $('.gjs-sm-sectors').before(traitsSector);
                    traitsSector.find('.gjs-sm-sector-title').on('click', function(){
                        var traitStyle = traitsProps.get(0).style;
                        var hidden = traitStyle.display == 'none';
                        if (hidden) {
                            traitStyle.display = 'block';
                        } else {
                            traitStyle.display = 'none';
                        }
                    });

                    // Open block manager
                    var openBlocksBtn = this.instance.Panels.getButton('views', 'open-blocks');
                    openBlocksBtn && openBlocksBtn.set('active', 1);
                });

                this.instance.on('update', e => {
                    var content = this.instance.getHtml({
                        cleanId: true
                    });
                    var extract = content.match(/<body\b[^>]*>([\s\S]*?)<\/body>/);
                    if(extract)
                        this.state = extract[1];
                    else
                        this.state = this.instance.getHtml();
                })
            }
        })
    )
})
