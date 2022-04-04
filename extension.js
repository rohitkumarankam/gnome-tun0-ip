const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const ShellToolkit = imports.gi.St;

function get_tun0_ip() {

    var command_output_bytes = GLib.spawn_command_line_sync('ifconfig tun0')[1];
    var command_output_string = '';

    for (var current_character_index = 0;
        current_character_index < command_output_bytes.length;
        ++current_character_index)
    {
        var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
        command_output_string += current_character;
    }

    var Re = new RegExp(/inet [^ ]+/g);
    var matches = command_output_string.match(Re);
    var tun0IPAddress;
    if (matches) {
        tun0IPAddress = matches[0].split(' ')[1];
    } else {
        tun0IPAddress = '';
    }
 
    return tun0IPAddress;
}

const tun0IPAddressIndicator = new Lang.Class({
    Name: 'tun0IPAddress.indicator',
    Extends: PanelMenu.Button,

    _init: function () {
        this.parent(0.0, "tun0 IP Address Indicator", false);
        this.buttonText = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.buttonText);
        this._updateLabel();
    },

    _updateLabel : function(){
        const refreshTime = 5

        if (this._timeout) {
                Mainloop.source_remove(this._timeout);
                this._timeout = null;
        }
        this._timeout = Mainloop.timeout_add_seconds(refreshTime, Lang.bind(this, this._updateLabel));

        this.buttonText.set_text(get_tun0_ip());
    },

    _removeTimeout: function () {
        if (this._timeout) {
            this._timeout = null;
        }
    },

    stop: function () {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
        this._timeout = undefined;

        this.menu.removeAll();
    }
});

let _indicator;

function init() {
    log('tun0 IP Address extension initialized');
}

function enable() {
    log('tun0 IP Address extension enabled');
    _indicator = new tun0IPAddressIndicator();
	Main.panel.addToStatusArea('tun0-ip-address', _indicator);
}

function disable() {
    log('tun0 IP Address extension disabled');
    _indicator.stop();
    _indicator.destroy();
}
