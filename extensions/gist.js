/*
Add this file to $(jupyter --data-dir)/nbextensions/gist.js
And load it with:

require(["nbextensions/gist"], function (gist_extension) {
    console.log('gist extension loaded');
    gist_extension.load_ipython_extension();
});

or add the following to your jupyter_notebook_config.py to
load for every notebook

from notebook.services.config import ConfigManager
cm = ConfigManager()
cm.update('notebook', {"load_extensions": {"gist": True}})
*/

function get_base_path() {
    var loc = window.location;
    var proto = loc.protocol;
    var host = loc.hostname;
    var port = loc.port;

    var base = proto + "//" + host;
    if (parseInt(port) != 80) {
        base += ":" + port;
    }
    return base;
}

define(function () {
    var github_redirect_uri = get_base_path() + "/create_gist";
    var gist_notebook = function () {
        // Save the notebook and create a checkpoint to ensure that we create
        // the gist using the most up-to-date content
        Jupyter.notebook.save_checkpoint();

        var github_client_id = Jupyter.notebook.config.data.oauth_client_id;
        // Get notebook path and encode it in base64

        // Characters like # get decoded by the github API and will mess up
        // getting the file path on the server if we use URI percent encoding,
        // so we use base64 instead
        var nb_path = window.btoa(Jupyter.notebook.base_url + Jupyter.notebook.notebook_path);

        // Start OAuth dialog
        window.open("https://github.com/login/oauth/authorize?client_id=" + github_client_id +
          "&scope=gist&redirect_uri=" + github_redirect_uri + "?nb_path=" + nb_path);
    };

    var gist_button = function () {
        if (!Jupyter.toolbar) {
            $([Jupyter.events]).on("app_initialized.NotebookApp", gist_button);
            return;
        }
        if ($("#gist_notebook").length === 0) {
            Jupyter.toolbar.add_buttons_group([
                {
                    'label'   : 'save notebook as gist',
                    'icon'    : 'fa-github',
                    'callback': gist_notebook,
                    'id'      : 'gist_notebook'
                },
            ]);
        }
    };

    var load_ipython_extension = function () {
        gist_button();
    };

    return {
        load_ipython_extension: load_ipython_extension
    };
});
