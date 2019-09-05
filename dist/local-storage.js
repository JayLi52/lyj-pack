var aaaa = (function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function(r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t,
        );
      }
      return n[i].exports;
    }
    for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function(require, module, exports) {
        (function(global) {
          'use strict';

          var stub = require('./stub');
          var tracking = require('./tracking');
          var ls = 'localStorage' in global && global.localStorage ? global.localStorage : stub;

          function accessor(key, value) {
            if (arguments.length === 1) {
              return get(key);
            }
            return set(key, value);
          }

          function get(key) {
            return JSON.parse(ls.getItem(key));
          }

          function set(key, value) {
            try {
              ls.setItem(key, JSON.stringify(value));
              return true;
            } catch (e) {
              return false;
            }
          }

          function remove(key) {
            return ls.removeItem(key);
          }

          function clear() {
            return ls.clear();
          }

          function backend(store) {
            store && (ls = store);

            return ls;
          }

          accessor.set = set;
          accessor.get = get;
          accessor.remove = remove;
          accessor.clear = clear;
          accessor.backend = backend;
          accessor.on = tracking.on;
          accessor.off = tracking.off;

          module.exports = accessor;
        }.call(
          this,
          typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
            ? window
            : {},
        ));
      },
      { './stub': 2, './tracking': 3 },
    ],
    2: [
      function(require, module, exports) {
        'use strict';

        var ms = {};

        function getItem(key) {
          return key in ms ? ms[key] : null;
        }

        function setItem(key, value) {
          ms[key] = value;
          return true;
        }

        function removeItem(key) {
          var found = key in ms;
          if (found) {
            return delete ms[key];
          }
          return false;
        }

        function clear() {
          ms = {};
          return true;
        }

        module.exports = {
          getItem: getItem,
          setItem: setItem,
          removeItem: removeItem,
          clear: clear,
        };
      },
      {},
    ],
    3: [
      function(require, module, exports) {
        (function(global) {
          'use strict';

          var listeners = {};
          var listening = false;

          function listen() {
            if (global.addEventListener) {
              global.addEventListener('storage', change, false);
            } else if (global.attachEvent) {
              global.attachEvent('onstorage', change);
            } else {
              global.onstorage = change;
            }
          }

          function change(e) {
            if (!e) {
              e = global.event;
            }
            var all = listeners[e.key];
            if (all) {
              all.forEach(fire);
            }

            function fire(listener) {
              listener(JSON.parse(e.newValue), JSON.parse(e.oldValue), e.url || e.uri);
            }
          }

          function on(key, fn) {
            if (listeners[key]) {
              listeners[key].push(fn);
            } else {
              listeners[key] = [fn];
            }
            if (listening === false) {
              listen();
            }
          }

          function off(key, fn) {
            var ns = listeners[key];
            if (ns.length > 1) {
              ns.splice(ns.indexOf(fn), 1);
            } else {
              listeners[key] = [];
            }
          }

          module.exports = {
            on: on,
            off: off,
          };
        }.call(
          this,
          typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
            ? window
            : {},
        ));
      },
      {},
    ],
  },
  {},
  [1],
);
