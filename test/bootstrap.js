require('babel-polyfill');

// from https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => prop !== 'root' && typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

window.Object = Object;
window.Math = Math;

global.jsdom = jsdom;
global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};

require('raf/polyfill'); // eslint-disable-line import/newline-after-import
copyProps(window, global);
