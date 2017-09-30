import jquery from "jquery";
window.$ = jquery;

export {jquery as $};
export _ from "lodash";
export Backbone from "backbone";
export Marionette from "backbone.marionette";
export Radio from 'backbone.radio';
export ComputedFields from 'backbone-computedfields';
import io from 'socket.io-client';
window.io = io;
export {io};