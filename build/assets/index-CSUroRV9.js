function ig(s, l) {
  for (var a = 0; a < l.length; a++) {
    const c = l[a];
    if (typeof c != "string" && !Array.isArray(c)) {
      for (const u in c)
        if (u !== "default" && !(u in s)) {
          const f = Object.getOwnPropertyDescriptor(c, u);
          f &&
            Object.defineProperty(
              s,
              u,
              f.get ? f : { enumerable: !0, get: () => c[u] }
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(s, Symbol.toStringTag, { value: "Module" })
  );
}
(function () {
  const l = document.createElement("link").relList;
  if (l && l.supports && l.supports("modulepreload")) return;
  for (const u of document.querySelectorAll('link[rel="modulepreload"]')) c(u);
  new MutationObserver((u) => {
    for (const f of u)
      if (f.type === "childList")
        for (const p of f.addedNodes)
          p.tagName === "LINK" && p.rel === "modulepreload" && c(p);
  }).observe(document, { childList: !0, subtree: !0 });
  function a(u) {
    const f = {};
    return (
      u.integrity && (f.integrity = u.integrity),
      u.referrerPolicy && (f.referrerPolicy = u.referrerPolicy),
      u.crossOrigin === "use-credentials"
        ? (f.credentials = "include")
        : u.crossOrigin === "anonymous"
        ? (f.credentials = "omit")
        : (f.credentials = "same-origin"),
      f
    );
  }
  function c(u) {
    if (u.ep) return;
    u.ep = !0;
    const f = a(u);
    fetch(u.href, f);
  }
})();
function gf(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default")
    ? s.default
    : s;
}
var Co = { exports: {} },
  $s = {},
  Eo = { exports: {} },
  Re = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var gm;
function lg() {
  if (gm) return Re;
  gm = 1;
  var s = Symbol.for("react.element"),
    l = Symbol.for("react.portal"),
    a = Symbol.for("react.fragment"),
    c = Symbol.for("react.strict_mode"),
    u = Symbol.for("react.profiler"),
    f = Symbol.for("react.provider"),
    p = Symbol.for("react.context"),
    m = Symbol.for("react.forward_ref"),
    x = Symbol.for("react.suspense"),
    v = Symbol.for("react.memo"),
    N = Symbol.for("react.lazy"),
    g = Symbol.iterator;
  function S(C) {
    return C === null || typeof C != "object"
      ? null
      : ((C = (g && C[g]) || C["@@iterator"]),
        typeof C == "function" ? C : null);
  }
  var A = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    T = Object.assign,
    b = {};
  function E(C, L, ae) {
    (this.props = C),
      (this.context = L),
      (this.refs = b),
      (this.updater = ae || A);
  }
  (E.prototype.isReactComponent = {}),
    (E.prototype.setState = function (C, L) {
      if (typeof C != "object" && typeof C != "function" && C != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, C, L, "setState");
    }),
    (E.prototype.forceUpdate = function (C) {
      this.updater.enqueueForceUpdate(this, C, "forceUpdate");
    });
  function I() {}
  I.prototype = E.prototype;
  function z(C, L, ae) {
    (this.props = C),
      (this.context = L),
      (this.refs = b),
      (this.updater = ae || A);
  }
  var O = (z.prototype = new I());
  (O.constructor = z), T(O, E.prototype), (O.isPureReactComponent = !0);
  var D = Array.isArray,
    q = Object.prototype.hasOwnProperty,
    Z = { current: null },
    U = { key: !0, ref: !0, __self: !0, __source: !0 };
  function H(C, L, ae) {
    var oe,
      we = {},
      ke = null,
      B = null;
    if (L != null)
      for (oe in (L.ref !== void 0 && (B = L.ref),
      L.key !== void 0 && (ke = "" + L.key),
      L))
        q.call(L, oe) && !U.hasOwnProperty(oe) && (we[oe] = L[oe]);
    var ue = arguments.length - 2;
    if (ue === 1) we.children = ae;
    else if (1 < ue) {
      for (var be = Array(ue), Se = 0; Se < ue; Se++)
        be[Se] = arguments[Se + 2];
      we.children = be;
    }
    if (C && C.defaultProps)
      for (oe in ((ue = C.defaultProps), ue))
        we[oe] === void 0 && (we[oe] = ue[oe]);
    return {
      $$typeof: s,
      type: C,
      key: ke,
      ref: B,
      props: we,
      _owner: Z.current,
    };
  }
  function he(C, L) {
    return {
      $$typeof: s,
      type: C.type,
      key: L,
      ref: C.ref,
      props: C.props,
      _owner: C._owner,
    };
  }
  function ye(C) {
    return typeof C == "object" && C !== null && C.$$typeof === s;
  }
  function Ae(C) {
    var L = { "=": "=0", ":": "=2" };
    return (
      "$" +
      C.replace(/[=:]/g, function (ae) {
        return L[ae];
      })
    );
  }
  var Ce = /\/+/g;
  function je(C, L) {
    return typeof C == "object" && C !== null && C.key != null
      ? Ae("" + C.key)
      : L.toString(36);
  }
  function ge(C, L, ae, oe, we) {
    var ke = typeof C;
    (ke === "undefined" || ke === "boolean") && (C = null);
    var B = !1;
    if (C === null) B = !0;
    else
      switch (ke) {
        case "string":
        case "number":
          B = !0;
          break;
        case "object":
          switch (C.$$typeof) {
            case s:
            case l:
              B = !0;
          }
      }
    if (B)
      return (
        (B = C),
        (we = we(B)),
        (C = oe === "" ? "." + je(B, 0) : oe),
        D(we)
          ? ((ae = ""),
            C != null && (ae = C.replace(Ce, "$&/") + "/"),
            ge(we, L, ae, "", function (Se) {
              return Se;
            }))
          : we != null &&
            (ye(we) &&
              (we = he(
                we,
                ae +
                  (!we.key || (B && B.key === we.key)
                    ? ""
                    : ("" + we.key).replace(Ce, "$&/") + "/") +
                  C
              )),
            L.push(we)),
        1
      );
    if (((B = 0), (oe = oe === "" ? "." : oe + ":"), D(C)))
      for (var ue = 0; ue < C.length; ue++) {
        ke = C[ue];
        var be = oe + je(ke, ue);
        B += ge(ke, L, ae, be, we);
      }
    else if (((be = S(C)), typeof be == "function"))
      for (C = be.call(C), ue = 0; !(ke = C.next()).done; )
        (ke = ke.value), (be = oe + je(ke, ue++)), (B += ge(ke, L, ae, be, we));
    else if (ke === "object")
      throw (
        ((L = String(C)),
        Error(
          "Objects are not valid as a React child (found: " +
            (L === "[object Object]"
              ? "object with keys {" + Object.keys(C).join(", ") + "}"
              : L) +
            "). If you meant to render a collection of children, use an array instead."
        ))
      );
    return B;
  }
  function Ee(C, L, ae) {
    if (C == null) return C;
    var oe = [],
      we = 0;
    return (
      ge(C, oe, "", "", function (ke) {
        return L.call(ae, ke, we++);
      }),
      oe
    );
  }
  function de(C) {
    if (C._status === -1) {
      var L = C._result;
      (L = L()),
        L.then(
          function (ae) {
            (C._status === 0 || C._status === -1) &&
              ((C._status = 1), (C._result = ae));
          },
          function (ae) {
            (C._status === 0 || C._status === -1) &&
              ((C._status = 2), (C._result = ae));
          }
        ),
        C._status === -1 && ((C._status = 0), (C._result = L));
    }
    if (C._status === 1) return C._result.default;
    throw C._result;
  }
  var le = { current: null },
    P = { transition: null },
    X = {
      ReactCurrentDispatcher: le,
      ReactCurrentBatchConfig: P,
      ReactCurrentOwner: Z,
    };
  function K() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return (
    (Re.Children = {
      map: Ee,
      forEach: function (C, L, ae) {
        Ee(
          C,
          function () {
            L.apply(this, arguments);
          },
          ae
        );
      },
      count: function (C) {
        var L = 0;
        return (
          Ee(C, function () {
            L++;
          }),
          L
        );
      },
      toArray: function (C) {
        return (
          Ee(C, function (L) {
            return L;
          }) || []
        );
      },
      only: function (C) {
        if (!ye(C))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return C;
      },
    }),
    (Re.Component = E),
    (Re.Fragment = a),
    (Re.Profiler = u),
    (Re.PureComponent = z),
    (Re.StrictMode = c),
    (Re.Suspense = x),
    (Re.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = X),
    (Re.act = K),
    (Re.cloneElement = function (C, L, ae) {
      if (C == null)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            C +
            "."
        );
      var oe = T({}, C.props),
        we = C.key,
        ke = C.ref,
        B = C._owner;
      if (L != null) {
        if (
          (L.ref !== void 0 && ((ke = L.ref), (B = Z.current)),
          L.key !== void 0 && (we = "" + L.key),
          C.type && C.type.defaultProps)
        )
          var ue = C.type.defaultProps;
        for (be in L)
          q.call(L, be) &&
            !U.hasOwnProperty(be) &&
            (oe[be] = L[be] === void 0 && ue !== void 0 ? ue[be] : L[be]);
      }
      var be = arguments.length - 2;
      if (be === 1) oe.children = ae;
      else if (1 < be) {
        ue = Array(be);
        for (var Se = 0; Se < be; Se++) ue[Se] = arguments[Se + 2];
        oe.children = ue;
      }
      return {
        $$typeof: s,
        type: C.type,
        key: we,
        ref: ke,
        props: oe,
        _owner: B,
      };
    }),
    (Re.createContext = function (C) {
      return (
        (C = {
          $$typeof: p,
          _currentValue: C,
          _currentValue2: C,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (C.Provider = { $$typeof: f, _context: C }),
        (C.Consumer = C)
      );
    }),
    (Re.createElement = H),
    (Re.createFactory = function (C) {
      var L = H.bind(null, C);
      return (L.type = C), L;
    }),
    (Re.createRef = function () {
      return { current: null };
    }),
    (Re.forwardRef = function (C) {
      return { $$typeof: m, render: C };
    }),
    (Re.isValidElement = ye),
    (Re.lazy = function (C) {
      return { $$typeof: N, _payload: { _status: -1, _result: C }, _init: de };
    }),
    (Re.memo = function (C, L) {
      return { $$typeof: v, type: C, compare: L === void 0 ? null : L };
    }),
    (Re.startTransition = function (C) {
      var L = P.transition;
      P.transition = {};
      try {
        C();
      } finally {
        P.transition = L;
      }
    }),
    (Re.unstable_act = K),
    (Re.useCallback = function (C, L) {
      return le.current.useCallback(C, L);
    }),
    (Re.useContext = function (C) {
      return le.current.useContext(C);
    }),
    (Re.useDebugValue = function () {}),
    (Re.useDeferredValue = function (C) {
      return le.current.useDeferredValue(C);
    }),
    (Re.useEffect = function (C, L) {
      return le.current.useEffect(C, L);
    }),
    (Re.useId = function () {
      return le.current.useId();
    }),
    (Re.useImperativeHandle = function (C, L, ae) {
      return le.current.useImperativeHandle(C, L, ae);
    }),
    (Re.useInsertionEffect = function (C, L) {
      return le.current.useInsertionEffect(C, L);
    }),
    (Re.useLayoutEffect = function (C, L) {
      return le.current.useLayoutEffect(C, L);
    }),
    (Re.useMemo = function (C, L) {
      return le.current.useMemo(C, L);
    }),
    (Re.useReducer = function (C, L, ae) {
      return le.current.useReducer(C, L, ae);
    }),
    (Re.useRef = function (C) {
      return le.current.useRef(C);
    }),
    (Re.useState = function (C) {
      return le.current.useState(C);
    }),
    (Re.useSyncExternalStore = function (C, L, ae) {
      return le.current.useSyncExternalStore(C, L, ae);
    }),
    (Re.useTransition = function () {
      return le.current.useTransition();
    }),
    (Re.version = "18.3.1"),
    Re
  );
}
var vm;
function dc() {
  return vm || ((vm = 1), (Eo.exports = lg())), Eo.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ym;
function ag() {
  if (ym) return $s;
  ym = 1;
  var s = dc(),
    l = Symbol.for("react.element"),
    a = Symbol.for("react.fragment"),
    c = Object.prototype.hasOwnProperty,
    u = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    f = { key: !0, ref: !0, __self: !0, __source: !0 };
  function p(m, x, v) {
    var N,
      g = {},
      S = null,
      A = null;
    v !== void 0 && (S = "" + v),
      x.key !== void 0 && (S = "" + x.key),
      x.ref !== void 0 && (A = x.ref);
    for (N in x) c.call(x, N) && !f.hasOwnProperty(N) && (g[N] = x[N]);
    if (m && m.defaultProps)
      for (N in ((x = m.defaultProps), x)) g[N] === void 0 && (g[N] = x[N]);
    return {
      $$typeof: l,
      type: m,
      key: S,
      ref: A,
      props: g,
      _owner: u.current,
    };
  }
  return ($s.Fragment = a), ($s.jsx = p), ($s.jsxs = p), $s;
}
var jm;
function og() {
  return jm || ((jm = 1), (Co.exports = ag())), Co.exports;
}
var t = og(),
  nl = {},
  Po = { exports: {} },
  gt = {},
  Ao = { exports: {} },
  Ro = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var bm;
function cg() {
  return (
    bm ||
      ((bm = 1),
      (function (s) {
        function l(P, X) {
          var K = P.length;
          P.push(X);
          e: for (; 0 < K; ) {
            var C = (K - 1) >>> 1,
              L = P[C];
            if (0 < u(L, X)) (P[C] = X), (P[K] = L), (K = C);
            else break e;
          }
        }
        function a(P) {
          return P.length === 0 ? null : P[0];
        }
        function c(P) {
          if (P.length === 0) return null;
          var X = P[0],
            K = P.pop();
          if (K !== X) {
            P[0] = K;
            e: for (var C = 0, L = P.length, ae = L >>> 1; C < ae; ) {
              var oe = 2 * (C + 1) - 1,
                we = P[oe],
                ke = oe + 1,
                B = P[ke];
              if (0 > u(we, K))
                ke < L && 0 > u(B, we)
                  ? ((P[C] = B), (P[ke] = K), (C = ke))
                  : ((P[C] = we), (P[oe] = K), (C = oe));
              else if (ke < L && 0 > u(B, K)) (P[C] = B), (P[ke] = K), (C = ke);
              else break e;
            }
          }
          return X;
        }
        function u(P, X) {
          var K = P.sortIndex - X.sortIndex;
          return K !== 0 ? K : P.id - X.id;
        }
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var f = performance;
          s.unstable_now = function () {
            return f.now();
          };
        } else {
          var p = Date,
            m = p.now();
          s.unstable_now = function () {
            return p.now() - m;
          };
        }
        var x = [],
          v = [],
          N = 1,
          g = null,
          S = 3,
          A = !1,
          T = !1,
          b = !1,
          E = typeof setTimeout == "function" ? setTimeout : null,
          I = typeof clearTimeout == "function" ? clearTimeout : null,
          z = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" &&
          navigator.scheduling !== void 0 &&
          navigator.scheduling.isInputPending !== void 0 &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function O(P) {
          for (var X = a(v); X !== null; ) {
            if (X.callback === null) c(v);
            else if (X.startTime <= P)
              c(v), (X.sortIndex = X.expirationTime), l(x, X);
            else break;
            X = a(v);
          }
        }
        function D(P) {
          if (((b = !1), O(P), !T))
            if (a(x) !== null) (T = !0), de(q);
            else {
              var X = a(v);
              X !== null && le(D, X.startTime - P);
            }
        }
        function q(P, X) {
          (T = !1), b && ((b = !1), I(H), (H = -1)), (A = !0);
          var K = S;
          try {
            for (
              O(X), g = a(x);
              g !== null && (!(g.expirationTime > X) || (P && !Ae()));

            ) {
              var C = g.callback;
              if (typeof C == "function") {
                (g.callback = null), (S = g.priorityLevel);
                var L = C(g.expirationTime <= X);
                (X = s.unstable_now()),
                  typeof L == "function"
                    ? (g.callback = L)
                    : g === a(x) && c(x),
                  O(X);
              } else c(x);
              g = a(x);
            }
            if (g !== null) var ae = !0;
            else {
              var oe = a(v);
              oe !== null && le(D, oe.startTime - X), (ae = !1);
            }
            return ae;
          } finally {
            (g = null), (S = K), (A = !1);
          }
        }
        var Z = !1,
          U = null,
          H = -1,
          he = 5,
          ye = -1;
        function Ae() {
          return !(s.unstable_now() - ye < he);
        }
        function Ce() {
          if (U !== null) {
            var P = s.unstable_now();
            ye = P;
            var X = !0;
            try {
              X = U(!0, P);
            } finally {
              X ? je() : ((Z = !1), (U = null));
            }
          } else Z = !1;
        }
        var je;
        if (typeof z == "function")
          je = function () {
            z(Ce);
          };
        else if (typeof MessageChannel < "u") {
          var ge = new MessageChannel(),
            Ee = ge.port2;
          (ge.port1.onmessage = Ce),
            (je = function () {
              Ee.postMessage(null);
            });
        } else
          je = function () {
            E(Ce, 0);
          };
        function de(P) {
          (U = P), Z || ((Z = !0), je());
        }
        function le(P, X) {
          H = E(function () {
            P(s.unstable_now());
          }, X);
        }
        (s.unstable_IdlePriority = 5),
          (s.unstable_ImmediatePriority = 1),
          (s.unstable_LowPriority = 4),
          (s.unstable_NormalPriority = 3),
          (s.unstable_Profiling = null),
          (s.unstable_UserBlockingPriority = 2),
          (s.unstable_cancelCallback = function (P) {
            P.callback = null;
          }),
          (s.unstable_continueExecution = function () {
            T || A || ((T = !0), de(q));
          }),
          (s.unstable_forceFrameRate = function (P) {
            0 > P || 125 < P
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
                )
              : (he = 0 < P ? Math.floor(1e3 / P) : 5);
          }),
          (s.unstable_getCurrentPriorityLevel = function () {
            return S;
          }),
          (s.unstable_getFirstCallbackNode = function () {
            return a(x);
          }),
          (s.unstable_next = function (P) {
            switch (S) {
              case 1:
              case 2:
              case 3:
                var X = 3;
                break;
              default:
                X = S;
            }
            var K = S;
            S = X;
            try {
              return P();
            } finally {
              S = K;
            }
          }),
          (s.unstable_pauseExecution = function () {}),
          (s.unstable_requestPaint = function () {}),
          (s.unstable_runWithPriority = function (P, X) {
            switch (P) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                P = 3;
            }
            var K = S;
            S = P;
            try {
              return X();
            } finally {
              S = K;
            }
          }),
          (s.unstable_scheduleCallback = function (P, X, K) {
            var C = s.unstable_now();
            switch (
              (typeof K == "object" && K !== null
                ? ((K = K.delay),
                  (K = typeof K == "number" && 0 < K ? C + K : C))
                : (K = C),
              P)
            ) {
              case 1:
                var L = -1;
                break;
              case 2:
                L = 250;
                break;
              case 5:
                L = 1073741823;
                break;
              case 4:
                L = 1e4;
                break;
              default:
                L = 5e3;
            }
            return (
              (L = K + L),
              (P = {
                id: N++,
                callback: X,
                priorityLevel: P,
                startTime: K,
                expirationTime: L,
                sortIndex: -1,
              }),
              K > C
                ? ((P.sortIndex = K),
                  l(v, P),
                  a(x) === null &&
                    P === a(v) &&
                    (b ? (I(H), (H = -1)) : (b = !0), le(D, K - C)))
                : ((P.sortIndex = L), l(x, P), T || A || ((T = !0), de(q))),
              P
            );
          }),
          (s.unstable_shouldYield = Ae),
          (s.unstable_wrapCallback = function (P) {
            var X = S;
            return function () {
              var K = S;
              S = X;
              try {
                return P.apply(this, arguments);
              } finally {
                S = K;
              }
            };
          });
      })(Ro)),
    Ro
  );
}
var Nm;
function dg() {
  return Nm || ((Nm = 1), (Ao.exports = cg())), Ao.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var wm;
function ug() {
  if (wm) return gt;
  wm = 1;
  var s = dc(),
    l = dg();
  function a(e) {
    for (
      var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
        n = 1;
      n < arguments.length;
      n++
    )
      r += "&args[]=" + encodeURIComponent(arguments[n]);
    return (
      "Minified React error #" +
      e +
      "; visit " +
      r +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  var c = new Set(),
    u = {};
  function f(e, r) {
    p(e, r), p(e + "Capture", r);
  }
  function p(e, r) {
    for (u[e] = r, e = 0; e < r.length; e++) c.add(r[e]);
  }
  var m = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    x = Object.prototype.hasOwnProperty,
    v =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    N = {},
    g = {};
  function S(e) {
    return x.call(g, e)
      ? !0
      : x.call(N, e)
      ? !1
      : v.test(e)
      ? (g[e] = !0)
      : ((N[e] = !0), !1);
  }
  function A(e, r, n, i) {
    if (n !== null && n.type === 0) return !1;
    switch (typeof r) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return i
          ? !1
          : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function T(e, r, n, i) {
    if (r === null || typeof r > "u" || A(e, r, n, i)) return !0;
    if (i) return !1;
    if (n !== null)
      switch (n.type) {
        case 3:
          return !r;
        case 4:
          return r === !1;
        case 5:
          return isNaN(r);
        case 6:
          return isNaN(r) || 1 > r;
      }
    return !1;
  }
  function b(e, r, n, i, o, d, h) {
    (this.acceptsBooleans = r === 2 || r === 3 || r === 4),
      (this.attributeName = i),
      (this.attributeNamespace = o),
      (this.mustUseProperty = n),
      (this.propertyName = e),
      (this.type = r),
      (this.sanitizeURL = d),
      (this.removeEmptyString = h);
  }
  var E = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (e) {
      E[e] = new b(e, 0, !1, e, null, !1, !1);
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (e) {
      var r = e[0];
      E[r] = new b(r, 1, !1, e[1], null, !1, !1);
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function (
      e
    ) {
      E[e] = new b(e, 2, !1, e.toLowerCase(), null, !1, !1);
    }),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (e) {
      E[e] = new b(e, 2, !1, e, null, !1, !1);
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (e) {
        E[e] = new b(e, 3, !1, e.toLowerCase(), null, !1, !1);
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (e) {
      E[e] = new b(e, 3, !0, e, null, !1, !1);
    }),
    ["capture", "download"].forEach(function (e) {
      E[e] = new b(e, 4, !1, e, null, !1, !1);
    }),
    ["cols", "rows", "size", "span"].forEach(function (e) {
      E[e] = new b(e, 6, !1, e, null, !1, !1);
    }),
    ["rowSpan", "start"].forEach(function (e) {
      E[e] = new b(e, 5, !1, e.toLowerCase(), null, !1, !1);
    });
  var I = /[\-:]([a-z])/g;
  function z(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (e) {
      var r = e.replace(I, z);
      E[r] = new b(r, 1, !1, e, null, !1, !1);
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (e) {
        var r = e.replace(I, z);
        E[r] = new b(r, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
      var r = e.replace(I, z);
      E[r] = new b(r, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
    }),
    ["tabIndex", "crossOrigin"].forEach(function (e) {
      E[e] = new b(e, 1, !1, e.toLowerCase(), null, !1, !1);
    }),
    (E.xlinkHref = new b(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1
    )),
    ["src", "href", "action", "formAction"].forEach(function (e) {
      E[e] = new b(e, 1, !1, e.toLowerCase(), null, !0, !0);
    });
  function O(e, r, n, i) {
    var o = E.hasOwnProperty(r) ? E[r] : null;
    (o !== null
      ? o.type !== 0
      : i ||
        !(2 < r.length) ||
        (r[0] !== "o" && r[0] !== "O") ||
        (r[1] !== "n" && r[1] !== "N")) &&
      (T(r, n, o, i) && (n = null),
      i || o === null
        ? S(r) &&
          (n === null ? e.removeAttribute(r) : e.setAttribute(r, "" + n))
        : o.mustUseProperty
        ? (e[o.propertyName] = n === null ? (o.type === 3 ? !1 : "") : n)
        : ((r = o.attributeName),
          (i = o.attributeNamespace),
          n === null
            ? e.removeAttribute(r)
            : ((o = o.type),
              (n = o === 3 || (o === 4 && n === !0) ? "" : "" + n),
              i ? e.setAttributeNS(i, r, n) : e.setAttribute(r, n))));
  }
  var D = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    q = Symbol.for("react.element"),
    Z = Symbol.for("react.portal"),
    U = Symbol.for("react.fragment"),
    H = Symbol.for("react.strict_mode"),
    he = Symbol.for("react.profiler"),
    ye = Symbol.for("react.provider"),
    Ae = Symbol.for("react.context"),
    Ce = Symbol.for("react.forward_ref"),
    je = Symbol.for("react.suspense"),
    ge = Symbol.for("react.suspense_list"),
    Ee = Symbol.for("react.memo"),
    de = Symbol.for("react.lazy"),
    le = Symbol.for("react.offscreen"),
    P = Symbol.iterator;
  function X(e) {
    return e === null || typeof e != "object"
      ? null
      : ((e = (P && e[P]) || e["@@iterator"]),
        typeof e == "function" ? e : null);
  }
  var K = Object.assign,
    C;
  function L(e) {
    if (C === void 0)
      try {
        throw Error();
      } catch (n) {
        var r = n.stack.trim().match(/\n( *(at )?)/);
        C = (r && r[1]) || "";
      }
    return (
      `
` +
      C +
      e
    );
  }
  var ae = !1;
  function oe(e, r) {
    if (!e || ae) return "";
    ae = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (r)
        if (
          ((r = function () {
            throw Error();
          }),
          Object.defineProperty(r.prototype, "props", {
            set: function () {
              throw Error();
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(r, []);
          } catch (_) {
            var i = _;
          }
          Reflect.construct(e, [], r);
        } else {
          try {
            r.call();
          } catch (_) {
            i = _;
          }
          e.call(r.prototype);
        }
      else {
        try {
          throw Error();
        } catch (_) {
          i = _;
        }
        e();
      }
    } catch (_) {
      if (_ && i && typeof _.stack == "string") {
        for (
          var o = _.stack.split(`
`),
            d = i.stack.split(`
`),
            h = o.length - 1,
            y = d.length - 1;
          1 <= h && 0 <= y && o[h] !== d[y];

        )
          y--;
        for (; 1 <= h && 0 <= y; h--, y--)
          if (o[h] !== d[y]) {
            if (h !== 1 || y !== 1)
              do
                if ((h--, y--, 0 > y || o[h] !== d[y])) {
                  var w =
                    `
` + o[h].replace(" at new ", " at ");
                  return (
                    e.displayName &&
                      w.includes("<anonymous>") &&
                      (w = w.replace("<anonymous>", e.displayName)),
                    w
                  );
                }
              while (1 <= h && 0 <= y);
            break;
          }
      }
    } finally {
      (ae = !1), (Error.prepareStackTrace = n);
    }
    return (e = e ? e.displayName || e.name : "") ? L(e) : "";
  }
  function we(e) {
    switch (e.tag) {
      case 5:
        return L(e.type);
      case 16:
        return L("Lazy");
      case 13:
        return L("Suspense");
      case 19:
        return L("SuspenseList");
      case 0:
      case 2:
      case 15:
        return (e = oe(e.type, !1)), e;
      case 11:
        return (e = oe(e.type.render, !1)), e;
      case 1:
        return (e = oe(e.type, !0)), e;
      default:
        return "";
    }
  }
  function ke(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case U:
        return "Fragment";
      case Z:
        return "Portal";
      case he:
        return "Profiler";
      case H:
        return "StrictMode";
      case je:
        return "Suspense";
      case ge:
        return "SuspenseList";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Ae:
          return (e.displayName || "Context") + ".Consumer";
        case ye:
          return (e._context.displayName || "Context") + ".Provider";
        case Ce:
          var r = e.render;
          return (
            (e = e.displayName),
            e ||
              ((e = r.displayName || r.name || ""),
              (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
            e
          );
        case Ee:
          return (
            (r = e.displayName || null), r !== null ? r : ke(e.type) || "Memo"
          );
        case de:
          (r = e._payload), (e = e._init);
          try {
            return ke(e(r));
          } catch {}
      }
    return null;
  }
  function B(e) {
    var r = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (r.displayName || "Context") + ".Consumer";
      case 10:
        return (r._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return (
          (e = r.render),
          (e = e.displayName || e.name || ""),
          r.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
        );
      case 7:
        return "Fragment";
      case 5:
        return r;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ke(r);
      case 8:
        return r === H ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof r == "function") return r.displayName || r.name || null;
        if (typeof r == "string") return r;
    }
    return null;
  }
  function ue(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function be(e) {
    var r = e.type;
    return (
      (e = e.nodeName) &&
      e.toLowerCase() === "input" &&
      (r === "checkbox" || r === "radio")
    );
  }
  function Se(e) {
    var r = be(e) ? "checked" : "value",
      n = Object.getOwnPropertyDescriptor(e.constructor.prototype, r),
      i = "" + e[r];
    if (
      !e.hasOwnProperty(r) &&
      typeof n < "u" &&
      typeof n.get == "function" &&
      typeof n.set == "function"
    ) {
      var o = n.get,
        d = n.set;
      return (
        Object.defineProperty(e, r, {
          configurable: !0,
          get: function () {
            return o.call(this);
          },
          set: function (h) {
            (i = "" + h), d.call(this, h);
          },
        }),
        Object.defineProperty(e, r, { enumerable: n.enumerable }),
        {
          getValue: function () {
            return i;
          },
          setValue: function (h) {
            i = "" + h;
          },
          stopTracking: function () {
            (e._valueTracker = null), delete e[r];
          },
        }
      );
    }
  }
  function Me(e) {
    e._valueTracker || (e._valueTracker = Se(e));
  }
  function Ie(e) {
    if (!e) return !1;
    var r = e._valueTracker;
    if (!r) return !0;
    var n = r.getValue(),
      i = "";
    return (
      e && (i = be(e) ? (e.checked ? "true" : "false") : e.value),
      (e = i),
      e !== n ? (r.setValue(e), !0) : !1
    );
  }
  function tt(e) {
    if (
      ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
    )
      return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function zt(e, r) {
    var n = r.checked;
    return K({}, r, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: n ?? e._wrapperState.initialChecked,
    });
  }
  function un(e, r) {
    var n = r.defaultValue == null ? "" : r.defaultValue,
      i = r.checked != null ? r.checked : r.defaultChecked;
    (n = ue(r.value != null ? r.value : n)),
      (e._wrapperState = {
        initialChecked: i,
        initialValue: n,
        controlled:
          r.type === "checkbox" || r.type === "radio"
            ? r.checked != null
            : r.value != null,
      });
  }
  function mn(e, r) {
    (r = r.checked), r != null && O(e, "checked", r, !1);
  }
  function Br(e, r) {
    mn(e, r);
    var n = ue(r.value),
      i = r.type;
    if (n != null)
      i === "number"
        ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
        : e.value !== "" + n && (e.value = "" + n);
    else if (i === "submit" || i === "reset") {
      e.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value")
      ? zl(e, r.type, n)
      : r.hasOwnProperty("defaultValue") && zl(e, r.type, ue(r.defaultValue)),
      r.checked == null &&
        r.defaultChecked != null &&
        (e.defaultChecked = !!r.defaultChecked);
  }
  function Cc(e, r, n) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var i = r.type;
      if (
        !(
          (i !== "submit" && i !== "reset") ||
          (r.value !== void 0 && r.value !== null)
        )
      )
        return;
      (r = "" + e._wrapperState.initialValue),
        n || r === e.value || (e.value = r),
        (e.defaultValue = r);
    }
    (n = e.name),
      n !== "" && (e.name = ""),
      (e.defaultChecked = !!e._wrapperState.initialChecked),
      n !== "" && (e.name = n);
  }
  function zl(e, r, n) {
    (r !== "number" || tt(e.ownerDocument) !== e) &&
      (n == null
        ? (e.defaultValue = "" + e._wrapperState.initialValue)
        : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
  }
  var ts = Array.isArray;
  function fn(e, r, n, i) {
    if (((e = e.options), r)) {
      r = {};
      for (var o = 0; o < n.length; o++) r["$" + n[o]] = !0;
      for (n = 0; n < e.length; n++)
        (o = r.hasOwnProperty("$" + e[n].value)),
          e[n].selected !== o && (e[n].selected = o),
          o && i && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + ue(n), r = null, o = 0; o < e.length; o++) {
        if (e[o].value === n) {
          (e[o].selected = !0), i && (e[o].defaultSelected = !0);
          return;
        }
        r !== null || e[o].disabled || (r = e[o]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Il(e, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(a(91));
    return K({}, r, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue,
    });
  }
  function Ec(e, r) {
    var n = r.value;
    if (n == null) {
      if (((n = r.children), (r = r.defaultValue), n != null)) {
        if (r != null) throw Error(a(92));
        if (ts(n)) {
          if (1 < n.length) throw Error(a(93));
          n = n[0];
        }
        r = n;
      }
      r == null && (r = ""), (n = r);
    }
    e._wrapperState = { initialValue: ue(n) };
  }
  function Pc(e, r) {
    var n = ue(r.value),
      i = ue(r.defaultValue);
    n != null &&
      ((n = "" + n),
      n !== e.value && (e.value = n),
      r.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
      i != null && (e.defaultValue = "" + i);
  }
  function Ac(e) {
    var r = e.textContent;
    r === e._wrapperState.initialValue &&
      r !== "" &&
      r !== null &&
      (e.value = r);
  }
  function Rc(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Ol(e, r) {
    return e == null || e === "http://www.w3.org/1999/xhtml"
      ? Rc(r)
      : e === "http://www.w3.org/2000/svg" && r === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
  }
  var Ks,
    Mc = (function (e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (r, n, i, o) {
            MSApp.execUnsafeLocalFunction(function () {
              return e(r, n, i, o);
            });
          }
        : e;
    })(function (e, r) {
      if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
        e.innerHTML = r;
      else {
        for (
          Ks = Ks || document.createElement("div"),
            Ks.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>",
            r = Ks.firstChild;
          e.firstChild;

        )
          e.removeChild(e.firstChild);
        for (; r.firstChild; ) e.appendChild(r.firstChild);
      }
    });
  function rs(e, r) {
    if (r) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = r;
        return;
      }
    }
    e.textContent = r;
  }
  var ns = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    cp = ["Webkit", "ms", "Moz", "O"];
  Object.keys(ns).forEach(function (e) {
    cp.forEach(function (r) {
      (r = r + e.charAt(0).toUpperCase() + e.substring(1)), (ns[r] = ns[e]);
    });
  });
  function _c(e, r, n) {
    return r == null || typeof r == "boolean" || r === ""
      ? ""
      : n || typeof r != "number" || r === 0 || (ns.hasOwnProperty(e) && ns[e])
      ? ("" + r).trim()
      : r + "px";
  }
  function Tc(e, r) {
    e = e.style;
    for (var n in r)
      if (r.hasOwnProperty(n)) {
        var i = n.indexOf("--") === 0,
          o = _c(n, r[n], i);
        n === "float" && (n = "cssFloat"), i ? e.setProperty(n, o) : (e[n] = o);
      }
  }
  var dp = K(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    }
  );
  function Ll(e, r) {
    if (r) {
      if (dp[e] && (r.children != null || r.dangerouslySetInnerHTML != null))
        throw Error(a(137, e));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(a(60));
        if (
          typeof r.dangerouslySetInnerHTML != "object" ||
          !("__html" in r.dangerouslySetInnerHTML)
        )
          throw Error(a(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(a(62));
    }
  }
  function Dl(e, r) {
    if (e.indexOf("-") === -1) return typeof r.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Fl = null;
  function $l(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var Hl = null,
    hn = null,
    pn = null;
  function zc(e) {
    if ((e = ks(e))) {
      if (typeof Hl != "function") throw Error(a(280));
      var r = e.stateNode;
      r && ((r = vi(r)), Hl(e.stateNode, e.type, r));
    }
  }
  function Ic(e) {
    hn ? (pn ? pn.push(e) : (pn = [e])) : (hn = e);
  }
  function Oc() {
    if (hn) {
      var e = hn,
        r = pn;
      if (((pn = hn = null), zc(e), r)) for (e = 0; e < r.length; e++) zc(r[e]);
    }
  }
  function Lc(e, r) {
    return e(r);
  }
  function Dc() {}
  var Vl = !1;
  function Fc(e, r, n) {
    if (Vl) return e(r, n);
    Vl = !0;
    try {
      return Lc(e, r, n);
    } finally {
      (Vl = !1), (hn !== null || pn !== null) && (Dc(), Oc());
    }
  }
  function ss(e, r) {
    var n = e.stateNode;
    if (n === null) return null;
    var i = vi(n);
    if (i === null) return null;
    n = i[r];
    e: switch (r) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (i = !i.disabled) ||
          ((e = e.type),
          (i = !(
            e === "button" ||
            e === "input" ||
            e === "select" ||
            e === "textarea"
          ))),
          (e = !i);
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function") throw Error(a(231, r, typeof n));
    return n;
  }
  var ql = !1;
  if (m)
    try {
      var is = {};
      Object.defineProperty(is, "passive", {
        get: function () {
          ql = !0;
        },
      }),
        window.addEventListener("test", is, is),
        window.removeEventListener("test", is, is);
    } catch {
      ql = !1;
    }
  function up(e, r, n, i, o, d, h, y, w) {
    var _ = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(n, _);
    } catch ($) {
      this.onError($);
    }
  }
  var ls = !1,
    Ys = null,
    Xs = !1,
    Bl = null,
    mp = {
      onError: function (e) {
        (ls = !0), (Ys = e);
      },
    };
  function fp(e, r, n, i, o, d, h, y, w) {
    (ls = !1), (Ys = null), up.apply(mp, arguments);
  }
  function hp(e, r, n, i, o, d, h, y, w) {
    if ((fp.apply(this, arguments), ls)) {
      if (ls) {
        var _ = Ys;
        (ls = !1), (Ys = null);
      } else throw Error(a(198));
      Xs || ((Xs = !0), (Bl = _));
    }
  }
  function Ur(e) {
    var r = e,
      n = e;
    if (e.alternate) for (; r.return; ) r = r.return;
    else {
      e = r;
      do (r = e), (r.flags & 4098) !== 0 && (n = r.return), (e = r.return);
      while (e);
    }
    return r.tag === 3 ? n : null;
  }
  function $c(e) {
    if (e.tag === 13) {
      var r = e.memoizedState;
      if (
        (r === null && ((e = e.alternate), e !== null && (r = e.memoizedState)),
        r !== null)
      )
        return r.dehydrated;
    }
    return null;
  }
  function Hc(e) {
    if (Ur(e) !== e) throw Error(a(188));
  }
  function pp(e) {
    var r = e.alternate;
    if (!r) {
      if (((r = Ur(e)), r === null)) throw Error(a(188));
      return r !== e ? null : e;
    }
    for (var n = e, i = r; ; ) {
      var o = n.return;
      if (o === null) break;
      var d = o.alternate;
      if (d === null) {
        if (((i = o.return), i !== null)) {
          n = i;
          continue;
        }
        break;
      }
      if (o.child === d.child) {
        for (d = o.child; d; ) {
          if (d === n) return Hc(o), e;
          if (d === i) return Hc(o), r;
          d = d.sibling;
        }
        throw Error(a(188));
      }
      if (n.return !== i.return) (n = o), (i = d);
      else {
        for (var h = !1, y = o.child; y; ) {
          if (y === n) {
            (h = !0), (n = o), (i = d);
            break;
          }
          if (y === i) {
            (h = !0), (i = o), (n = d);
            break;
          }
          y = y.sibling;
        }
        if (!h) {
          for (y = d.child; y; ) {
            if (y === n) {
              (h = !0), (n = d), (i = o);
              break;
            }
            if (y === i) {
              (h = !0), (i = d), (n = o);
              break;
            }
            y = y.sibling;
          }
          if (!h) throw Error(a(189));
        }
      }
      if (n.alternate !== i) throw Error(a(190));
    }
    if (n.tag !== 3) throw Error(a(188));
    return n.stateNode.current === n ? e : r;
  }
  function Vc(e) {
    return (e = pp(e)), e !== null ? qc(e) : null;
  }
  function qc(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var r = qc(e);
      if (r !== null) return r;
      e = e.sibling;
    }
    return null;
  }
  var Bc = l.unstable_scheduleCallback,
    Uc = l.unstable_cancelCallback,
    xp = l.unstable_shouldYield,
    gp = l.unstable_requestPaint,
    Be = l.unstable_now,
    vp = l.unstable_getCurrentPriorityLevel,
    Ul = l.unstable_ImmediatePriority,
    Wc = l.unstable_UserBlockingPriority,
    Zs = l.unstable_NormalPriority,
    yp = l.unstable_LowPriority,
    Gc = l.unstable_IdlePriority,
    Js = null,
    Wt = null;
  function jp(e) {
    if (Wt && typeof Wt.onCommitFiberRoot == "function")
      try {
        Wt.onCommitFiberRoot(Js, e, void 0, (e.current.flags & 128) === 128);
      } catch {}
  }
  var It = Math.clz32 ? Math.clz32 : wp,
    bp = Math.log,
    Np = Math.LN2;
  function wp(e) {
    return (e >>>= 0), e === 0 ? 32 : (31 - ((bp(e) / Np) | 0)) | 0;
  }
  var ei = 64,
    ti = 4194304;
  function as(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function ri(e, r) {
    var n = e.pendingLanes;
    if (n === 0) return 0;
    var i = 0,
      o = e.suspendedLanes,
      d = e.pingedLanes,
      h = n & 268435455;
    if (h !== 0) {
      var y = h & ~o;
      y !== 0 ? (i = as(y)) : ((d &= h), d !== 0 && (i = as(d)));
    } else (h = n & ~o), h !== 0 ? (i = as(h)) : d !== 0 && (i = as(d));
    if (i === 0) return 0;
    if (
      r !== 0 &&
      r !== i &&
      (r & o) === 0 &&
      ((o = i & -i), (d = r & -r), o >= d || (o === 16 && (d & 4194240) !== 0))
    )
      return r;
    if (((i & 4) !== 0 && (i |= n & 16), (r = e.entangledLanes), r !== 0))
      for (e = e.entanglements, r &= i; 0 < r; )
        (n = 31 - It(r)), (o = 1 << n), (i |= e[n]), (r &= ~o);
    return i;
  }
  function Sp(e, r) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return r + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function kp(e, r) {
    for (
      var n = e.suspendedLanes,
        i = e.pingedLanes,
        o = e.expirationTimes,
        d = e.pendingLanes;
      0 < d;

    ) {
      var h = 31 - It(d),
        y = 1 << h,
        w = o[h];
      w === -1
        ? ((y & n) === 0 || (y & i) !== 0) && (o[h] = Sp(y, r))
        : w <= r && (e.expiredLanes |= y),
        (d &= ~y);
    }
  }
  function Wl(e) {
    return (
      (e = e.pendingLanes & -1073741825),
      e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
    );
  }
  function Qc() {
    var e = ei;
    return (ei <<= 1), (ei & 4194240) === 0 && (ei = 64), e;
  }
  function Gl(e) {
    for (var r = [], n = 0; 31 > n; n++) r.push(e);
    return r;
  }
  function os(e, r, n) {
    (e.pendingLanes |= r),
      r !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
      (e = e.eventTimes),
      (r = 31 - It(r)),
      (e[r] = n);
  }
  function Cp(e, r) {
    var n = e.pendingLanes & ~r;
    (e.pendingLanes = r),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.expiredLanes &= r),
      (e.mutableReadLanes &= r),
      (e.entangledLanes &= r),
      (r = e.entanglements);
    var i = e.eventTimes;
    for (e = e.expirationTimes; 0 < n; ) {
      var o = 31 - It(n),
        d = 1 << o;
      (r[o] = 0), (i[o] = -1), (e[o] = -1), (n &= ~d);
    }
  }
  function Ql(e, r) {
    var n = (e.entangledLanes |= r);
    for (e = e.entanglements; n; ) {
      var i = 31 - It(n),
        o = 1 << i;
      (o & r) | (e[i] & r) && (e[i] |= r), (n &= ~o);
    }
  }
  var ze = 0;
  function Kc(e) {
    return (
      (e &= -e),
      1 < e ? (4 < e ? ((e & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
    );
  }
  var Yc,
    Kl,
    Xc,
    Zc,
    Jc,
    Yl = !1,
    ni = [],
    gr = null,
    vr = null,
    yr = null,
    cs = new Map(),
    ds = new Map(),
    jr = [],
    Ep =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " "
      );
  function ed(e, r) {
    switch (e) {
      case "focusin":
      case "focusout":
        gr = null;
        break;
      case "dragenter":
      case "dragleave":
        vr = null;
        break;
      case "mouseover":
      case "mouseout":
        yr = null;
        break;
      case "pointerover":
      case "pointerout":
        cs.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ds.delete(r.pointerId);
    }
  }
  function us(e, r, n, i, o, d) {
    return e === null || e.nativeEvent !== d
      ? ((e = {
          blockedOn: r,
          domEventName: n,
          eventSystemFlags: i,
          nativeEvent: d,
          targetContainers: [o],
        }),
        r !== null && ((r = ks(r)), r !== null && Kl(r)),
        e)
      : ((e.eventSystemFlags |= i),
        (r = e.targetContainers),
        o !== null && r.indexOf(o) === -1 && r.push(o),
        e);
  }
  function Pp(e, r, n, i, o) {
    switch (r) {
      case "focusin":
        return (gr = us(gr, e, r, n, i, o)), !0;
      case "dragenter":
        return (vr = us(vr, e, r, n, i, o)), !0;
      case "mouseover":
        return (yr = us(yr, e, r, n, i, o)), !0;
      case "pointerover":
        var d = o.pointerId;
        return cs.set(d, us(cs.get(d) || null, e, r, n, i, o)), !0;
      case "gotpointercapture":
        return (
          (d = o.pointerId), ds.set(d, us(ds.get(d) || null, e, r, n, i, o)), !0
        );
    }
    return !1;
  }
  function td(e) {
    var r = Wr(e.target);
    if (r !== null) {
      var n = Ur(r);
      if (n !== null) {
        if (((r = n.tag), r === 13)) {
          if (((r = $c(n)), r !== null)) {
            (e.blockedOn = r),
              Jc(e.priority, function () {
                Xc(n);
              });
            return;
          }
        } else if (r === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function si(e) {
    if (e.blockedOn !== null) return !1;
    for (var r = e.targetContainers; 0 < r.length; ) {
      var n = Zl(e.domEventName, e.eventSystemFlags, r[0], e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var i = new n.constructor(n.type, n);
        (Fl = i), n.target.dispatchEvent(i), (Fl = null);
      } else return (r = ks(n)), r !== null && Kl(r), (e.blockedOn = n), !1;
      r.shift();
    }
    return !0;
  }
  function rd(e, r, n) {
    si(e) && n.delete(r);
  }
  function Ap() {
    (Yl = !1),
      gr !== null && si(gr) && (gr = null),
      vr !== null && si(vr) && (vr = null),
      yr !== null && si(yr) && (yr = null),
      cs.forEach(rd),
      ds.forEach(rd);
  }
  function ms(e, r) {
    e.blockedOn === r &&
      ((e.blockedOn = null),
      Yl ||
        ((Yl = !0),
        l.unstable_scheduleCallback(l.unstable_NormalPriority, Ap)));
  }
  function fs(e) {
    function r(o) {
      return ms(o, e);
    }
    if (0 < ni.length) {
      ms(ni[0], e);
      for (var n = 1; n < ni.length; n++) {
        var i = ni[n];
        i.blockedOn === e && (i.blockedOn = null);
      }
    }
    for (
      gr !== null && ms(gr, e),
        vr !== null && ms(vr, e),
        yr !== null && ms(yr, e),
        cs.forEach(r),
        ds.forEach(r),
        n = 0;
      n < jr.length;
      n++
    )
      (i = jr[n]), i.blockedOn === e && (i.blockedOn = null);
    for (; 0 < jr.length && ((n = jr[0]), n.blockedOn === null); )
      td(n), n.blockedOn === null && jr.shift();
  }
  var xn = D.ReactCurrentBatchConfig,
    ii = !0;
  function Rp(e, r, n, i) {
    var o = ze,
      d = xn.transition;
    xn.transition = null;
    try {
      (ze = 1), Xl(e, r, n, i);
    } finally {
      (ze = o), (xn.transition = d);
    }
  }
  function Mp(e, r, n, i) {
    var o = ze,
      d = xn.transition;
    xn.transition = null;
    try {
      (ze = 4), Xl(e, r, n, i);
    } finally {
      (ze = o), (xn.transition = d);
    }
  }
  function Xl(e, r, n, i) {
    if (ii) {
      var o = Zl(e, r, n, i);
      if (o === null) pa(e, r, i, li, n), ed(e, i);
      else if (Pp(o, e, r, n, i)) i.stopPropagation();
      else if ((ed(e, i), r & 4 && -1 < Ep.indexOf(e))) {
        for (; o !== null; ) {
          var d = ks(o);
          if (
            (d !== null && Yc(d),
            (d = Zl(e, r, n, i)),
            d === null && pa(e, r, i, li, n),
            d === o)
          )
            break;
          o = d;
        }
        o !== null && i.stopPropagation();
      } else pa(e, r, i, null, n);
    }
  }
  var li = null;
  function Zl(e, r, n, i) {
    if (((li = null), (e = $l(i)), (e = Wr(e)), e !== null))
      if (((r = Ur(e)), r === null)) e = null;
      else if (((n = r.tag), n === 13)) {
        if (((e = $c(r)), e !== null)) return e;
        e = null;
      } else if (n === 3) {
        if (r.stateNode.current.memoizedState.isDehydrated)
          return r.tag === 3 ? r.stateNode.containerInfo : null;
        e = null;
      } else r !== e && (e = null);
    return (li = e), null;
  }
  function nd(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (vp()) {
          case Ul:
            return 1;
          case Wc:
            return 4;
          case Zs:
          case yp:
            return 16;
          case Gc:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var br = null,
    Jl = null,
    ai = null;
  function sd() {
    if (ai) return ai;
    var e,
      r = Jl,
      n = r.length,
      i,
      o = "value" in br ? br.value : br.textContent,
      d = o.length;
    for (e = 0; e < n && r[e] === o[e]; e++);
    var h = n - e;
    for (i = 1; i <= h && r[n - i] === o[d - i]; i++);
    return (ai = o.slice(e, 1 < i ? 1 - i : void 0));
  }
  function oi(e) {
    var r = e.keyCode;
    return (
      "charCode" in e
        ? ((e = e.charCode), e === 0 && r === 13 && (e = 13))
        : (e = r),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function ci() {
    return !0;
  }
  function id() {
    return !1;
  }
  function jt(e) {
    function r(n, i, o, d, h) {
      (this._reactName = n),
        (this._targetInst = o),
        (this.type = i),
        (this.nativeEvent = d),
        (this.target = h),
        (this.currentTarget = null);
      for (var y in e)
        e.hasOwnProperty(y) && ((n = e[y]), (this[y] = n ? n(d) : d[y]));
      return (
        (this.isDefaultPrevented = (
          d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1
        )
          ? ci
          : id),
        (this.isPropagationStopped = id),
        this
      );
    }
    return (
      K(r.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n &&
            (n.preventDefault
              ? n.preventDefault()
              : typeof n.returnValue != "unknown" && (n.returnValue = !1),
            (this.isDefaultPrevented = ci));
        },
        stopPropagation: function () {
          var n = this.nativeEvent;
          n &&
            (n.stopPropagation
              ? n.stopPropagation()
              : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
            (this.isPropagationStopped = ci));
        },
        persist: function () {},
        isPersistent: ci,
      }),
      r
    );
  }
  var gn = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    ea = jt(gn),
    hs = K({}, gn, { view: 0, detail: 0 }),
    _p = jt(hs),
    ta,
    ra,
    ps,
    di = K({}, hs, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: sa,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e
          ? e.movementX
          : (e !== ps &&
              (ps && e.type === "mousemove"
                ? ((ta = e.screenX - ps.screenX), (ra = e.screenY - ps.screenY))
                : (ra = ta = 0),
              (ps = e)),
            ta);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : ra;
      },
    }),
    ld = jt(di),
    Tp = K({}, di, { dataTransfer: 0 }),
    zp = jt(Tp),
    Ip = K({}, hs, { relatedTarget: 0 }),
    na = jt(Ip),
    Op = K({}, gn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Lp = jt(Op),
    Dp = K({}, gn, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      },
    }),
    Fp = jt(Dp),
    $p = K({}, gn, { data: 0 }),
    ad = jt($p),
    Hp = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    Vp = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    qp = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function Bp(e) {
    var r = this.nativeEvent;
    return r.getModifierState
      ? r.getModifierState(e)
      : (e = qp[e])
      ? !!r[e]
      : !1;
  }
  function sa() {
    return Bp;
  }
  var Up = K({}, hs, {
      key: function (e) {
        if (e.key) {
          var r = Hp[e.key] || e.key;
          if (r !== "Unidentified") return r;
        }
        return e.type === "keypress"
          ? ((e = oi(e)), e === 13 ? "Enter" : String.fromCharCode(e))
          : e.type === "keydown" || e.type === "keyup"
          ? Vp[e.keyCode] || "Unidentified"
          : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: sa,
      charCode: function (e) {
        return e.type === "keypress" ? oi(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress"
          ? oi(e)
          : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
      },
    }),
    Wp = jt(Up),
    Gp = K({}, di, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    od = jt(Gp),
    Qp = K({}, hs, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: sa,
    }),
    Kp = jt(Qp),
    Yp = K({}, gn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Xp = jt(Yp),
    Zp = K({}, di, {
      deltaX: function (e) {
        return "deltaX" in e
          ? e.deltaX
          : "wheelDeltaX" in e
          ? -e.wheelDeltaX
          : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e
          ? e.deltaY
          : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
          ? -e.wheelDelta
          : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    Jp = jt(Zp),
    ex = [9, 13, 27, 32],
    ia = m && "CompositionEvent" in window,
    xs = null;
  m && "documentMode" in document && (xs = document.documentMode);
  var tx = m && "TextEvent" in window && !xs,
    cd = m && (!ia || (xs && 8 < xs && 11 >= xs)),
    dd = " ",
    ud = !1;
  function md(e, r) {
    switch (e) {
      case "keyup":
        return ex.indexOf(r.keyCode) !== -1;
      case "keydown":
        return r.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function fd(e) {
    return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
  }
  var vn = !1;
  function rx(e, r) {
    switch (e) {
      case "compositionend":
        return fd(r);
      case "keypress":
        return r.which !== 32 ? null : ((ud = !0), dd);
      case "textInput":
        return (e = r.data), e === dd && ud ? null : e;
      default:
        return null;
    }
  }
  function nx(e, r) {
    if (vn)
      return e === "compositionend" || (!ia && md(e, r))
        ? ((e = sd()), (ai = Jl = br = null), (vn = !1), e)
        : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(r.ctrlKey || r.altKey || r.metaKey) || (r.ctrlKey && r.altKey)) {
          if (r.char && 1 < r.char.length) return r.char;
          if (r.which) return String.fromCharCode(r.which);
        }
        return null;
      case "compositionend":
        return cd && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var sx = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function hd(e) {
    var r = e && e.nodeName && e.nodeName.toLowerCase();
    return r === "input" ? !!sx[e.type] : r === "textarea";
  }
  function pd(e, r, n, i) {
    Ic(i),
      (r = pi(r, "onChange")),
      0 < r.length &&
        ((n = new ea("onChange", "change", null, n, i)),
        e.push({ event: n, listeners: r }));
  }
  var gs = null,
    vs = null;
  function ix(e) {
    Td(e, 0);
  }
  function ui(e) {
    var r = wn(e);
    if (Ie(r)) return e;
  }
  function lx(e, r) {
    if (e === "change") return r;
  }
  var xd = !1;
  if (m) {
    var la;
    if (m) {
      var aa = "oninput" in document;
      if (!aa) {
        var gd = document.createElement("div");
        gd.setAttribute("oninput", "return;"),
          (aa = typeof gd.oninput == "function");
      }
      la = aa;
    } else la = !1;
    xd = la && (!document.documentMode || 9 < document.documentMode);
  }
  function vd() {
    gs && (gs.detachEvent("onpropertychange", yd), (vs = gs = null));
  }
  function yd(e) {
    if (e.propertyName === "value" && ui(vs)) {
      var r = [];
      pd(r, vs, e, $l(e)), Fc(ix, r);
    }
  }
  function ax(e, r, n) {
    e === "focusin"
      ? (vd(), (gs = r), (vs = n), gs.attachEvent("onpropertychange", yd))
      : e === "focusout" && vd();
  }
  function ox(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return ui(vs);
  }
  function cx(e, r) {
    if (e === "click") return ui(r);
  }
  function dx(e, r) {
    if (e === "input" || e === "change") return ui(r);
  }
  function ux(e, r) {
    return (e === r && (e !== 0 || 1 / e === 1 / r)) || (e !== e && r !== r);
  }
  var Ot = typeof Object.is == "function" ? Object.is : ux;
  function ys(e, r) {
    if (Ot(e, r)) return !0;
    if (
      typeof e != "object" ||
      e === null ||
      typeof r != "object" ||
      r === null
    )
      return !1;
    var n = Object.keys(e),
      i = Object.keys(r);
    if (n.length !== i.length) return !1;
    for (i = 0; i < n.length; i++) {
      var o = n[i];
      if (!x.call(r, o) || !Ot(e[o], r[o])) return !1;
    }
    return !0;
  }
  function jd(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function bd(e, r) {
    var n = jd(e);
    e = 0;
    for (var i; n; ) {
      if (n.nodeType === 3) {
        if (((i = e + n.textContent.length), e <= r && i >= r))
          return { node: n, offset: r - e };
        e = i;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = jd(n);
    }
  }
  function Nd(e, r) {
    return e && r
      ? e === r
        ? !0
        : e && e.nodeType === 3
        ? !1
        : r && r.nodeType === 3
        ? Nd(e, r.parentNode)
        : "contains" in e
        ? e.contains(r)
        : e.compareDocumentPosition
        ? !!(e.compareDocumentPosition(r) & 16)
        : !1
      : !1;
  }
  function wd() {
    for (var e = window, r = tt(); r instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof r.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = r.contentWindow;
      else break;
      r = tt(e.document);
    }
    return r;
  }
  function oa(e) {
    var r = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      r &&
      ((r === "input" &&
        (e.type === "text" ||
          e.type === "search" ||
          e.type === "tel" ||
          e.type === "url" ||
          e.type === "password")) ||
        r === "textarea" ||
        e.contentEditable === "true")
    );
  }
  function mx(e) {
    var r = wd(),
      n = e.focusedElem,
      i = e.selectionRange;
    if (
      r !== n &&
      n &&
      n.ownerDocument &&
      Nd(n.ownerDocument.documentElement, n)
    ) {
      if (i !== null && oa(n)) {
        if (
          ((r = i.start),
          (e = i.end),
          e === void 0 && (e = r),
          "selectionStart" in n)
        )
          (n.selectionStart = r),
            (n.selectionEnd = Math.min(e, n.value.length));
        else if (
          ((e = ((r = n.ownerDocument || document) && r.defaultView) || window),
          e.getSelection)
        ) {
          e = e.getSelection();
          var o = n.textContent.length,
            d = Math.min(i.start, o);
          (i = i.end === void 0 ? d : Math.min(i.end, o)),
            !e.extend && d > i && ((o = i), (i = d), (d = o)),
            (o = bd(n, d));
          var h = bd(n, i);
          o &&
            h &&
            (e.rangeCount !== 1 ||
              e.anchorNode !== o.node ||
              e.anchorOffset !== o.offset ||
              e.focusNode !== h.node ||
              e.focusOffset !== h.offset) &&
            ((r = r.createRange()),
            r.setStart(o.node, o.offset),
            e.removeAllRanges(),
            d > i
              ? (e.addRange(r), e.extend(h.node, h.offset))
              : (r.setEnd(h.node, h.offset), e.addRange(r)));
        }
      }
      for (r = [], e = n; (e = e.parentNode); )
        e.nodeType === 1 &&
          r.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof n.focus == "function" && n.focus(), n = 0; n < r.length; n++)
        (e = r[n]),
          (e.element.scrollLeft = e.left),
          (e.element.scrollTop = e.top);
    }
  }
  var fx = m && "documentMode" in document && 11 >= document.documentMode,
    yn = null,
    ca = null,
    js = null,
    da = !1;
  function Sd(e, r, n) {
    var i =
      n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    da ||
      yn == null ||
      yn !== tt(i) ||
      ((i = yn),
      "selectionStart" in i && oa(i)
        ? (i = { start: i.selectionStart, end: i.selectionEnd })
        : ((i = (
            (i.ownerDocument && i.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (i = {
            anchorNode: i.anchorNode,
            anchorOffset: i.anchorOffset,
            focusNode: i.focusNode,
            focusOffset: i.focusOffset,
          })),
      (js && ys(js, i)) ||
        ((js = i),
        (i = pi(ca, "onSelect")),
        0 < i.length &&
          ((r = new ea("onSelect", "select", null, r, n)),
          e.push({ event: r, listeners: i }),
          (r.target = yn))));
  }
  function mi(e, r) {
    var n = {};
    return (
      (n[e.toLowerCase()] = r.toLowerCase()),
      (n["Webkit" + e] = "webkit" + r),
      (n["Moz" + e] = "moz" + r),
      n
    );
  }
  var jn = {
      animationend: mi("Animation", "AnimationEnd"),
      animationiteration: mi("Animation", "AnimationIteration"),
      animationstart: mi("Animation", "AnimationStart"),
      transitionend: mi("Transition", "TransitionEnd"),
    },
    ua = {},
    kd = {};
  m &&
    ((kd = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete jn.animationend.animation,
      delete jn.animationiteration.animation,
      delete jn.animationstart.animation),
    "TransitionEvent" in window || delete jn.transitionend.transition);
  function fi(e) {
    if (ua[e]) return ua[e];
    if (!jn[e]) return e;
    var r = jn[e],
      n;
    for (n in r) if (r.hasOwnProperty(n) && n in kd) return (ua[e] = r[n]);
    return e;
  }
  var Cd = fi("animationend"),
    Ed = fi("animationiteration"),
    Pd = fi("animationstart"),
    Ad = fi("transitionend"),
    Rd = new Map(),
    Md =
      "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " "
      );
  function Nr(e, r) {
    Rd.set(e, r), f(r, [e]);
  }
  for (var ma = 0; ma < Md.length; ma++) {
    var fa = Md[ma],
      hx = fa.toLowerCase(),
      px = fa[0].toUpperCase() + fa.slice(1);
    Nr(hx, "on" + px);
  }
  Nr(Cd, "onAnimationEnd"),
    Nr(Ed, "onAnimationIteration"),
    Nr(Pd, "onAnimationStart"),
    Nr("dblclick", "onDoubleClick"),
    Nr("focusin", "onFocus"),
    Nr("focusout", "onBlur"),
    Nr(Ad, "onTransitionEnd"),
    p("onMouseEnter", ["mouseout", "mouseover"]),
    p("onMouseLeave", ["mouseout", "mouseover"]),
    p("onPointerEnter", ["pointerout", "pointerover"]),
    p("onPointerLeave", ["pointerout", "pointerover"]),
    f(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " "
      )
    ),
    f(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " "
      )
    ),
    f("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    f(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" ")
    ),
    f(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" ")
    ),
    f(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
    );
  var bs =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " "
      ),
    xx = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(bs)
    );
  function _d(e, r, n) {
    var i = e.type || "unknown-event";
    (e.currentTarget = n), hp(i, r, void 0, e), (e.currentTarget = null);
  }
  function Td(e, r) {
    r = (r & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var i = e[n],
        o = i.event;
      i = i.listeners;
      e: {
        var d = void 0;
        if (r)
          for (var h = i.length - 1; 0 <= h; h--) {
            var y = i[h],
              w = y.instance,
              _ = y.currentTarget;
            if (((y = y.listener), w !== d && o.isPropagationStopped()))
              break e;
            _d(o, y, _), (d = w);
          }
        else
          for (h = 0; h < i.length; h++) {
            if (
              ((y = i[h]),
              (w = y.instance),
              (_ = y.currentTarget),
              (y = y.listener),
              w !== d && o.isPropagationStopped())
            )
              break e;
            _d(o, y, _), (d = w);
          }
      }
    }
    if (Xs) throw ((e = Bl), (Xs = !1), (Bl = null), e);
  }
  function Le(e, r) {
    var n = r[ba];
    n === void 0 && (n = r[ba] = new Set());
    var i = e + "__bubble";
    n.has(i) || (zd(r, e, 2, !1), n.add(i));
  }
  function ha(e, r, n) {
    var i = 0;
    r && (i |= 4), zd(n, e, i, r);
  }
  var hi = "_reactListening" + Math.random().toString(36).slice(2);
  function Ns(e) {
    if (!e[hi]) {
      (e[hi] = !0),
        c.forEach(function (n) {
          n !== "selectionchange" && (xx.has(n) || ha(n, !1, e), ha(n, !0, e));
        });
      var r = e.nodeType === 9 ? e : e.ownerDocument;
      r === null || r[hi] || ((r[hi] = !0), ha("selectionchange", !1, r));
    }
  }
  function zd(e, r, n, i) {
    switch (nd(r)) {
      case 1:
        var o = Rp;
        break;
      case 4:
        o = Mp;
        break;
      default:
        o = Xl;
    }
    (n = o.bind(null, r, n, e)),
      (o = void 0),
      !ql ||
        (r !== "touchstart" && r !== "touchmove" && r !== "wheel") ||
        (o = !0),
      i
        ? o !== void 0
          ? e.addEventListener(r, n, { capture: !0, passive: o })
          : e.addEventListener(r, n, !0)
        : o !== void 0
        ? e.addEventListener(r, n, { passive: o })
        : e.addEventListener(r, n, !1);
  }
  function pa(e, r, n, i, o) {
    var d = i;
    if ((r & 1) === 0 && (r & 2) === 0 && i !== null)
      e: for (;;) {
        if (i === null) return;
        var h = i.tag;
        if (h === 3 || h === 4) {
          var y = i.stateNode.containerInfo;
          if (y === o || (y.nodeType === 8 && y.parentNode === o)) break;
          if (h === 4)
            for (h = i.return; h !== null; ) {
              var w = h.tag;
              if (
                (w === 3 || w === 4) &&
                ((w = h.stateNode.containerInfo),
                w === o || (w.nodeType === 8 && w.parentNode === o))
              )
                return;
              h = h.return;
            }
          for (; y !== null; ) {
            if (((h = Wr(y)), h === null)) return;
            if (((w = h.tag), w === 5 || w === 6)) {
              i = d = h;
              continue e;
            }
            y = y.parentNode;
          }
        }
        i = i.return;
      }
    Fc(function () {
      var _ = d,
        $ = $l(n),
        V = [];
      e: {
        var F = Rd.get(e);
        if (F !== void 0) {
          var J = ea,
            re = e;
          switch (e) {
            case "keypress":
              if (oi(n) === 0) break e;
            case "keydown":
            case "keyup":
              J = Wp;
              break;
            case "focusin":
              (re = "focus"), (J = na);
              break;
            case "focusout":
              (re = "blur"), (J = na);
              break;
            case "beforeblur":
            case "afterblur":
              J = na;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              J = ld;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              J = zp;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              J = Kp;
              break;
            case Cd:
            case Ed:
            case Pd:
              J = Lp;
              break;
            case Ad:
              J = Xp;
              break;
            case "scroll":
              J = _p;
              break;
            case "wheel":
              J = Jp;
              break;
            case "copy":
            case "cut":
            case "paste":
              J = Fp;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              J = od;
          }
          var ie = (r & 4) !== 0,
            Ue = !ie && e === "scroll",
            R = ie ? (F !== null ? F + "Capture" : null) : F;
          ie = [];
          for (var k = _, M; k !== null; ) {
            M = k;
            var W = M.stateNode;
            if (
              (M.tag === 5 &&
                W !== null &&
                ((M = W),
                R !== null &&
                  ((W = ss(k, R)), W != null && ie.push(ws(k, W, M)))),
              Ue)
            )
              break;
            k = k.return;
          }
          0 < ie.length &&
            ((F = new J(F, re, null, n, $)),
            V.push({ event: F, listeners: ie }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (
            ((F = e === "mouseover" || e === "pointerover"),
            (J = e === "mouseout" || e === "pointerout"),
            F &&
              n !== Fl &&
              (re = n.relatedTarget || n.fromElement) &&
              (Wr(re) || re[sr]))
          )
            break e;
          if (
            (J || F) &&
            ((F =
              $.window === $
                ? $
                : (F = $.ownerDocument)
                ? F.defaultView || F.parentWindow
                : window),
            J
              ? ((re = n.relatedTarget || n.toElement),
                (J = _),
                (re = re ? Wr(re) : null),
                re !== null &&
                  ((Ue = Ur(re)),
                  re !== Ue || (re.tag !== 5 && re.tag !== 6)) &&
                  (re = null))
              : ((J = null), (re = _)),
            J !== re)
          ) {
            if (
              ((ie = ld),
              (W = "onMouseLeave"),
              (R = "onMouseEnter"),
              (k = "mouse"),
              (e === "pointerout" || e === "pointerover") &&
                ((ie = od),
                (W = "onPointerLeave"),
                (R = "onPointerEnter"),
                (k = "pointer")),
              (Ue = J == null ? F : wn(J)),
              (M = re == null ? F : wn(re)),
              (F = new ie(W, k + "leave", J, n, $)),
              (F.target = Ue),
              (F.relatedTarget = M),
              (W = null),
              Wr($) === _ &&
                ((ie = new ie(R, k + "enter", re, n, $)),
                (ie.target = M),
                (ie.relatedTarget = Ue),
                (W = ie)),
              (Ue = W),
              J && re)
            )
              t: {
                for (ie = J, R = re, k = 0, M = ie; M; M = bn(M)) k++;
                for (M = 0, W = R; W; W = bn(W)) M++;
                for (; 0 < k - M; ) (ie = bn(ie)), k--;
                for (; 0 < M - k; ) (R = bn(R)), M--;
                for (; k--; ) {
                  if (ie === R || (R !== null && ie === R.alternate)) break t;
                  (ie = bn(ie)), (R = bn(R));
                }
                ie = null;
              }
            else ie = null;
            J !== null && Id(V, F, J, ie, !1),
              re !== null && Ue !== null && Id(V, Ue, re, ie, !0);
          }
        }
        e: {
          if (
            ((F = _ ? wn(_) : window),
            (J = F.nodeName && F.nodeName.toLowerCase()),
            J === "select" || (J === "input" && F.type === "file"))
          )
            var ce = lx;
          else if (hd(F))
            if (xd) ce = dx;
            else {
              ce = ox;
              var me = ax;
            }
          else
            (J = F.nodeName) &&
              J.toLowerCase() === "input" &&
              (F.type === "checkbox" || F.type === "radio") &&
              (ce = cx);
          if (ce && (ce = ce(e, _))) {
            pd(V, ce, n, $);
            break e;
          }
          me && me(e, F, _),
            e === "focusout" &&
              (me = F._wrapperState) &&
              me.controlled &&
              F.type === "number" &&
              zl(F, "number", F.value);
        }
        switch (((me = _ ? wn(_) : window), e)) {
          case "focusin":
            (hd(me) || me.contentEditable === "true") &&
              ((yn = me), (ca = _), (js = null));
            break;
          case "focusout":
            js = ca = yn = null;
            break;
          case "mousedown":
            da = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            (da = !1), Sd(V, n, $);
            break;
          case "selectionchange":
            if (fx) break;
          case "keydown":
          case "keyup":
            Sd(V, n, $);
        }
        var fe;
        if (ia)
          e: {
            switch (e) {
              case "compositionstart":
                var ve = "onCompositionStart";
                break e;
              case "compositionend":
                ve = "onCompositionEnd";
                break e;
              case "compositionupdate":
                ve = "onCompositionUpdate";
                break e;
            }
            ve = void 0;
          }
        else
          vn
            ? md(e, n) && (ve = "onCompositionEnd")
            : e === "keydown" &&
              n.keyCode === 229 &&
              (ve = "onCompositionStart");
        ve &&
          (cd &&
            n.locale !== "ko" &&
            (vn || ve !== "onCompositionStart"
              ? ve === "onCompositionEnd" && vn && (fe = sd())
              : ((br = $),
                (Jl = "value" in br ? br.value : br.textContent),
                (vn = !0))),
          (me = pi(_, ve)),
          0 < me.length &&
            ((ve = new ad(ve, e, null, n, $)),
            V.push({ event: ve, listeners: me }),
            fe
              ? (ve.data = fe)
              : ((fe = fd(n)), fe !== null && (ve.data = fe)))),
          (fe = tx ? rx(e, n) : nx(e, n)) &&
            ((_ = pi(_, "onBeforeInput")),
            0 < _.length &&
              (($ = new ad("onBeforeInput", "beforeinput", null, n, $)),
              V.push({ event: $, listeners: _ }),
              ($.data = fe)));
      }
      Td(V, r);
    });
  }
  function ws(e, r, n) {
    return { instance: e, listener: r, currentTarget: n };
  }
  function pi(e, r) {
    for (var n = r + "Capture", i = []; e !== null; ) {
      var o = e,
        d = o.stateNode;
      o.tag === 5 &&
        d !== null &&
        ((o = d),
        (d = ss(e, n)),
        d != null && i.unshift(ws(e, d, o)),
        (d = ss(e, r)),
        d != null && i.push(ws(e, d, o))),
        (e = e.return);
    }
    return i;
  }
  function bn(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function Id(e, r, n, i, o) {
    for (var d = r._reactName, h = []; n !== null && n !== i; ) {
      var y = n,
        w = y.alternate,
        _ = y.stateNode;
      if (w !== null && w === i) break;
      y.tag === 5 &&
        _ !== null &&
        ((y = _),
        o
          ? ((w = ss(n, d)), w != null && h.unshift(ws(n, w, y)))
          : o || ((w = ss(n, d)), w != null && h.push(ws(n, w, y)))),
        (n = n.return);
    }
    h.length !== 0 && e.push({ event: r, listeners: h });
  }
  var gx = /\r\n?/g,
    vx = /\u0000|\uFFFD/g;
  function Od(e) {
    return (typeof e == "string" ? e : "" + e)
      .replace(
        gx,
        `
`
      )
      .replace(vx, "");
  }
  function xi(e, r, n) {
    if (((r = Od(r)), Od(e) !== r && n)) throw Error(a(425));
  }
  function gi() {}
  var xa = null,
    ga = null;
  function va(e, r) {
    return (
      e === "textarea" ||
      e === "noscript" ||
      typeof r.children == "string" ||
      typeof r.children == "number" ||
      (typeof r.dangerouslySetInnerHTML == "object" &&
        r.dangerouslySetInnerHTML !== null &&
        r.dangerouslySetInnerHTML.__html != null)
    );
  }
  var ya = typeof setTimeout == "function" ? setTimeout : void 0,
    yx = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Ld = typeof Promise == "function" ? Promise : void 0,
    jx =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Ld < "u"
        ? function (e) {
            return Ld.resolve(null).then(e).catch(bx);
          }
        : ya;
  function bx(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function ja(e, r) {
    var n = r,
      i = 0;
    do {
      var o = n.nextSibling;
      if ((e.removeChild(n), o && o.nodeType === 8))
        if (((n = o.data), n === "/$")) {
          if (i === 0) {
            e.removeChild(o), fs(r);
            return;
          }
          i--;
        } else (n !== "$" && n !== "$?" && n !== "$!") || i++;
      n = o;
    } while (n);
    fs(r);
  }
  function wr(e) {
    for (; e != null; e = e.nextSibling) {
      var r = e.nodeType;
      if (r === 1 || r === 3) break;
      if (r === 8) {
        if (((r = e.data), r === "$" || r === "$!" || r === "$?")) break;
        if (r === "/$") return null;
      }
    }
    return e;
  }
  function Dd(e) {
    e = e.previousSibling;
    for (var r = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?") {
          if (r === 0) return e;
          r--;
        } else n === "/$" && r++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var Nn = Math.random().toString(36).slice(2),
    Gt = "__reactFiber$" + Nn,
    Ss = "__reactProps$" + Nn,
    sr = "__reactContainer$" + Nn,
    ba = "__reactEvents$" + Nn,
    Nx = "__reactListeners$" + Nn,
    wx = "__reactHandles$" + Nn;
  function Wr(e) {
    var r = e[Gt];
    if (r) return r;
    for (var n = e.parentNode; n; ) {
      if ((r = n[sr] || n[Gt])) {
        if (
          ((n = r.alternate),
          r.child !== null || (n !== null && n.child !== null))
        )
          for (e = Dd(e); e !== null; ) {
            if ((n = e[Gt])) return n;
            e = Dd(e);
          }
        return r;
      }
      (e = n), (n = e.parentNode);
    }
    return null;
  }
  function ks(e) {
    return (
      (e = e[Gt] || e[sr]),
      !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3)
        ? null
        : e
    );
  }
  function wn(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(a(33));
  }
  function vi(e) {
    return e[Ss] || null;
  }
  var Na = [],
    Sn = -1;
  function Sr(e) {
    return { current: e };
  }
  function De(e) {
    0 > Sn || ((e.current = Na[Sn]), (Na[Sn] = null), Sn--);
  }
  function Oe(e, r) {
    Sn++, (Na[Sn] = e.current), (e.current = r);
  }
  var kr = {},
    lt = Sr(kr),
    mt = Sr(!1),
    Gr = kr;
  function kn(e, r) {
    var n = e.type.contextTypes;
    if (!n) return kr;
    var i = e.stateNode;
    if (i && i.__reactInternalMemoizedUnmaskedChildContext === r)
      return i.__reactInternalMemoizedMaskedChildContext;
    var o = {},
      d;
    for (d in n) o[d] = r[d];
    return (
      i &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = r),
        (e.__reactInternalMemoizedMaskedChildContext = o)),
      o
    );
  }
  function ft(e) {
    return (e = e.childContextTypes), e != null;
  }
  function yi() {
    De(mt), De(lt);
  }
  function Fd(e, r, n) {
    if (lt.current !== kr) throw Error(a(168));
    Oe(lt, r), Oe(mt, n);
  }
  function $d(e, r, n) {
    var i = e.stateNode;
    if (((r = r.childContextTypes), typeof i.getChildContext != "function"))
      return n;
    i = i.getChildContext();
    for (var o in i) if (!(o in r)) throw Error(a(108, B(e) || "Unknown", o));
    return K({}, n, i);
  }
  function ji(e) {
    return (
      (e =
        ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) ||
        kr),
      (Gr = lt.current),
      Oe(lt, e),
      Oe(mt, mt.current),
      !0
    );
  }
  function Hd(e, r, n) {
    var i = e.stateNode;
    if (!i) throw Error(a(169));
    n
      ? ((e = $d(e, r, Gr)),
        (i.__reactInternalMemoizedMergedChildContext = e),
        De(mt),
        De(lt),
        Oe(lt, e))
      : De(mt),
      Oe(mt, n);
  }
  var ir = null,
    bi = !1,
    wa = !1;
  function Vd(e) {
    ir === null ? (ir = [e]) : ir.push(e);
  }
  function Sx(e) {
    (bi = !0), Vd(e);
  }
  function Cr() {
    if (!wa && ir !== null) {
      wa = !0;
      var e = 0,
        r = ze;
      try {
        var n = ir;
        for (ze = 1; e < n.length; e++) {
          var i = n[e];
          do i = i(!0);
          while (i !== null);
        }
        (ir = null), (bi = !1);
      } catch (o) {
        throw (ir !== null && (ir = ir.slice(e + 1)), Bc(Ul, Cr), o);
      } finally {
        (ze = r), (wa = !1);
      }
    }
    return null;
  }
  var Cn = [],
    En = 0,
    Ni = null,
    wi = 0,
    Et = [],
    Pt = 0,
    Qr = null,
    lr = 1,
    ar = "";
  function Kr(e, r) {
    (Cn[En++] = wi), (Cn[En++] = Ni), (Ni = e), (wi = r);
  }
  function qd(e, r, n) {
    (Et[Pt++] = lr), (Et[Pt++] = ar), (Et[Pt++] = Qr), (Qr = e);
    var i = lr;
    e = ar;
    var o = 32 - It(i) - 1;
    (i &= ~(1 << o)), (n += 1);
    var d = 32 - It(r) + o;
    if (30 < d) {
      var h = o - (o % 5);
      (d = (i & ((1 << h) - 1)).toString(32)),
        (i >>= h),
        (o -= h),
        (lr = (1 << (32 - It(r) + o)) | (n << o) | i),
        (ar = d + e);
    } else (lr = (1 << d) | (n << o) | i), (ar = e);
  }
  function Sa(e) {
    e.return !== null && (Kr(e, 1), qd(e, 1, 0));
  }
  function ka(e) {
    for (; e === Ni; )
      (Ni = Cn[--En]), (Cn[En] = null), (wi = Cn[--En]), (Cn[En] = null);
    for (; e === Qr; )
      (Qr = Et[--Pt]),
        (Et[Pt] = null),
        (ar = Et[--Pt]),
        (Et[Pt] = null),
        (lr = Et[--Pt]),
        (Et[Pt] = null);
  }
  var bt = null,
    Nt = null,
    Fe = !1,
    Lt = null;
  function Bd(e, r) {
    var n = _t(5, null, null, 0);
    (n.elementType = "DELETED"),
      (n.stateNode = r),
      (n.return = e),
      (r = e.deletions),
      r === null ? ((e.deletions = [n]), (e.flags |= 16)) : r.push(n);
  }
  function Ud(e, r) {
    switch (e.tag) {
      case 5:
        var n = e.type;
        return (
          (r =
            r.nodeType !== 1 || n.toLowerCase() !== r.nodeName.toLowerCase()
              ? null
              : r),
          r !== null
            ? ((e.stateNode = r), (bt = e), (Nt = wr(r.firstChild)), !0)
            : !1
        );
      case 6:
        return (
          (r = e.pendingProps === "" || r.nodeType !== 3 ? null : r),
          r !== null ? ((e.stateNode = r), (bt = e), (Nt = null), !0) : !1
        );
      case 13:
        return (
          (r = r.nodeType !== 8 ? null : r),
          r !== null
            ? ((n = Qr !== null ? { id: lr, overflow: ar } : null),
              (e.memoizedState = {
                dehydrated: r,
                treeContext: n,
                retryLane: 1073741824,
              }),
              (n = _t(18, null, null, 0)),
              (n.stateNode = r),
              (n.return = e),
              (e.child = n),
              (bt = e),
              (Nt = null),
              !0)
            : !1
        );
      default:
        return !1;
    }
  }
  function Ca(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function Ea(e) {
    if (Fe) {
      var r = Nt;
      if (r) {
        var n = r;
        if (!Ud(e, r)) {
          if (Ca(e)) throw Error(a(418));
          r = wr(n.nextSibling);
          var i = bt;
          r && Ud(e, r)
            ? Bd(i, n)
            : ((e.flags = (e.flags & -4097) | 2), (Fe = !1), (bt = e));
        }
      } else {
        if (Ca(e)) throw Error(a(418));
        (e.flags = (e.flags & -4097) | 2), (Fe = !1), (bt = e);
      }
    }
  }
  function Wd(e) {
    for (
      e = e.return;
      e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;

    )
      e = e.return;
    bt = e;
  }
  function Si(e) {
    if (e !== bt) return !1;
    if (!Fe) return Wd(e), (Fe = !0), !1;
    var r;
    if (
      ((r = e.tag !== 3) &&
        !(r = e.tag !== 5) &&
        ((r = e.type),
        (r = r !== "head" && r !== "body" && !va(e.type, e.memoizedProps))),
      r && (r = Nt))
    ) {
      if (Ca(e)) throw (Gd(), Error(a(418)));
      for (; r; ) Bd(e, r), (r = wr(r.nextSibling));
    }
    if ((Wd(e), e.tag === 13)) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(a(317));
      e: {
        for (e = e.nextSibling, r = 0; e; ) {
          if (e.nodeType === 8) {
            var n = e.data;
            if (n === "/$") {
              if (r === 0) {
                Nt = wr(e.nextSibling);
                break e;
              }
              r--;
            } else (n !== "$" && n !== "$!" && n !== "$?") || r++;
          }
          e = e.nextSibling;
        }
        Nt = null;
      }
    } else Nt = bt ? wr(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Gd() {
    for (var e = Nt; e; ) e = wr(e.nextSibling);
  }
  function Pn() {
    (Nt = bt = null), (Fe = !1);
  }
  function Pa(e) {
    Lt === null ? (Lt = [e]) : Lt.push(e);
  }
  var kx = D.ReactCurrentBatchConfig;
  function Cs(e, r, n) {
    if (
      ((e = n.ref),
      e !== null && typeof e != "function" && typeof e != "object")
    ) {
      if (n._owner) {
        if (((n = n._owner), n)) {
          if (n.tag !== 1) throw Error(a(309));
          var i = n.stateNode;
        }
        if (!i) throw Error(a(147, e));
        var o = i,
          d = "" + e;
        return r !== null &&
          r.ref !== null &&
          typeof r.ref == "function" &&
          r.ref._stringRef === d
          ? r.ref
          : ((r = function (h) {
              var y = o.refs;
              h === null ? delete y[d] : (y[d] = h);
            }),
            (r._stringRef = d),
            r);
      }
      if (typeof e != "string") throw Error(a(284));
      if (!n._owner) throw Error(a(290, e));
    }
    return e;
  }
  function ki(e, r) {
    throw (
      ((e = Object.prototype.toString.call(r)),
      Error(
        a(
          31,
          e === "[object Object]"
            ? "object with keys {" + Object.keys(r).join(", ") + "}"
            : e
        )
      ))
    );
  }
  function Qd(e) {
    var r = e._init;
    return r(e._payload);
  }
  function Kd(e) {
    function r(R, k) {
      if (e) {
        var M = R.deletions;
        M === null ? ((R.deletions = [k]), (R.flags |= 16)) : M.push(k);
      }
    }
    function n(R, k) {
      if (!e) return null;
      for (; k !== null; ) r(R, k), (k = k.sibling);
      return null;
    }
    function i(R, k) {
      for (R = new Map(); k !== null; )
        k.key !== null ? R.set(k.key, k) : R.set(k.index, k), (k = k.sibling);
      return R;
    }
    function o(R, k) {
      return (R = zr(R, k)), (R.index = 0), (R.sibling = null), R;
    }
    function d(R, k, M) {
      return (
        (R.index = M),
        e
          ? ((M = R.alternate),
            M !== null
              ? ((M = M.index), M < k ? ((R.flags |= 2), k) : M)
              : ((R.flags |= 2), k))
          : ((R.flags |= 1048576), k)
      );
    }
    function h(R) {
      return e && R.alternate === null && (R.flags |= 2), R;
    }
    function y(R, k, M, W) {
      return k === null || k.tag !== 6
        ? ((k = jo(M, R.mode, W)), (k.return = R), k)
        : ((k = o(k, M)), (k.return = R), k);
    }
    function w(R, k, M, W) {
      var ce = M.type;
      return ce === U
        ? $(R, k, M.props.children, W, M.key)
        : k !== null &&
          (k.elementType === ce ||
            (typeof ce == "object" &&
              ce !== null &&
              ce.$$typeof === de &&
              Qd(ce) === k.type))
        ? ((W = o(k, M.props)), (W.ref = Cs(R, k, M)), (W.return = R), W)
        : ((W = Ki(M.type, M.key, M.props, null, R.mode, W)),
          (W.ref = Cs(R, k, M)),
          (W.return = R),
          W);
    }
    function _(R, k, M, W) {
      return k === null ||
        k.tag !== 4 ||
        k.stateNode.containerInfo !== M.containerInfo ||
        k.stateNode.implementation !== M.implementation
        ? ((k = bo(M, R.mode, W)), (k.return = R), k)
        : ((k = o(k, M.children || [])), (k.return = R), k);
    }
    function $(R, k, M, W, ce) {
      return k === null || k.tag !== 7
        ? ((k = nn(M, R.mode, W, ce)), (k.return = R), k)
        : ((k = o(k, M)), (k.return = R), k);
    }
    function V(R, k, M) {
      if ((typeof k == "string" && k !== "") || typeof k == "number")
        return (k = jo("" + k, R.mode, M)), (k.return = R), k;
      if (typeof k == "object" && k !== null) {
        switch (k.$$typeof) {
          case q:
            return (
              (M = Ki(k.type, k.key, k.props, null, R.mode, M)),
              (M.ref = Cs(R, null, k)),
              (M.return = R),
              M
            );
          case Z:
            return (k = bo(k, R.mode, M)), (k.return = R), k;
          case de:
            var W = k._init;
            return V(R, W(k._payload), M);
        }
        if (ts(k) || X(k))
          return (k = nn(k, R.mode, M, null)), (k.return = R), k;
        ki(R, k);
      }
      return null;
    }
    function F(R, k, M, W) {
      var ce = k !== null ? k.key : null;
      if ((typeof M == "string" && M !== "") || typeof M == "number")
        return ce !== null ? null : y(R, k, "" + M, W);
      if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case q:
            return M.key === ce ? w(R, k, M, W) : null;
          case Z:
            return M.key === ce ? _(R, k, M, W) : null;
          case de:
            return (ce = M._init), F(R, k, ce(M._payload), W);
        }
        if (ts(M) || X(M)) return ce !== null ? null : $(R, k, M, W, null);
        ki(R, M);
      }
      return null;
    }
    function J(R, k, M, W, ce) {
      if ((typeof W == "string" && W !== "") || typeof W == "number")
        return (R = R.get(M) || null), y(k, R, "" + W, ce);
      if (typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case q:
            return (
              (R = R.get(W.key === null ? M : W.key) || null), w(k, R, W, ce)
            );
          case Z:
            return (
              (R = R.get(W.key === null ? M : W.key) || null), _(k, R, W, ce)
            );
          case de:
            var me = W._init;
            return J(R, k, M, me(W._payload), ce);
        }
        if (ts(W) || X(W)) return (R = R.get(M) || null), $(k, R, W, ce, null);
        ki(k, W);
      }
      return null;
    }
    function re(R, k, M, W) {
      for (
        var ce = null, me = null, fe = k, ve = (k = 0), et = null;
        fe !== null && ve < M.length;
        ve++
      ) {
        fe.index > ve ? ((et = fe), (fe = null)) : (et = fe.sibling);
        var Te = F(R, fe, M[ve], W);
        if (Te === null) {
          fe === null && (fe = et);
          break;
        }
        e && fe && Te.alternate === null && r(R, fe),
          (k = d(Te, k, ve)),
          me === null ? (ce = Te) : (me.sibling = Te),
          (me = Te),
          (fe = et);
      }
      if (ve === M.length) return n(R, fe), Fe && Kr(R, ve), ce;
      if (fe === null) {
        for (; ve < M.length; ve++)
          (fe = V(R, M[ve], W)),
            fe !== null &&
              ((k = d(fe, k, ve)),
              me === null ? (ce = fe) : (me.sibling = fe),
              (me = fe));
        return Fe && Kr(R, ve), ce;
      }
      for (fe = i(R, fe); ve < M.length; ve++)
        (et = J(fe, R, ve, M[ve], W)),
          et !== null &&
            (e &&
              et.alternate !== null &&
              fe.delete(et.key === null ? ve : et.key),
            (k = d(et, k, ve)),
            me === null ? (ce = et) : (me.sibling = et),
            (me = et));
      return (
        e &&
          fe.forEach(function (Ir) {
            return r(R, Ir);
          }),
        Fe && Kr(R, ve),
        ce
      );
    }
    function ie(R, k, M, W) {
      var ce = X(M);
      if (typeof ce != "function") throw Error(a(150));
      if (((M = ce.call(M)), M == null)) throw Error(a(151));
      for (
        var me = (ce = null), fe = k, ve = (k = 0), et = null, Te = M.next();
        fe !== null && !Te.done;
        ve++, Te = M.next()
      ) {
        fe.index > ve ? ((et = fe), (fe = null)) : (et = fe.sibling);
        var Ir = F(R, fe, Te.value, W);
        if (Ir === null) {
          fe === null && (fe = et);
          break;
        }
        e && fe && Ir.alternate === null && r(R, fe),
          (k = d(Ir, k, ve)),
          me === null ? (ce = Ir) : (me.sibling = Ir),
          (me = Ir),
          (fe = et);
      }
      if (Te.done) return n(R, fe), Fe && Kr(R, ve), ce;
      if (fe === null) {
        for (; !Te.done; ve++, Te = M.next())
          (Te = V(R, Te.value, W)),
            Te !== null &&
              ((k = d(Te, k, ve)),
              me === null ? (ce = Te) : (me.sibling = Te),
              (me = Te));
        return Fe && Kr(R, ve), ce;
      }
      for (fe = i(R, fe); !Te.done; ve++, Te = M.next())
        (Te = J(fe, R, ve, Te.value, W)),
          Te !== null &&
            (e &&
              Te.alternate !== null &&
              fe.delete(Te.key === null ? ve : Te.key),
            (k = d(Te, k, ve)),
            me === null ? (ce = Te) : (me.sibling = Te),
            (me = Te));
      return (
        e &&
          fe.forEach(function (sg) {
            return r(R, sg);
          }),
        Fe && Kr(R, ve),
        ce
      );
    }
    function Ue(R, k, M, W) {
      if (
        (typeof M == "object" &&
          M !== null &&
          M.type === U &&
          M.key === null &&
          (M = M.props.children),
        typeof M == "object" && M !== null)
      ) {
        switch (M.$$typeof) {
          case q:
            e: {
              for (var ce = M.key, me = k; me !== null; ) {
                if (me.key === ce) {
                  if (((ce = M.type), ce === U)) {
                    if (me.tag === 7) {
                      n(R, me.sibling),
                        (k = o(me, M.props.children)),
                        (k.return = R),
                        (R = k);
                      break e;
                    }
                  } else if (
                    me.elementType === ce ||
                    (typeof ce == "object" &&
                      ce !== null &&
                      ce.$$typeof === de &&
                      Qd(ce) === me.type)
                  ) {
                    n(R, me.sibling),
                      (k = o(me, M.props)),
                      (k.ref = Cs(R, me, M)),
                      (k.return = R),
                      (R = k);
                    break e;
                  }
                  n(R, me);
                  break;
                } else r(R, me);
                me = me.sibling;
              }
              M.type === U
                ? ((k = nn(M.props.children, R.mode, W, M.key)),
                  (k.return = R),
                  (R = k))
                : ((W = Ki(M.type, M.key, M.props, null, R.mode, W)),
                  (W.ref = Cs(R, k, M)),
                  (W.return = R),
                  (R = W));
            }
            return h(R);
          case Z:
            e: {
              for (me = M.key; k !== null; ) {
                if (k.key === me)
                  if (
                    k.tag === 4 &&
                    k.stateNode.containerInfo === M.containerInfo &&
                    k.stateNode.implementation === M.implementation
                  ) {
                    n(R, k.sibling),
                      (k = o(k, M.children || [])),
                      (k.return = R),
                      (R = k);
                    break e;
                  } else {
                    n(R, k);
                    break;
                  }
                else r(R, k);
                k = k.sibling;
              }
              (k = bo(M, R.mode, W)), (k.return = R), (R = k);
            }
            return h(R);
          case de:
            return (me = M._init), Ue(R, k, me(M._payload), W);
        }
        if (ts(M)) return re(R, k, M, W);
        if (X(M)) return ie(R, k, M, W);
        ki(R, M);
      }
      return (typeof M == "string" && M !== "") || typeof M == "number"
        ? ((M = "" + M),
          k !== null && k.tag === 6
            ? (n(R, k.sibling), (k = o(k, M)), (k.return = R), (R = k))
            : (n(R, k), (k = jo(M, R.mode, W)), (k.return = R), (R = k)),
          h(R))
        : n(R, k);
    }
    return Ue;
  }
  var An = Kd(!0),
    Yd = Kd(!1),
    Ci = Sr(null),
    Ei = null,
    Rn = null,
    Aa = null;
  function Ra() {
    Aa = Rn = Ei = null;
  }
  function Ma(e) {
    var r = Ci.current;
    De(Ci), (e._currentValue = r);
  }
  function _a(e, r, n) {
    for (; e !== null; ) {
      var i = e.alternate;
      if (
        ((e.childLanes & r) !== r
          ? ((e.childLanes |= r), i !== null && (i.childLanes |= r))
          : i !== null && (i.childLanes & r) !== r && (i.childLanes |= r),
        e === n)
      )
        break;
      e = e.return;
    }
  }
  function Mn(e, r) {
    (Ei = e),
      (Aa = Rn = null),
      (e = e.dependencies),
      e !== null &&
        e.firstContext !== null &&
        ((e.lanes & r) !== 0 && (ht = !0), (e.firstContext = null));
  }
  function At(e) {
    var r = e._currentValue;
    if (Aa !== e)
      if (((e = { context: e, memoizedValue: r, next: null }), Rn === null)) {
        if (Ei === null) throw Error(a(308));
        (Rn = e), (Ei.dependencies = { lanes: 0, firstContext: e });
      } else Rn = Rn.next = e;
    return r;
  }
  var Yr = null;
  function Ta(e) {
    Yr === null ? (Yr = [e]) : Yr.push(e);
  }
  function Xd(e, r, n, i) {
    var o = r.interleaved;
    return (
      o === null ? ((n.next = n), Ta(r)) : ((n.next = o.next), (o.next = n)),
      (r.interleaved = n),
      or(e, i)
    );
  }
  function or(e, r) {
    e.lanes |= r;
    var n = e.alternate;
    for (n !== null && (n.lanes |= r), n = e, e = e.return; e !== null; )
      (e.childLanes |= r),
        (n = e.alternate),
        n !== null && (n.childLanes |= r),
        (n = e),
        (e = e.return);
    return n.tag === 3 ? n.stateNode : null;
  }
  var Er = !1;
  function za(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, interleaved: null, lanes: 0 },
      effects: null,
    };
  }
  function Zd(e, r) {
    (e = e.updateQueue),
      r.updateQueue === e &&
        (r.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          effects: e.effects,
        });
  }
  function cr(e, r) {
    return {
      eventTime: e,
      lane: r,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    };
  }
  function Pr(e, r, n) {
    var i = e.updateQueue;
    if (i === null) return null;
    if (((i = i.shared), (_e & 2) !== 0)) {
      var o = i.pending;
      return (
        o === null ? (r.next = r) : ((r.next = o.next), (o.next = r)),
        (i.pending = r),
        or(e, n)
      );
    }
    return (
      (o = i.interleaved),
      o === null ? ((r.next = r), Ta(i)) : ((r.next = o.next), (o.next = r)),
      (i.interleaved = r),
      or(e, n)
    );
  }
  function Pi(e, r, n) {
    if (
      ((r = r.updateQueue), r !== null && ((r = r.shared), (n & 4194240) !== 0))
    ) {
      var i = r.lanes;
      (i &= e.pendingLanes), (n |= i), (r.lanes = n), Ql(e, n);
    }
  }
  function Jd(e, r) {
    var n = e.updateQueue,
      i = e.alternate;
    if (i !== null && ((i = i.updateQueue), n === i)) {
      var o = null,
        d = null;
      if (((n = n.firstBaseUpdate), n !== null)) {
        do {
          var h = {
            eventTime: n.eventTime,
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: n.callback,
            next: null,
          };
          d === null ? (o = d = h) : (d = d.next = h), (n = n.next);
        } while (n !== null);
        d === null ? (o = d = r) : (d = d.next = r);
      } else o = d = r;
      (n = {
        baseState: i.baseState,
        firstBaseUpdate: o,
        lastBaseUpdate: d,
        shared: i.shared,
        effects: i.effects,
      }),
        (e.updateQueue = n);
      return;
    }
    (e = n.lastBaseUpdate),
      e === null ? (n.firstBaseUpdate = r) : (e.next = r),
      (n.lastBaseUpdate = r);
  }
  function Ai(e, r, n, i) {
    var o = e.updateQueue;
    Er = !1;
    var d = o.firstBaseUpdate,
      h = o.lastBaseUpdate,
      y = o.shared.pending;
    if (y !== null) {
      o.shared.pending = null;
      var w = y,
        _ = w.next;
      (w.next = null), h === null ? (d = _) : (h.next = _), (h = w);
      var $ = e.alternate;
      $ !== null &&
        (($ = $.updateQueue),
        (y = $.lastBaseUpdate),
        y !== h &&
          (y === null ? ($.firstBaseUpdate = _) : (y.next = _),
          ($.lastBaseUpdate = w)));
    }
    if (d !== null) {
      var V = o.baseState;
      (h = 0), ($ = _ = w = null), (y = d);
      do {
        var F = y.lane,
          J = y.eventTime;
        if ((i & F) === F) {
          $ !== null &&
            ($ = $.next =
              {
                eventTime: J,
                lane: 0,
                tag: y.tag,
                payload: y.payload,
                callback: y.callback,
                next: null,
              });
          e: {
            var re = e,
              ie = y;
            switch (((F = r), (J = n), ie.tag)) {
              case 1:
                if (((re = ie.payload), typeof re == "function")) {
                  V = re.call(J, V, F);
                  break e;
                }
                V = re;
                break e;
              case 3:
                re.flags = (re.flags & -65537) | 128;
              case 0:
                if (
                  ((re = ie.payload),
                  (F = typeof re == "function" ? re.call(J, V, F) : re),
                  F == null)
                )
                  break e;
                V = K({}, V, F);
                break e;
              case 2:
                Er = !0;
            }
          }
          y.callback !== null &&
            y.lane !== 0 &&
            ((e.flags |= 64),
            (F = o.effects),
            F === null ? (o.effects = [y]) : F.push(y));
        } else
          (J = {
            eventTime: J,
            lane: F,
            tag: y.tag,
            payload: y.payload,
            callback: y.callback,
            next: null,
          }),
            $ === null ? ((_ = $ = J), (w = V)) : ($ = $.next = J),
            (h |= F);
        if (((y = y.next), y === null)) {
          if (((y = o.shared.pending), y === null)) break;
          (F = y),
            (y = F.next),
            (F.next = null),
            (o.lastBaseUpdate = F),
            (o.shared.pending = null);
        }
      } while (!0);
      if (
        ($ === null && (w = V),
        (o.baseState = w),
        (o.firstBaseUpdate = _),
        (o.lastBaseUpdate = $),
        (r = o.shared.interleaved),
        r !== null)
      ) {
        o = r;
        do (h |= o.lane), (o = o.next);
        while (o !== r);
      } else d === null && (o.shared.lanes = 0);
      (Jr |= h), (e.lanes = h), (e.memoizedState = V);
    }
  }
  function eu(e, r, n) {
    if (((e = r.effects), (r.effects = null), e !== null))
      for (r = 0; r < e.length; r++) {
        var i = e[r],
          o = i.callback;
        if (o !== null) {
          if (((i.callback = null), (i = n), typeof o != "function"))
            throw Error(a(191, o));
          o.call(i);
        }
      }
  }
  var Es = {},
    Qt = Sr(Es),
    Ps = Sr(Es),
    As = Sr(Es);
  function Xr(e) {
    if (e === Es) throw Error(a(174));
    return e;
  }
  function Ia(e, r) {
    switch ((Oe(As, r), Oe(Ps, e), Oe(Qt, Es), (e = r.nodeType), e)) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Ol(null, "");
        break;
      default:
        (e = e === 8 ? r.parentNode : r),
          (r = e.namespaceURI || null),
          (e = e.tagName),
          (r = Ol(r, e));
    }
    De(Qt), Oe(Qt, r);
  }
  function _n() {
    De(Qt), De(Ps), De(As);
  }
  function tu(e) {
    Xr(As.current);
    var r = Xr(Qt.current),
      n = Ol(r, e.type);
    r !== n && (Oe(Ps, e), Oe(Qt, n));
  }
  function Oa(e) {
    Ps.current === e && (De(Qt), De(Ps));
  }
  var He = Sr(0);
  function Ri(e) {
    for (var r = e; r !== null; ) {
      if (r.tag === 13) {
        var n = r.memoizedState;
        if (
          n !== null &&
          ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
        )
          return r;
      } else if (r.tag === 19 && r.memoizedProps.revealOrder !== void 0) {
        if ((r.flags & 128) !== 0) return r;
      } else if (r.child !== null) {
        (r.child.return = r), (r = r.child);
        continue;
      }
      if (r === e) break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === e) return null;
        r = r.return;
      }
      (r.sibling.return = r.return), (r = r.sibling);
    }
    return null;
  }
  var La = [];
  function Da() {
    for (var e = 0; e < La.length; e++)
      La[e]._workInProgressVersionPrimary = null;
    La.length = 0;
  }
  var Mi = D.ReactCurrentDispatcher,
    Fa = D.ReactCurrentBatchConfig,
    Zr = 0,
    Ve = null,
    Qe = null,
    Ze = null,
    _i = !1,
    Rs = !1,
    Ms = 0,
    Cx = 0;
  function at() {
    throw Error(a(321));
  }
  function $a(e, r) {
    if (r === null) return !1;
    for (var n = 0; n < r.length && n < e.length; n++)
      if (!Ot(e[n], r[n])) return !1;
    return !0;
  }
  function Ha(e, r, n, i, o, d) {
    if (
      ((Zr = d),
      (Ve = r),
      (r.memoizedState = null),
      (r.updateQueue = null),
      (r.lanes = 0),
      (Mi.current = e === null || e.memoizedState === null ? Rx : Mx),
      (e = n(i, o)),
      Rs)
    ) {
      d = 0;
      do {
        if (((Rs = !1), (Ms = 0), 25 <= d)) throw Error(a(301));
        (d += 1),
          (Ze = Qe = null),
          (r.updateQueue = null),
          (Mi.current = _x),
          (e = n(i, o));
      } while (Rs);
    }
    if (
      ((Mi.current = Ii),
      (r = Qe !== null && Qe.next !== null),
      (Zr = 0),
      (Ze = Qe = Ve = null),
      (_i = !1),
      r)
    )
      throw Error(a(300));
    return e;
  }
  function Va() {
    var e = Ms !== 0;
    return (Ms = 0), e;
  }
  function Kt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return Ze === null ? (Ve.memoizedState = Ze = e) : (Ze = Ze.next = e), Ze;
  }
  function Rt() {
    if (Qe === null) {
      var e = Ve.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Qe.next;
    var r = Ze === null ? Ve.memoizedState : Ze.next;
    if (r !== null) (Ze = r), (Qe = e);
    else {
      if (e === null) throw Error(a(310));
      (Qe = e),
        (e = {
          memoizedState: Qe.memoizedState,
          baseState: Qe.baseState,
          baseQueue: Qe.baseQueue,
          queue: Qe.queue,
          next: null,
        }),
        Ze === null ? (Ve.memoizedState = Ze = e) : (Ze = Ze.next = e);
    }
    return Ze;
  }
  function _s(e, r) {
    return typeof r == "function" ? r(e) : r;
  }
  function qa(e) {
    var r = Rt(),
      n = r.queue;
    if (n === null) throw Error(a(311));
    n.lastRenderedReducer = e;
    var i = Qe,
      o = i.baseQueue,
      d = n.pending;
    if (d !== null) {
      if (o !== null) {
        var h = o.next;
        (o.next = d.next), (d.next = h);
      }
      (i.baseQueue = o = d), (n.pending = null);
    }
    if (o !== null) {
      (d = o.next), (i = i.baseState);
      var y = (h = null),
        w = null,
        _ = d;
      do {
        var $ = _.lane;
        if ((Zr & $) === $)
          w !== null &&
            (w = w.next =
              {
                lane: 0,
                action: _.action,
                hasEagerState: _.hasEagerState,
                eagerState: _.eagerState,
                next: null,
              }),
            (i = _.hasEagerState ? _.eagerState : e(i, _.action));
        else {
          var V = {
            lane: $,
            action: _.action,
            hasEagerState: _.hasEagerState,
            eagerState: _.eagerState,
            next: null,
          };
          w === null ? ((y = w = V), (h = i)) : (w = w.next = V),
            (Ve.lanes |= $),
            (Jr |= $);
        }
        _ = _.next;
      } while (_ !== null && _ !== d);
      w === null ? (h = i) : (w.next = y),
        Ot(i, r.memoizedState) || (ht = !0),
        (r.memoizedState = i),
        (r.baseState = h),
        (r.baseQueue = w),
        (n.lastRenderedState = i);
    }
    if (((e = n.interleaved), e !== null)) {
      o = e;
      do (d = o.lane), (Ve.lanes |= d), (Jr |= d), (o = o.next);
      while (o !== e);
    } else o === null && (n.lanes = 0);
    return [r.memoizedState, n.dispatch];
  }
  function Ba(e) {
    var r = Rt(),
      n = r.queue;
    if (n === null) throw Error(a(311));
    n.lastRenderedReducer = e;
    var i = n.dispatch,
      o = n.pending,
      d = r.memoizedState;
    if (o !== null) {
      n.pending = null;
      var h = (o = o.next);
      do (d = e(d, h.action)), (h = h.next);
      while (h !== o);
      Ot(d, r.memoizedState) || (ht = !0),
        (r.memoizedState = d),
        r.baseQueue === null && (r.baseState = d),
        (n.lastRenderedState = d);
    }
    return [d, i];
  }
  function ru() {}
  function nu(e, r) {
    var n = Ve,
      i = Rt(),
      o = r(),
      d = !Ot(i.memoizedState, o);
    if (
      (d && ((i.memoizedState = o), (ht = !0)),
      (i = i.queue),
      Ua(lu.bind(null, n, i, e), [e]),
      i.getSnapshot !== r || d || (Ze !== null && Ze.memoizedState.tag & 1))
    ) {
      if (
        ((n.flags |= 2048),
        Ts(9, iu.bind(null, n, i, o, r), void 0, null),
        Je === null)
      )
        throw Error(a(349));
      (Zr & 30) !== 0 || su(n, r, o);
    }
    return o;
  }
  function su(e, r, n) {
    (e.flags |= 16384),
      (e = { getSnapshot: r, value: n }),
      (r = Ve.updateQueue),
      r === null
        ? ((r = { lastEffect: null, stores: null }),
          (Ve.updateQueue = r),
          (r.stores = [e]))
        : ((n = r.stores), n === null ? (r.stores = [e]) : n.push(e));
  }
  function iu(e, r, n, i) {
    (r.value = n), (r.getSnapshot = i), au(r) && ou(e);
  }
  function lu(e, r, n) {
    return n(function () {
      au(r) && ou(e);
    });
  }
  function au(e) {
    var r = e.getSnapshot;
    e = e.value;
    try {
      var n = r();
      return !Ot(e, n);
    } catch {
      return !0;
    }
  }
  function ou(e) {
    var r = or(e, 1);
    r !== null && Ht(r, e, 1, -1);
  }
  function cu(e) {
    var r = Kt();
    return (
      typeof e == "function" && (e = e()),
      (r.memoizedState = r.baseState = e),
      (e = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: _s,
        lastRenderedState: e,
      }),
      (r.queue = e),
      (e = e.dispatch = Ax.bind(null, Ve, e)),
      [r.memoizedState, e]
    );
  }
  function Ts(e, r, n, i) {
    return (
      (e = { tag: e, create: r, destroy: n, deps: i, next: null }),
      (r = Ve.updateQueue),
      r === null
        ? ((r = { lastEffect: null, stores: null }),
          (Ve.updateQueue = r),
          (r.lastEffect = e.next = e))
        : ((n = r.lastEffect),
          n === null
            ? (r.lastEffect = e.next = e)
            : ((i = n.next), (n.next = e), (e.next = i), (r.lastEffect = e))),
      e
    );
  }
  function du() {
    return Rt().memoizedState;
  }
  function Ti(e, r, n, i) {
    var o = Kt();
    (Ve.flags |= e),
      (o.memoizedState = Ts(1 | r, n, void 0, i === void 0 ? null : i));
  }
  function zi(e, r, n, i) {
    var o = Rt();
    i = i === void 0 ? null : i;
    var d = void 0;
    if (Qe !== null) {
      var h = Qe.memoizedState;
      if (((d = h.destroy), i !== null && $a(i, h.deps))) {
        o.memoizedState = Ts(r, n, d, i);
        return;
      }
    }
    (Ve.flags |= e), (o.memoizedState = Ts(1 | r, n, d, i));
  }
  function uu(e, r) {
    return Ti(8390656, 8, e, r);
  }
  function Ua(e, r) {
    return zi(2048, 8, e, r);
  }
  function mu(e, r) {
    return zi(4, 2, e, r);
  }
  function fu(e, r) {
    return zi(4, 4, e, r);
  }
  function hu(e, r) {
    if (typeof r == "function")
      return (
        (e = e()),
        r(e),
        function () {
          r(null);
        }
      );
    if (r != null)
      return (
        (e = e()),
        (r.current = e),
        function () {
          r.current = null;
        }
      );
  }
  function pu(e, r, n) {
    return (
      (n = n != null ? n.concat([e]) : null), zi(4, 4, hu.bind(null, r, e), n)
    );
  }
  function Wa() {}
  function xu(e, r) {
    var n = Rt();
    r = r === void 0 ? null : r;
    var i = n.memoizedState;
    return i !== null && r !== null && $a(r, i[1])
      ? i[0]
      : ((n.memoizedState = [e, r]), e);
  }
  function gu(e, r) {
    var n = Rt();
    r = r === void 0 ? null : r;
    var i = n.memoizedState;
    return i !== null && r !== null && $a(r, i[1])
      ? i[0]
      : ((e = e()), (n.memoizedState = [e, r]), e);
  }
  function vu(e, r, n) {
    return (Zr & 21) === 0
      ? (e.baseState && ((e.baseState = !1), (ht = !0)), (e.memoizedState = n))
      : (Ot(n, r) ||
          ((n = Qc()), (Ve.lanes |= n), (Jr |= n), (e.baseState = !0)),
        r);
  }
  function Ex(e, r) {
    var n = ze;
    (ze = n !== 0 && 4 > n ? n : 4), e(!0);
    var i = Fa.transition;
    Fa.transition = {};
    try {
      e(!1), r();
    } finally {
      (ze = n), (Fa.transition = i);
    }
  }
  function yu() {
    return Rt().memoizedState;
  }
  function Px(e, r, n) {
    var i = _r(e);
    if (
      ((n = {
        lane: i,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      ju(e))
    )
      bu(r, n);
    else if (((n = Xd(e, r, n, i)), n !== null)) {
      var o = ut();
      Ht(n, e, i, o), Nu(n, r, i);
    }
  }
  function Ax(e, r, n) {
    var i = _r(e),
      o = {
        lane: i,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
    if (ju(e)) bu(r, o);
    else {
      var d = e.alternate;
      if (
        e.lanes === 0 &&
        (d === null || d.lanes === 0) &&
        ((d = r.lastRenderedReducer), d !== null)
      )
        try {
          var h = r.lastRenderedState,
            y = d(h, n);
          if (((o.hasEagerState = !0), (o.eagerState = y), Ot(y, h))) {
            var w = r.interleaved;
            w === null
              ? ((o.next = o), Ta(r))
              : ((o.next = w.next), (w.next = o)),
              (r.interleaved = o);
            return;
          }
        } catch {
        } finally {
        }
      (n = Xd(e, r, o, i)),
        n !== null && ((o = ut()), Ht(n, e, i, o), Nu(n, r, i));
    }
  }
  function ju(e) {
    var r = e.alternate;
    return e === Ve || (r !== null && r === Ve);
  }
  function bu(e, r) {
    Rs = _i = !0;
    var n = e.pending;
    n === null ? (r.next = r) : ((r.next = n.next), (n.next = r)),
      (e.pending = r);
  }
  function Nu(e, r, n) {
    if ((n & 4194240) !== 0) {
      var i = r.lanes;
      (i &= e.pendingLanes), (n |= i), (r.lanes = n), Ql(e, n);
    }
  }
  var Ii = {
      readContext: At,
      useCallback: at,
      useContext: at,
      useEffect: at,
      useImperativeHandle: at,
      useInsertionEffect: at,
      useLayoutEffect: at,
      useMemo: at,
      useReducer: at,
      useRef: at,
      useState: at,
      useDebugValue: at,
      useDeferredValue: at,
      useTransition: at,
      useMutableSource: at,
      useSyncExternalStore: at,
      useId: at,
      unstable_isNewReconciler: !1,
    },
    Rx = {
      readContext: At,
      useCallback: function (e, r) {
        return (Kt().memoizedState = [e, r === void 0 ? null : r]), e;
      },
      useContext: At,
      useEffect: uu,
      useImperativeHandle: function (e, r, n) {
        return (
          (n = n != null ? n.concat([e]) : null),
          Ti(4194308, 4, hu.bind(null, r, e), n)
        );
      },
      useLayoutEffect: function (e, r) {
        return Ti(4194308, 4, e, r);
      },
      useInsertionEffect: function (e, r) {
        return Ti(4, 2, e, r);
      },
      useMemo: function (e, r) {
        var n = Kt();
        return (
          (r = r === void 0 ? null : r),
          (e = e()),
          (n.memoizedState = [e, r]),
          e
        );
      },
      useReducer: function (e, r, n) {
        var i = Kt();
        return (
          (r = n !== void 0 ? n(r) : r),
          (i.memoizedState = i.baseState = r),
          (e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: e,
            lastRenderedState: r,
          }),
          (i.queue = e),
          (e = e.dispatch = Px.bind(null, Ve, e)),
          [i.memoizedState, e]
        );
      },
      useRef: function (e) {
        var r = Kt();
        return (e = { current: e }), (r.memoizedState = e);
      },
      useState: cu,
      useDebugValue: Wa,
      useDeferredValue: function (e) {
        return (Kt().memoizedState = e);
      },
      useTransition: function () {
        var e = cu(!1),
          r = e[0];
        return (e = Ex.bind(null, e[1])), (Kt().memoizedState = e), [r, e];
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (e, r, n) {
        var i = Ve,
          o = Kt();
        if (Fe) {
          if (n === void 0) throw Error(a(407));
          n = n();
        } else {
          if (((n = r()), Je === null)) throw Error(a(349));
          (Zr & 30) !== 0 || su(i, r, n);
        }
        o.memoizedState = n;
        var d = { value: n, getSnapshot: r };
        return (
          (o.queue = d),
          uu(lu.bind(null, i, d, e), [e]),
          (i.flags |= 2048),
          Ts(9, iu.bind(null, i, d, n, r), void 0, null),
          n
        );
      },
      useId: function () {
        var e = Kt(),
          r = Je.identifierPrefix;
        if (Fe) {
          var n = ar,
            i = lr;
          (n = (i & ~(1 << (32 - It(i) - 1))).toString(32) + n),
            (r = ":" + r + "R" + n),
            (n = Ms++),
            0 < n && (r += "H" + n.toString(32)),
            (r += ":");
        } else (n = Cx++), (r = ":" + r + "r" + n.toString(32) + ":");
        return (e.memoizedState = r);
      },
      unstable_isNewReconciler: !1,
    },
    Mx = {
      readContext: At,
      useCallback: xu,
      useContext: At,
      useEffect: Ua,
      useImperativeHandle: pu,
      useInsertionEffect: mu,
      useLayoutEffect: fu,
      useMemo: gu,
      useReducer: qa,
      useRef: du,
      useState: function () {
        return qa(_s);
      },
      useDebugValue: Wa,
      useDeferredValue: function (e) {
        var r = Rt();
        return vu(r, Qe.memoizedState, e);
      },
      useTransition: function () {
        var e = qa(_s)[0],
          r = Rt().memoizedState;
        return [e, r];
      },
      useMutableSource: ru,
      useSyncExternalStore: nu,
      useId: yu,
      unstable_isNewReconciler: !1,
    },
    _x = {
      readContext: At,
      useCallback: xu,
      useContext: At,
      useEffect: Ua,
      useImperativeHandle: pu,
      useInsertionEffect: mu,
      useLayoutEffect: fu,
      useMemo: gu,
      useReducer: Ba,
      useRef: du,
      useState: function () {
        return Ba(_s);
      },
      useDebugValue: Wa,
      useDeferredValue: function (e) {
        var r = Rt();
        return Qe === null ? (r.memoizedState = e) : vu(r, Qe.memoizedState, e);
      },
      useTransition: function () {
        var e = Ba(_s)[0],
          r = Rt().memoizedState;
        return [e, r];
      },
      useMutableSource: ru,
      useSyncExternalStore: nu,
      useId: yu,
      unstable_isNewReconciler: !1,
    };
  function Dt(e, r) {
    if (e && e.defaultProps) {
      (r = K({}, r)), (e = e.defaultProps);
      for (var n in e) r[n] === void 0 && (r[n] = e[n]);
      return r;
    }
    return r;
  }
  function Ga(e, r, n, i) {
    (r = e.memoizedState),
      (n = n(i, r)),
      (n = n == null ? r : K({}, r, n)),
      (e.memoizedState = n),
      e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var Oi = {
    isMounted: function (e) {
      return (e = e._reactInternals) ? Ur(e) === e : !1;
    },
    enqueueSetState: function (e, r, n) {
      e = e._reactInternals;
      var i = ut(),
        o = _r(e),
        d = cr(i, o);
      (d.payload = r),
        n != null && (d.callback = n),
        (r = Pr(e, d, o)),
        r !== null && (Ht(r, e, o, i), Pi(r, e, o));
    },
    enqueueReplaceState: function (e, r, n) {
      e = e._reactInternals;
      var i = ut(),
        o = _r(e),
        d = cr(i, o);
      (d.tag = 1),
        (d.payload = r),
        n != null && (d.callback = n),
        (r = Pr(e, d, o)),
        r !== null && (Ht(r, e, o, i), Pi(r, e, o));
    },
    enqueueForceUpdate: function (e, r) {
      e = e._reactInternals;
      var n = ut(),
        i = _r(e),
        o = cr(n, i);
      (o.tag = 2),
        r != null && (o.callback = r),
        (r = Pr(e, o, i)),
        r !== null && (Ht(r, e, i, n), Pi(r, e, i));
    },
  };
  function wu(e, r, n, i, o, d, h) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == "function"
        ? e.shouldComponentUpdate(i, d, h)
        : r.prototype && r.prototype.isPureReactComponent
        ? !ys(n, i) || !ys(o, d)
        : !0
    );
  }
  function Su(e, r, n) {
    var i = !1,
      o = kr,
      d = r.contextType;
    return (
      typeof d == "object" && d !== null
        ? (d = At(d))
        : ((o = ft(r) ? Gr : lt.current),
          (i = r.contextTypes),
          (d = (i = i != null) ? kn(e, o) : kr)),
      (r = new r(n, d)),
      (e.memoizedState =
        r.state !== null && r.state !== void 0 ? r.state : null),
      (r.updater = Oi),
      (e.stateNode = r),
      (r._reactInternals = e),
      i &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = o),
        (e.__reactInternalMemoizedMaskedChildContext = d)),
      r
    );
  }
  function ku(e, r, n, i) {
    (e = r.state),
      typeof r.componentWillReceiveProps == "function" &&
        r.componentWillReceiveProps(n, i),
      typeof r.UNSAFE_componentWillReceiveProps == "function" &&
        r.UNSAFE_componentWillReceiveProps(n, i),
      r.state !== e && Oi.enqueueReplaceState(r, r.state, null);
  }
  function Qa(e, r, n, i) {
    var o = e.stateNode;
    (o.props = n), (o.state = e.memoizedState), (o.refs = {}), za(e);
    var d = r.contextType;
    typeof d == "object" && d !== null
      ? (o.context = At(d))
      : ((d = ft(r) ? Gr : lt.current), (o.context = kn(e, d))),
      (o.state = e.memoizedState),
      (d = r.getDerivedStateFromProps),
      typeof d == "function" && (Ga(e, r, d, n), (o.state = e.memoizedState)),
      typeof r.getDerivedStateFromProps == "function" ||
        typeof o.getSnapshotBeforeUpdate == "function" ||
        (typeof o.UNSAFE_componentWillMount != "function" &&
          typeof o.componentWillMount != "function") ||
        ((r = o.state),
        typeof o.componentWillMount == "function" && o.componentWillMount(),
        typeof o.UNSAFE_componentWillMount == "function" &&
          o.UNSAFE_componentWillMount(),
        r !== o.state && Oi.enqueueReplaceState(o, o.state, null),
        Ai(e, n, o, i),
        (o.state = e.memoizedState)),
      typeof o.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Tn(e, r) {
    try {
      var n = "",
        i = r;
      do (n += we(i)), (i = i.return);
      while (i);
      var o = n;
    } catch (d) {
      o =
        `
Error generating stack: ` +
        d.message +
        `
` +
        d.stack;
    }
    return { value: e, source: r, stack: o, digest: null };
  }
  function Ka(e, r, n) {
    return { value: e, source: null, stack: n ?? null, digest: r ?? null };
  }
  function Ya(e, r) {
    try {
      console.error(r.value);
    } catch (n) {
      setTimeout(function () {
        throw n;
      });
    }
  }
  var Tx = typeof WeakMap == "function" ? WeakMap : Map;
  function Cu(e, r, n) {
    (n = cr(-1, n)), (n.tag = 3), (n.payload = { element: null });
    var i = r.value;
    return (
      (n.callback = function () {
        qi || ((qi = !0), (mo = i)), Ya(e, r);
      }),
      n
    );
  }
  function Eu(e, r, n) {
    (n = cr(-1, n)), (n.tag = 3);
    var i = e.type.getDerivedStateFromError;
    if (typeof i == "function") {
      var o = r.value;
      (n.payload = function () {
        return i(o);
      }),
        (n.callback = function () {
          Ya(e, r);
        });
    }
    var d = e.stateNode;
    return (
      d !== null &&
        typeof d.componentDidCatch == "function" &&
        (n.callback = function () {
          Ya(e, r),
            typeof i != "function" &&
              (Rr === null ? (Rr = new Set([this])) : Rr.add(this));
          var h = r.stack;
          this.componentDidCatch(r.value, {
            componentStack: h !== null ? h : "",
          });
        }),
      n
    );
  }
  function Pu(e, r, n) {
    var i = e.pingCache;
    if (i === null) {
      i = e.pingCache = new Tx();
      var o = new Set();
      i.set(r, o);
    } else (o = i.get(r)), o === void 0 && ((o = new Set()), i.set(r, o));
    o.has(n) || (o.add(n), (e = Gx.bind(null, e, r, n)), r.then(e, e));
  }
  function Au(e) {
    do {
      var r;
      if (
        ((r = e.tag === 13) &&
          ((r = e.memoizedState),
          (r = r !== null ? r.dehydrated !== null : !0)),
        r)
      )
        return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function Ru(e, r, n, i, o) {
    return (e.mode & 1) === 0
      ? (e === r
          ? (e.flags |= 65536)
          : ((e.flags |= 128),
            (n.flags |= 131072),
            (n.flags &= -52805),
            n.tag === 1 &&
              (n.alternate === null
                ? (n.tag = 17)
                : ((r = cr(-1, 1)), (r.tag = 2), Pr(n, r, 1))),
            (n.lanes |= 1)),
        e)
      : ((e.flags |= 65536), (e.lanes = o), e);
  }
  var zx = D.ReactCurrentOwner,
    ht = !1;
  function dt(e, r, n, i) {
    r.child = e === null ? Yd(r, null, n, i) : An(r, e.child, n, i);
  }
  function Mu(e, r, n, i, o) {
    n = n.render;
    var d = r.ref;
    return (
      Mn(r, o),
      (i = Ha(e, r, n, i, d, o)),
      (n = Va()),
      e !== null && !ht
        ? ((r.updateQueue = e.updateQueue),
          (r.flags &= -2053),
          (e.lanes &= ~o),
          dr(e, r, o))
        : (Fe && n && Sa(r), (r.flags |= 1), dt(e, r, i, o), r.child)
    );
  }
  function _u(e, r, n, i, o) {
    if (e === null) {
      var d = n.type;
      return typeof d == "function" &&
        !yo(d) &&
        d.defaultProps === void 0 &&
        n.compare === null &&
        n.defaultProps === void 0
        ? ((r.tag = 15), (r.type = d), Tu(e, r, d, i, o))
        : ((e = Ki(n.type, null, i, r, r.mode, o)),
          (e.ref = r.ref),
          (e.return = r),
          (r.child = e));
    }
    if (((d = e.child), (e.lanes & o) === 0)) {
      var h = d.memoizedProps;
      if (
        ((n = n.compare), (n = n !== null ? n : ys), n(h, i) && e.ref === r.ref)
      )
        return dr(e, r, o);
    }
    return (
      (r.flags |= 1),
      (e = zr(d, i)),
      (e.ref = r.ref),
      (e.return = r),
      (r.child = e)
    );
  }
  function Tu(e, r, n, i, o) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (ys(d, i) && e.ref === r.ref)
        if (((ht = !1), (r.pendingProps = i = d), (e.lanes & o) !== 0))
          (e.flags & 131072) !== 0 && (ht = !0);
        else return (r.lanes = e.lanes), dr(e, r, o);
    }
    return Xa(e, r, n, i, o);
  }
  function zu(e, r, n) {
    var i = r.pendingProps,
      o = i.children,
      d = e !== null ? e.memoizedState : null;
    if (i.mode === "hidden")
      if ((r.mode & 1) === 0)
        (r.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          Oe(In, wt),
          (wt |= n);
      else {
        if ((n & 1073741824) === 0)
          return (
            (e = d !== null ? d.baseLanes | n : n),
            (r.lanes = r.childLanes = 1073741824),
            (r.memoizedState = {
              baseLanes: e,
              cachePool: null,
              transitions: null,
            }),
            (r.updateQueue = null),
            Oe(In, wt),
            (wt |= e),
            null
          );
        (r.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          (i = d !== null ? d.baseLanes : n),
          Oe(In, wt),
          (wt |= i);
      }
    else
      d !== null ? ((i = d.baseLanes | n), (r.memoizedState = null)) : (i = n),
        Oe(In, wt),
        (wt |= i);
    return dt(e, r, o, n), r.child;
  }
  function Iu(e, r) {
    var n = r.ref;
    ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
      ((r.flags |= 512), (r.flags |= 2097152));
  }
  function Xa(e, r, n, i, o) {
    var d = ft(n) ? Gr : lt.current;
    return (
      (d = kn(r, d)),
      Mn(r, o),
      (n = Ha(e, r, n, i, d, o)),
      (i = Va()),
      e !== null && !ht
        ? ((r.updateQueue = e.updateQueue),
          (r.flags &= -2053),
          (e.lanes &= ~o),
          dr(e, r, o))
        : (Fe && i && Sa(r), (r.flags |= 1), dt(e, r, n, o), r.child)
    );
  }
  function Ou(e, r, n, i, o) {
    if (ft(n)) {
      var d = !0;
      ji(r);
    } else d = !1;
    if ((Mn(r, o), r.stateNode === null))
      Di(e, r), Su(r, n, i), Qa(r, n, i, o), (i = !0);
    else if (e === null) {
      var h = r.stateNode,
        y = r.memoizedProps;
      h.props = y;
      var w = h.context,
        _ = n.contextType;
      typeof _ == "object" && _ !== null
        ? (_ = At(_))
        : ((_ = ft(n) ? Gr : lt.current), (_ = kn(r, _)));
      var $ = n.getDerivedStateFromProps,
        V =
          typeof $ == "function" ||
          typeof h.getSnapshotBeforeUpdate == "function";
      V ||
        (typeof h.UNSAFE_componentWillReceiveProps != "function" &&
          typeof h.componentWillReceiveProps != "function") ||
        ((y !== i || w !== _) && ku(r, h, i, _)),
        (Er = !1);
      var F = r.memoizedState;
      (h.state = F),
        Ai(r, i, h, o),
        (w = r.memoizedState),
        y !== i || F !== w || mt.current || Er
          ? (typeof $ == "function" && (Ga(r, n, $, i), (w = r.memoizedState)),
            (y = Er || wu(r, n, y, i, F, w, _))
              ? (V ||
                  (typeof h.UNSAFE_componentWillMount != "function" &&
                    typeof h.componentWillMount != "function") ||
                  (typeof h.componentWillMount == "function" &&
                    h.componentWillMount(),
                  typeof h.UNSAFE_componentWillMount == "function" &&
                    h.UNSAFE_componentWillMount()),
                typeof h.componentDidMount == "function" &&
                  (r.flags |= 4194308))
              : (typeof h.componentDidMount == "function" &&
                  (r.flags |= 4194308),
                (r.memoizedProps = i),
                (r.memoizedState = w)),
            (h.props = i),
            (h.state = w),
            (h.context = _),
            (i = y))
          : (typeof h.componentDidMount == "function" && (r.flags |= 4194308),
            (i = !1));
    } else {
      (h = r.stateNode),
        Zd(e, r),
        (y = r.memoizedProps),
        (_ = r.type === r.elementType ? y : Dt(r.type, y)),
        (h.props = _),
        (V = r.pendingProps),
        (F = h.context),
        (w = n.contextType),
        typeof w == "object" && w !== null
          ? (w = At(w))
          : ((w = ft(n) ? Gr : lt.current), (w = kn(r, w)));
      var J = n.getDerivedStateFromProps;
      ($ =
        typeof J == "function" ||
        typeof h.getSnapshotBeforeUpdate == "function") ||
        (typeof h.UNSAFE_componentWillReceiveProps != "function" &&
          typeof h.componentWillReceiveProps != "function") ||
        ((y !== V || F !== w) && ku(r, h, i, w)),
        (Er = !1),
        (F = r.memoizedState),
        (h.state = F),
        Ai(r, i, h, o);
      var re = r.memoizedState;
      y !== V || F !== re || mt.current || Er
        ? (typeof J == "function" && (Ga(r, n, J, i), (re = r.memoizedState)),
          (_ = Er || wu(r, n, _, i, F, re, w) || !1)
            ? ($ ||
                (typeof h.UNSAFE_componentWillUpdate != "function" &&
                  typeof h.componentWillUpdate != "function") ||
                (typeof h.componentWillUpdate == "function" &&
                  h.componentWillUpdate(i, re, w),
                typeof h.UNSAFE_componentWillUpdate == "function" &&
                  h.UNSAFE_componentWillUpdate(i, re, w)),
              typeof h.componentDidUpdate == "function" && (r.flags |= 4),
              typeof h.getSnapshotBeforeUpdate == "function" &&
                (r.flags |= 1024))
            : (typeof h.componentDidUpdate != "function" ||
                (y === e.memoizedProps && F === e.memoizedState) ||
                (r.flags |= 4),
              typeof h.getSnapshotBeforeUpdate != "function" ||
                (y === e.memoizedProps && F === e.memoizedState) ||
                (r.flags |= 1024),
              (r.memoizedProps = i),
              (r.memoizedState = re)),
          (h.props = i),
          (h.state = re),
          (h.context = w),
          (i = _))
        : (typeof h.componentDidUpdate != "function" ||
            (y === e.memoizedProps && F === e.memoizedState) ||
            (r.flags |= 4),
          typeof h.getSnapshotBeforeUpdate != "function" ||
            (y === e.memoizedProps && F === e.memoizedState) ||
            (r.flags |= 1024),
          (i = !1));
    }
    return Za(e, r, n, i, d, o);
  }
  function Za(e, r, n, i, o, d) {
    Iu(e, r);
    var h = (r.flags & 128) !== 0;
    if (!i && !h) return o && Hd(r, n, !1), dr(e, r, d);
    (i = r.stateNode), (zx.current = r);
    var y =
      h && typeof n.getDerivedStateFromError != "function" ? null : i.render();
    return (
      (r.flags |= 1),
      e !== null && h
        ? ((r.child = An(r, e.child, null, d)), (r.child = An(r, null, y, d)))
        : dt(e, r, y, d),
      (r.memoizedState = i.state),
      o && Hd(r, n, !0),
      r.child
    );
  }
  function Lu(e) {
    var r = e.stateNode;
    r.pendingContext
      ? Fd(e, r.pendingContext, r.pendingContext !== r.context)
      : r.context && Fd(e, r.context, !1),
      Ia(e, r.containerInfo);
  }
  function Du(e, r, n, i, o) {
    return Pn(), Pa(o), (r.flags |= 256), dt(e, r, n, i), r.child;
  }
  var Ja = { dehydrated: null, treeContext: null, retryLane: 0 };
  function eo(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function Fu(e, r, n) {
    var i = r.pendingProps,
      o = He.current,
      d = !1,
      h = (r.flags & 128) !== 0,
      y;
    if (
      ((y = h) ||
        (y = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
      y
        ? ((d = !0), (r.flags &= -129))
        : (e === null || e.memoizedState !== null) && (o |= 1),
      Oe(He, o & 1),
      e === null)
    )
      return (
        Ea(r),
        (e = r.memoizedState),
        e !== null && ((e = e.dehydrated), e !== null)
          ? ((r.mode & 1) === 0
              ? (r.lanes = 1)
              : e.data === "$!"
              ? (r.lanes = 8)
              : (r.lanes = 1073741824),
            null)
          : ((h = i.children),
            (e = i.fallback),
            d
              ? ((i = r.mode),
                (d = r.child),
                (h = { mode: "hidden", children: h }),
                (i & 1) === 0 && d !== null
                  ? ((d.childLanes = 0), (d.pendingProps = h))
                  : (d = Yi(h, i, 0, null)),
                (e = nn(e, i, n, null)),
                (d.return = r),
                (e.return = r),
                (d.sibling = e),
                (r.child = d),
                (r.child.memoizedState = eo(n)),
                (r.memoizedState = Ja),
                e)
              : to(r, h))
      );
    if (((o = e.memoizedState), o !== null && ((y = o.dehydrated), y !== null)))
      return Ix(e, r, h, i, y, o, n);
    if (d) {
      (d = i.fallback), (h = r.mode), (o = e.child), (y = o.sibling);
      var w = { mode: "hidden", children: i.children };
      return (
        (h & 1) === 0 && r.child !== o
          ? ((i = r.child),
            (i.childLanes = 0),
            (i.pendingProps = w),
            (r.deletions = null))
          : ((i = zr(o, w)), (i.subtreeFlags = o.subtreeFlags & 14680064)),
        y !== null ? (d = zr(y, d)) : ((d = nn(d, h, n, null)), (d.flags |= 2)),
        (d.return = r),
        (i.return = r),
        (i.sibling = d),
        (r.child = i),
        (i = d),
        (d = r.child),
        (h = e.child.memoizedState),
        (h =
          h === null
            ? eo(n)
            : {
                baseLanes: h.baseLanes | n,
                cachePool: null,
                transitions: h.transitions,
              }),
        (d.memoizedState = h),
        (d.childLanes = e.childLanes & ~n),
        (r.memoizedState = Ja),
        i
      );
    }
    return (
      (d = e.child),
      (e = d.sibling),
      (i = zr(d, { mode: "visible", children: i.children })),
      (r.mode & 1) === 0 && (i.lanes = n),
      (i.return = r),
      (i.sibling = null),
      e !== null &&
        ((n = r.deletions),
        n === null ? ((r.deletions = [e]), (r.flags |= 16)) : n.push(e)),
      (r.child = i),
      (r.memoizedState = null),
      i
    );
  }
  function to(e, r) {
    return (
      (r = Yi({ mode: "visible", children: r }, e.mode, 0, null)),
      (r.return = e),
      (e.child = r)
    );
  }
  function Li(e, r, n, i) {
    return (
      i !== null && Pa(i),
      An(r, e.child, null, n),
      (e = to(r, r.pendingProps.children)),
      (e.flags |= 2),
      (r.memoizedState = null),
      e
    );
  }
  function Ix(e, r, n, i, o, d, h) {
    if (n)
      return r.flags & 256
        ? ((r.flags &= -257), (i = Ka(Error(a(422)))), Li(e, r, h, i))
        : r.memoizedState !== null
        ? ((r.child = e.child), (r.flags |= 128), null)
        : ((d = i.fallback),
          (o = r.mode),
          (i = Yi({ mode: "visible", children: i.children }, o, 0, null)),
          (d = nn(d, o, h, null)),
          (d.flags |= 2),
          (i.return = r),
          (d.return = r),
          (i.sibling = d),
          (r.child = i),
          (r.mode & 1) !== 0 && An(r, e.child, null, h),
          (r.child.memoizedState = eo(h)),
          (r.memoizedState = Ja),
          d);
    if ((r.mode & 1) === 0) return Li(e, r, h, null);
    if (o.data === "$!") {
      if (((i = o.nextSibling && o.nextSibling.dataset), i)) var y = i.dgst;
      return (
        (i = y), (d = Error(a(419))), (i = Ka(d, i, void 0)), Li(e, r, h, i)
      );
    }
    if (((y = (h & e.childLanes) !== 0), ht || y)) {
      if (((i = Je), i !== null)) {
        switch (h & -h) {
          case 4:
            o = 2;
            break;
          case 16:
            o = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            o = 32;
            break;
          case 536870912:
            o = 268435456;
            break;
          default:
            o = 0;
        }
        (o = (o & (i.suspendedLanes | h)) !== 0 ? 0 : o),
          o !== 0 &&
            o !== d.retryLane &&
            ((d.retryLane = o), or(e, o), Ht(i, e, o, -1));
      }
      return vo(), (i = Ka(Error(a(421)))), Li(e, r, h, i);
    }
    return o.data === "$?"
      ? ((r.flags |= 128),
        (r.child = e.child),
        (r = Qx.bind(null, e)),
        (o._reactRetry = r),
        null)
      : ((e = d.treeContext),
        (Nt = wr(o.nextSibling)),
        (bt = r),
        (Fe = !0),
        (Lt = null),
        e !== null &&
          ((Et[Pt++] = lr),
          (Et[Pt++] = ar),
          (Et[Pt++] = Qr),
          (lr = e.id),
          (ar = e.overflow),
          (Qr = r)),
        (r = to(r, i.children)),
        (r.flags |= 4096),
        r);
  }
  function $u(e, r, n) {
    e.lanes |= r;
    var i = e.alternate;
    i !== null && (i.lanes |= r), _a(e.return, r, n);
  }
  function ro(e, r, n, i, o) {
    var d = e.memoizedState;
    d === null
      ? (e.memoizedState = {
          isBackwards: r,
          rendering: null,
          renderingStartTime: 0,
          last: i,
          tail: n,
          tailMode: o,
        })
      : ((d.isBackwards = r),
        (d.rendering = null),
        (d.renderingStartTime = 0),
        (d.last = i),
        (d.tail = n),
        (d.tailMode = o));
  }
  function Hu(e, r, n) {
    var i = r.pendingProps,
      o = i.revealOrder,
      d = i.tail;
    if ((dt(e, r, i.children, n), (i = He.current), (i & 2) !== 0))
      (i = (i & 1) | 2), (r.flags |= 128);
    else {
      if (e !== null && (e.flags & 128) !== 0)
        e: for (e = r.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && $u(e, n, r);
          else if (e.tag === 19) $u(e, n, r);
          else if (e.child !== null) {
            (e.child.return = e), (e = e.child);
            continue;
          }
          if (e === r) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === r) break e;
            e = e.return;
          }
          (e.sibling.return = e.return), (e = e.sibling);
        }
      i &= 1;
    }
    if ((Oe(He, i), (r.mode & 1) === 0)) r.memoizedState = null;
    else
      switch (o) {
        case "forwards":
          for (n = r.child, o = null; n !== null; )
            (e = n.alternate),
              e !== null && Ri(e) === null && (o = n),
              (n = n.sibling);
          (n = o),
            n === null
              ? ((o = r.child), (r.child = null))
              : ((o = n.sibling), (n.sibling = null)),
            ro(r, !1, o, n, d);
          break;
        case "backwards":
          for (n = null, o = r.child, r.child = null; o !== null; ) {
            if (((e = o.alternate), e !== null && Ri(e) === null)) {
              r.child = o;
              break;
            }
            (e = o.sibling), (o.sibling = n), (n = o), (o = e);
          }
          ro(r, !0, n, null, d);
          break;
        case "together":
          ro(r, !1, null, null, void 0);
          break;
        default:
          r.memoizedState = null;
      }
    return r.child;
  }
  function Di(e, r) {
    (r.mode & 1) === 0 &&
      e !== null &&
      ((e.alternate = null), (r.alternate = null), (r.flags |= 2));
  }
  function dr(e, r, n) {
    if (
      (e !== null && (r.dependencies = e.dependencies),
      (Jr |= r.lanes),
      (n & r.childLanes) === 0)
    )
      return null;
    if (e !== null && r.child !== e.child) throw Error(a(153));
    if (r.child !== null) {
      for (
        e = r.child, n = zr(e, e.pendingProps), r.child = n, n.return = r;
        e.sibling !== null;

      )
        (e = e.sibling),
          (n = n.sibling = zr(e, e.pendingProps)),
          (n.return = r);
      n.sibling = null;
    }
    return r.child;
  }
  function Ox(e, r, n) {
    switch (r.tag) {
      case 3:
        Lu(r), Pn();
        break;
      case 5:
        tu(r);
        break;
      case 1:
        ft(r.type) && ji(r);
        break;
      case 4:
        Ia(r, r.stateNode.containerInfo);
        break;
      case 10:
        var i = r.type._context,
          o = r.memoizedProps.value;
        Oe(Ci, i._currentValue), (i._currentValue = o);
        break;
      case 13:
        if (((i = r.memoizedState), i !== null))
          return i.dehydrated !== null
            ? (Oe(He, He.current & 1), (r.flags |= 128), null)
            : (n & r.child.childLanes) !== 0
            ? Fu(e, r, n)
            : (Oe(He, He.current & 1),
              (e = dr(e, r, n)),
              e !== null ? e.sibling : null);
        Oe(He, He.current & 1);
        break;
      case 19:
        if (((i = (n & r.childLanes) !== 0), (e.flags & 128) !== 0)) {
          if (i) return Hu(e, r, n);
          r.flags |= 128;
        }
        if (
          ((o = r.memoizedState),
          o !== null &&
            ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
          Oe(He, He.current),
          i)
        )
          break;
        return null;
      case 22:
      case 23:
        return (r.lanes = 0), zu(e, r, n);
    }
    return dr(e, r, n);
  }
  var Vu, no, qu, Bu;
  (Vu = function (e, r) {
    for (var n = r.child; n !== null; ) {
      if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
      else if (n.tag !== 4 && n.child !== null) {
        (n.child.return = n), (n = n.child);
        continue;
      }
      if (n === r) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === r) return;
        n = n.return;
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }),
    (no = function () {}),
    (qu = function (e, r, n, i) {
      var o = e.memoizedProps;
      if (o !== i) {
        (e = r.stateNode), Xr(Qt.current);
        var d = null;
        switch (n) {
          case "input":
            (o = zt(e, o)), (i = zt(e, i)), (d = []);
            break;
          case "select":
            (o = K({}, o, { value: void 0 })),
              (i = K({}, i, { value: void 0 })),
              (d = []);
            break;
          case "textarea":
            (o = Il(e, o)), (i = Il(e, i)), (d = []);
            break;
          default:
            typeof o.onClick != "function" &&
              typeof i.onClick == "function" &&
              (e.onclick = gi);
        }
        Ll(n, i);
        var h;
        n = null;
        for (_ in o)
          if (!i.hasOwnProperty(_) && o.hasOwnProperty(_) && o[_] != null)
            if (_ === "style") {
              var y = o[_];
              for (h in y) y.hasOwnProperty(h) && (n || (n = {}), (n[h] = ""));
            } else
              _ !== "dangerouslySetInnerHTML" &&
                _ !== "children" &&
                _ !== "suppressContentEditableWarning" &&
                _ !== "suppressHydrationWarning" &&
                _ !== "autoFocus" &&
                (u.hasOwnProperty(_)
                  ? d || (d = [])
                  : (d = d || []).push(_, null));
        for (_ in i) {
          var w = i[_];
          if (
            ((y = o?.[_]),
            i.hasOwnProperty(_) && w !== y && (w != null || y != null))
          )
            if (_ === "style")
              if (y) {
                for (h in y)
                  !y.hasOwnProperty(h) ||
                    (w && w.hasOwnProperty(h)) ||
                    (n || (n = {}), (n[h] = ""));
                for (h in w)
                  w.hasOwnProperty(h) &&
                    y[h] !== w[h] &&
                    (n || (n = {}), (n[h] = w[h]));
              } else n || (d || (d = []), d.push(_, n)), (n = w);
            else
              _ === "dangerouslySetInnerHTML"
                ? ((w = w ? w.__html : void 0),
                  (y = y ? y.__html : void 0),
                  w != null && y !== w && (d = d || []).push(_, w))
                : _ === "children"
                ? (typeof w != "string" && typeof w != "number") ||
                  (d = d || []).push(_, "" + w)
                : _ !== "suppressContentEditableWarning" &&
                  _ !== "suppressHydrationWarning" &&
                  (u.hasOwnProperty(_)
                    ? (w != null && _ === "onScroll" && Le("scroll", e),
                      d || y === w || (d = []))
                    : (d = d || []).push(_, w));
        }
        n && (d = d || []).push("style", n);
        var _ = d;
        (r.updateQueue = _) && (r.flags |= 4);
      }
    }),
    (Bu = function (e, r, n, i) {
      n !== i && (r.flags |= 4);
    });
  function zs(e, r) {
    if (!Fe)
      switch (e.tailMode) {
        case "hidden":
          r = e.tail;
          for (var n = null; r !== null; )
            r.alternate !== null && (n = r), (r = r.sibling);
          n === null ? (e.tail = null) : (n.sibling = null);
          break;
        case "collapsed":
          n = e.tail;
          for (var i = null; n !== null; )
            n.alternate !== null && (i = n), (n = n.sibling);
          i === null
            ? r || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (i.sibling = null);
      }
  }
  function ot(e) {
    var r = e.alternate !== null && e.alternate.child === e.child,
      n = 0,
      i = 0;
    if (r)
      for (var o = e.child; o !== null; )
        (n |= o.lanes | o.childLanes),
          (i |= o.subtreeFlags & 14680064),
          (i |= o.flags & 14680064),
          (o.return = e),
          (o = o.sibling);
    else
      for (o = e.child; o !== null; )
        (n |= o.lanes | o.childLanes),
          (i |= o.subtreeFlags),
          (i |= o.flags),
          (o.return = e),
          (o = o.sibling);
    return (e.subtreeFlags |= i), (e.childLanes = n), r;
  }
  function Lx(e, r, n) {
    var i = r.pendingProps;
    switch ((ka(r), r.tag)) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return ot(r), null;
      case 1:
        return ft(r.type) && yi(), ot(r), null;
      case 3:
        return (
          (i = r.stateNode),
          _n(),
          De(mt),
          De(lt),
          Da(),
          i.pendingContext &&
            ((i.context = i.pendingContext), (i.pendingContext = null)),
          (e === null || e.child === null) &&
            (Si(r)
              ? (r.flags |= 4)
              : e === null ||
                (e.memoizedState.isDehydrated && (r.flags & 256) === 0) ||
                ((r.flags |= 1024), Lt !== null && (po(Lt), (Lt = null)))),
          no(e, r),
          ot(r),
          null
        );
      case 5:
        Oa(r);
        var o = Xr(As.current);
        if (((n = r.type), e !== null && r.stateNode != null))
          qu(e, r, n, i, o),
            e.ref !== r.ref && ((r.flags |= 512), (r.flags |= 2097152));
        else {
          if (!i) {
            if (r.stateNode === null) throw Error(a(166));
            return ot(r), null;
          }
          if (((e = Xr(Qt.current)), Si(r))) {
            (i = r.stateNode), (n = r.type);
            var d = r.memoizedProps;
            switch (((i[Gt] = r), (i[Ss] = d), (e = (r.mode & 1) !== 0), n)) {
              case "dialog":
                Le("cancel", i), Le("close", i);
                break;
              case "iframe":
              case "object":
              case "embed":
                Le("load", i);
                break;
              case "video":
              case "audio":
                for (o = 0; o < bs.length; o++) Le(bs[o], i);
                break;
              case "source":
                Le("error", i);
                break;
              case "img":
              case "image":
              case "link":
                Le("error", i), Le("load", i);
                break;
              case "details":
                Le("toggle", i);
                break;
              case "input":
                un(i, d), Le("invalid", i);
                break;
              case "select":
                (i._wrapperState = { wasMultiple: !!d.multiple }),
                  Le("invalid", i);
                break;
              case "textarea":
                Ec(i, d), Le("invalid", i);
            }
            Ll(n, d), (o = null);
            for (var h in d)
              if (d.hasOwnProperty(h)) {
                var y = d[h];
                h === "children"
                  ? typeof y == "string"
                    ? i.textContent !== y &&
                      (d.suppressHydrationWarning !== !0 &&
                        xi(i.textContent, y, e),
                      (o = ["children", y]))
                    : typeof y == "number" &&
                      i.textContent !== "" + y &&
                      (d.suppressHydrationWarning !== !0 &&
                        xi(i.textContent, y, e),
                      (o = ["children", "" + y]))
                  : u.hasOwnProperty(h) &&
                    y != null &&
                    h === "onScroll" &&
                    Le("scroll", i);
              }
            switch (n) {
              case "input":
                Me(i), Cc(i, d, !0);
                break;
              case "textarea":
                Me(i), Ac(i);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (i.onclick = gi);
            }
            (i = o), (r.updateQueue = i), i !== null && (r.flags |= 4);
          } else {
            (h = o.nodeType === 9 ? o : o.ownerDocument),
              e === "http://www.w3.org/1999/xhtml" && (e = Rc(n)),
              e === "http://www.w3.org/1999/xhtml"
                ? n === "script"
                  ? ((e = h.createElement("div")),
                    (e.innerHTML = "<script></script>"),
                    (e = e.removeChild(e.firstChild)))
                  : typeof i.is == "string"
                  ? (e = h.createElement(n, { is: i.is }))
                  : ((e = h.createElement(n)),
                    n === "select" &&
                      ((h = e),
                      i.multiple
                        ? (h.multiple = !0)
                        : i.size && (h.size = i.size)))
                : (e = h.createElementNS(e, n)),
              (e[Gt] = r),
              (e[Ss] = i),
              Vu(e, r, !1, !1),
              (r.stateNode = e);
            e: {
              switch (((h = Dl(n, i)), n)) {
                case "dialog":
                  Le("cancel", e), Le("close", e), (o = i);
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Le("load", e), (o = i);
                  break;
                case "video":
                case "audio":
                  for (o = 0; o < bs.length; o++) Le(bs[o], e);
                  o = i;
                  break;
                case "source":
                  Le("error", e), (o = i);
                  break;
                case "img":
                case "image":
                case "link":
                  Le("error", e), Le("load", e), (o = i);
                  break;
                case "details":
                  Le("toggle", e), (o = i);
                  break;
                case "input":
                  un(e, i), (o = zt(e, i)), Le("invalid", e);
                  break;
                case "option":
                  o = i;
                  break;
                case "select":
                  (e._wrapperState = { wasMultiple: !!i.multiple }),
                    (o = K({}, i, { value: void 0 })),
                    Le("invalid", e);
                  break;
                case "textarea":
                  Ec(e, i), (o = Il(e, i)), Le("invalid", e);
                  break;
                default:
                  o = i;
              }
              Ll(n, o), (y = o);
              for (d in y)
                if (y.hasOwnProperty(d)) {
                  var w = y[d];
                  d === "style"
                    ? Tc(e, w)
                    : d === "dangerouslySetInnerHTML"
                    ? ((w = w ? w.__html : void 0), w != null && Mc(e, w))
                    : d === "children"
                    ? typeof w == "string"
                      ? (n !== "textarea" || w !== "") && rs(e, w)
                      : typeof w == "number" && rs(e, "" + w)
                    : d !== "suppressContentEditableWarning" &&
                      d !== "suppressHydrationWarning" &&
                      d !== "autoFocus" &&
                      (u.hasOwnProperty(d)
                        ? w != null && d === "onScroll" && Le("scroll", e)
                        : w != null && O(e, d, w, h));
                }
              switch (n) {
                case "input":
                  Me(e), Cc(e, i, !1);
                  break;
                case "textarea":
                  Me(e), Ac(e);
                  break;
                case "option":
                  i.value != null && e.setAttribute("value", "" + ue(i.value));
                  break;
                case "select":
                  (e.multiple = !!i.multiple),
                    (d = i.value),
                    d != null
                      ? fn(e, !!i.multiple, d, !1)
                      : i.defaultValue != null &&
                        fn(e, !!i.multiple, i.defaultValue, !0);
                  break;
                default:
                  typeof o.onClick == "function" && (e.onclick = gi);
              }
              switch (n) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  i = !!i.autoFocus;
                  break e;
                case "img":
                  i = !0;
                  break e;
                default:
                  i = !1;
              }
            }
            i && (r.flags |= 4);
          }
          r.ref !== null && ((r.flags |= 512), (r.flags |= 2097152));
        }
        return ot(r), null;
      case 6:
        if (e && r.stateNode != null) Bu(e, r, e.memoizedProps, i);
        else {
          if (typeof i != "string" && r.stateNode === null) throw Error(a(166));
          if (((n = Xr(As.current)), Xr(Qt.current), Si(r))) {
            if (
              ((i = r.stateNode),
              (n = r.memoizedProps),
              (i[Gt] = r),
              (d = i.nodeValue !== n) && ((e = bt), e !== null))
            )
              switch (e.tag) {
                case 3:
                  xi(i.nodeValue, n, (e.mode & 1) !== 0);
                  break;
                case 5:
                  e.memoizedProps.suppressHydrationWarning !== !0 &&
                    xi(i.nodeValue, n, (e.mode & 1) !== 0);
              }
            d && (r.flags |= 4);
          } else
            (i = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(i)),
              (i[Gt] = r),
              (r.stateNode = i);
        }
        return ot(r), null;
      case 13:
        if (
          (De(He),
          (i = r.memoizedState),
          e === null ||
            (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
        ) {
          if (Fe && Nt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0)
            Gd(), Pn(), (r.flags |= 98560), (d = !1);
          else if (((d = Si(r)), i !== null && i.dehydrated !== null)) {
            if (e === null) {
              if (!d) throw Error(a(318));
              if (
                ((d = r.memoizedState),
                (d = d !== null ? d.dehydrated : null),
                !d)
              )
                throw Error(a(317));
              d[Gt] = r;
            } else
              Pn(),
                (r.flags & 128) === 0 && (r.memoizedState = null),
                (r.flags |= 4);
            ot(r), (d = !1);
          } else Lt !== null && (po(Lt), (Lt = null)), (d = !0);
          if (!d) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0
          ? ((r.lanes = n), r)
          : ((i = i !== null),
            i !== (e !== null && e.memoizedState !== null) &&
              i &&
              ((r.child.flags |= 8192),
              (r.mode & 1) !== 0 &&
                (e === null || (He.current & 1) !== 0
                  ? Ke === 0 && (Ke = 3)
                  : vo())),
            r.updateQueue !== null && (r.flags |= 4),
            ot(r),
            null);
      case 4:
        return (
          _n(),
          no(e, r),
          e === null && Ns(r.stateNode.containerInfo),
          ot(r),
          null
        );
      case 10:
        return Ma(r.type._context), ot(r), null;
      case 17:
        return ft(r.type) && yi(), ot(r), null;
      case 19:
        if ((De(He), (d = r.memoizedState), d === null)) return ot(r), null;
        if (((i = (r.flags & 128) !== 0), (h = d.rendering), h === null))
          if (i) zs(d, !1);
          else {
            if (Ke !== 0 || (e !== null && (e.flags & 128) !== 0))
              for (e = r.child; e !== null; ) {
                if (((h = Ri(e)), h !== null)) {
                  for (
                    r.flags |= 128,
                      zs(d, !1),
                      i = h.updateQueue,
                      i !== null && ((r.updateQueue = i), (r.flags |= 4)),
                      r.subtreeFlags = 0,
                      i = n,
                      n = r.child;
                    n !== null;

                  )
                    (d = n),
                      (e = i),
                      (d.flags &= 14680066),
                      (h = d.alternate),
                      h === null
                        ? ((d.childLanes = 0),
                          (d.lanes = e),
                          (d.child = null),
                          (d.subtreeFlags = 0),
                          (d.memoizedProps = null),
                          (d.memoizedState = null),
                          (d.updateQueue = null),
                          (d.dependencies = null),
                          (d.stateNode = null))
                        : ((d.childLanes = h.childLanes),
                          (d.lanes = h.lanes),
                          (d.child = h.child),
                          (d.subtreeFlags = 0),
                          (d.deletions = null),
                          (d.memoizedProps = h.memoizedProps),
                          (d.memoizedState = h.memoizedState),
                          (d.updateQueue = h.updateQueue),
                          (d.type = h.type),
                          (e = h.dependencies),
                          (d.dependencies =
                            e === null
                              ? null
                              : {
                                  lanes: e.lanes,
                                  firstContext: e.firstContext,
                                })),
                      (n = n.sibling);
                  return Oe(He, (He.current & 1) | 2), r.child;
                }
                e = e.sibling;
              }
            d.tail !== null &&
              Be() > On &&
              ((r.flags |= 128), (i = !0), zs(d, !1), (r.lanes = 4194304));
          }
        else {
          if (!i)
            if (((e = Ri(h)), e !== null)) {
              if (
                ((r.flags |= 128),
                (i = !0),
                (n = e.updateQueue),
                n !== null && ((r.updateQueue = n), (r.flags |= 4)),
                zs(d, !0),
                d.tail === null &&
                  d.tailMode === "hidden" &&
                  !h.alternate &&
                  !Fe)
              )
                return ot(r), null;
            } else
              2 * Be() - d.renderingStartTime > On &&
                n !== 1073741824 &&
                ((r.flags |= 128), (i = !0), zs(d, !1), (r.lanes = 4194304));
          d.isBackwards
            ? ((h.sibling = r.child), (r.child = h))
            : ((n = d.last),
              n !== null ? (n.sibling = h) : (r.child = h),
              (d.last = h));
        }
        return d.tail !== null
          ? ((r = d.tail),
            (d.rendering = r),
            (d.tail = r.sibling),
            (d.renderingStartTime = Be()),
            (r.sibling = null),
            (n = He.current),
            Oe(He, i ? (n & 1) | 2 : n & 1),
            r)
          : (ot(r), null);
      case 22:
      case 23:
        return (
          go(),
          (i = r.memoizedState !== null),
          e !== null && (e.memoizedState !== null) !== i && (r.flags |= 8192),
          i && (r.mode & 1) !== 0
            ? (wt & 1073741824) !== 0 &&
              (ot(r), r.subtreeFlags & 6 && (r.flags |= 8192))
            : ot(r),
          null
        );
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(a(156, r.tag));
  }
  function Dx(e, r) {
    switch ((ka(r), r.tag)) {
      case 1:
        return (
          ft(r.type) && yi(),
          (e = r.flags),
          e & 65536 ? ((r.flags = (e & -65537) | 128), r) : null
        );
      case 3:
        return (
          _n(),
          De(mt),
          De(lt),
          Da(),
          (e = r.flags),
          (e & 65536) !== 0 && (e & 128) === 0
            ? ((r.flags = (e & -65537) | 128), r)
            : null
        );
      case 5:
        return Oa(r), null;
      case 13:
        if (
          (De(He), (e = r.memoizedState), e !== null && e.dehydrated !== null)
        ) {
          if (r.alternate === null) throw Error(a(340));
          Pn();
        }
        return (
          (e = r.flags), e & 65536 ? ((r.flags = (e & -65537) | 128), r) : null
        );
      case 19:
        return De(He), null;
      case 4:
        return _n(), null;
      case 10:
        return Ma(r.type._context), null;
      case 22:
      case 23:
        return go(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Fi = !1,
    ct = !1,
    Fx = typeof WeakSet == "function" ? WeakSet : Set,
    te = null;
  function zn(e, r) {
    var n = e.ref;
    if (n !== null)
      if (typeof n == "function")
        try {
          n(null);
        } catch (i) {
          qe(e, r, i);
        }
      else n.current = null;
  }
  function so(e, r, n) {
    try {
      n();
    } catch (i) {
      qe(e, r, i);
    }
  }
  var Uu = !1;
  function $x(e, r) {
    if (((xa = ii), (e = wd()), oa(e))) {
      if ("selectionStart" in e)
        var n = { start: e.selectionStart, end: e.selectionEnd };
      else
        e: {
          n = ((n = e.ownerDocument) && n.defaultView) || window;
          var i = n.getSelection && n.getSelection();
          if (i && i.rangeCount !== 0) {
            n = i.anchorNode;
            var o = i.anchorOffset,
              d = i.focusNode;
            i = i.focusOffset;
            try {
              n.nodeType, d.nodeType;
            } catch {
              n = null;
              break e;
            }
            var h = 0,
              y = -1,
              w = -1,
              _ = 0,
              $ = 0,
              V = e,
              F = null;
            t: for (;;) {
              for (
                var J;
                V !== n || (o !== 0 && V.nodeType !== 3) || (y = h + o),
                  V !== d || (i !== 0 && V.nodeType !== 3) || (w = h + i),
                  V.nodeType === 3 && (h += V.nodeValue.length),
                  (J = V.firstChild) !== null;

              )
                (F = V), (V = J);
              for (;;) {
                if (V === e) break t;
                if (
                  (F === n && ++_ === o && (y = h),
                  F === d && ++$ === i && (w = h),
                  (J = V.nextSibling) !== null)
                )
                  break;
                (V = F), (F = V.parentNode);
              }
              V = J;
            }
            n = y === -1 || w === -1 ? null : { start: y, end: w };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (
      ga = { focusedElem: e, selectionRange: n }, ii = !1, te = r;
      te !== null;

    )
      if (
        ((r = te), (e = r.child), (r.subtreeFlags & 1028) !== 0 && e !== null)
      )
        (e.return = r), (te = e);
      else
        for (; te !== null; ) {
          r = te;
          try {
            var re = r.alternate;
            if ((r.flags & 1024) !== 0)
              switch (r.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (re !== null) {
                    var ie = re.memoizedProps,
                      Ue = re.memoizedState,
                      R = r.stateNode,
                      k = R.getSnapshotBeforeUpdate(
                        r.elementType === r.type ? ie : Dt(r.type, ie),
                        Ue
                      );
                    R.__reactInternalSnapshotBeforeUpdate = k;
                  }
                  break;
                case 3:
                  var M = r.stateNode.containerInfo;
                  M.nodeType === 1
                    ? (M.textContent = "")
                    : M.nodeType === 9 &&
                      M.documentElement &&
                      M.removeChild(M.documentElement);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(a(163));
              }
          } catch (W) {
            qe(r, r.return, W);
          }
          if (((e = r.sibling), e !== null)) {
            (e.return = r.return), (te = e);
            break;
          }
          te = r.return;
        }
    return (re = Uu), (Uu = !1), re;
  }
  function Is(e, r, n) {
    var i = r.updateQueue;
    if (((i = i !== null ? i.lastEffect : null), i !== null)) {
      var o = (i = i.next);
      do {
        if ((o.tag & e) === e) {
          var d = o.destroy;
          (o.destroy = void 0), d !== void 0 && so(r, n, d);
        }
        o = o.next;
      } while (o !== i);
    }
  }
  function $i(e, r) {
    if (
      ((r = r.updateQueue), (r = r !== null ? r.lastEffect : null), r !== null)
    ) {
      var n = (r = r.next);
      do {
        if ((n.tag & e) === e) {
          var i = n.create;
          n.destroy = i();
        }
        n = n.next;
      } while (n !== r);
    }
  }
  function io(e) {
    var r = e.ref;
    if (r !== null) {
      var n = e.stateNode;
      switch (e.tag) {
        case 5:
          e = n;
          break;
        default:
          e = n;
      }
      typeof r == "function" ? r(e) : (r.current = e);
    }
  }
  function Wu(e) {
    var r = e.alternate;
    r !== null && ((e.alternate = null), Wu(r)),
      (e.child = null),
      (e.deletions = null),
      (e.sibling = null),
      e.tag === 5 &&
        ((r = e.stateNode),
        r !== null &&
          (delete r[Gt],
          delete r[Ss],
          delete r[ba],
          delete r[Nx],
          delete r[wx])),
      (e.stateNode = null),
      (e.return = null),
      (e.dependencies = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.stateNode = null),
      (e.updateQueue = null);
  }
  function Gu(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Qu(e) {
    e: for (;;) {
      for (; e.sibling === null; ) {
        if (e.return === null || Gu(e.return)) return null;
        e = e.return;
      }
      for (
        e.sibling.return = e.return, e = e.sibling;
        e.tag !== 5 && e.tag !== 6 && e.tag !== 18;

      ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        (e.child.return = e), (e = e.child);
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function lo(e, r, n) {
    var i = e.tag;
    if (i === 5 || i === 6)
      (e = e.stateNode),
        r
          ? n.nodeType === 8
            ? n.parentNode.insertBefore(e, r)
            : n.insertBefore(e, r)
          : (n.nodeType === 8
              ? ((r = n.parentNode), r.insertBefore(e, n))
              : ((r = n), r.appendChild(e)),
            (n = n._reactRootContainer),
            n != null || r.onclick !== null || (r.onclick = gi));
    else if (i !== 4 && ((e = e.child), e !== null))
      for (lo(e, r, n), e = e.sibling; e !== null; )
        lo(e, r, n), (e = e.sibling);
  }
  function ao(e, r, n) {
    var i = e.tag;
    if (i === 5 || i === 6)
      (e = e.stateNode), r ? n.insertBefore(e, r) : n.appendChild(e);
    else if (i !== 4 && ((e = e.child), e !== null))
      for (ao(e, r, n), e = e.sibling; e !== null; )
        ao(e, r, n), (e = e.sibling);
  }
  var rt = null,
    Ft = !1;
  function Ar(e, r, n) {
    for (n = n.child; n !== null; ) Ku(e, r, n), (n = n.sibling);
  }
  function Ku(e, r, n) {
    if (Wt && typeof Wt.onCommitFiberUnmount == "function")
      try {
        Wt.onCommitFiberUnmount(Js, n);
      } catch {}
    switch (n.tag) {
      case 5:
        ct || zn(n, r);
      case 6:
        var i = rt,
          o = Ft;
        (rt = null),
          Ar(e, r, n),
          (rt = i),
          (Ft = o),
          rt !== null &&
            (Ft
              ? ((e = rt),
                (n = n.stateNode),
                e.nodeType === 8
                  ? e.parentNode.removeChild(n)
                  : e.removeChild(n))
              : rt.removeChild(n.stateNode));
        break;
      case 18:
        rt !== null &&
          (Ft
            ? ((e = rt),
              (n = n.stateNode),
              e.nodeType === 8
                ? ja(e.parentNode, n)
                : e.nodeType === 1 && ja(e, n),
              fs(e))
            : ja(rt, n.stateNode));
        break;
      case 4:
        (i = rt),
          (o = Ft),
          (rt = n.stateNode.containerInfo),
          (Ft = !0),
          Ar(e, r, n),
          (rt = i),
          (Ft = o);
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (
          !ct &&
          ((i = n.updateQueue), i !== null && ((i = i.lastEffect), i !== null))
        ) {
          o = i = i.next;
          do {
            var d = o,
              h = d.destroy;
            (d = d.tag),
              h !== void 0 && ((d & 2) !== 0 || (d & 4) !== 0) && so(n, r, h),
              (o = o.next);
          } while (o !== i);
        }
        Ar(e, r, n);
        break;
      case 1:
        if (
          !ct &&
          (zn(n, r),
          (i = n.stateNode),
          typeof i.componentWillUnmount == "function")
        )
          try {
            (i.props = n.memoizedProps),
              (i.state = n.memoizedState),
              i.componentWillUnmount();
          } catch (y) {
            qe(n, r, y);
          }
        Ar(e, r, n);
        break;
      case 21:
        Ar(e, r, n);
        break;
      case 22:
        n.mode & 1
          ? ((ct = (i = ct) || n.memoizedState !== null), Ar(e, r, n), (ct = i))
          : Ar(e, r, n);
        break;
      default:
        Ar(e, r, n);
    }
  }
  function Yu(e) {
    var r = e.updateQueue;
    if (r !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new Fx()),
        r.forEach(function (i) {
          var o = Kx.bind(null, e, i);
          n.has(i) || (n.add(i), i.then(o, o));
        });
    }
  }
  function $t(e, r) {
    var n = r.deletions;
    if (n !== null)
      for (var i = 0; i < n.length; i++) {
        var o = n[i];
        try {
          var d = e,
            h = r,
            y = h;
          e: for (; y !== null; ) {
            switch (y.tag) {
              case 5:
                (rt = y.stateNode), (Ft = !1);
                break e;
              case 3:
                (rt = y.stateNode.containerInfo), (Ft = !0);
                break e;
              case 4:
                (rt = y.stateNode.containerInfo), (Ft = !0);
                break e;
            }
            y = y.return;
          }
          if (rt === null) throw Error(a(160));
          Ku(d, h, o), (rt = null), (Ft = !1);
          var w = o.alternate;
          w !== null && (w.return = null), (o.return = null);
        } catch (_) {
          qe(o, r, _);
        }
      }
    if (r.subtreeFlags & 12854)
      for (r = r.child; r !== null; ) Xu(r, e), (r = r.sibling);
  }
  function Xu(e, r) {
    var n = e.alternate,
      i = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (($t(r, e), Yt(e), i & 4)) {
          try {
            Is(3, e, e.return), $i(3, e);
          } catch (ie) {
            qe(e, e.return, ie);
          }
          try {
            Is(5, e, e.return);
          } catch (ie) {
            qe(e, e.return, ie);
          }
        }
        break;
      case 1:
        $t(r, e), Yt(e), i & 512 && n !== null && zn(n, n.return);
        break;
      case 5:
        if (
          ($t(r, e),
          Yt(e),
          i & 512 && n !== null && zn(n, n.return),
          e.flags & 32)
        ) {
          var o = e.stateNode;
          try {
            rs(o, "");
          } catch (ie) {
            qe(e, e.return, ie);
          }
        }
        if (i & 4 && ((o = e.stateNode), o != null)) {
          var d = e.memoizedProps,
            h = n !== null ? n.memoizedProps : d,
            y = e.type,
            w = e.updateQueue;
          if (((e.updateQueue = null), w !== null))
            try {
              y === "input" && d.type === "radio" && d.name != null && mn(o, d),
                Dl(y, h);
              var _ = Dl(y, d);
              for (h = 0; h < w.length; h += 2) {
                var $ = w[h],
                  V = w[h + 1];
                $ === "style"
                  ? Tc(o, V)
                  : $ === "dangerouslySetInnerHTML"
                  ? Mc(o, V)
                  : $ === "children"
                  ? rs(o, V)
                  : O(o, $, V, _);
              }
              switch (y) {
                case "input":
                  Br(o, d);
                  break;
                case "textarea":
                  Pc(o, d);
                  break;
                case "select":
                  var F = o._wrapperState.wasMultiple;
                  o._wrapperState.wasMultiple = !!d.multiple;
                  var J = d.value;
                  J != null
                    ? fn(o, !!d.multiple, J, !1)
                    : F !== !!d.multiple &&
                      (d.defaultValue != null
                        ? fn(o, !!d.multiple, d.defaultValue, !0)
                        : fn(o, !!d.multiple, d.multiple ? [] : "", !1));
              }
              o[Ss] = d;
            } catch (ie) {
              qe(e, e.return, ie);
            }
        }
        break;
      case 6:
        if (($t(r, e), Yt(e), i & 4)) {
          if (e.stateNode === null) throw Error(a(162));
          (o = e.stateNode), (d = e.memoizedProps);
          try {
            o.nodeValue = d;
          } catch (ie) {
            qe(e, e.return, ie);
          }
        }
        break;
      case 3:
        if (
          ($t(r, e), Yt(e), i & 4 && n !== null && n.memoizedState.isDehydrated)
        )
          try {
            fs(r.containerInfo);
          } catch (ie) {
            qe(e, e.return, ie);
          }
        break;
      case 4:
        $t(r, e), Yt(e);
        break;
      case 13:
        $t(r, e),
          Yt(e),
          (o = e.child),
          o.flags & 8192 &&
            ((d = o.memoizedState !== null),
            (o.stateNode.isHidden = d),
            !d ||
              (o.alternate !== null && o.alternate.memoizedState !== null) ||
              (uo = Be())),
          i & 4 && Yu(e);
        break;
      case 22:
        if (
          (($ = n !== null && n.memoizedState !== null),
          e.mode & 1 ? ((ct = (_ = ct) || $), $t(r, e), (ct = _)) : $t(r, e),
          Yt(e),
          i & 8192)
        ) {
          if (
            ((_ = e.memoizedState !== null),
            (e.stateNode.isHidden = _) && !$ && (e.mode & 1) !== 0)
          )
            for (te = e, $ = e.child; $ !== null; ) {
              for (V = te = $; te !== null; ) {
                switch (((F = te), (J = F.child), F.tag)) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Is(4, F, F.return);
                    break;
                  case 1:
                    zn(F, F.return);
                    var re = F.stateNode;
                    if (typeof re.componentWillUnmount == "function") {
                      (i = F), (n = F.return);
                      try {
                        (r = i),
                          (re.props = r.memoizedProps),
                          (re.state = r.memoizedState),
                          re.componentWillUnmount();
                      } catch (ie) {
                        qe(i, n, ie);
                      }
                    }
                    break;
                  case 5:
                    zn(F, F.return);
                    break;
                  case 22:
                    if (F.memoizedState !== null) {
                      em(V);
                      continue;
                    }
                }
                J !== null ? ((J.return = F), (te = J)) : em(V);
              }
              $ = $.sibling;
            }
          e: for ($ = null, V = e; ; ) {
            if (V.tag === 5) {
              if ($ === null) {
                $ = V;
                try {
                  (o = V.stateNode),
                    _
                      ? ((d = o.style),
                        typeof d.setProperty == "function"
                          ? d.setProperty("display", "none", "important")
                          : (d.display = "none"))
                      : ((y = V.stateNode),
                        (w = V.memoizedProps.style),
                        (h =
                          w != null && w.hasOwnProperty("display")
                            ? w.display
                            : null),
                        (y.style.display = _c("display", h)));
                } catch (ie) {
                  qe(e, e.return, ie);
                }
              }
            } else if (V.tag === 6) {
              if ($ === null)
                try {
                  V.stateNode.nodeValue = _ ? "" : V.memoizedProps;
                } catch (ie) {
                  qe(e, e.return, ie);
                }
            } else if (
              ((V.tag !== 22 && V.tag !== 23) ||
                V.memoizedState === null ||
                V === e) &&
              V.child !== null
            ) {
              (V.child.return = V), (V = V.child);
              continue;
            }
            if (V === e) break e;
            for (; V.sibling === null; ) {
              if (V.return === null || V.return === e) break e;
              $ === V && ($ = null), (V = V.return);
            }
            $ === V && ($ = null),
              (V.sibling.return = V.return),
              (V = V.sibling);
          }
        }
        break;
      case 19:
        $t(r, e), Yt(e), i & 4 && Yu(e);
        break;
      case 21:
        break;
      default:
        $t(r, e), Yt(e);
    }
  }
  function Yt(e) {
    var r = e.flags;
    if (r & 2) {
      try {
        e: {
          for (var n = e.return; n !== null; ) {
            if (Gu(n)) {
              var i = n;
              break e;
            }
            n = n.return;
          }
          throw Error(a(160));
        }
        switch (i.tag) {
          case 5:
            var o = i.stateNode;
            i.flags & 32 && (rs(o, ""), (i.flags &= -33));
            var d = Qu(e);
            ao(e, d, o);
            break;
          case 3:
          case 4:
            var h = i.stateNode.containerInfo,
              y = Qu(e);
            lo(e, y, h);
            break;
          default:
            throw Error(a(161));
        }
      } catch (w) {
        qe(e, e.return, w);
      }
      e.flags &= -3;
    }
    r & 4096 && (e.flags &= -4097);
  }
  function Hx(e, r, n) {
    (te = e), Zu(e);
  }
  function Zu(e, r, n) {
    for (var i = (e.mode & 1) !== 0; te !== null; ) {
      var o = te,
        d = o.child;
      if (o.tag === 22 && i) {
        var h = o.memoizedState !== null || Fi;
        if (!h) {
          var y = o.alternate,
            w = (y !== null && y.memoizedState !== null) || ct;
          y = Fi;
          var _ = ct;
          if (((Fi = h), (ct = w) && !_))
            for (te = o; te !== null; )
              (h = te),
                (w = h.child),
                h.tag === 22 && h.memoizedState !== null
                  ? tm(o)
                  : w !== null
                  ? ((w.return = h), (te = w))
                  : tm(o);
          for (; d !== null; ) (te = d), Zu(d), (d = d.sibling);
          (te = o), (Fi = y), (ct = _);
        }
        Ju(e);
      } else
        (o.subtreeFlags & 8772) !== 0 && d !== null
          ? ((d.return = o), (te = d))
          : Ju(e);
    }
  }
  function Ju(e) {
    for (; te !== null; ) {
      var r = te;
      if ((r.flags & 8772) !== 0) {
        var n = r.alternate;
        try {
          if ((r.flags & 8772) !== 0)
            switch (r.tag) {
              case 0:
              case 11:
              case 15:
                ct || $i(5, r);
                break;
              case 1:
                var i = r.stateNode;
                if (r.flags & 4 && !ct)
                  if (n === null) i.componentDidMount();
                  else {
                    var o =
                      r.elementType === r.type
                        ? n.memoizedProps
                        : Dt(r.type, n.memoizedProps);
                    i.componentDidUpdate(
                      o,
                      n.memoizedState,
                      i.__reactInternalSnapshotBeforeUpdate
                    );
                  }
                var d = r.updateQueue;
                d !== null && eu(r, d, i);
                break;
              case 3:
                var h = r.updateQueue;
                if (h !== null) {
                  if (((n = null), r.child !== null))
                    switch (r.child.tag) {
                      case 5:
                        n = r.child.stateNode;
                        break;
                      case 1:
                        n = r.child.stateNode;
                    }
                  eu(r, h, n);
                }
                break;
              case 5:
                var y = r.stateNode;
                if (n === null && r.flags & 4) {
                  n = y;
                  var w = r.memoizedProps;
                  switch (r.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      w.autoFocus && n.focus();
                      break;
                    case "img":
                      w.src && (n.src = w.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (r.memoizedState === null) {
                  var _ = r.alternate;
                  if (_ !== null) {
                    var $ = _.memoizedState;
                    if ($ !== null) {
                      var V = $.dehydrated;
                      V !== null && fs(V);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(a(163));
            }
          ct || (r.flags & 512 && io(r));
        } catch (F) {
          qe(r, r.return, F);
        }
      }
      if (r === e) {
        te = null;
        break;
      }
      if (((n = r.sibling), n !== null)) {
        (n.return = r.return), (te = n);
        break;
      }
      te = r.return;
    }
  }
  function em(e) {
    for (; te !== null; ) {
      var r = te;
      if (r === e) {
        te = null;
        break;
      }
      var n = r.sibling;
      if (n !== null) {
        (n.return = r.return), (te = n);
        break;
      }
      te = r.return;
    }
  }
  function tm(e) {
    for (; te !== null; ) {
      var r = te;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var n = r.return;
            try {
              $i(4, r);
            } catch (w) {
              qe(r, n, w);
            }
            break;
          case 1:
            var i = r.stateNode;
            if (typeof i.componentDidMount == "function") {
              var o = r.return;
              try {
                i.componentDidMount();
              } catch (w) {
                qe(r, o, w);
              }
            }
            var d = r.return;
            try {
              io(r);
            } catch (w) {
              qe(r, d, w);
            }
            break;
          case 5:
            var h = r.return;
            try {
              io(r);
            } catch (w) {
              qe(r, h, w);
            }
        }
      } catch (w) {
        qe(r, r.return, w);
      }
      if (r === e) {
        te = null;
        break;
      }
      var y = r.sibling;
      if (y !== null) {
        (y.return = r.return), (te = y);
        break;
      }
      te = r.return;
    }
  }
  var Vx = Math.ceil,
    Hi = D.ReactCurrentDispatcher,
    oo = D.ReactCurrentOwner,
    Mt = D.ReactCurrentBatchConfig,
    _e = 0,
    Je = null,
    We = null,
    nt = 0,
    wt = 0,
    In = Sr(0),
    Ke = 0,
    Os = null,
    Jr = 0,
    Vi = 0,
    co = 0,
    Ls = null,
    pt = null,
    uo = 0,
    On = 1 / 0,
    ur = null,
    qi = !1,
    mo = null,
    Rr = null,
    Bi = !1,
    Mr = null,
    Ui = 0,
    Ds = 0,
    fo = null,
    Wi = -1,
    Gi = 0;
  function ut() {
    return (_e & 6) !== 0 ? Be() : Wi !== -1 ? Wi : (Wi = Be());
  }
  function _r(e) {
    return (e.mode & 1) === 0
      ? 1
      : (_e & 2) !== 0 && nt !== 0
      ? nt & -nt
      : kx.transition !== null
      ? (Gi === 0 && (Gi = Qc()), Gi)
      : ((e = ze),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : nd(e.type))),
        e);
  }
  function Ht(e, r, n, i) {
    if (50 < Ds) throw ((Ds = 0), (fo = null), Error(a(185)));
    os(e, n, i),
      ((_e & 2) === 0 || e !== Je) &&
        (e === Je && ((_e & 2) === 0 && (Vi |= n), Ke === 4 && Tr(e, nt)),
        xt(e, i),
        n === 1 &&
          _e === 0 &&
          (r.mode & 1) === 0 &&
          ((On = Be() + 500), bi && Cr()));
  }
  function xt(e, r) {
    var n = e.callbackNode;
    kp(e, r);
    var i = ri(e, e === Je ? nt : 0);
    if (i === 0)
      n !== null && Uc(n), (e.callbackNode = null), (e.callbackPriority = 0);
    else if (((r = i & -i), e.callbackPriority !== r)) {
      if ((n != null && Uc(n), r === 1))
        e.tag === 0 ? Sx(nm.bind(null, e)) : Vd(nm.bind(null, e)),
          jx(function () {
            (_e & 6) === 0 && Cr();
          }),
          (n = null);
      else {
        switch (Kc(i)) {
          case 1:
            n = Ul;
            break;
          case 4:
            n = Wc;
            break;
          case 16:
            n = Zs;
            break;
          case 536870912:
            n = Gc;
            break;
          default:
            n = Zs;
        }
        n = um(n, rm.bind(null, e));
      }
      (e.callbackPriority = r), (e.callbackNode = n);
    }
  }
  function rm(e, r) {
    if (((Wi = -1), (Gi = 0), (_e & 6) !== 0)) throw Error(a(327));
    var n = e.callbackNode;
    if (Ln() && e.callbackNode !== n) return null;
    var i = ri(e, e === Je ? nt : 0);
    if (i === 0) return null;
    if ((i & 30) !== 0 || (i & e.expiredLanes) !== 0 || r) r = Qi(e, i);
    else {
      r = i;
      var o = _e;
      _e |= 2;
      var d = im();
      (Je !== e || nt !== r) && ((ur = null), (On = Be() + 500), tn(e, r));
      do
        try {
          Ux();
          break;
        } catch (y) {
          sm(e, y);
        }
      while (!0);
      Ra(),
        (Hi.current = d),
        (_e = o),
        We !== null ? (r = 0) : ((Je = null), (nt = 0), (r = Ke));
    }
    if (r !== 0) {
      if (
        (r === 2 && ((o = Wl(e)), o !== 0 && ((i = o), (r = ho(e, o)))),
        r === 1)
      )
        throw ((n = Os), tn(e, 0), Tr(e, i), xt(e, Be()), n);
      if (r === 6) Tr(e, i);
      else {
        if (
          ((o = e.current.alternate),
          (i & 30) === 0 &&
            !qx(o) &&
            ((r = Qi(e, i)),
            r === 2 && ((d = Wl(e)), d !== 0 && ((i = d), (r = ho(e, d)))),
            r === 1))
        )
          throw ((n = Os), tn(e, 0), Tr(e, i), xt(e, Be()), n);
        switch (((e.finishedWork = o), (e.finishedLanes = i), r)) {
          case 0:
          case 1:
            throw Error(a(345));
          case 2:
            rn(e, pt, ur);
            break;
          case 3:
            if (
              (Tr(e, i),
              (i & 130023424) === i && ((r = uo + 500 - Be()), 10 < r))
            ) {
              if (ri(e, 0) !== 0) break;
              if (((o = e.suspendedLanes), (o & i) !== i)) {
                ut(), (e.pingedLanes |= e.suspendedLanes & o);
                break;
              }
              e.timeoutHandle = ya(rn.bind(null, e, pt, ur), r);
              break;
            }
            rn(e, pt, ur);
            break;
          case 4:
            if ((Tr(e, i), (i & 4194240) === i)) break;
            for (r = e.eventTimes, o = -1; 0 < i; ) {
              var h = 31 - It(i);
              (d = 1 << h), (h = r[h]), h > o && (o = h), (i &= ~d);
            }
            if (
              ((i = o),
              (i = Be() - i),
              (i =
                (120 > i
                  ? 120
                  : 480 > i
                  ? 480
                  : 1080 > i
                  ? 1080
                  : 1920 > i
                  ? 1920
                  : 3e3 > i
                  ? 3e3
                  : 4320 > i
                  ? 4320
                  : 1960 * Vx(i / 1960)) - i),
              10 < i)
            ) {
              e.timeoutHandle = ya(rn.bind(null, e, pt, ur), i);
              break;
            }
            rn(e, pt, ur);
            break;
          case 5:
            rn(e, pt, ur);
            break;
          default:
            throw Error(a(329));
        }
      }
    }
    return xt(e, Be()), e.callbackNode === n ? rm.bind(null, e) : null;
  }
  function ho(e, r) {
    var n = Ls;
    return (
      e.current.memoizedState.isDehydrated && (tn(e, r).flags |= 256),
      (e = Qi(e, r)),
      e !== 2 && ((r = pt), (pt = n), r !== null && po(r)),
      e
    );
  }
  function po(e) {
    pt === null ? (pt = e) : pt.push.apply(pt, e);
  }
  function qx(e) {
    for (var r = e; ; ) {
      if (r.flags & 16384) {
        var n = r.updateQueue;
        if (n !== null && ((n = n.stores), n !== null))
          for (var i = 0; i < n.length; i++) {
            var o = n[i],
              d = o.getSnapshot;
            o = o.value;
            try {
              if (!Ot(d(), o)) return !1;
            } catch {
              return !1;
            }
          }
      }
      if (((n = r.child), r.subtreeFlags & 16384 && n !== null))
        (n.return = r), (r = n);
      else {
        if (r === e) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === e) return !0;
          r = r.return;
        }
        (r.sibling.return = r.return), (r = r.sibling);
      }
    }
    return !0;
  }
  function Tr(e, r) {
    for (
      r &= ~co,
        r &= ~Vi,
        e.suspendedLanes |= r,
        e.pingedLanes &= ~r,
        e = e.expirationTimes;
      0 < r;

    ) {
      var n = 31 - It(r),
        i = 1 << n;
      (e[n] = -1), (r &= ~i);
    }
  }
  function nm(e) {
    if ((_e & 6) !== 0) throw Error(a(327));
    Ln();
    var r = ri(e, 0);
    if ((r & 1) === 0) return xt(e, Be()), null;
    var n = Qi(e, r);
    if (e.tag !== 0 && n === 2) {
      var i = Wl(e);
      i !== 0 && ((r = i), (n = ho(e, i)));
    }
    if (n === 1) throw ((n = Os), tn(e, 0), Tr(e, r), xt(e, Be()), n);
    if (n === 6) throw Error(a(345));
    return (
      (e.finishedWork = e.current.alternate),
      (e.finishedLanes = r),
      rn(e, pt, ur),
      xt(e, Be()),
      null
    );
  }
  function xo(e, r) {
    var n = _e;
    _e |= 1;
    try {
      return e(r);
    } finally {
      (_e = n), _e === 0 && ((On = Be() + 500), bi && Cr());
    }
  }
  function en(e) {
    Mr !== null && Mr.tag === 0 && (_e & 6) === 0 && Ln();
    var r = _e;
    _e |= 1;
    var n = Mt.transition,
      i = ze;
    try {
      if (((Mt.transition = null), (ze = 1), e)) return e();
    } finally {
      (ze = i), (Mt.transition = n), (_e = r), (_e & 6) === 0 && Cr();
    }
  }
  function go() {
    (wt = In.current), De(In);
  }
  function tn(e, r) {
    (e.finishedWork = null), (e.finishedLanes = 0);
    var n = e.timeoutHandle;
    if ((n !== -1 && ((e.timeoutHandle = -1), yx(n)), We !== null))
      for (n = We.return; n !== null; ) {
        var i = n;
        switch ((ka(i), i.tag)) {
          case 1:
            (i = i.type.childContextTypes), i != null && yi();
            break;
          case 3:
            _n(), De(mt), De(lt), Da();
            break;
          case 5:
            Oa(i);
            break;
          case 4:
            _n();
            break;
          case 13:
            De(He);
            break;
          case 19:
            De(He);
            break;
          case 10:
            Ma(i.type._context);
            break;
          case 22:
          case 23:
            go();
        }
        n = n.return;
      }
    if (
      ((Je = e),
      (We = e = zr(e.current, null)),
      (nt = wt = r),
      (Ke = 0),
      (Os = null),
      (co = Vi = Jr = 0),
      (pt = Ls = null),
      Yr !== null)
    ) {
      for (r = 0; r < Yr.length; r++)
        if (((n = Yr[r]), (i = n.interleaved), i !== null)) {
          n.interleaved = null;
          var o = i.next,
            d = n.pending;
          if (d !== null) {
            var h = d.next;
            (d.next = o), (i.next = h);
          }
          n.pending = i;
        }
      Yr = null;
    }
    return e;
  }
  function sm(e, r) {
    do {
      var n = We;
      try {
        if ((Ra(), (Mi.current = Ii), _i)) {
          for (var i = Ve.memoizedState; i !== null; ) {
            var o = i.queue;
            o !== null && (o.pending = null), (i = i.next);
          }
          _i = !1;
        }
        if (
          ((Zr = 0),
          (Ze = Qe = Ve = null),
          (Rs = !1),
          (Ms = 0),
          (oo.current = null),
          n === null || n.return === null)
        ) {
          (Ke = 1), (Os = r), (We = null);
          break;
        }
        e: {
          var d = e,
            h = n.return,
            y = n,
            w = r;
          if (
            ((r = nt),
            (y.flags |= 32768),
            w !== null && typeof w == "object" && typeof w.then == "function")
          ) {
            var _ = w,
              $ = y,
              V = $.tag;
            if (($.mode & 1) === 0 && (V === 0 || V === 11 || V === 15)) {
              var F = $.alternate;
              F
                ? (($.updateQueue = F.updateQueue),
                  ($.memoizedState = F.memoizedState),
                  ($.lanes = F.lanes))
                : (($.updateQueue = null), ($.memoizedState = null));
            }
            var J = Au(h);
            if (J !== null) {
              (J.flags &= -257),
                Ru(J, h, y, d, r),
                J.mode & 1 && Pu(d, _, r),
                (r = J),
                (w = _);
              var re = r.updateQueue;
              if (re === null) {
                var ie = new Set();
                ie.add(w), (r.updateQueue = ie);
              } else re.add(w);
              break e;
            } else {
              if ((r & 1) === 0) {
                Pu(d, _, r), vo();
                break e;
              }
              w = Error(a(426));
            }
          } else if (Fe && y.mode & 1) {
            var Ue = Au(h);
            if (Ue !== null) {
              (Ue.flags & 65536) === 0 && (Ue.flags |= 256),
                Ru(Ue, h, y, d, r),
                Pa(Tn(w, y));
              break e;
            }
          }
          (d = w = Tn(w, y)),
            Ke !== 4 && (Ke = 2),
            Ls === null ? (Ls = [d]) : Ls.push(d),
            (d = h);
          do {
            switch (d.tag) {
              case 3:
                (d.flags |= 65536), (r &= -r), (d.lanes |= r);
                var R = Cu(d, w, r);
                Jd(d, R);
                break e;
              case 1:
                y = w;
                var k = d.type,
                  M = d.stateNode;
                if (
                  (d.flags & 128) === 0 &&
                  (typeof k.getDerivedStateFromError == "function" ||
                    (M !== null &&
                      typeof M.componentDidCatch == "function" &&
                      (Rr === null || !Rr.has(M))))
                ) {
                  (d.flags |= 65536), (r &= -r), (d.lanes |= r);
                  var W = Eu(d, y, r);
                  Jd(d, W);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        am(n);
      } catch (ce) {
        (r = ce), We === n && n !== null && (We = n = n.return);
        continue;
      }
      break;
    } while (!0);
  }
  function im() {
    var e = Hi.current;
    return (Hi.current = Ii), e === null ? Ii : e;
  }
  function vo() {
    (Ke === 0 || Ke === 3 || Ke === 2) && (Ke = 4),
      Je === null ||
        ((Jr & 268435455) === 0 && (Vi & 268435455) === 0) ||
        Tr(Je, nt);
  }
  function Qi(e, r) {
    var n = _e;
    _e |= 2;
    var i = im();
    (Je !== e || nt !== r) && ((ur = null), tn(e, r));
    do
      try {
        Bx();
        break;
      } catch (o) {
        sm(e, o);
      }
    while (!0);
    if ((Ra(), (_e = n), (Hi.current = i), We !== null)) throw Error(a(261));
    return (Je = null), (nt = 0), Ke;
  }
  function Bx() {
    for (; We !== null; ) lm(We);
  }
  function Ux() {
    for (; We !== null && !xp(); ) lm(We);
  }
  function lm(e) {
    var r = dm(e.alternate, e, wt);
    (e.memoizedProps = e.pendingProps),
      r === null ? am(e) : (We = r),
      (oo.current = null);
  }
  function am(e) {
    var r = e;
    do {
      var n = r.alternate;
      if (((e = r.return), (r.flags & 32768) === 0)) {
        if (((n = Lx(n, r, wt)), n !== null)) {
          We = n;
          return;
        }
      } else {
        if (((n = Dx(n, r)), n !== null)) {
          (n.flags &= 32767), (We = n);
          return;
        }
        if (e !== null)
          (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
        else {
          (Ke = 6), (We = null);
          return;
        }
      }
      if (((r = r.sibling), r !== null)) {
        We = r;
        return;
      }
      We = r = e;
    } while (r !== null);
    Ke === 0 && (Ke = 5);
  }
  function rn(e, r, n) {
    var i = ze,
      o = Mt.transition;
    try {
      (Mt.transition = null), (ze = 1), Wx(e, r, n, i);
    } finally {
      (Mt.transition = o), (ze = i);
    }
    return null;
  }
  function Wx(e, r, n, i) {
    do Ln();
    while (Mr !== null);
    if ((_e & 6) !== 0) throw Error(a(327));
    n = e.finishedWork;
    var o = e.finishedLanes;
    if (n === null) return null;
    if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
      throw Error(a(177));
    (e.callbackNode = null), (e.callbackPriority = 0);
    var d = n.lanes | n.childLanes;
    if (
      (Cp(e, d),
      e === Je && ((We = Je = null), (nt = 0)),
      ((n.subtreeFlags & 2064) === 0 && (n.flags & 2064) === 0) ||
        Bi ||
        ((Bi = !0),
        um(Zs, function () {
          return Ln(), null;
        })),
      (d = (n.flags & 15990) !== 0),
      (n.subtreeFlags & 15990) !== 0 || d)
    ) {
      (d = Mt.transition), (Mt.transition = null);
      var h = ze;
      ze = 1;
      var y = _e;
      (_e |= 4),
        (oo.current = null),
        $x(e, n),
        Xu(n, e),
        mx(ga),
        (ii = !!xa),
        (ga = xa = null),
        (e.current = n),
        Hx(n),
        gp(),
        (_e = y),
        (ze = h),
        (Mt.transition = d);
    } else e.current = n;
    if (
      (Bi && ((Bi = !1), (Mr = e), (Ui = o)),
      (d = e.pendingLanes),
      d === 0 && (Rr = null),
      jp(n.stateNode),
      xt(e, Be()),
      r !== null)
    )
      for (i = e.onRecoverableError, n = 0; n < r.length; n++)
        (o = r[n]), i(o.value, { componentStack: o.stack, digest: o.digest });
    if (qi) throw ((qi = !1), (e = mo), (mo = null), e);
    return (
      (Ui & 1) !== 0 && e.tag !== 0 && Ln(),
      (d = e.pendingLanes),
      (d & 1) !== 0 ? (e === fo ? Ds++ : ((Ds = 0), (fo = e))) : (Ds = 0),
      Cr(),
      null
    );
  }
  function Ln() {
    if (Mr !== null) {
      var e = Kc(Ui),
        r = Mt.transition,
        n = ze;
      try {
        if (((Mt.transition = null), (ze = 16 > e ? 16 : e), Mr === null))
          var i = !1;
        else {
          if (((e = Mr), (Mr = null), (Ui = 0), (_e & 6) !== 0))
            throw Error(a(331));
          var o = _e;
          for (_e |= 4, te = e.current; te !== null; ) {
            var d = te,
              h = d.child;
            if ((te.flags & 16) !== 0) {
              var y = d.deletions;
              if (y !== null) {
                for (var w = 0; w < y.length; w++) {
                  var _ = y[w];
                  for (te = _; te !== null; ) {
                    var $ = te;
                    switch ($.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Is(8, $, d);
                    }
                    var V = $.child;
                    if (V !== null) (V.return = $), (te = V);
                    else
                      for (; te !== null; ) {
                        $ = te;
                        var F = $.sibling,
                          J = $.return;
                        if ((Wu($), $ === _)) {
                          te = null;
                          break;
                        }
                        if (F !== null) {
                          (F.return = J), (te = F);
                          break;
                        }
                        te = J;
                      }
                  }
                }
                var re = d.alternate;
                if (re !== null) {
                  var ie = re.child;
                  if (ie !== null) {
                    re.child = null;
                    do {
                      var Ue = ie.sibling;
                      (ie.sibling = null), (ie = Ue);
                    } while (ie !== null);
                  }
                }
                te = d;
              }
            }
            if ((d.subtreeFlags & 2064) !== 0 && h !== null)
              (h.return = d), (te = h);
            else
              e: for (; te !== null; ) {
                if (((d = te), (d.flags & 2048) !== 0))
                  switch (d.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Is(9, d, d.return);
                  }
                var R = d.sibling;
                if (R !== null) {
                  (R.return = d.return), (te = R);
                  break e;
                }
                te = d.return;
              }
          }
          var k = e.current;
          for (te = k; te !== null; ) {
            h = te;
            var M = h.child;
            if ((h.subtreeFlags & 2064) !== 0 && M !== null)
              (M.return = h), (te = M);
            else
              e: for (h = k; te !== null; ) {
                if (((y = te), (y.flags & 2048) !== 0))
                  try {
                    switch (y.tag) {
                      case 0:
                      case 11:
                      case 15:
                        $i(9, y);
                    }
                  } catch (ce) {
                    qe(y, y.return, ce);
                  }
                if (y === h) {
                  te = null;
                  break e;
                }
                var W = y.sibling;
                if (W !== null) {
                  (W.return = y.return), (te = W);
                  break e;
                }
                te = y.return;
              }
          }
          if (
            ((_e = o),
            Cr(),
            Wt && typeof Wt.onPostCommitFiberRoot == "function")
          )
            try {
              Wt.onPostCommitFiberRoot(Js, e);
            } catch {}
          i = !0;
        }
        return i;
      } finally {
        (ze = n), (Mt.transition = r);
      }
    }
    return !1;
  }
  function om(e, r, n) {
    (r = Tn(n, r)),
      (r = Cu(e, r, 1)),
      (e = Pr(e, r, 1)),
      (r = ut()),
      e !== null && (os(e, 1, r), xt(e, r));
  }
  function qe(e, r, n) {
    if (e.tag === 3) om(e, e, n);
    else
      for (; r !== null; ) {
        if (r.tag === 3) {
          om(r, e, n);
          break;
        } else if (r.tag === 1) {
          var i = r.stateNode;
          if (
            typeof r.type.getDerivedStateFromError == "function" ||
            (typeof i.componentDidCatch == "function" &&
              (Rr === null || !Rr.has(i)))
          ) {
            (e = Tn(n, e)),
              (e = Eu(r, e, 1)),
              (r = Pr(r, e, 1)),
              (e = ut()),
              r !== null && (os(r, 1, e), xt(r, e));
            break;
          }
        }
        r = r.return;
      }
  }
  function Gx(e, r, n) {
    var i = e.pingCache;
    i !== null && i.delete(r),
      (r = ut()),
      (e.pingedLanes |= e.suspendedLanes & n),
      Je === e &&
        (nt & n) === n &&
        (Ke === 4 || (Ke === 3 && (nt & 130023424) === nt && 500 > Be() - uo)
          ? tn(e, 0)
          : (co |= n)),
      xt(e, r);
  }
  function cm(e, r) {
    r === 0 &&
      ((e.mode & 1) === 0
        ? (r = 1)
        : ((r = ti), (ti <<= 1), (ti & 130023424) === 0 && (ti = 4194304)));
    var n = ut();
    (e = or(e, r)), e !== null && (os(e, r, n), xt(e, n));
  }
  function Qx(e) {
    var r = e.memoizedState,
      n = 0;
    r !== null && (n = r.retryLane), cm(e, n);
  }
  function Kx(e, r) {
    var n = 0;
    switch (e.tag) {
      case 13:
        var i = e.stateNode,
          o = e.memoizedState;
        o !== null && (n = o.retryLane);
        break;
      case 19:
        i = e.stateNode;
        break;
      default:
        throw Error(a(314));
    }
    i !== null && i.delete(r), cm(e, n);
  }
  var dm;
  dm = function (e, r, n) {
    if (e !== null)
      if (e.memoizedProps !== r.pendingProps || mt.current) ht = !0;
      else {
        if ((e.lanes & n) === 0 && (r.flags & 128) === 0)
          return (ht = !1), Ox(e, r, n);
        ht = (e.flags & 131072) !== 0;
      }
    else (ht = !1), Fe && (r.flags & 1048576) !== 0 && qd(r, wi, r.index);
    switch (((r.lanes = 0), r.tag)) {
      case 2:
        var i = r.type;
        Di(e, r), (e = r.pendingProps);
        var o = kn(r, lt.current);
        Mn(r, n), (o = Ha(null, r, i, e, o, n));
        var d = Va();
        return (
          (r.flags |= 1),
          typeof o == "object" &&
          o !== null &&
          typeof o.render == "function" &&
          o.$$typeof === void 0
            ? ((r.tag = 1),
              (r.memoizedState = null),
              (r.updateQueue = null),
              ft(i) ? ((d = !0), ji(r)) : (d = !1),
              (r.memoizedState =
                o.state !== null && o.state !== void 0 ? o.state : null),
              za(r),
              (o.updater = Oi),
              (r.stateNode = o),
              (o._reactInternals = r),
              Qa(r, i, e, n),
              (r = Za(null, r, i, !0, d, n)))
            : ((r.tag = 0), Fe && d && Sa(r), dt(null, r, o, n), (r = r.child)),
          r
        );
      case 16:
        i = r.elementType;
        e: {
          switch (
            (Di(e, r),
            (e = r.pendingProps),
            (o = i._init),
            (i = o(i._payload)),
            (r.type = i),
            (o = r.tag = Xx(i)),
            (e = Dt(i, e)),
            o)
          ) {
            case 0:
              r = Xa(null, r, i, e, n);
              break e;
            case 1:
              r = Ou(null, r, i, e, n);
              break e;
            case 11:
              r = Mu(null, r, i, e, n);
              break e;
            case 14:
              r = _u(null, r, i, Dt(i.type, e), n);
              break e;
          }
          throw Error(a(306, i, ""));
        }
        return r;
      case 0:
        return (
          (i = r.type),
          (o = r.pendingProps),
          (o = r.elementType === i ? o : Dt(i, o)),
          Xa(e, r, i, o, n)
        );
      case 1:
        return (
          (i = r.type),
          (o = r.pendingProps),
          (o = r.elementType === i ? o : Dt(i, o)),
          Ou(e, r, i, o, n)
        );
      case 3:
        e: {
          if ((Lu(r), e === null)) throw Error(a(387));
          (i = r.pendingProps),
            (d = r.memoizedState),
            (o = d.element),
            Zd(e, r),
            Ai(r, i, null, n);
          var h = r.memoizedState;
          if (((i = h.element), d.isDehydrated))
            if (
              ((d = {
                element: i,
                isDehydrated: !1,
                cache: h.cache,
                pendingSuspenseBoundaries: h.pendingSuspenseBoundaries,
                transitions: h.transitions,
              }),
              (r.updateQueue.baseState = d),
              (r.memoizedState = d),
              r.flags & 256)
            ) {
              (o = Tn(Error(a(423)), r)), (r = Du(e, r, i, n, o));
              break e;
            } else if (i !== o) {
              (o = Tn(Error(a(424)), r)), (r = Du(e, r, i, n, o));
              break e;
            } else
              for (
                Nt = wr(r.stateNode.containerInfo.firstChild),
                  bt = r,
                  Fe = !0,
                  Lt = null,
                  n = Yd(r, null, i, n),
                  r.child = n;
                n;

              )
                (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
          else {
            if ((Pn(), i === o)) {
              r = dr(e, r, n);
              break e;
            }
            dt(e, r, i, n);
          }
          r = r.child;
        }
        return r;
      case 5:
        return (
          tu(r),
          e === null && Ea(r),
          (i = r.type),
          (o = r.pendingProps),
          (d = e !== null ? e.memoizedProps : null),
          (h = o.children),
          va(i, o) ? (h = null) : d !== null && va(i, d) && (r.flags |= 32),
          Iu(e, r),
          dt(e, r, h, n),
          r.child
        );
      case 6:
        return e === null && Ea(r), null;
      case 13:
        return Fu(e, r, n);
      case 4:
        return (
          Ia(r, r.stateNode.containerInfo),
          (i = r.pendingProps),
          e === null ? (r.child = An(r, null, i, n)) : dt(e, r, i, n),
          r.child
        );
      case 11:
        return (
          (i = r.type),
          (o = r.pendingProps),
          (o = r.elementType === i ? o : Dt(i, o)),
          Mu(e, r, i, o, n)
        );
      case 7:
        return dt(e, r, r.pendingProps, n), r.child;
      case 8:
        return dt(e, r, r.pendingProps.children, n), r.child;
      case 12:
        return dt(e, r, r.pendingProps.children, n), r.child;
      case 10:
        e: {
          if (
            ((i = r.type._context),
            (o = r.pendingProps),
            (d = r.memoizedProps),
            (h = o.value),
            Oe(Ci, i._currentValue),
            (i._currentValue = h),
            d !== null)
          )
            if (Ot(d.value, h)) {
              if (d.children === o.children && !mt.current) {
                r = dr(e, r, n);
                break e;
              }
            } else
              for (d = r.child, d !== null && (d.return = r); d !== null; ) {
                var y = d.dependencies;
                if (y !== null) {
                  h = d.child;
                  for (var w = y.firstContext; w !== null; ) {
                    if (w.context === i) {
                      if (d.tag === 1) {
                        (w = cr(-1, n & -n)), (w.tag = 2);
                        var _ = d.updateQueue;
                        if (_ !== null) {
                          _ = _.shared;
                          var $ = _.pending;
                          $ === null
                            ? (w.next = w)
                            : ((w.next = $.next), ($.next = w)),
                            (_.pending = w);
                        }
                      }
                      (d.lanes |= n),
                        (w = d.alternate),
                        w !== null && (w.lanes |= n),
                        _a(d.return, n, r),
                        (y.lanes |= n);
                      break;
                    }
                    w = w.next;
                  }
                } else if (d.tag === 10) h = d.type === r.type ? null : d.child;
                else if (d.tag === 18) {
                  if (((h = d.return), h === null)) throw Error(a(341));
                  (h.lanes |= n),
                    (y = h.alternate),
                    y !== null && (y.lanes |= n),
                    _a(h, n, r),
                    (h = d.sibling);
                } else h = d.child;
                if (h !== null) h.return = d;
                else
                  for (h = d; h !== null; ) {
                    if (h === r) {
                      h = null;
                      break;
                    }
                    if (((d = h.sibling), d !== null)) {
                      (d.return = h.return), (h = d);
                      break;
                    }
                    h = h.return;
                  }
                d = h;
              }
          dt(e, r, o.children, n), (r = r.child);
        }
        return r;
      case 9:
        return (
          (o = r.type),
          (i = r.pendingProps.children),
          Mn(r, n),
          (o = At(o)),
          (i = i(o)),
          (r.flags |= 1),
          dt(e, r, i, n),
          r.child
        );
      case 14:
        return (
          (i = r.type),
          (o = Dt(i, r.pendingProps)),
          (o = Dt(i.type, o)),
          _u(e, r, i, o, n)
        );
      case 15:
        return Tu(e, r, r.type, r.pendingProps, n);
      case 17:
        return (
          (i = r.type),
          (o = r.pendingProps),
          (o = r.elementType === i ? o : Dt(i, o)),
          Di(e, r),
          (r.tag = 1),
          ft(i) ? ((e = !0), ji(r)) : (e = !1),
          Mn(r, n),
          Su(r, i, o),
          Qa(r, i, o, n),
          Za(null, r, i, !0, e, n)
        );
      case 19:
        return Hu(e, r, n);
      case 22:
        return zu(e, r, n);
    }
    throw Error(a(156, r.tag));
  };
  function um(e, r) {
    return Bc(e, r);
  }
  function Yx(e, r, n, i) {
    (this.tag = e),
      (this.key = n),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = r),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = i),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null);
  }
  function _t(e, r, n, i) {
    return new Yx(e, r, n, i);
  }
  function yo(e) {
    return (e = e.prototype), !(!e || !e.isReactComponent);
  }
  function Xx(e) {
    if (typeof e == "function") return yo(e) ? 1 : 0;
    if (e != null) {
      if (((e = e.$$typeof), e === Ce)) return 11;
      if (e === Ee) return 14;
    }
    return 2;
  }
  function zr(e, r) {
    var n = e.alternate;
    return (
      n === null
        ? ((n = _t(e.tag, r, e.key, e.mode)),
          (n.elementType = e.elementType),
          (n.type = e.type),
          (n.stateNode = e.stateNode),
          (n.alternate = e),
          (e.alternate = n))
        : ((n.pendingProps = r),
          (n.type = e.type),
          (n.flags = 0),
          (n.subtreeFlags = 0),
          (n.deletions = null)),
      (n.flags = e.flags & 14680064),
      (n.childLanes = e.childLanes),
      (n.lanes = e.lanes),
      (n.child = e.child),
      (n.memoizedProps = e.memoizedProps),
      (n.memoizedState = e.memoizedState),
      (n.updateQueue = e.updateQueue),
      (r = e.dependencies),
      (n.dependencies =
        r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }),
      (n.sibling = e.sibling),
      (n.index = e.index),
      (n.ref = e.ref),
      n
    );
  }
  function Ki(e, r, n, i, o, d) {
    var h = 2;
    if (((i = e), typeof e == "function")) yo(e) && (h = 1);
    else if (typeof e == "string") h = 5;
    else
      e: switch (e) {
        case U:
          return nn(n.children, o, d, r);
        case H:
          (h = 8), (o |= 8);
          break;
        case he:
          return (
            (e = _t(12, n, r, o | 2)), (e.elementType = he), (e.lanes = d), e
          );
        case je:
          return (e = _t(13, n, r, o)), (e.elementType = je), (e.lanes = d), e;
        case ge:
          return (e = _t(19, n, r, o)), (e.elementType = ge), (e.lanes = d), e;
        case le:
          return Yi(n, o, d, r);
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case ye:
                h = 10;
                break e;
              case Ae:
                h = 9;
                break e;
              case Ce:
                h = 11;
                break e;
              case Ee:
                h = 14;
                break e;
              case de:
                (h = 16), (i = null);
                break e;
            }
          throw Error(a(130, e == null ? e : typeof e, ""));
      }
    return (
      (r = _t(h, n, r, o)), (r.elementType = e), (r.type = i), (r.lanes = d), r
    );
  }
  function nn(e, r, n, i) {
    return (e = _t(7, e, i, r)), (e.lanes = n), e;
  }
  function Yi(e, r, n, i) {
    return (
      (e = _t(22, e, i, r)),
      (e.elementType = le),
      (e.lanes = n),
      (e.stateNode = { isHidden: !1 }),
      e
    );
  }
  function jo(e, r, n) {
    return (e = _t(6, e, null, r)), (e.lanes = n), e;
  }
  function bo(e, r, n) {
    return (
      (r = _t(4, e.children !== null ? e.children : [], e.key, r)),
      (r.lanes = n),
      (r.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      r
    );
  }
  function Zx(e, r, n, i, o) {
    (this.tag = r),
      (this.containerInfo = e),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode = this.pendingContext = this.context = null),
      (this.callbackPriority = 0),
      (this.eventTimes = Gl(0)),
      (this.expirationTimes = Gl(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = Gl(0)),
      (this.identifierPrefix = i),
      (this.onRecoverableError = o),
      (this.mutableSourceEagerHydrationData = null);
  }
  function No(e, r, n, i, o, d, h, y, w) {
    return (
      (e = new Zx(e, r, n, y, w)),
      r === 1 ? ((r = 1), d === !0 && (r |= 8)) : (r = 0),
      (d = _t(3, null, null, r)),
      (e.current = d),
      (d.stateNode = e),
      (d.memoizedState = {
        element: i,
        isDehydrated: n,
        cache: null,
        transitions: null,
        pendingSuspenseBoundaries: null,
      }),
      za(d),
      e
    );
  }
  function Jx(e, r, n) {
    var i =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: Z,
      key: i == null ? null : "" + i,
      children: e,
      containerInfo: r,
      implementation: n,
    };
  }
  function mm(e) {
    if (!e) return kr;
    e = e._reactInternals;
    e: {
      if (Ur(e) !== e || e.tag !== 1) throw Error(a(170));
      var r = e;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (ft(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(a(171));
    }
    if (e.tag === 1) {
      var n = e.type;
      if (ft(n)) return $d(e, n, r);
    }
    return r;
  }
  function fm(e, r, n, i, o, d, h, y, w) {
    return (
      (e = No(n, i, !0, e, o, d, h, y, w)),
      (e.context = mm(null)),
      (n = e.current),
      (i = ut()),
      (o = _r(n)),
      (d = cr(i, o)),
      (d.callback = r ?? null),
      Pr(n, d, o),
      (e.current.lanes = o),
      os(e, o, i),
      xt(e, i),
      e
    );
  }
  function Xi(e, r, n, i) {
    var o = r.current,
      d = ut(),
      h = _r(o);
    return (
      (n = mm(n)),
      r.context === null ? (r.context = n) : (r.pendingContext = n),
      (r = cr(d, h)),
      (r.payload = { element: e }),
      (i = i === void 0 ? null : i),
      i !== null && (r.callback = i),
      (e = Pr(o, r, h)),
      e !== null && (Ht(e, o, h, d), Pi(e, o, h)),
      h
    );
  }
  function Zi(e) {
    if (((e = e.current), !e.child)) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function hm(e, r) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < r ? n : r;
    }
  }
  function wo(e, r) {
    hm(e, r), (e = e.alternate) && hm(e, r);
  }
  function eg() {
    return null;
  }
  var pm =
    typeof reportError == "function"
      ? reportError
      : function (e) {
          console.error(e);
        };
  function So(e) {
    this._internalRoot = e;
  }
  (Ji.prototype.render = So.prototype.render =
    function (e) {
      var r = this._internalRoot;
      if (r === null) throw Error(a(409));
      Xi(e, r, null, null);
    }),
    (Ji.prototype.unmount = So.prototype.unmount =
      function () {
        var e = this._internalRoot;
        if (e !== null) {
          this._internalRoot = null;
          var r = e.containerInfo;
          en(function () {
            Xi(null, e, null, null);
          }),
            (r[sr] = null);
        }
      });
  function Ji(e) {
    this._internalRoot = e;
  }
  Ji.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var r = Zc();
      e = { blockedOn: null, target: e, priority: r };
      for (var n = 0; n < jr.length && r !== 0 && r < jr[n].priority; n++);
      jr.splice(n, 0, e), n === 0 && td(e);
    }
  };
  function ko(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
  }
  function el(e) {
    return !(
      !e ||
      (e.nodeType !== 1 &&
        e.nodeType !== 9 &&
        e.nodeType !== 11 &&
        (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
    );
  }
  function xm() {}
  function tg(e, r, n, i, o) {
    if (o) {
      if (typeof i == "function") {
        var d = i;
        i = function () {
          var _ = Zi(h);
          d.call(_);
        };
      }
      var h = fm(r, i, e, 0, null, !1, !1, "", xm);
      return (
        (e._reactRootContainer = h),
        (e[sr] = h.current),
        Ns(e.nodeType === 8 ? e.parentNode : e),
        en(),
        h
      );
    }
    for (; (o = e.lastChild); ) e.removeChild(o);
    if (typeof i == "function") {
      var y = i;
      i = function () {
        var _ = Zi(w);
        y.call(_);
      };
    }
    var w = No(e, 0, !1, null, null, !1, !1, "", xm);
    return (
      (e._reactRootContainer = w),
      (e[sr] = w.current),
      Ns(e.nodeType === 8 ? e.parentNode : e),
      en(function () {
        Xi(r, w, n, i);
      }),
      w
    );
  }
  function tl(e, r, n, i, o) {
    var d = n._reactRootContainer;
    if (d) {
      var h = d;
      if (typeof o == "function") {
        var y = o;
        o = function () {
          var w = Zi(h);
          y.call(w);
        };
      }
      Xi(r, h, e, o);
    } else h = tg(n, r, e, o, i);
    return Zi(h);
  }
  (Yc = function (e) {
    switch (e.tag) {
      case 3:
        var r = e.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var n = as(r.pendingLanes);
          n !== 0 &&
            (Ql(r, n | 1),
            xt(r, Be()),
            (_e & 6) === 0 && ((On = Be() + 500), Cr()));
        }
        break;
      case 13:
        en(function () {
          var i = or(e, 1);
          if (i !== null) {
            var o = ut();
            Ht(i, e, 1, o);
          }
        }),
          wo(e, 1);
    }
  }),
    (Kl = function (e) {
      if (e.tag === 13) {
        var r = or(e, 134217728);
        if (r !== null) {
          var n = ut();
          Ht(r, e, 134217728, n);
        }
        wo(e, 134217728);
      }
    }),
    (Xc = function (e) {
      if (e.tag === 13) {
        var r = _r(e),
          n = or(e, r);
        if (n !== null) {
          var i = ut();
          Ht(n, e, r, i);
        }
        wo(e, r);
      }
    }),
    (Zc = function () {
      return ze;
    }),
    (Jc = function (e, r) {
      var n = ze;
      try {
        return (ze = e), r();
      } finally {
        ze = n;
      }
    }),
    (Hl = function (e, r, n) {
      switch (r) {
        case "input":
          if ((Br(e, n), (r = n.name), n.type === "radio" && r != null)) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (
              n = n.querySelectorAll(
                "input[name=" + JSON.stringify("" + r) + '][type="radio"]'
              ),
                r = 0;
              r < n.length;
              r++
            ) {
              var i = n[r];
              if (i !== e && i.form === e.form) {
                var o = vi(i);
                if (!o) throw Error(a(90));
                Ie(i), Br(i, o);
              }
            }
          }
          break;
        case "textarea":
          Pc(e, n);
          break;
        case "select":
          (r = n.value), r != null && fn(e, !!n.multiple, r, !1);
      }
    }),
    (Lc = xo),
    (Dc = en);
  var rg = { usingClientEntryPoint: !1, Events: [ks, wn, vi, Ic, Oc, xo] },
    Fs = {
      findFiberByHostInstance: Wr,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom",
    },
    ng = {
      bundleType: Fs.bundleType,
      version: Fs.version,
      rendererPackageName: Fs.rendererPackageName,
      rendererConfig: Fs.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: D.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (e) {
        return (e = Vc(e)), e === null ? null : e.stateNode;
      },
      findFiberByHostInstance: Fs.findFiberByHostInstance || eg,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var rl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!rl.isDisabled && rl.supportsFiber)
      try {
        (Js = rl.inject(ng)), (Wt = rl);
      } catch {}
  }
  return (
    (gt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = rg),
    (gt.createPortal = function (e, r) {
      var n =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!ko(r)) throw Error(a(200));
      return Jx(e, r, null, n);
    }),
    (gt.createRoot = function (e, r) {
      if (!ko(e)) throw Error(a(299));
      var n = !1,
        i = "",
        o = pm;
      return (
        r != null &&
          (r.unstable_strictMode === !0 && (n = !0),
          r.identifierPrefix !== void 0 && (i = r.identifierPrefix),
          r.onRecoverableError !== void 0 && (o = r.onRecoverableError)),
        (r = No(e, 1, !1, null, null, n, !1, i, o)),
        (e[sr] = r.current),
        Ns(e.nodeType === 8 ? e.parentNode : e),
        new So(r)
      );
    }),
    (gt.findDOMNode = function (e) {
      if (e == null) return null;
      if (e.nodeType === 1) return e;
      var r = e._reactInternals;
      if (r === void 0)
        throw typeof e.render == "function"
          ? Error(a(188))
          : ((e = Object.keys(e).join(",")), Error(a(268, e)));
      return (e = Vc(r)), (e = e === null ? null : e.stateNode), e;
    }),
    (gt.flushSync = function (e) {
      return en(e);
    }),
    (gt.hydrate = function (e, r, n) {
      if (!el(r)) throw Error(a(200));
      return tl(null, e, r, !0, n);
    }),
    (gt.hydrateRoot = function (e, r, n) {
      if (!ko(e)) throw Error(a(405));
      var i = (n != null && n.hydratedSources) || null,
        o = !1,
        d = "",
        h = pm;
      if (
        (n != null &&
          (n.unstable_strictMode === !0 && (o = !0),
          n.identifierPrefix !== void 0 && (d = n.identifierPrefix),
          n.onRecoverableError !== void 0 && (h = n.onRecoverableError)),
        (r = fm(r, null, e, 1, n ?? null, o, !1, d, h)),
        (e[sr] = r.current),
        Ns(e),
        i)
      )
        for (e = 0; e < i.length; e++)
          (n = i[e]),
            (o = n._getVersion),
            (o = o(n._source)),
            r.mutableSourceEagerHydrationData == null
              ? (r.mutableSourceEagerHydrationData = [n, o])
              : r.mutableSourceEagerHydrationData.push(n, o);
      return new Ji(r);
    }),
    (gt.render = function (e, r, n) {
      if (!el(r)) throw Error(a(200));
      return tl(null, e, r, !1, n);
    }),
    (gt.unmountComponentAtNode = function (e) {
      if (!el(e)) throw Error(a(40));
      return e._reactRootContainer
        ? (en(function () {
            tl(null, null, e, !1, function () {
              (e._reactRootContainer = null), (e[sr] = null);
            });
          }),
          !0)
        : !1;
    }),
    (gt.unstable_batchedUpdates = xo),
    (gt.unstable_renderSubtreeIntoContainer = function (e, r, n, i) {
      if (!el(n)) throw Error(a(200));
      if (e == null || e._reactInternals === void 0) throw Error(a(38));
      return tl(e, r, n, !1, i);
    }),
    (gt.version = "18.3.1-next-f1338f8080-20240426"),
    gt
  );
}
var Sm;
function vf() {
  if (Sm) return Po.exports;
  Sm = 1;
  function s() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s);
      } catch (l) {
        console.error(l);
      }
  }
  return s(), (Po.exports = ug()), Po.exports;
}
var km;
function mg() {
  if (km) return nl;
  km = 1;
  var s = vf();
  return (nl.createRoot = s.createRoot), (nl.hydrateRoot = s.hydrateRoot), nl;
}
var fg = mg(),
  j = dc();
const Lr = gf(j),
  yf = ig({ __proto__: null, default: Lr }, [j]);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const hg = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  pg = (s) =>
    s.replace(/^([A-Z])|[\s-_]+(\w)/g, (l, a, c) =>
      c ? c.toUpperCase() : a.toLowerCase()
    ),
  Cm = (s) => {
    const l = pg(s);
    return l.charAt(0).toUpperCase() + l.slice(1);
  },
  jf = (...s) =>
    s
      .filter((l, a, c) => !!l && l.trim() !== "" && c.indexOf(l) === a)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var xg = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const gg = j.forwardRef(
  (
    {
      color: s = "currentColor",
      size: l = 24,
      strokeWidth: a = 2,
      absoluteStrokeWidth: c,
      className: u = "",
      children: f,
      iconNode: p,
      ...m
    },
    x
  ) =>
    j.createElement(
      "svg",
      {
        ref: x,
        ...xg,
        width: l,
        height: l,
        stroke: s,
        strokeWidth: c ? (Number(a) * 24) / Number(l) : a,
        className: jf("lucide", u),
        ...m,
      },
      [
        ...p.map(([v, N]) => j.createElement(v, N)),
        ...(Array.isArray(f) ? f : [f]),
      ]
    )
);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ee = (s, l) => {
  const a = j.forwardRef(({ className: c, ...u }, f) =>
    j.createElement(gg, {
      ref: f,
      iconNode: l,
      className: jf(`lucide-${hg(Cm(s))}`, `lucide-${s}`, c),
      ...u,
    })
  );
  return (a.displayName = Cm(s)), a;
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const vg = [
    [
      "path",
      {
        d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
        key: "169zse",
      },
    ],
  ],
  Em = ee("activity", vg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const yg = [
    ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
    ["path", { d: "M19 12H5", key: "x3x0zl" }],
  ],
  jg = ee("arrow-left", yg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bg = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
  ],
  bf = ee("arrow-right", bg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ng = [
    [
      "path",
      {
        d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
        key: "1yiouv",
      },
    ],
    ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }],
  ],
  sl = ee("award", Ng);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wg = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
    [
      "path",
      {
        d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        key: "11g9vi",
      },
    ],
  ],
  Wo = ee("bell", wg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Sg = [
    ["path", { d: "M12 7v14", key: "1akyts" }],
    [
      "path",
      {
        d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
        key: "ruj8y",
      },
    ],
  ],
  Mo = ee("book-open", Sg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kg = [
    [
      "path",
      {
        d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
        key: "k3hazp",
      },
    ],
  ],
  Cg = ee("book", kg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Eg = [
    ["path", { d: "M12 8V4H8", key: "hb8ula" }],
    [
      "rect",
      { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" },
    ],
    ["path", { d: "M2 14h2", key: "vft8re" }],
    ["path", { d: "M20 14h2", key: "4cs60a" }],
    ["path", { d: "M15 13v2", key: "1xurst" }],
    ["path", { d: "M9 13v2", key: "rq6x2g" }],
  ],
  Vn = ee("bot", Eg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pg = [
    [
      "rect",
      { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" },
    ],
    ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
    ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
    ["path", { d: "M16 10h.01", key: "1m94wz" }],
    ["path", { d: "M12 10h.01", key: "1nrarc" }],
    ["path", { d: "M8 10h.01", key: "19clt8" }],
    ["path", { d: "M12 14h.01", key: "1etili" }],
    ["path", { d: "M8 14h.01", key: "6423bh" }],
    ["path", { d: "M12 18h.01", key: "mhygvu" }],
    ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ],
  Nl = ee("calculator", Pg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ag = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" },
    ],
    ["path", { d: "M3 10h18", key: "8toen8" }],
  ],
  Go = ee("calendar", Ag);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rg = [
    [
      "path",
      {
        d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
        key: "1tc9qg",
      },
    ],
    ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
  ],
  Mg = ee("camera", Rg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _g = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "M18 17V9", key: "2bz60n" }],
    ["path", { d: "M13 17V5", key: "1frdt8" }],
    ["path", { d: "M8 17v-3", key: "17ska0" }],
  ],
  Un = ee("chart-column", _g);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Tg = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "m19 9-5 5-4-4-3 3", key: "2osh9i" }],
  ],
  Nf = ee("chart-line", Tg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const zg = [
    [
      "path",
      {
        d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
        key: "pzmjnu",
      },
    ],
    ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }],
  ],
  wf = ee("chart-pie", zg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ig = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]],
  Og = ee("check", Ig);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Lg = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]],
  Sf = ee("chevron-down", Lg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dg = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]],
  Fg = ee("chevron-left", Dg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $g = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]],
  Hg = ee("chevron-right", $g);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vg = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]],
  qg = ee("chevron-up", Vg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bg = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
    ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }],
  ],
  il = ee("circle-alert", Bg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ug = [
    ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
    ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
  ],
  vt = ee("circle-check-big", Ug);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wg = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
    ["path", { d: "m9 9 6 6", key: "z0biqf" }],
  ],
  Gg = ee("circle-x", Wg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qg = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }],
  ],
  Wn = ee("clock", Qg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Kg = [
    ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
    ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
    ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }],
  ],
  Yg = ee("database", Kg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xg = [
    ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
    [
      "path",
      { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" },
    ],
  ],
  Zg = ee("dollar-sign", Xg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Jg = [
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
    ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }],
  ],
  Fr = ee("download", Jg);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ev = [
    [
      "path",
      {
        d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        key: "1nclc0",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  tv = ee("eye", ev);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const rv = [
    [
      "path",
      {
        d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
        key: "1rqfz7",
      },
    ],
    ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
    ["path", { d: "M10 9H8", key: "b1mrlr" }],
    ["path", { d: "M16 13H8", key: "t4e002" }],
    ["path", { d: "M16 17H8", key: "z1uh3a" }],
  ],
  ln = ee("file-text", rv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const nv = [
    [
      "path",
      {
        d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
        key: "sc7q7i",
      },
    ],
  ],
  wl = ee("funnel", nv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const sv = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    [
      "path",
      { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" },
    ],
    ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ],
  iv = ee("globe", sv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const lv = [
    [
      "path",
      {
        d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
        key: "j76jl0",
      },
    ],
    ["path", { d: "M22 10v6", key: "1lu8f3" }],
    ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }],
  ],
  Qo = ee("graduation-cap", lv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const av = [
    [
      "path",
      { d: "M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16", key: "1ifwr1" },
    ],
    [
      "path",
      {
        d: "m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9",
        key: "17abbs",
      },
    ],
    ["path", { d: "m2 15 6 6", key: "10dquu" }],
    [
      "path",
      {
        d: "M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z",
        key: "1h3036",
      },
    ],
  ],
  ov = ee("hand-heart", av);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const cv = [
    [
      "path",
      {
        d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
        key: "c3ymky",
      },
    ],
    ["path", { d: "M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27", key: "1uw2ng" }],
  ],
  dv = ee("heart-pulse", cv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const uv = [
    [
      "path",
      {
        d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
        key: "c3ymky",
      },
    ],
  ],
  qs = ee("heart", uv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const mv = [
    [
      "path",
      { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" },
    ],
    [
      "path",
      {
        d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        key: "1d0kgt",
      },
    ],
  ],
  fv = ee("house", mv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const hv = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M12 16v-4", key: "1dtifu" }],
    ["path", { d: "M12 8h.01", key: "e9boi3" }],
  ],
  Pm = ee("info", hv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pv = [
    [
      "path",
      {
        d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
        key: "nnexq3",
      },
    ],
    [
      "path",
      { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12", key: "mt58a7" },
    ],
  ],
  Am = ee("leaf", pv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xv = [
    [
      "path",
      {
        d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
        key: "1gvzjb",
      },
    ],
    ["path", { d: "M9 18h6", key: "x1upvd" }],
    ["path", { d: "M10 22h4", key: "ceow96" }],
  ],
  gv = ee("lightbulb", xv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const vv = [
    [
      "rect",
      { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" },
    ],
    ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }],
  ],
  yv = ee("mail", vv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jv = [
    [
      "path",
      {
        d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
        key: "1r0f0z",
      },
    ],
    ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }],
  ],
  kf = ee("map-pin", jv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bv = [
    ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
    ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
    ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }],
  ],
  Cf = ee("menu", bv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Nv = [
    ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }],
  ],
  _o = ee("message-circle", Nv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wv = [
    ["path", { d: "M6 18h8", key: "1borvv" }],
    ["path", { d: "M3 22h18", key: "8prr45" }],
    ["path", { d: "M14 22a7 7 0 1 0 0-14h-1", key: "1jwaiy" }],
    ["path", { d: "M9 14h2", key: "197e7h" }],
    ["path", { d: "M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z", key: "1bmzmy" }],
    ["path", { d: "M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3", key: "1drr47" }],
  ],
  Sv = ee("microscope", wv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kv = [
    [
      "path",
      {
        d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
        key: "1a0edw",
      },
    ],
    ["path", { d: "M12 22V12", key: "d0xqtd" }],
    ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
    ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ],
  Rm = ee("package", kv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Cv = [
    [
      "path",
      {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        key: "foiqr5",
      },
    ],
  ],
  Ev = ee("phone", Cv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pv = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]],
  Ko = ee("play", Pv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Av = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "M12 5v14", key: "s699le" }],
  ],
  Gn = ee("plus", Av);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rv = [
    [
      "rect",
      { width: "5", height: "5", x: "3", y: "3", rx: "1", key: "1tu5fj" },
    ],
    [
      "rect",
      { width: "5", height: "5", x: "16", y: "3", rx: "1", key: "1v8r4q" },
    ],
    [
      "rect",
      { width: "5", height: "5", x: "3", y: "16", rx: "1", key: "1x03jg" },
    ],
    ["path", { d: "M21 16h-3a2 2 0 0 0-2 2v3", key: "177gqh" }],
    ["path", { d: "M21 21v.01", key: "ents32" }],
    ["path", { d: "M12 7v3a2 2 0 0 1-2 2H7", key: "8crl2c" }],
    ["path", { d: "M3 12h.01", key: "nlz23k" }],
    ["path", { d: "M12 3h.01", key: "n36tog" }],
    ["path", { d: "M12 16v.01", key: "133mhm" }],
    ["path", { d: "M16 12h1", key: "1slzba" }],
    ["path", { d: "M21 12v.01", key: "1lwtk9" }],
    ["path", { d: "M12 21v-1", key: "1880an" }],
  ],
  To = ee("qr-code", Rv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Mv = [
    [
      "path",
      {
        d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
        key: "14sxne",
      },
    ],
    ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
    [
      "path",
      {
        d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",
        key: "1hlbsb",
      },
    ],
    ["path", { d: "M16 16h5v5", key: "ccwih5" }],
  ],
  _v = ee("refresh-ccw", Mv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Tv = [
    [
      "path",
      { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "7g6ntu" },
    ],
    [
      "path",
      { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "ijws7r" },
    ],
    ["path", { d: "M7 21h10", key: "1b0cd5" }],
    ["path", { d: "M12 3v18", key: "108xh3" }],
    ["path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2", key: "3gwbw2" }],
  ],
  zv = ee("scale", Tv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Iv = [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
  ],
  Kn = ee("search", Iv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ov = [
    [
      "path",
      {
        d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        key: "1ffxy3",
      },
    ],
    ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }],
  ],
  Lv = ee("send", Ov);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dv = [
    [
      "path",
      {
        d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
        key: "1qme2f",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  Fv = ee("settings", Dv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $v = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
  ],
  Hv = ee("shield-check", $v);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vv = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
  ],
  Sl = ee("shield", Vv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qv = [
    ["circle", { cx: "8", cy: "21", r: "1", key: "jimo8o" }],
    ["circle", { cx: "19", cy: "21", r: "1", key: "13723u" }],
    [
      "path",
      {
        d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
        key: "9zh506",
      },
    ],
  ],
  zo = ee("shopping-cart", qv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bv = [
    [
      "rect",
      {
        width: "14",
        height: "20",
        x: "5",
        y: "2",
        rx: "2",
        ry: "2",
        key: "1yt0o3",
      },
    ],
    ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ],
  Ef = ee("smartphone", Bv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Uv = [
    [
      "path",
      {
        d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
        key: "r04s7s",
      },
    ],
  ],
  Yo = ee("star", Uv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wv = [
    [
      "path",
      {
        d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7",
        key: "ztvudi",
      },
    ],
    ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", key: "1b2hhj" }],
    [
      "path",
      { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4", key: "2ebpfo" },
    ],
    ["path", { d: "M2 7h20", key: "1fcdvo" }],
    [
      "path",
      {
        d: "M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7",
        key: "6c3vgh",
      },
    ],
  ],
  uc = ee("store", Wv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Gv = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
    ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ],
  hr = ee("target", Gv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qv = [
    ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
    ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }],
  ],
  er = ee("trending-up", Qv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Kv = [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
        key: "wmoenq",
      },
    ],
    ["path", { d: "M12 9v4", key: "juzpu7" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }],
  ],
  qt = ee("triangle-alert", Kv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Yv = [
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
    ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }],
  ],
  Pf = ee("upload", Yv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xv = [
    ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
    ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }],
  ],
  Af = ee("user", Xv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Zv = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
    ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }],
  ],
  tr = ee("users", Zv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Jv = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
  ],
  e0 = ee("x", Jv);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const t0 = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db",
      },
    ],
  ],
  Mm = ee("zap", t0);
function r0() {
  const s = [
    {
      icon: Sl,
      title: "Automatisation SST",
      description: "Automatisez vos processus de santé et sécurité au travail",
    },
    {
      icon: er,
      title: "Réduction des risques",
      description: "Réduisez significativement vos risques opérationnels",
    },
    {
      icon: hr,
      title: "Conformité réglementaire",
      description: "Respectez toutes les exigences réglementaires en vigueur",
    },
    {
      icon: tr,
      title: "Culture de prévention",
      description: "Ancrez durablement une culture de sécurité",
    },
  ];
  return t.jsxs("section", {
    className:
      "py-20 px-6 bg-gradient-to-br from-white to-[var(--sahtee-neutral)] relative overflow-hidden",
    children: [
      t.jsx("div", {
        className:
          "absolute top-0 right-0 w-96 h-96 bg-[var(--sahtee-blue-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
      }),
      t.jsx("div", {
        className:
          "absolute bottom-0 left-0 w-96 h-96 bg-[var(--sahtee-blue-secondary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2",
      }),
      t.jsxs("div", {
        className: "max-w-7xl mx-auto relative z-10",
        children: [
          t.jsxs("div", {
            className: "text-center mb-16",
            children: [
              t.jsx("h2", {
                className:
                  "text-4xl md:text-5xl text-[var(--sahtee-blue-primary)] mb-6",
                children: "Qui sommes-nous",
              }),
              t.jsx("div", {
                className:
                  "w-24 h-1 bg-gradient-to-r from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] mx-auto mb-8",
              }),
            ],
          }),
          t.jsxs("div", {
            className: "grid lg:grid-cols-2 gap-12 items-start",
            children: [
              t.jsxs("div", {
                className: "space-y-6 h-full flex flex-col",
                children: [
                  t.jsx("div", {
                    className:
                      "bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[var(--sahtee-blue-primary)]/10 flex-1",
                    children: t.jsxs("div", {
                      className: "flex items-start gap-4",
                      children: [
                        t.jsx("div", {
                          className:
                            "w-2 h-full bg-gradient-to-b from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-full",
                        }),
                        t.jsx("div", {
                          children: t.jsxs("p", {
                            className: "text-lg leading-relaxed text-gray-700",
                            children: [
                              t.jsx("span", {
                                className: "text-[var(--sahtee-blue-primary)]",
                                children: "SAHTEE",
                              }),
                              " est une plateforme dédiée à l'amélioration de la santé et de la sécurité au travail dans les environnements professionnels.",
                            ],
                          }),
                        }),
                      ],
                    }),
                  }),
                  t.jsxs("div", {
                    className:
                      "bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-2xl p-8 shadow-xl text-white flex-1",
                    children: [
                      t.jsxs("h3", {
                        className: "text-2xl mb-4 flex items-center gap-3",
                        children: [
                          t.jsx(hr, { className: "w-6 h-6" }),
                          "Notre Mission",
                        ],
                      }),
                      t.jsx("p", {
                        className: "text-lg leading-relaxed text-blue-50",
                        children:
                          "Accompagner les entreprises dans l'automatisation de leurs processus SST, la réduction des risques opérationnels, le respect des exigences réglementaires et l'ancrage durable d'une culture de prévention et de sécurité au sein de leurs organisations.",
                      }),
                    ],
                  }),
                ],
              }),
              t.jsx("div", {
                className: "grid sm:grid-cols-2 gap-4",
                children: s.map((l, a) => {
                  const c = l.icon;
                  return t.jsxs(
                    "div",
                    {
                      className:
                        "bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[var(--sahtee-blue-primary)]/10 group",
                      children: [
                        t.jsx("div", {
                          className:
                            "w-12 h-12 bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
                          children: t.jsx(c, {
                            className: "w-6 h-6 text-white",
                          }),
                        }),
                        t.jsx("h4", {
                          className: "text-[var(--sahtee-blue-primary)] mb-2",
                          children: l.title,
                        }),
                        t.jsx("p", {
                          className: "text-sm text-gray-600 leading-relaxed",
                          children: l.description,
                        }),
                      ],
                    },
                    a
                  );
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function _m(s, l) {
  if (typeof s == "function") return s(l);
  s != null && (s.current = l);
}
function Rf(...s) {
  return (l) => {
    let a = !1;
    const c = s.map((u) => {
      const f = _m(u, l);
      return !a && typeof f == "function" && (a = !0), f;
    });
    if (a)
      return () => {
        for (let u = 0; u < c.length; u++) {
          const f = c[u];
          typeof f == "function" ? f() : _m(s[u], null);
        }
      };
  };
}
function st(...s) {
  return j.useCallback(Rf(...s), s);
}
function Bs(s) {
  const l = n0(s),
    a = j.forwardRef((c, u) => {
      const { children: f, ...p } = c,
        m = j.Children.toArray(f),
        x = m.find(i0);
      if (x) {
        const v = x.props.children,
          N = m.map((g) =>
            g === x
              ? j.Children.count(v) > 1
                ? j.Children.only(null)
                : j.isValidElement(v)
                ? v.props.children
                : null
              : g
          );
        return t.jsx(l, {
          ...p,
          ref: u,
          children: j.isValidElement(v) ? j.cloneElement(v, void 0, N) : null,
        });
      }
      return t.jsx(l, { ...p, ref: u, children: f });
    });
  return (a.displayName = `${s}.Slot`), a;
}
var Mf = Bs("Slot");
function n0(s) {
  const l = j.forwardRef((a, c) => {
    const { children: u, ...f } = a;
    if (j.isValidElement(u)) {
      const p = a0(u),
        m = l0(f, u.props);
      return (
        u.type !== j.Fragment && (m.ref = c ? Rf(c, p) : p),
        j.cloneElement(u, m)
      );
    }
    return j.Children.count(u) > 1 ? j.Children.only(null) : null;
  });
  return (l.displayName = `${s}.SlotClone`), l;
}
var s0 = Symbol("radix.slottable");
function i0(s) {
  return (
    j.isValidElement(s) &&
    typeof s.type == "function" &&
    "__radixId" in s.type &&
    s.type.__radixId === s0
  );
}
function l0(s, l) {
  const a = { ...l };
  for (const c in l) {
    const u = s[c],
      f = l[c];
    /^on[A-Z]/.test(c)
      ? u && f
        ? (a[c] = (...m) => {
            const x = f(...m);
            return u(...m), x;
          })
        : u && (a[c] = u)
      : c === "style"
      ? (a[c] = { ...u, ...f })
      : c === "className" && (a[c] = [u, f].filter(Boolean).join(" "));
  }
  return { ...s, ...a };
}
function a0(s) {
  let l = Object.getOwnPropertyDescriptor(s.props, "ref")?.get,
    a = l && "isReactWarning" in l && l.isReactWarning;
  return a
    ? s.ref
    : ((l = Object.getOwnPropertyDescriptor(s, "ref")?.get),
      (a = l && "isReactWarning" in l && l.isReactWarning),
      a ? s.props.ref : s.props.ref || s.ref);
}
function _f(s) {
  var l,
    a,
    c = "";
  if (typeof s == "string" || typeof s == "number") c += s;
  else if (typeof s == "object")
    if (Array.isArray(s)) {
      var u = s.length;
      for (l = 0; l < u; l++)
        s[l] && (a = _f(s[l])) && (c && (c += " "), (c += a));
    } else for (a in s) s[a] && (c && (c += " "), (c += a));
  return c;
}
function Tf() {
  for (var s, l, a = 0, c = "", u = arguments.length; a < u; a++)
    (s = arguments[a]) && (l = _f(s)) && (c && (c += " "), (c += l));
  return c;
}
const Tm = (s) => (typeof s == "boolean" ? `${s}` : s === 0 ? "0" : s),
  zm = Tf,
  zf = (s, l) => (a) => {
    var c;
    if (l?.variants == null) return zm(s, a?.class, a?.className);
    const { variants: u, defaultVariants: f } = l,
      p = Object.keys(u).map((v) => {
        const N = a?.[v],
          g = f?.[v];
        if (N === null) return null;
        const S = Tm(N) || Tm(g);
        return u[v][S];
      }),
      m =
        a &&
        Object.entries(a).reduce((v, N) => {
          let [g, S] = N;
          return S === void 0 || (v[g] = S), v;
        }, {}),
      x =
        l == null || (c = l.compoundVariants) === null || c === void 0
          ? void 0
          : c.reduce((v, N) => {
              let { class: g, className: S, ...A } = N;
              return Object.entries(A).every((T) => {
                let [b, E] = T;
                return Array.isArray(E)
                  ? E.includes({ ...f, ...m }[b])
                  : { ...f, ...m }[b] === E;
              })
                ? [...v, g, S]
                : v;
            }, []);
    return zm(s, p, x, a?.class, a?.className);
  },
  mc = "-",
  o0 = (s) => {
    const l = d0(s),
      { conflictingClassGroups: a, conflictingClassGroupModifiers: c } = s;
    return {
      getClassGroupId: (p) => {
        const m = p.split(mc);
        return m[0] === "" && m.length !== 1 && m.shift(), If(m, l) || c0(p);
      },
      getConflictingClassGroupIds: (p, m) => {
        const x = a[p] || [];
        return m && c[p] ? [...x, ...c[p]] : x;
      },
    };
  },
  If = (s, l) => {
    if (s.length === 0) return l.classGroupId;
    const a = s[0],
      c = l.nextPart.get(a),
      u = c ? If(s.slice(1), c) : void 0;
    if (u) return u;
    if (l.validators.length === 0) return;
    const f = s.join(mc);
    return l.validators.find(({ validator: p }) => p(f))?.classGroupId;
  },
  Im = /^\[(.+)\]$/,
  c0 = (s) => {
    if (Im.test(s)) {
      const l = Im.exec(s)[1],
        a = l?.substring(0, l.indexOf(":"));
      if (a) return "arbitrary.." + a;
    }
  },
  d0 = (s) => {
    const { theme: l, classGroups: a } = s,
      c = { nextPart: new Map(), validators: [] };
    for (const u in a) Xo(a[u], c, u, l);
    return c;
  },
  Xo = (s, l, a, c) => {
    s.forEach((u) => {
      if (typeof u == "string") {
        const f = u === "" ? l : Om(l, u);
        f.classGroupId = a;
        return;
      }
      if (typeof u == "function") {
        if (u0(u)) {
          Xo(u(c), l, a, c);
          return;
        }
        l.validators.push({ validator: u, classGroupId: a });
        return;
      }
      Object.entries(u).forEach(([f, p]) => {
        Xo(p, Om(l, f), a, c);
      });
    });
  },
  Om = (s, l) => {
    let a = s;
    return (
      l.split(mc).forEach((c) => {
        a.nextPart.has(c) ||
          a.nextPart.set(c, { nextPart: new Map(), validators: [] }),
          (a = a.nextPart.get(c));
      }),
      a
    );
  },
  u0 = (s) => s.isThemeGetter,
  m0 = (s) => {
    if (s < 1) return { get: () => {}, set: () => {} };
    let l = 0,
      a = new Map(),
      c = new Map();
    const u = (f, p) => {
      a.set(f, p), l++, l > s && ((l = 0), (c = a), (a = new Map()));
    };
    return {
      get(f) {
        let p = a.get(f);
        if (p !== void 0) return p;
        if ((p = c.get(f)) !== void 0) return u(f, p), p;
      },
      set(f, p) {
        a.has(f) ? a.set(f, p) : u(f, p);
      },
    };
  },
  Zo = "!",
  Jo = ":",
  f0 = Jo.length,
  h0 = (s) => {
    const { prefix: l, experimentalParseClassName: a } = s;
    let c = (u) => {
      const f = [];
      let p = 0,
        m = 0,
        x = 0,
        v;
      for (let T = 0; T < u.length; T++) {
        let b = u[T];
        if (p === 0 && m === 0) {
          if (b === Jo) {
            f.push(u.slice(x, T)), (x = T + f0);
            continue;
          }
          if (b === "/") {
            v = T;
            continue;
          }
        }
        b === "[" ? p++ : b === "]" ? p-- : b === "(" ? m++ : b === ")" && m--;
      }
      const N = f.length === 0 ? u : u.substring(x),
        g = p0(N),
        S = g !== N,
        A = v && v > x ? v - x : void 0;
      return {
        modifiers: f,
        hasImportantModifier: S,
        baseClassName: g,
        maybePostfixModifierPosition: A,
      };
    };
    if (l) {
      const u = l + Jo,
        f = c;
      c = (p) =>
        p.startsWith(u)
          ? f(p.substring(u.length))
          : {
              isExternal: !0,
              modifiers: [],
              hasImportantModifier: !1,
              baseClassName: p,
              maybePostfixModifierPosition: void 0,
            };
    }
    if (a) {
      const u = c;
      c = (f) => a({ className: f, parseClassName: u });
    }
    return c;
  },
  p0 = (s) =>
    s.endsWith(Zo)
      ? s.substring(0, s.length - 1)
      : s.startsWith(Zo)
      ? s.substring(1)
      : s,
  x0 = (s) => {
    const l = Object.fromEntries(s.orderSensitiveModifiers.map((c) => [c, !0]));
    return (c) => {
      if (c.length <= 1) return c;
      const u = [];
      let f = [];
      return (
        c.forEach((p) => {
          p[0] === "[" || l[p] ? (u.push(...f.sort(), p), (f = [])) : f.push(p);
        }),
        u.push(...f.sort()),
        u
      );
    };
  },
  g0 = (s) => ({
    cache: m0(s.cacheSize),
    parseClassName: h0(s),
    sortModifiers: x0(s),
    ...o0(s),
  }),
  v0 = /\s+/,
  y0 = (s, l) => {
    const {
        parseClassName: a,
        getClassGroupId: c,
        getConflictingClassGroupIds: u,
        sortModifiers: f,
      } = l,
      p = [],
      m = s.trim().split(v0);
    let x = "";
    for (let v = m.length - 1; v >= 0; v -= 1) {
      const N = m[v],
        {
          isExternal: g,
          modifiers: S,
          hasImportantModifier: A,
          baseClassName: T,
          maybePostfixModifierPosition: b,
        } = a(N);
      if (g) {
        x = N + (x.length > 0 ? " " + x : x);
        continue;
      }
      let E = !!b,
        I = c(E ? T.substring(0, b) : T);
      if (!I) {
        if (!E) {
          x = N + (x.length > 0 ? " " + x : x);
          continue;
        }
        if (((I = c(T)), !I)) {
          x = N + (x.length > 0 ? " " + x : x);
          continue;
        }
        E = !1;
      }
      const z = f(S).join(":"),
        O = A ? z + Zo : z,
        D = O + I;
      if (p.includes(D)) continue;
      p.push(D);
      const q = u(I, E);
      for (let Z = 0; Z < q.length; ++Z) {
        const U = q[Z];
        p.push(O + U);
      }
      x = N + (x.length > 0 ? " " + x : x);
    }
    return x;
  };
function j0() {
  let s = 0,
    l,
    a,
    c = "";
  for (; s < arguments.length; )
    (l = arguments[s++]) && (a = Of(l)) && (c && (c += " "), (c += a));
  return c;
}
const Of = (s) => {
  if (typeof s == "string") return s;
  let l,
    a = "";
  for (let c = 0; c < s.length; c++)
    s[c] && (l = Of(s[c])) && (a && (a += " "), (a += l));
  return a;
};
function b0(s, ...l) {
  let a,
    c,
    u,
    f = p;
  function p(x) {
    const v = l.reduce((N, g) => g(N), s());
    return (a = g0(v)), (c = a.cache.get), (u = a.cache.set), (f = m), m(x);
  }
  function m(x) {
    const v = c(x);
    if (v) return v;
    const N = y0(x, a);
    return u(x, N), N;
  }
  return function () {
    return f(j0.apply(null, arguments));
  };
}
const Ye = (s) => {
    const l = (a) => a[s] || [];
    return (l.isThemeGetter = !0), l;
  },
  Lf = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  Df = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  N0 = /^\d+\/\d+$/,
  w0 = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  S0 =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  k0 = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  C0 = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  E0 =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  Dn = (s) => N0.test(s),
  Pe = (s) => !!s && !Number.isNaN(Number(s)),
  Or = (s) => !!s && Number.isInteger(Number(s)),
  Io = (s) => s.endsWith("%") && Pe(s.slice(0, -1)),
  mr = (s) => w0.test(s),
  P0 = () => !0,
  A0 = (s) => S0.test(s) && !k0.test(s),
  Ff = () => !1,
  R0 = (s) => C0.test(s),
  M0 = (s) => E0.test(s),
  _0 = (s) => !ne(s) && !se(s),
  T0 = (s) => Yn(s, Vf, Ff),
  ne = (s) => Lf.test(s),
  sn = (s) => Yn(s, qf, A0),
  Oo = (s) => Yn(s, D0, Pe),
  Lm = (s) => Yn(s, $f, Ff),
  z0 = (s) => Yn(s, Hf, M0),
  ll = (s) => Yn(s, Bf, R0),
  se = (s) => Df.test(s),
  Hs = (s) => Xn(s, qf),
  I0 = (s) => Xn(s, F0),
  Dm = (s) => Xn(s, $f),
  O0 = (s) => Xn(s, Vf),
  L0 = (s) => Xn(s, Hf),
  al = (s) => Xn(s, Bf, !0),
  Yn = (s, l, a) => {
    const c = Lf.exec(s);
    return c ? (c[1] ? l(c[1]) : a(c[2])) : !1;
  },
  Xn = (s, l, a = !1) => {
    const c = Df.exec(s);
    return c ? (c[1] ? l(c[1]) : a) : !1;
  },
  $f = (s) => s === "position" || s === "percentage",
  Hf = (s) => s === "image" || s === "url",
  Vf = (s) => s === "length" || s === "size" || s === "bg-size",
  qf = (s) => s === "length",
  D0 = (s) => s === "number",
  F0 = (s) => s === "family-name",
  Bf = (s) => s === "shadow",
  $0 = () => {
    const s = Ye("color"),
      l = Ye("font"),
      a = Ye("text"),
      c = Ye("font-weight"),
      u = Ye("tracking"),
      f = Ye("leading"),
      p = Ye("breakpoint"),
      m = Ye("container"),
      x = Ye("spacing"),
      v = Ye("radius"),
      N = Ye("shadow"),
      g = Ye("inset-shadow"),
      S = Ye("text-shadow"),
      A = Ye("drop-shadow"),
      T = Ye("blur"),
      b = Ye("perspective"),
      E = Ye("aspect"),
      I = Ye("ease"),
      z = Ye("animate"),
      O = () => [
        "auto",
        "avoid",
        "all",
        "avoid-page",
        "page",
        "left",
        "right",
        "column",
      ],
      D = () => [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "left-top",
        "top-right",
        "right-top",
        "bottom-right",
        "right-bottom",
        "bottom-left",
        "left-bottom",
      ],
      q = () => [...D(), se, ne],
      Z = () => ["auto", "hidden", "clip", "visible", "scroll"],
      U = () => ["auto", "contain", "none"],
      H = () => [se, ne, x],
      he = () => [Dn, "full", "auto", ...H()],
      ye = () => [Or, "none", "subgrid", se, ne],
      Ae = () => ["auto", { span: ["full", Or, se, ne] }, Or, se, ne],
      Ce = () => [Or, "auto", se, ne],
      je = () => ["auto", "min", "max", "fr", se, ne],
      ge = () => [
        "start",
        "end",
        "center",
        "between",
        "around",
        "evenly",
        "stretch",
        "baseline",
        "center-safe",
        "end-safe",
      ],
      Ee = () => [
        "start",
        "end",
        "center",
        "stretch",
        "center-safe",
        "end-safe",
      ],
      de = () => ["auto", ...H()],
      le = () => [
        Dn,
        "auto",
        "full",
        "dvw",
        "dvh",
        "lvw",
        "lvh",
        "svw",
        "svh",
        "min",
        "max",
        "fit",
        ...H(),
      ],
      P = () => [s, se, ne],
      X = () => [...D(), Dm, Lm, { position: [se, ne] }],
      K = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }],
      C = () => ["auto", "cover", "contain", O0, T0, { size: [se, ne] }],
      L = () => [Io, Hs, sn],
      ae = () => ["", "none", "full", v, se, ne],
      oe = () => ["", Pe, Hs, sn],
      we = () => ["solid", "dashed", "dotted", "double"],
      ke = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      B = () => [Pe, Io, Dm, Lm],
      ue = () => ["", "none", T, se, ne],
      be = () => ["none", Pe, se, ne],
      Se = () => ["none", Pe, se, ne],
      Me = () => [Pe, se, ne],
      Ie = () => [Dn, "full", ...H()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [mr],
        breakpoint: [mr],
        color: [P0],
        container: [mr],
        "drop-shadow": [mr],
        ease: ["in", "out", "in-out"],
        font: [_0],
        "font-weight": [
          "thin",
          "extralight",
          "light",
          "normal",
          "medium",
          "semibold",
          "bold",
          "extrabold",
          "black",
        ],
        "inset-shadow": [mr],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: [
          "dramatic",
          "near",
          "normal",
          "midrange",
          "distant",
          "none",
        ],
        radius: [mr],
        shadow: [mr],
        spacing: ["px", Pe],
        text: [mr],
        "text-shadow": [mr],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", Dn, ne, se, E] }],
        container: ["container"],
        columns: [{ columns: [Pe, ne, se, m] }],
        "break-after": [{ "break-after": O() }],
        "break-before": [{ "break-before": O() }],
        "break-inside": [
          { "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] },
        ],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        sr: ["sr-only", "not-sr-only"],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [
          { object: ["contain", "cover", "fill", "none", "scale-down"] },
        ],
        "object-position": [{ object: q() }],
        overflow: [{ overflow: Z() }],
        "overflow-x": [{ "overflow-x": Z() }],
        "overflow-y": [{ "overflow-y": Z() }],
        overscroll: [{ overscroll: U() }],
        "overscroll-x": [{ "overscroll-x": U() }],
        "overscroll-y": [{ "overscroll-y": U() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: he() }],
        "inset-x": [{ "inset-x": he() }],
        "inset-y": [{ "inset-y": he() }],
        start: [{ start: he() }],
        end: [{ end: he() }],
        top: [{ top: he() }],
        right: [{ right: he() }],
        bottom: [{ bottom: he() }],
        left: [{ left: he() }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: [Or, "auto", se, ne] }],
        basis: [{ basis: [Dn, "full", "auto", m, ...H()] }],
        "flex-direction": [
          { flex: ["row", "row-reverse", "col", "col-reverse"] },
        ],
        "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
        flex: [{ flex: [Pe, Dn, "auto", "initial", "none", ne] }],
        grow: [{ grow: ["", Pe, se, ne] }],
        shrink: [{ shrink: ["", Pe, se, ne] }],
        order: [{ order: [Or, "first", "last", "none", se, ne] }],
        "grid-cols": [{ "grid-cols": ye() }],
        "col-start-end": [{ col: Ae() }],
        "col-start": [{ "col-start": Ce() }],
        "col-end": [{ "col-end": Ce() }],
        "grid-rows": [{ "grid-rows": ye() }],
        "row-start-end": [{ row: Ae() }],
        "row-start": [{ "row-start": Ce() }],
        "row-end": [{ "row-end": Ce() }],
        "grid-flow": [
          { "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] },
        ],
        "auto-cols": [{ "auto-cols": je() }],
        "auto-rows": [{ "auto-rows": je() }],
        gap: [{ gap: H() }],
        "gap-x": [{ "gap-x": H() }],
        "gap-y": [{ "gap-y": H() }],
        "justify-content": [{ justify: [...ge(), "normal"] }],
        "justify-items": [{ "justify-items": [...Ee(), "normal"] }],
        "justify-self": [{ "justify-self": ["auto", ...Ee()] }],
        "align-content": [{ content: ["normal", ...ge()] }],
        "align-items": [{ items: [...Ee(), { baseline: ["", "last"] }] }],
        "align-self": [{ self: ["auto", ...Ee(), { baseline: ["", "last"] }] }],
        "place-content": [{ "place-content": ge() }],
        "place-items": [{ "place-items": [...Ee(), "baseline"] }],
        "place-self": [{ "place-self": ["auto", ...Ee()] }],
        p: [{ p: H() }],
        px: [{ px: H() }],
        py: [{ py: H() }],
        ps: [{ ps: H() }],
        pe: [{ pe: H() }],
        pt: [{ pt: H() }],
        pr: [{ pr: H() }],
        pb: [{ pb: H() }],
        pl: [{ pl: H() }],
        m: [{ m: de() }],
        mx: [{ mx: de() }],
        my: [{ my: de() }],
        ms: [{ ms: de() }],
        me: [{ me: de() }],
        mt: [{ mt: de() }],
        mr: [{ mr: de() }],
        mb: [{ mb: de() }],
        ml: [{ ml: de() }],
        "space-x": [{ "space-x": H() }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": H() }],
        "space-y-reverse": ["space-y-reverse"],
        size: [{ size: le() }],
        w: [{ w: [m, "screen", ...le()] }],
        "min-w": [{ "min-w": [m, "screen", "none", ...le()] }],
        "max-w": [
          { "max-w": [m, "screen", "none", "prose", { screen: [p] }, ...le()] },
        ],
        h: [{ h: ["screen", "lh", ...le()] }],
        "min-h": [{ "min-h": ["screen", "lh", "none", ...le()] }],
        "max-h": [{ "max-h": ["screen", "lh", ...le()] }],
        "font-size": [{ text: ["base", a, Hs, sn] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [{ font: [c, se, Oo] }],
        "font-stretch": [
          {
            "font-stretch": [
              "ultra-condensed",
              "extra-condensed",
              "condensed",
              "semi-condensed",
              "normal",
              "semi-expanded",
              "expanded",
              "extra-expanded",
              "ultra-expanded",
              Io,
              ne,
            ],
          },
        ],
        "font-family": [{ font: [I0, ne, l] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: [u, se, ne] }],
        "line-clamp": [{ "line-clamp": [Pe, "none", se, Oo] }],
        leading: [{ leading: [f, ...H()] }],
        "list-image": [{ "list-image": ["none", se, ne] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "list-style-type": [{ list: ["disc", "decimal", "none", se, ne] }],
        "text-alignment": [
          { text: ["left", "center", "right", "justify", "start", "end"] },
        ],
        "placeholder-color": [{ placeholder: P() }],
        "text-color": [{ text: P() }],
        "text-decoration": [
          "underline",
          "overline",
          "line-through",
          "no-underline",
        ],
        "text-decoration-style": [{ decoration: [...we(), "wavy"] }],
        "text-decoration-thickness": [
          { decoration: [Pe, "from-font", "auto", se, sn] },
        ],
        "text-decoration-color": [{ decoration: P() }],
        "underline-offset": [{ "underline-offset": [Pe, "auto", se, ne] }],
        "text-transform": [
          "uppercase",
          "lowercase",
          "capitalize",
          "normal-case",
        ],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: H() }],
        "vertical-align": [
          {
            align: [
              "baseline",
              "top",
              "middle",
              "bottom",
              "text-top",
              "text-bottom",
              "sub",
              "super",
              se,
              ne,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              "normal",
              "nowrap",
              "pre",
              "pre-line",
              "pre-wrap",
              "break-spaces",
            ],
          },
        ],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        wrap: [{ wrap: ["break-word", "anywhere", "normal"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", se, ne] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: X() }],
        "bg-repeat": [{ bg: K() }],
        "bg-size": [{ bg: C() }],
        "bg-image": [
          {
            bg: [
              "none",
              {
                linear: [
                  { to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
                  Or,
                  se,
                  ne,
                ],
                radial: ["", se, ne],
                conic: [Or, se, ne],
              },
              L0,
              z0,
            ],
          },
        ],
        "bg-color": [{ bg: P() }],
        "gradient-from-pos": [{ from: L() }],
        "gradient-via-pos": [{ via: L() }],
        "gradient-to-pos": [{ to: L() }],
        "gradient-from": [{ from: P() }],
        "gradient-via": [{ via: P() }],
        "gradient-to": [{ to: P() }],
        rounded: [{ rounded: ae() }],
        "rounded-s": [{ "rounded-s": ae() }],
        "rounded-e": [{ "rounded-e": ae() }],
        "rounded-t": [{ "rounded-t": ae() }],
        "rounded-r": [{ "rounded-r": ae() }],
        "rounded-b": [{ "rounded-b": ae() }],
        "rounded-l": [{ "rounded-l": ae() }],
        "rounded-ss": [{ "rounded-ss": ae() }],
        "rounded-se": [{ "rounded-se": ae() }],
        "rounded-ee": [{ "rounded-ee": ae() }],
        "rounded-es": [{ "rounded-es": ae() }],
        "rounded-tl": [{ "rounded-tl": ae() }],
        "rounded-tr": [{ "rounded-tr": ae() }],
        "rounded-br": [{ "rounded-br": ae() }],
        "rounded-bl": [{ "rounded-bl": ae() }],
        "border-w": [{ border: oe() }],
        "border-w-x": [{ "border-x": oe() }],
        "border-w-y": [{ "border-y": oe() }],
        "border-w-s": [{ "border-s": oe() }],
        "border-w-e": [{ "border-e": oe() }],
        "border-w-t": [{ "border-t": oe() }],
        "border-w-r": [{ "border-r": oe() }],
        "border-w-b": [{ "border-b": oe() }],
        "border-w-l": [{ "border-l": oe() }],
        "divide-x": [{ "divide-x": oe() }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": oe() }],
        "divide-y-reverse": ["divide-y-reverse"],
        "border-style": [{ border: [...we(), "hidden", "none"] }],
        "divide-style": [{ divide: [...we(), "hidden", "none"] }],
        "border-color": [{ border: P() }],
        "border-color-x": [{ "border-x": P() }],
        "border-color-y": [{ "border-y": P() }],
        "border-color-s": [{ "border-s": P() }],
        "border-color-e": [{ "border-e": P() }],
        "border-color-t": [{ "border-t": P() }],
        "border-color-r": [{ "border-r": P() }],
        "border-color-b": [{ "border-b": P() }],
        "border-color-l": [{ "border-l": P() }],
        "divide-color": [{ divide: P() }],
        "outline-style": [{ outline: [...we(), "none", "hidden"] }],
        "outline-offset": [{ "outline-offset": [Pe, se, ne] }],
        "outline-w": [{ outline: ["", Pe, Hs, sn] }],
        "outline-color": [{ outline: P() }],
        shadow: [{ shadow: ["", "none", N, al, ll] }],
        "shadow-color": [{ shadow: P() }],
        "inset-shadow": [{ "inset-shadow": ["none", g, al, ll] }],
        "inset-shadow-color": [{ "inset-shadow": P() }],
        "ring-w": [{ ring: oe() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: P() }],
        "ring-offset-w": [{ "ring-offset": [Pe, sn] }],
        "ring-offset-color": [{ "ring-offset": P() }],
        "inset-ring-w": [{ "inset-ring": oe() }],
        "inset-ring-color": [{ "inset-ring": P() }],
        "text-shadow": [{ "text-shadow": ["none", S, al, ll] }],
        "text-shadow-color": [{ "text-shadow": P() }],
        opacity: [{ opacity: [Pe, se, ne] }],
        "mix-blend": [
          { "mix-blend": [...ke(), "plus-darker", "plus-lighter"] },
        ],
        "bg-blend": [{ "bg-blend": ke() }],
        "mask-clip": [
          {
            "mask-clip": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
          "mask-no-clip",
        ],
        "mask-composite": [
          { mask: ["add", "subtract", "intersect", "exclude"] },
        ],
        "mask-image-linear-pos": [{ "mask-linear": [Pe] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": B() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": B() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": P() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": P() }],
        "mask-image-t-from-pos": [{ "mask-t-from": B() }],
        "mask-image-t-to-pos": [{ "mask-t-to": B() }],
        "mask-image-t-from-color": [{ "mask-t-from": P() }],
        "mask-image-t-to-color": [{ "mask-t-to": P() }],
        "mask-image-r-from-pos": [{ "mask-r-from": B() }],
        "mask-image-r-to-pos": [{ "mask-r-to": B() }],
        "mask-image-r-from-color": [{ "mask-r-from": P() }],
        "mask-image-r-to-color": [{ "mask-r-to": P() }],
        "mask-image-b-from-pos": [{ "mask-b-from": B() }],
        "mask-image-b-to-pos": [{ "mask-b-to": B() }],
        "mask-image-b-from-color": [{ "mask-b-from": P() }],
        "mask-image-b-to-color": [{ "mask-b-to": P() }],
        "mask-image-l-from-pos": [{ "mask-l-from": B() }],
        "mask-image-l-to-pos": [{ "mask-l-to": B() }],
        "mask-image-l-from-color": [{ "mask-l-from": P() }],
        "mask-image-l-to-color": [{ "mask-l-to": P() }],
        "mask-image-x-from-pos": [{ "mask-x-from": B() }],
        "mask-image-x-to-pos": [{ "mask-x-to": B() }],
        "mask-image-x-from-color": [{ "mask-x-from": P() }],
        "mask-image-x-to-color": [{ "mask-x-to": P() }],
        "mask-image-y-from-pos": [{ "mask-y-from": B() }],
        "mask-image-y-to-pos": [{ "mask-y-to": B() }],
        "mask-image-y-from-color": [{ "mask-y-from": P() }],
        "mask-image-y-to-color": [{ "mask-y-to": P() }],
        "mask-image-radial": [{ "mask-radial": [se, ne] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": B() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": B() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": P() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": P() }],
        "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
        "mask-image-radial-size": [
          {
            "mask-radial": [
              { closest: ["side", "corner"], farthest: ["side", "corner"] },
            ],
          },
        ],
        "mask-image-radial-pos": [{ "mask-radial-at": D() }],
        "mask-image-conic-pos": [{ "mask-conic": [Pe] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": B() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": B() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": P() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": P() }],
        "mask-mode": [{ mask: ["alpha", "luminance", "match"] }],
        "mask-origin": [
          {
            "mask-origin": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
        ],
        "mask-position": [{ mask: X() }],
        "mask-repeat": [{ mask: K() }],
        "mask-size": [{ mask: C() }],
        "mask-type": [{ "mask-type": ["alpha", "luminance"] }],
        "mask-image": [{ mask: ["none", se, ne] }],
        filter: [{ filter: ["", "none", se, ne] }],
        blur: [{ blur: ue() }],
        brightness: [{ brightness: [Pe, se, ne] }],
        contrast: [{ contrast: [Pe, se, ne] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", A, al, ll] }],
        "drop-shadow-color": [{ "drop-shadow": P() }],
        grayscale: [{ grayscale: ["", Pe, se, ne] }],
        "hue-rotate": [{ "hue-rotate": [Pe, se, ne] }],
        invert: [{ invert: ["", Pe, se, ne] }],
        saturate: [{ saturate: [Pe, se, ne] }],
        sepia: [{ sepia: ["", Pe, se, ne] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none", se, ne] }],
        "backdrop-blur": [{ "backdrop-blur": ue() }],
        "backdrop-brightness": [{ "backdrop-brightness": [Pe, se, ne] }],
        "backdrop-contrast": [{ "backdrop-contrast": [Pe, se, ne] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": ["", Pe, se, ne] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [Pe, se, ne] }],
        "backdrop-invert": [{ "backdrop-invert": ["", Pe, se, ne] }],
        "backdrop-opacity": [{ "backdrop-opacity": [Pe, se, ne] }],
        "backdrop-saturate": [{ "backdrop-saturate": [Pe, se, ne] }],
        "backdrop-sepia": [{ "backdrop-sepia": ["", Pe, se, ne] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": H() }],
        "border-spacing-x": [{ "border-spacing-x": H() }],
        "border-spacing-y": [{ "border-spacing-y": H() }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [
          {
            transition: [
              "",
              "all",
              "colors",
              "opacity",
              "shadow",
              "transform",
              "none",
              se,
              ne,
            ],
          },
        ],
        "transition-behavior": [{ transition: ["normal", "discrete"] }],
        duration: [{ duration: [Pe, "initial", se, ne] }],
        ease: [{ ease: ["linear", "initial", I, se, ne] }],
        delay: [{ delay: [Pe, se, ne] }],
        animate: [{ animate: ["none", z, se, ne] }],
        backface: [{ backface: ["hidden", "visible"] }],
        perspective: [{ perspective: [b, se, ne] }],
        "perspective-origin": [{ "perspective-origin": q() }],
        rotate: [{ rotate: be() }],
        "rotate-x": [{ "rotate-x": be() }],
        "rotate-y": [{ "rotate-y": be() }],
        "rotate-z": [{ "rotate-z": be() }],
        scale: [{ scale: Se() }],
        "scale-x": [{ "scale-x": Se() }],
        "scale-y": [{ "scale-y": Se() }],
        "scale-z": [{ "scale-z": Se() }],
        "scale-3d": ["scale-3d"],
        skew: [{ skew: Me() }],
        "skew-x": [{ "skew-x": Me() }],
        "skew-y": [{ "skew-y": Me() }],
        transform: [{ transform: [se, ne, "", "none", "gpu", "cpu"] }],
        "transform-origin": [{ origin: q() }],
        "transform-style": [{ transform: ["3d", "flat"] }],
        translate: [{ translate: Ie() }],
        "translate-x": [{ "translate-x": Ie() }],
        "translate-y": [{ "translate-y": Ie() }],
        "translate-z": [{ "translate-z": Ie() }],
        "translate-none": ["translate-none"],
        accent: [{ accent: P() }],
        appearance: [{ appearance: ["none", "auto"] }],
        "caret-color": [{ caret: P() }],
        "color-scheme": [
          {
            scheme: [
              "normal",
              "dark",
              "light",
              "light-dark",
              "only-dark",
              "only-light",
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              se,
              ne,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": ["fixed", "content"] }],
        "pointer-events": [{ "pointer-events": ["auto", "none"] }],
        resize: [{ resize: ["none", "", "y", "x"] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": H() }],
        "scroll-mx": [{ "scroll-mx": H() }],
        "scroll-my": [{ "scroll-my": H() }],
        "scroll-ms": [{ "scroll-ms": H() }],
        "scroll-me": [{ "scroll-me": H() }],
        "scroll-mt": [{ "scroll-mt": H() }],
        "scroll-mr": [{ "scroll-mr": H() }],
        "scroll-mb": [{ "scroll-mb": H() }],
        "scroll-ml": [{ "scroll-ml": H() }],
        "scroll-p": [{ "scroll-p": H() }],
        "scroll-px": [{ "scroll-px": H() }],
        "scroll-py": [{ "scroll-py": H() }],
        "scroll-ps": [{ "scroll-ps": H() }],
        "scroll-pe": [{ "scroll-pe": H() }],
        "scroll-pt": [{ "scroll-pt": H() }],
        "scroll-pr": [{ "scroll-pr": H() }],
        "scroll-pb": [{ "scroll-pb": H() }],
        "scroll-pl": [{ "scroll-pl": H() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [
          {
            "will-change": ["auto", "scroll", "contents", "transform", se, ne],
          },
        ],
        fill: [{ fill: ["none", ...P()] }],
        "stroke-w": [{ stroke: [Pe, Hs, sn, Oo] }],
        stroke: [{ stroke: ["none", ...P()] }],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: [
          "inset-x",
          "inset-y",
          "start",
          "end",
          "top",
          "right",
          "bottom",
          "left",
        ],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction",
        ],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": [
          "border-w-x",
          "border-w-y",
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l",
        ],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-x",
          "border-color-y",
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": [
          "translate",
          "translate-x",
          "translate-y",
          "translate-z",
        ],
        "scroll-m": [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml",
        ],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl",
        ],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
      orderSensitiveModifiers: [
        "*",
        "**",
        "after",
        "backdrop",
        "before",
        "details-content",
        "file",
        "first-letter",
        "first-line",
        "marker",
        "placeholder",
        "selection",
      ],
    };
  },
  H0 = b0($0);
function it(...s) {
  return H0(Tf(s));
}
const V0 = zf(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
function Y({ className: s, variant: l, size: a, asChild: c = !1, ...u }) {
  const f = c ? Mf : "button";
  return t.jsx(f, {
    "data-slot": "button",
    className: it(V0({ variant: l, size: a, className: s })),
    ...u,
  });
}
function q0() {
  return t.jsx("section", {
    className: "py-20",
    style: { backgroundColor: "#1f4993" },
    children: t.jsx("div", {
      className: "max-w-6xl mx-auto px-6 text-center",
      children: t.jsxs("div", {
        className: "text-white",
        children: [
          t.jsx("h2", {
            className: "text-4xl md:text-5xl mb-8",
            children: "Découvrez SAHTEE en action",
          }),
          t.jsx("p", {
            className:
              "text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-4xl mx-auto",
            children:
              "Voyez comment SAHTEE peut transformer la santé et sécurité au travail dans votre organisation",
          }),
          t.jsxs("div", {
            className:
              "flex flex-col sm:flex-row gap-6 justify-center items-center",
            children: [
              t.jsxs(Y, {
                size: "lg",
                className:
                  "bg-[var(--sahtee-blue-secondary)] hover:bg-[var(--sahtee-blue-primary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group",
                children: [
                  "Demander une démonstration",
                  t.jsx(bf, {
                    className:
                      "ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform",
                  }),
                ],
              }),
              t.jsxs(Y, {
                variant: "outline",
                size: "lg",
                className:
                  "border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg rounded-lg transition-all duration-300 group",
                children: [
                  t.jsx(Ko, {
                    className:
                      "mr-2 w-5 h-5 group-hover:scale-110 transition-transform",
                  }),
                  "Voir la vidéo",
                ],
              }),
            ],
          }),
          t.jsxs("div", {
            className: "mt-16 pt-8 border-t border-blue-800",
            children: [
              t.jsx("p", {
                className: "text-blue-200 mb-4",
                children: "Déjà adopté par plus de 100 entreprises",
              }),
              t.jsxs("div", {
                className:
                  "flex justify-center items-center gap-8 text-blue-300",
                children: [
                  t.jsxs("div", {
                    className: "text-center",
                    children: [
                      t.jsx("div", {
                        className: "text-2xl",
                        children: "99.9%",
                      }),
                      t.jsx("div", {
                        className: "text-sm",
                        children: "Disponibilité",
                      }),
                    ],
                  }),
                  t.jsxs("div", {
                    className: "text-center",
                    children: [
                      t.jsx("div", { className: "text-2xl", children: "24/7" }),
                      t.jsx("div", {
                        className: "text-sm",
                        children: "Support",
                      }),
                    ],
                  }),
                  t.jsxs("div", {
                    className: "text-center",
                    children: [
                      t.jsx("div", {
                        className: "text-2xl",
                        children: "ISO 27001",
                      }),
                      t.jsx("div", {
                        className: "text-sm",
                        children: "Certifié",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
function B0() {
  return t.jsx("section", {
    className: "py-20",
    style: { backgroundColor: "#f6f9ee" },
    children: t.jsx("div", {
      className: "max-w-4xl mx-auto px-6 text-center",
      children: t.jsxs("div", {
        className: "bg-white rounded-2xl p-12 shadow-xl",
        children: [
          t.jsx("h2", {
            className: "text-4xl mb-8 text-gray-900",
            children:
              "Découvrez comment SAHTEE peut transformer votre organisation",
          }),
          t.jsx("p", {
            className: "text-xl text-gray-600 mb-10 leading-relaxed",
            children:
              "Rejoignez les entreprises qui ont déjà révolutionné leur approche de la santé et sécurité au travail avec notre plateforme digitale.",
          }),
          t.jsxs(Y, {
            size: "lg",
            className:
              "bg-gradient-to-r from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] hover:from-[var(--sahtee-blue-primary)] hover:to-[var(--sahtee-blue-secondary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group hover:brightness-90",
            children: [
              "Demander une démonstration",
              t.jsx(bf, {
                className:
                  "ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform",
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
const U0 = zf(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
function Ne({ className: s, variant: l, asChild: a = !1, ...c }) {
  const u = a ? Mf : "span";
  return t.jsx(u, {
    "data-slot": "badge",
    className: it(U0({ variant: l }), s),
    ...c,
  });
}
function G({ className: s, ...l }) {
  return t.jsx("div", {
    "data-slot": "card",
    className: it(
      "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
      s
    ),
    ...l,
  });
}
function pe({ className: s, ...l }) {
  return t.jsx("div", {
    "data-slot": "card-header",
    className: it(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      s
    ),
    ...l,
  });
}
function xe({ className: s, ...l }) {
  return t.jsx("h4", {
    "data-slot": "card-title",
    className: it("leading-none", s),
    ...l,
  });
}
function Uf({ className: s, ...l }) {
  return t.jsx("p", {
    "data-slot": "card-description",
    className: it("text-muted-foreground", s),
    ...l,
  });
}
function Q({ className: s, ...l }) {
  return t.jsx("div", {
    "data-slot": "card-content",
    className: it("px-6 [&:last-child]:pb-6", s),
    ...l,
  });
}
function Wf({ className: s, ...l }) {
  return t.jsx("div", {
    "data-slot": "card-footer",
    className: it("flex items-center px-6 pb-6 [.border-t]:pt-6", s),
    ...l,
  });
}
function W0() {
  const [s, l] = j.useState("kanban"),
    a = [
      {
        id: 1,
        title: "Amélioration éclairage Atelier B",
        description:
          "Installation de nouveaux éclairages LED pour réduire la fatigue visuelle",
        priority: "Haute",
        status: "todo",
        assignee: "Marc Durand",
        dueDate: "2024-02-15",
        progress: 0,
        category: "Préventif",
        risk: "Ergonomie",
      },
      {
        id: 2,
        title: "Formation port EPI Zone C",
        description: "Session de sensibilisation suite à l'incident du 10/01",
        priority: "Critique",
        status: "inprogress",
        assignee: "Sophie Martin",
        dueDate: "2024-01-30",
        progress: 60,
        category: "Correctif",
        risk: "Accident",
      },
      {
        id: 3,
        title: "Réparation barrière sécurité",
        description: "Remise en état de la barrière endommagée - Zone stockage",
        priority: "Critique",
        status: "inprogress",
        assignee: "Jean Petit",
        dueDate: "2024-01-25",
        progress: 80,
        category: "Correctif",
        risk: "Sécurité",
      },
      {
        id: 4,
        title: "Mise à jour procédure LOTO",
        description: "Révision des procédures de consignation/déconsignation",
        priority: "Moyenne",
        status: "done",
        assignee: "Marie Dubois",
        dueDate: "2024-01-10",
        progress: 100,
        category: "Préventif",
        risk: "Énergie",
      },
    ],
    c = [
      {
        id: "todo",
        title: "À faire",
        color: "bg-gray-100",
        count: a.filter((m) => m.status === "todo").length,
      },
      {
        id: "inprogress",
        title: "En cours",
        color: "bg-blue-100",
        count: a.filter((m) => m.status === "inprogress").length,
      },
      {
        id: "done",
        title: "Terminé",
        color: "bg-green-100",
        count: a.filter((m) => m.status === "done").length,
      },
    ],
    u = (m) => {
      switch (m) {
        case "Critique":
          return "bg-red-100 text-red-800";
        case "Haute":
          return "bg-orange-100 text-orange-800";
        case "Moyenne":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    f = (m) => {
      switch (m) {
        case "Correctif":
          return "bg-red-50 text-red-700 border-red-200";
        case "Préventif":
          return "bg-blue-50 text-blue-700 border-blue-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    },
    p = ({ action: m }) =>
      t.jsx(G, {
        className: "mb-3 cursor-pointer hover:shadow-md transition-shadow",
        children: t.jsx(Q, {
          className: "p-4",
          children: t.jsxs("div", {
            className: "space-y-3",
            children: [
              t.jsxs("div", {
                className: "flex items-start justify-between",
                children: [
                  t.jsx("h4", {
                    className: "font-medium text-sm",
                    children: m.title,
                  }),
                  t.jsx(Ne, {
                    className: u(m.priority),
                    size: "sm",
                    children: m.priority,
                  }),
                ],
              }),
              t.jsx("p", {
                className: "text-xs text-gray-600 line-clamp-2",
                children: m.description,
              }),
              t.jsxs("div", {
                className: "flex items-center justify-between text-xs",
                children: [
                  t.jsx(Ne, {
                    variant: "outline",
                    className: f(m.category),
                    children: m.category,
                  }),
                  t.jsx("span", {
                    className: "text-gray-500",
                    children: m.risk,
                  }),
                ],
              }),
              t.jsxs("div", {
                className: "flex items-center justify-between text-xs",
                children: [
                  t.jsxs("div", {
                    className: "flex items-center gap-1",
                    children: [
                      t.jsx(Af, { className: "w-3 h-3" }),
                      t.jsx("span", { children: m.assignee }),
                    ],
                  }),
                  t.jsxs("div", {
                    className: "flex items-center gap-1",
                    children: [
                      t.jsx(Go, { className: "w-3 h-3" }),
                      t.jsx("span", { children: m.dueDate }),
                    ],
                  }),
                ],
              }),
              m.status === "inprogress" &&
                t.jsxs("div", {
                  className: "space-y-1",
                  children: [
                    t.jsxs("div", {
                      className: "flex justify-between text-xs",
                      children: [
                        t.jsx("span", { children: "Progression" }),
                        t.jsxs("span", { children: [m.progress, "%"] }),
                      ],
                    }),
                    t.jsx("div", {
                      className: "w-full bg-gray-200 rounded-full h-1.5",
                      children: t.jsx("div", {
                        className:
                          "bg-[var(--sahtee-blue-primary)] h-1.5 rounded-full",
                        style: { width: `${m.progress}%` },
                      }),
                    }),
                  ],
                }),
            ],
          }),
        }),
      });
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "CAPA Room",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Gestion des actions correctives et préventives (Corrective and Preventive Actions)",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs("div", {
                  className: "flex bg-gray-100 rounded-lg p-1",
                  children: [
                    t.jsx("button", {
                      onClick: () => l("kanban"),
                      className: `px-3 py-1 rounded text-sm transition-colors ${
                        s === "kanban"
                          ? "bg-white text-[var(--sahtee-blue-primary)] shadow-sm"
                          : "text-gray-600"
                      }`,
                      children: "Vue Kanban",
                    }),
                    t.jsx("button", {
                      onClick: () => l("list"),
                      className: `px-3 py-1 rounded text-sm transition-colors ${
                        s === "list"
                          ? "bg-white text-[var(--sahtee-blue-primary)] shadow-sm"
                          : "text-gray-600"
                      }`,
                      children: "Vue Liste",
                    }),
                  ],
                }),
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(wl, { className: "w-4 h-4 mr-2" }),
                    "Filtres",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                    "Nouveau plan",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "p-6 pb-0",
        children: t.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
          children: [
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Total actions",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                          children: a.length,
                        }),
                      ],
                    }),
                    t.jsx(hr, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "En retard",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-red-500",
                          children: "2",
                        }),
                      ],
                    }),
                    t.jsx(qt, { className: "w-6 h-6 text-red-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "En cours",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-blue-500",
                          children: "2",
                        }),
                      ],
                    }),
                    t.jsx(Wn, { className: "w-6 h-6 text-blue-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Terminées",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-green-500",
                          children: "1",
                        }),
                      ],
                    }),
                    t.jsx(vt, { className: "w-6 h-6 text-green-500" }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
      t.jsx("main", {
        className: "p-6 pt-0",
        children:
          s === "kanban"
            ? t.jsx("div", {
                className: "flex gap-6 overflow-x-auto pb-4",
                children: c.map((m) =>
                  t.jsxs(
                    "div",
                    {
                      className: "flex-shrink-0 w-80",
                      children: [
                        t.jsx("div", {
                          className: `${m.color} rounded-lg p-3 mb-4`,
                          children: t.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              t.jsx("h3", {
                                className: "font-medium",
                                children: m.title,
                              }),
                              t.jsx(Ne, {
                                variant: "secondary",
                                className: "bg-white",
                                children: m.count,
                              }),
                            ],
                          }),
                        }),
                        t.jsx("div", {
                          className: "space-y-3",
                          children: a
                            .filter((x) => x.status === m.id)
                            .map((x) => t.jsx(p, { action: x }, x.id)),
                        }),
                        m.id !== "done" &&
                          t.jsxs(Y, {
                            variant: "ghost",
                            className:
                              "w-full mt-3 border-2 border-dashed border-gray-300 hover:border-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]",
                            children: [
                              t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                              "Ajouter une action",
                            ],
                          }),
                      ],
                    },
                    m.id
                  )
                ),
              })
            : t.jsxs(G, {
                children: [
                  t.jsx(pe, {
                    children: t.jsx(xe, { children: "Liste des actions CAPA" }),
                  }),
                  t.jsx(Q, {
                    children: t.jsx("div", {
                      className: "space-y-4",
                      children: a.map((m) =>
                        t.jsxs(
                          "div",
                          {
                            className:
                              "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-4",
                                children: [
                                  t.jsx("div", {
                                    className: `w-3 h-3 rounded-full ${
                                      m.status === "done"
                                        ? "bg-green-500"
                                        : m.status === "inprogress"
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                    }`,
                                  }),
                                  t.jsxs("div", {
                                    className: "flex-1",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-2 mb-1",
                                        children: [
                                          t.jsx("h4", {
                                            className: "font-medium",
                                            children: m.title,
                                          }),
                                          t.jsx(Ne, {
                                            className: u(m.priority),
                                            size: "sm",
                                            children: m.priority,
                                          }),
                                          t.jsx(Ne, {
                                            variant: "outline",
                                            className: f(m.category),
                                            children: m.category,
                                          }),
                                        ],
                                      }),
                                      t.jsx("p", {
                                        className: "text-sm text-gray-600",
                                        children: m.description,
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-4 mt-2 text-xs text-gray-500",
                                        children: [
                                          t.jsxs("span", {
                                            children: [
                                              "Assigné à: ",
                                              m.assignee,
                                            ],
                                          }),
                                          t.jsxs("span", {
                                            children: ["Échéance: ", m.dueDate],
                                          }),
                                          t.jsxs("span", {
                                            children: ["Risque: ", m.risk],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  m.status === "inprogress" &&
                                    t.jsx("div", {
                                      className: "text-right text-xs",
                                      children: t.jsxs("div", {
                                        className: "font-medium",
                                        children: [m.progress, "%"],
                                      }),
                                    }),
                                  t.jsx(Y, {
                                    size: "sm",
                                    variant: "outline",
                                    children: "Modifier",
                                  }),
                                ],
                              }),
                            ],
                          },
                          m.id
                        )
                      ),
                    }),
                  }),
                ],
              }),
      }),
    ],
  });
}
function kl(s, l = []) {
  let a = [];
  function c(f, p) {
    const m = j.createContext(p),
      x = a.length;
    a = [...a, p];
    const v = (g) => {
      const { scope: S, children: A, ...T } = g,
        b = S?.[s]?.[x] || m,
        E = j.useMemo(() => T, Object.values(T));
      return t.jsx(b.Provider, { value: E, children: A });
    };
    v.displayName = f + "Provider";
    function N(g, S) {
      const A = S?.[s]?.[x] || m,
        T = j.useContext(A);
      if (T) return T;
      if (p !== void 0) return p;
      throw new Error(`\`${g}\` must be used within \`${f}\``);
    }
    return [v, N];
  }
  const u = () => {
    const f = a.map((p) => j.createContext(p));
    return function (m) {
      const x = m?.[s] || f;
      return j.useMemo(() => ({ [`__scope${s}`]: { ...m, [s]: x } }), [m, x]);
    };
  };
  return (u.scopeName = s), [c, G0(u, ...l)];
}
function G0(...s) {
  const l = s[0];
  if (s.length === 1) return l;
  const a = () => {
    const c = s.map((u) => ({ useScope: u(), scopeName: u.scopeName }));
    return function (f) {
      const p = c.reduce((m, { useScope: x, scopeName: v }) => {
        const g = x(f)[`__scope${v}`];
        return { ...m, ...g };
      }, {});
      return j.useMemo(() => ({ [`__scope${l.scopeName}`]: p }), [p]);
    };
  };
  return (a.scopeName = l.scopeName), a;
}
var Gs = vf();
const Q0 = gf(Gs);
var K0 = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  $e = K0.reduce((s, l) => {
    const a = Bs(`Primitive.${l}`),
      c = j.forwardRef((u, f) => {
        const { asChild: p, ...m } = u,
          x = p ? a : l;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          t.jsx(x, { ...m, ref: f })
        );
      });
    return (c.displayName = `Primitive.${l}`), { ...s, [l]: c };
  }, {});
function Y0(s, l) {
  s && Gs.flushSync(() => s.dispatchEvent(l));
}
var fc = "Progress",
  hc = 100,
  [X0] = kl(fc),
  [Z0, J0] = X0(fc),
  Gf = j.forwardRef((s, l) => {
    const {
      __scopeProgress: a,
      value: c = null,
      max: u,
      getValueLabel: f = ey,
      ...p
    } = s;
    (u || u === 0) && !Fm(u) && console.error(ty(`${u}`, "Progress"));
    const m = Fm(u) ? u : hc;
    c !== null && !$m(c, m) && console.error(ry(`${c}`, "Progress"));
    const x = $m(c, m) ? c : null,
      v = xl(x) ? f(x, m) : void 0;
    return t.jsx(Z0, {
      scope: a,
      value: x,
      max: m,
      children: t.jsx($e.div, {
        "aria-valuemax": m,
        "aria-valuemin": 0,
        "aria-valuenow": xl(x) ? x : void 0,
        "aria-valuetext": v,
        role: "progressbar",
        "data-state": Yf(x, m),
        "data-value": x ?? void 0,
        "data-max": m,
        ...p,
        ref: l,
      }),
    });
  });
Gf.displayName = fc;
var Qf = "ProgressIndicator",
  Kf = j.forwardRef((s, l) => {
    const { __scopeProgress: a, ...c } = s,
      u = J0(Qf, a);
    return t.jsx($e.div, {
      "data-state": Yf(u.value, u.max),
      "data-value": u.value ?? void 0,
      "data-max": u.max,
      ...c,
      ref: l,
    });
  });
Kf.displayName = Qf;
function ey(s, l) {
  return `${Math.round((s / l) * 100)}%`;
}
function Yf(s, l) {
  return s == null ? "indeterminate" : s === l ? "complete" : "loading";
}
function xl(s) {
  return typeof s == "number";
}
function Fm(s) {
  return xl(s) && !isNaN(s) && s > 0;
}
function $m(s, l) {
  return xl(s) && !isNaN(s) && s <= l && s >= 0;
}
function ty(s, l) {
  return `Invalid prop \`max\` of value \`${s}\` supplied to \`${l}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${hc}\`.`;
}
function ry(s, l) {
  return `Invalid prop \`value\` of value \`${s}\` supplied to \`${l}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${hc} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var ny = Gf,
  sy = Kf;
function fr({ className: s, value: l, ...a }) {
  return t.jsx(ny, {
    "data-slot": "progress",
    className: it(
      "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
      s
    ),
    ...a,
    children: t.jsx(sy, {
      "data-slot": "progress-indicator",
      className: "bg-primary h-full w-full flex-1 transition-all",
      style: { transform: `translateX(-${100 - (l || 0)}%)` },
    }),
  });
}
function iy() {
  const [s, l] = j.useState("rula-reba"),
    [a, c] = j.useState("rula"),
    u = {
      employee: "Marie Dubois - Poste Assemblage",
      date: "2024-01-20",
      scores: {
        arm: 3,
        neck: 2,
        trunk: 4,
        legs: 2,
        muscle: 1,
        force: 2,
        finalScore: 5,
      },
      interpretation: {
        level: "Moyen",
        action: "Investigation et changements requis",
        priority: "Moyenne",
      },
      recommendations: [
        "Ajuster la hauteur du plan de travail",
        "Installer un support pour les avant-bras",
        "Réduire la fréquence des mouvements répétitifs",
        "Former l'opérateur aux bonnes postures",
      ],
    },
    f = {
      task: "Levage de caisses - Zone stockage",
      parameters: {
        weight: 15,
        horizontalDistance: 45,
        verticalHeight: 75,
        verticalTravel: 30,
        asymmetryAngle: 30,
        frequency: 2,
        duration: 4,
      },
      results: {
        rwl: 12.5,
        li: 1.2,
        interpretation: "Risque modéré - Amélioration recommandée",
      },
    },
    p = {
      materialHandling: { score: 3.2, risk: "Modéré", cost: "€2,400/incident" },
      workEnvironment: { score: 2.8, risk: "Faible", cost: "€1,800/incident" },
      safety: { score: 3.8, risk: "Élevé", cost: "€4,200/incident" },
    },
    m = [
      {
        id: 1,
        title: "Réduction TMS Atelier A",
        phase: "Mesure",
        defectRate: "12.5%",
        target: "&lt; 5%",
        savings: "€85,000",
        timeline: "6 mois",
        status: "En cours",
      },
      {
        id: 2,
        title: "Optimisation Temps Formation",
        phase: "Amélioration",
        defectRate: "8.2%",
        target: "&lt; 3%",
        savings: "€45,000",
        timeline: "4 mois",
        status: "En cours",
      },
      {
        id: 3,
        title: "Standardisation EPI",
        phase: "Contrôle",
        defectRate: "2.1%",
        target: "&lt; 2%",
        savings: "€32,000",
        timeline: "Terminé",
        status: "Complété",
      },
    ],
    x = {
      task: "Maintenance équipement haute tension",
      steps: [
        {
          step: 1,
          description: "Préparation outils et EPI",
          hazards: ["Outils défaillants", "EPI inadéquat"],
          controls: ["Vérification systématique", "Check-list EPI"],
          risk: "Faible",
        },
        {
          step: 2,
          description: "Consignation électrique",
          hazards: ["Électrocution", "Arc électrique"],
          controls: ["Procédure LOTO", "Vérificateur d'absence tension"],
          risk: "Critique",
        },
        {
          step: 3,
          description: "Intervention mécanique",
          hazards: ["Chute d'outil", "Coupure"],
          controls: ["Sécurisation outils", "Gants anti-coupure"],
          risk: "Moyen",
        },
        {
          step: 4,
          description: "Remise en service",
          hazards: ["Mauvaise reconnexion", "Test inadéquat"],
          controls: ["Double vérification", "Procédure test"],
          risk: "Moyen",
        },
      ],
      overallRisk: "Élevé",
      recommendations: [
        "Formation spécialisée obligatoire",
        "Supervision systématique",
        "Équipement de mesure étalonné",
        "Procédure d'urgence définie",
      ],
    },
    v = (g) => {
      switch (g.toLowerCase()) {
        case "critique":
        case "élevé":
          return "bg-red-100 text-red-800";
        case "moyen":
        case "modéré":
          return "bg-orange-100 text-orange-800";
        case "faible":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    N = (g) =>
      g >= 5 ? "text-red-600" : g >= 3 ? "text-orange-600" : "text-green-600";
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Outils d'Analyse Avancée",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "RULA, REBA, NIOSH, Liberty Mutual, Six Sigma, JSA/JHA",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                    "Exporter analyses",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(hr, { className: "w-4 h-4 mr-2" }),
                    "Nouvelle analyse",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "p-6 pb-0",
        children: t.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
          children: [
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Analyses RULA/REBA",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                          children: "47",
                        }),
                      ],
                    }),
                    t.jsx(tr, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Projets Six Sigma",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-green-500",
                          children: "3",
                        }),
                      ],
                    }),
                    t.jsx(er, { className: "w-6 h-6 text-green-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "JSA/JHA complétées",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-secondary)]",
                          children: "156",
                        }),
                      ],
                    }),
                    t.jsx(vt, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-secondary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Économies identifiées",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-purple-500",
                          children: "€162k",
                        }),
                      ],
                    }),
                    t.jsx(Un, { className: "w-6 h-6 text-purple-500" }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b px-6",
        children: t.jsxs("div", {
          className: "flex space-x-8",
          children: [
            t.jsxs("button", {
              onClick: () => l("rula-reba"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "rula-reba"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(tr, { className: "w-4 h-4 inline-block mr-2" }),
                "RULA / REBA",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("niosh"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "niosh"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Nl, { className: "w-4 h-4 inline-block mr-2" }),
                "NIOSH",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("liberty"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "liberty"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Un, { className: "w-4 h-4 inline-block mr-2" }),
                "Liberty Mutual",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("sixsigma"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "sixsigma"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(er, { className: "w-4 h-4 inline-block mr-2" }),
                "Six Sigma",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("jsa"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "jsa"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(qt, { className: "w-4 h-4 inline-block mr-2" }),
                "JSA / JHA",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "rula-reba" &&
            t.jsxs("div", {
              className: "grid lg:grid-cols-2 gap-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Évaluation Ergonomique",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "flex gap-2",
                            children: [
                              t.jsx(Y, {
                                variant: a === "rula" ? "default" : "outline",
                                onClick: () => c("rula"),
                                className:
                                  a === "rula"
                                    ? "bg-[var(--sahtee-blue-primary)]"
                                    : "",
                                children: "RULA",
                              }),
                              t.jsx(Y, {
                                variant: a === "reba" ? "default" : "outline",
                                onClick: () => c("reba"),
                                className:
                                  a === "reba"
                                    ? "bg-[var(--sahtee-blue-primary)]"
                                    : "",
                                children: "REBA",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsxs("h4", {
                                    className: "font-medium",
                                    children: ["Analyse RULA - ", u.employee],
                                  }),
                                  t.jsxs("p", {
                                    className: "text-sm text-gray-600",
                                    children: ["Évaluation du ", u.date],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "grid grid-cols-2 gap-4",
                                children: [
                                  t.jsxs("div", {
                                    className: "space-y-2",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", {
                                            children: "Bras/Poignet",
                                          }),
                                          t.jsx("span", {
                                            className: N(u.scores.arm),
                                            children: u.scores.arm,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", { children: "Cou" }),
                                          t.jsx("span", {
                                            className: N(u.scores.neck),
                                            children: u.scores.neck,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", { children: "Tronc" }),
                                          t.jsx("span", {
                                            className: N(u.scores.trunk),
                                            children: u.scores.trunk,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "space-y-2",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", { children: "Jambes" }),
                                          t.jsx("span", {
                                            className: N(u.scores.legs),
                                            children: u.scores.legs,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", { children: "Muscle" }),
                                          t.jsx("span", {
                                            className: N(u.scores.muscle),
                                            children: u.scores.muscle,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm",
                                        children: [
                                          t.jsx("span", { children: "Force" }),
                                          t.jsx("span", {
                                            className: N(u.scores.force),
                                            children: u.scores.force,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx("div", {
                                className:
                                  "p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500",
                                children: t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between",
                                  children: [
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("h5", {
                                          className:
                                            "font-medium text-orange-900",
                                          children: "Score Final RULA",
                                        }),
                                        t.jsx("p", {
                                          className: "text-sm text-orange-700",
                                          children: u.interpretation.action,
                                        }),
                                      ],
                                    }),
                                    t.jsx("div", {
                                      className:
                                        "text-2xl font-bold text-orange-600",
                                      children: u.scores.finalScore,
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, { children: "Recommandations" }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              t.jsxs(Ne, {
                                className: v(u.interpretation.level),
                                children: ["Risque ", u.interpretation.level],
                              }),
                              t.jsxs(Ne, {
                                variant: "outline",
                                children: [
                                  "Priorité ",
                                  u.interpretation.priority,
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Actions correctives",
                              }),
                              t.jsx("div", {
                                className: "space-y-2",
                                children: u.recommendations.map((g, S) =>
                                  t.jsxs(
                                    "div",
                                    {
                                      className:
                                        "flex items-start gap-2 text-sm",
                                      children: [
                                        t.jsx(vt, {
                                          className:
                                            "w-4 h-4 text-green-500 mt-0.5 flex-shrink-0",
                                        }),
                                        t.jsx("span", { children: g }),
                                      ],
                                    },
                                    S
                                  )
                                ),
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "pt-4 border-t",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Planning d'intervention",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2 text-sm",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "Ajustements immédiats",
                                      }),
                                      t.jsx("span", {
                                        className: "text-orange-600",
                                        children: "1 semaine",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "Formation ergonomie",
                                      }),
                                      t.jsx("span", {
                                        className: "text-blue-600",
                                        children: "2 semaines",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "Réévaluation complète",
                                      }),
                                      t.jsx("span", {
                                        className: "text-green-600",
                                        children: "1 mois",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "niosh" &&
            t.jsxs("div", {
              className: "grid lg:grid-cols-2 gap-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Analyse NIOSH - Équation de levage",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: f.task,
                              }),
                              t.jsx("p", {
                                className: "text-sm text-gray-600",
                                children: "Évaluation ergonomique du poste",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                className: "space-y-3",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", {
                                        children: "Poids de l'objet",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [f.parameters.weight, " kg"],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", {
                                        children: "Distance horizontale",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          f.parameters.horizontalDistance,
                                          " cm",
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", {
                                        children: "Hauteur de levage",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          f.parameters.verticalHeight,
                                          " cm",
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", {
                                        children: "Déplacement vertical",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          f.parameters.verticalTravel,
                                          " cm",
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "space-y-3",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", {
                                        children: "Angle d'asymétrie",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          f.parameters.asymmetryAngle,
                                          "°",
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", { children: "Fréquence" }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          f.parameters.frequency,
                                          "/min",
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between text-sm",
                                    children: [
                                      t.jsx("span", { children: "Durée" }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [f.parameters.duration, "h"],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-3 pt-4 border-t",
                            children: [
                              t.jsxs("div", {
                                className: "flex justify-between items-center",
                                children: [
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children:
                                      "Limite de Poids Recommandée (RWL)",
                                  }),
                                  t.jsxs("span", {
                                    className:
                                      "text-lg font-bold text-[var(--sahtee-blue-primary)]",
                                    children: [f.results.rwl, " kg"],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between items-center",
                                children: [
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "Indice de Levage (LI)",
                                  }),
                                  t.jsx("span", {
                                    className: "text-lg font-bold text-red-600",
                                    children: f.results.li,
                                  }),
                                ],
                              }),
                              t.jsx("div", {
                                className: "p-3 bg-orange-50 rounded-lg",
                                children: t.jsx("p", {
                                  className:
                                    "text-sm font-medium text-orange-900",
                                  children: f.results.interpretation,
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Interprétation et Actions",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Signification de l'Indice de Levage",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2 text-sm",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "w-3 h-3 bg-green-500 rounded-full",
                                      }),
                                      t.jsx("span", {
                                        children: "LI ≤ 1.0 : Risque minimal",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "w-3 h-3 bg-orange-500 rounded-full",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "1.0 < LI ≤ 3.0 : Risque modéré - Amélioration recommandée",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "w-3 h-3 bg-red-500 rounded-full",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "LI > 3.0 : Risque élevé - Action immédiate",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Actions recommandées",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex items-start gap-2 text-sm",
                                    children: [
                                      t.jsx(vt, {
                                        className:
                                          "w-4 h-4 text-orange-500 mt-0.5",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "Réduire le poids des charges (max 12 kg)",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-start gap-2 text-sm",
                                    children: [
                                      t.jsx(vt, {
                                        className:
                                          "w-4 h-4 text-orange-500 mt-0.5",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "Rapprocher les objets du corps (distance < 40 cm)",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-start gap-2 text-sm",
                                    children: [
                                      t.jsx(vt, {
                                        className:
                                          "w-4 h-4 text-orange-500 mt-0.5",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "Installer une aide mécanique au levage",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-start gap-2 text-sm",
                                    children: [
                                      t.jsx(vt, {
                                        className:
                                          "w-4 h-4 text-orange-500 mt-0.5",
                                      }),
                                      t.jsx("span", {
                                        children:
                                          "Former aux techniques de manutention",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "p-3 bg-blue-50 rounded-lg",
                            children: [
                              t.jsx("h5", {
                                className: "font-medium text-blue-900 mb-2",
                                children: "Simulation d'amélioration",
                              }),
                              t.jsxs("div", {
                                className: "text-sm text-blue-700",
                                children: [
                                  t.jsx("p", {
                                    children:
                                      "Avec les modifications proposées :",
                                  }),
                                  t.jsx("p", {
                                    children: "• Nouveau RWL estimé : 15.8 kg",
                                  }),
                                  t.jsx("p", {
                                    children: "• Nouvel LI estimé : 0.95",
                                  }),
                                  t.jsx("p", {
                                    className: "font-medium",
                                    children:
                                      "→ Risque ramené au niveau acceptable",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "liberty" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Analyse Liberty Mutual - Tables de risques",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "grid lg:grid-cols-3 gap-6",
                        children: [
                          t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Manipulation Manuelle",
                              }),
                              t.jsxs("div", {
                                className: "p-4 bg-orange-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className: "text-center",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "text-2xl font-bold text-orange-600",
                                        children: p.materialHandling.score,
                                      }),
                                      t.jsx("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Score de risque",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "mt-3 space-y-2 text-sm",
                                    children: [
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Niveau de risque",
                                          }),
                                          t.jsx(Ne, {
                                            className: v(
                                              p.materialHandling.risk
                                            ),
                                            children: p.materialHandling.risk,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Coût moyen",
                                          }),
                                          t.jsx("span", {
                                            className: "font-medium",
                                            children: p.materialHandling.cost,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Environnement",
                              }),
                              t.jsxs("div", {
                                className: "p-4 bg-green-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className: "text-center",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "text-2xl font-bold text-green-600",
                                        children: p.workEnvironment.score,
                                      }),
                                      t.jsx("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Score de risque",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "mt-3 space-y-2 text-sm",
                                    children: [
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Niveau de risque",
                                          }),
                                          t.jsx(Ne, {
                                            className: v(
                                              p.workEnvironment.risk
                                            ),
                                            children: p.workEnvironment.risk,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Coût moyen",
                                          }),
                                          t.jsx("span", {
                                            className: "font-medium",
                                            children: p.workEnvironment.cost,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Programmes Sécurité",
                              }),
                              t.jsxs("div", {
                                className: "p-4 bg-red-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className: "text-center",
                                    children: [
                                      t.jsx("div", {
                                        className:
                                          "text-2xl font-bold text-red-600",
                                        children: p.safety.score,
                                      }),
                                      t.jsx("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Score de risque",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "mt-3 space-y-2 text-sm",
                                    children: [
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Niveau de risque",
                                          }),
                                          t.jsx(Ne, {
                                            className: v(p.safety.risk),
                                            children: p.safety.risk,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className: "flex justify-between",
                                        children: [
                                          t.jsx("span", {
                                            children: "Coût moyen",
                                          }),
                                          t.jsx("span", {
                                            className: "font-medium",
                                            children: p.safety.cost,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Plan d'action Liberty Mutual",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className:
                              "p-4 bg-red-50 rounded-lg border-l-4 border-red-500",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium text-red-900",
                                children: "Priorité 1 : Programmes Sécurité",
                              }),
                              t.jsx("p", {
                                className: "text-sm text-red-700 mt-1",
                                children:
                                  "Score de 3.8 indique des lacunes importantes dans les programmes de sécurité. Amélioration potentielle : réduction de 40% des incidents.",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium text-orange-900",
                                children: "Priorité 2 : Manipulation Manuelle",
                              }),
                              t.jsx("p", {
                                className: "text-sm text-orange-700 mt-1",
                                children:
                                  "Score de 3.2 nécessite des améliorations ergonomiques. Formation et équipements d'aide recommandés.",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "grid lg:grid-cols-2 gap-4 mt-6",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h5", {
                                    className: "font-medium mb-2",
                                    children: "Actions immédiates",
                                  }),
                                  t.jsxs("ul", {
                                    className: "text-sm space-y-1",
                                    children: [
                                      t.jsx("li", {
                                        children:
                                          "• Révision procédures sécurité",
                                      }),
                                      t.jsx("li", {
                                        children: "• Formation superviseurs",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Audit des pratiques actuelles",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Mise en place d'indicateurs",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h5", {
                                    className: "font-medium mb-2",
                                    children: "Actions moyen terme",
                                  }),
                                  t.jsxs("ul", {
                                    className: "text-sm space-y-1",
                                    children: [
                                      t.jsx("li", {
                                        children:
                                          "• Investissement en équipements",
                                      }),
                                      t.jsx("li", {
                                        children: "• Programme d'ergonomie",
                                      }),
                                      t.jsx("li", {
                                        children: "• Système de récompenses",
                                      }),
                                      t.jsx("li", {
                                        children: "• Évaluation régulière",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "sixsigma" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Projets Six Sigma SST",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: m.map((g) =>
                          t.jsxs(
                            "div",
                            {
                              className: "border rounded-lg p-4",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex items-start justify-between mb-3",
                                  children: [
                                    t.jsxs("div", {
                                      className: "flex-1",
                                      children: [
                                        t.jsx("h4", {
                                          className: "font-medium",
                                          children: g.title,
                                        }),
                                        t.jsxs("div", {
                                          className:
                                            "flex items-center gap-4 mt-2 text-sm text-gray-600",
                                          children: [
                                            t.jsxs("span", {
                                              children: ["Phase: ", g.phase],
                                            }),
                                            t.jsxs("span", {
                                              children: [
                                                "Timeline: ",
                                                g.timeline,
                                              ],
                                            }),
                                            t.jsx(Ne, {
                                              className:
                                                g.status === "Complété"
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-blue-100 text-blue-800",
                                              children: g.status,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "text-right",
                                      children: [
                                        t.jsx("div", {
                                          className:
                                            "text-lg font-bold text-green-600",
                                          children: g.savings,
                                        }),
                                        t.jsx("div", {
                                          className: "text-xs text-gray-500",
                                          children: "Économies estimées",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "grid lg:grid-cols-3 gap-4",
                                  children: [
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-sm text-gray-600",
                                          children: "Taux de défaut actuel",
                                        }),
                                        t.jsx("div", {
                                          className: "font-medium text-red-600",
                                          children: g.defectRate,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-sm text-gray-600",
                                          children: "Objectif",
                                        }),
                                        t.jsx("div", {
                                          className:
                                            "font-medium text-green-600",
                                          children: g.target,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-sm text-gray-600",
                                          children: "Progression",
                                        }),
                                        t.jsx(fr, {
                                          value:
                                            g.status === "Complété" ? 100 : 65,
                                          className: "h-2 mt-1",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            g.id
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, { children: "Méthodologie DMAIC" }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "grid lg:grid-cols-5 gap-4",
                        children: [
                          t.jsxs("div", {
                            className: "text-center p-3 bg-blue-50 rounded-lg",
                            children: [
                              t.jsx("div", {
                                className:
                                  "font-bold text-[var(--sahtee-blue-primary)]",
                                children: "D",
                              }),
                              t.jsx("div", {
                                className: "text-sm mt-1",
                                children: "Définir",
                              }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600",
                                children: "Problème identifié",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "text-center p-3 bg-green-50 rounded-lg",
                            children: [
                              t.jsx("div", {
                                className: "font-bold text-green-600",
                                children: "M",
                              }),
                              t.jsx("div", {
                                className: "text-sm mt-1",
                                children: "Mesurer",
                              }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600",
                                children: "Données collectées",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "text-center p-3 bg-orange-50 rounded-lg",
                            children: [
                              t.jsx("div", {
                                className: "font-bold text-orange-600",
                                children: "A",
                              }),
                              t.jsx("div", {
                                className: "text-sm mt-1",
                                children: "Analyser",
                              }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600",
                                children: "Causes identifiées",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "text-center p-3 bg-purple-50 rounded-lg",
                            children: [
                              t.jsx("div", {
                                className: "font-bold text-purple-600",
                                children: "I",
                              }),
                              t.jsx("div", {
                                className: "text-sm mt-1",
                                children: "Améliorer",
                              }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600",
                                children: "Solutions mises en place",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "text-center p-3 bg-gray-50 rounded-lg",
                            children: [
                              t.jsx("div", {
                                className: "font-bold text-gray-600",
                                children: "C",
                              }),
                              t.jsx("div", {
                                className: "text-sm mt-1",
                                children: "Contrôler",
                              }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600",
                                children: "Surveillance continue",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "jsa" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Analyse Sécurité du Travail (JSA)",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h4", {
                                    className: "font-medium",
                                    children: x.task,
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-gray-600",
                                    children: "Analyse des risques par étape",
                                  }),
                                ],
                              }),
                              t.jsxs(Ne, {
                                className: v(x.overallRisk),
                                children: ["Risque Global: ", x.overallRisk],
                              }),
                            ],
                          }),
                          t.jsx("div", {
                            className: "space-y-3",
                            children: x.steps.map((g) =>
                              t.jsxs(
                                "div",
                                {
                                  className: "border rounded-lg p-4",
                                  children: [
                                    t.jsxs("div", {
                                      className:
                                        "flex items-start justify-between mb-3",
                                      children: [
                                        t.jsx("div", {
                                          className: "flex-1",
                                          children: t.jsxs("h5", {
                                            className: "font-medium",
                                            children: [
                                              "Étape ",
                                              g.step,
                                              ": ",
                                              g.description,
                                            ],
                                          }),
                                        }),
                                        t.jsx(Ne, {
                                          className: v(g.risk),
                                          children: g.risk,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "grid lg:grid-cols-2 gap-4",
                                      children: [
                                        t.jsxs("div", {
                                          children: [
                                            t.jsx("h6", {
                                              className:
                                                "text-sm font-medium text-red-700 mb-2",
                                              children: "Dangers identifiés",
                                            }),
                                            t.jsx("ul", {
                                              className: "text-sm space-y-1",
                                              children: g.hazards.map((S, A) =>
                                                t.jsxs(
                                                  "li",
                                                  {
                                                    className:
                                                      "flex items-start gap-2",
                                                    children: [
                                                      t.jsx(qt, {
                                                        className:
                                                          "w-3 h-3 text-red-500 mt-0.5 flex-shrink-0",
                                                      }),
                                                      t.jsx("span", {
                                                        children: S,
                                                      }),
                                                    ],
                                                  },
                                                  A
                                                )
                                              ),
                                            }),
                                          ],
                                        }),
                                        t.jsxs("div", {
                                          children: [
                                            t.jsx("h6", {
                                              className:
                                                "text-sm font-medium text-green-700 mb-2",
                                              children: "Mesures de contrôle",
                                            }),
                                            t.jsx("ul", {
                                              className: "text-sm space-y-1",
                                              children: g.controls.map((S, A) =>
                                                t.jsxs(
                                                  "li",
                                                  {
                                                    className:
                                                      "flex items-start gap-2",
                                                    children: [
                                                      t.jsx(vt, {
                                                        className:
                                                          "w-3 h-3 text-green-500 mt-0.5 flex-shrink-0",
                                                      }),
                                                      t.jsx("span", {
                                                        children: S,
                                                      }),
                                                    ],
                                                  },
                                                  A
                                                )
                                              ),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                g.step
                              )
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Recommandations Générales",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Plan d'action prioritaire",
                              }),
                              t.jsx("div", {
                                className: "space-y-2",
                                children: x.recommendations.map((g, S) =>
                                  t.jsxs(
                                    "div",
                                    {
                                      className:
                                        "flex items-start gap-2 p-3 bg-blue-50 rounded-lg",
                                      children: [
                                        t.jsx("div", {
                                          className:
                                            "bg-[var(--sahtee-blue-primary)] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold",
                                          children: S + 1,
                                        }),
                                        t.jsx("span", {
                                          className: "text-sm",
                                          children: g,
                                        }),
                                      ],
                                    },
                                    S
                                  )
                                ),
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "grid lg:grid-cols-2 gap-4 pt-4 border-t",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h5", {
                                    className: "font-medium mb-2",
                                    children: "Ressources nécessaires",
                                  }),
                                  t.jsxs("ul", {
                                    className:
                                      "text-sm space-y-1 text-gray-600",
                                    children: [
                                      t.jsx("li", {
                                        children:
                                          "• Formateur certifié électricité",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Équipements de mesure étalonnés",
                                      }),
                                      t.jsx("li", {
                                        children: "• Supervision expérimentée",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Procédures d'urgence actualisées",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h5", {
                                    className: "font-medium mb-2",
                                    children: "Timeline d'implémentation",
                                  }),
                                  t.jsxs("ul", {
                                    className:
                                      "text-sm space-y-1 text-gray-600",
                                    children: [
                                      t.jsx("li", {
                                        children: "• Formation: 2 semaines",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Mise à jour procédures: 1 semaine",
                                      }),
                                      t.jsx("li", {
                                        children: "• Test équipements: 3 jours",
                                      }),
                                      t.jsx("li", {
                                        children:
                                          "• Validation finale: 1 semaine",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function St({ className: s, type: l, ...a }) {
  return t.jsx("input", {
    type: l,
    "data-slot": "input",
    className: it(
      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      s
    ),
    ...a,
  });
}
var ly = "Label",
  Xf = j.forwardRef((s, l) =>
    t.jsx($e.label, {
      ...s,
      ref: l,
      onMouseDown: (a) => {
        a.target.closest("button, input, select, textarea") ||
          (s.onMouseDown?.(a),
          !a.defaultPrevented && a.detail > 1 && a.preventDefault());
      },
    })
  );
Xf.displayName = ly;
var ay = Xf;
function Xe({ className: s, ...l }) {
  return t.jsx(ay, {
    "data-slot": "label",
    className: it(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      s
    ),
    ...l,
  });
}
function oy() {
  const [s, l] = j.useState("library"),
    [a, c] = j.useState(!1),
    [u, f] = j.useState(!1),
    p = [
      {
        id: 1,
        name: "ISO 45001:2018",
        category: "Management SST",
        status: "Conforme",
        progress: 94,
        lastUpdate: "2024-01-15",
        nextAudit: "2024-06-15",
      },
      {
        id: 2,
        name: "Directive Machines 2006/42/CE",
        category: "Sécurité machines",
        status: "En cours",
        progress: 78,
        lastUpdate: "2024-01-10",
        nextAudit: "2024-03-10",
      },
      {
        id: 3,
        name: "OSHA Standards",
        category: "Sécurité US",
        status: "À réviser",
        progress: 65,
        lastUpdate: "2023-12-20",
        nextAudit: "2024-02-20",
      },
      {
        id: 4,
        name: "Code du Travail - Livre IV",
        category: "Réglementation FR",
        status: "Conforme",
        progress: 88,
        lastUpdate: "2024-01-05",
        nextAudit: "2024-07-05",
      },
    ],
    m = [
      {
        id: 1,
        title: "Audit Semestriel ISO 45001",
        site: "Site Principal",
        auditor: "Bureau Veritas",
        date: "2024-01-15",
        status: "Terminé",
        score: 94,
        findings: 3,
      },
      {
        id: 2,
        title: "Audit Sécurité Machines",
        site: "Atelier Production",
        auditor: "TÜV SÜD",
        date: "2024-02-01",
        status: "En cours",
        score: 0,
        findings: 0,
      },
    ],
    x = (v) => {
      switch (v) {
        case "Conforme":
          return "bg-green-100 text-green-800";
        case "En cours":
          return "bg-blue-100 text-blue-800";
        case "À réviser":
          return "bg-orange-100 text-orange-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Conformity Room",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Bibliothèque réglementaire : normes ISO, OSHA, COR, IAP - Traçabilité complète et alertes automatiques",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  type: "button",
                  variant: "outline",
                  onClick: () => c(!0),
                  className:
                    "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                  children: [
                    t.jsx(Pf, { className: "w-4 h-4 mr-2" }),
                    "Importer données juridiques",
                  ],
                }),
                t.jsxs(Y, {
                  type: "button",
                  onClick: () => f(!0),
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white",
                  children: [
                    t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                    "Nouvel audit",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b",
        children: t.jsxs("div", {
          className: "flex space-x-8 px-6",
          children: [
            t.jsxs("button", {
              type: "button",
              onClick: () => l("library"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "library"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Cg, { className: "w-4 h-4 inline-block mr-2" }),
                "Bibliothèque Réglementaire",
              ],
            }),
            t.jsxs("button", {
              type: "button",
              onClick: () => l("status"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "status"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(hr, { className: "w-4 h-4 inline-block mr-2" }),
                "Statut des Normes",
              ],
            }),
            t.jsxs("button", {
              type: "button",
              onClick: () => l("compliance"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "compliance"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(vt, { className: "w-4 h-4 inline-block mr-2" }),
                "Suivi Conformité",
              ],
            }),
            t.jsxs("button", {
              type: "button",
              onClick: () => l("audits"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "audits"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(ln, { className: "w-4 h-4 inline-block mr-2" }),
                "Audits",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "library" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className:
                    "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm",
                  children: [
                    t.jsxs("div", {
                      className: "relative flex-1",
                      children: [
                        t.jsx(Kn, {
                          className:
                            "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                        }),
                        t.jsx("input", {
                          type: "text",
                          placeholder: "Rechercher une réglementation...",
                          className:
                            "pl-10 pr-4 py-2 border rounded-lg text-sm w-full",
                        }),
                      ],
                    }),
                    t.jsxs(Y, {
                      variant: "outline",
                      size: "sm",
                      children: [
                        t.jsx(wl, { className: "w-4 h-4 mr-2" }),
                        "Filtres",
                      ],
                    }),
                    t.jsxs(Y, {
                      variant: "outline",
                      size: "sm",
                      children: [
                        t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                        "Exporter",
                      ],
                    }),
                  ],
                }),
                t.jsx("div", {
                  className: "grid lg:grid-cols-2 gap-6",
                  children: p.map((v) =>
                    t.jsxs(
                      G,
                      {
                        className: "hover:shadow-md transition-shadow",
                        children: [
                          t.jsx(pe, {
                            children: t.jsxs("div", {
                              className: "flex items-start justify-between",
                              children: [
                                t.jsxs("div", {
                                  children: [
                                    t.jsx(xe, {
                                      className: "text-lg",
                                      children: v.name,
                                    }),
                                    t.jsx("p", {
                                      className: "text-sm text-gray-600 mt-1",
                                      children: v.category,
                                    }),
                                  ],
                                }),
                                t.jsx(Ne, {
                                  className: x(v.status),
                                  children: v.status,
                                }),
                              ],
                            }),
                          }),
                          t.jsx(Q, {
                            children: t.jsxs("div", {
                              className: "space-y-4",
                              children: [
                                t.jsxs("div", {
                                  children: [
                                    t.jsxs("div", {
                                      className:
                                        "flex justify-between text-sm mb-2",
                                      children: [
                                        t.jsx("span", {
                                          children: "Progression conformité",
                                        }),
                                        t.jsxs("span", {
                                          className: "font-medium",
                                          children: [v.progress, "%"],
                                        }),
                                      ],
                                    }),
                                    t.jsx(fr, {
                                      value: v.progress,
                                      className: "h-2",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "grid grid-cols-2 gap-4 text-sm",
                                  children: [
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("p", {
                                          className: "text-gray-600",
                                          children: "Dernière mise à jour",
                                        }),
                                        t.jsx("p", {
                                          className: "font-medium",
                                          children: v.lastUpdate,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("p", {
                                          className: "text-gray-600",
                                          children: "Prochain audit",
                                        }),
                                        t.jsx("p", {
                                          className: "font-medium",
                                          children: v.nextAudit,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex gap-2 pt-2",
                                  children: [
                                    t.jsx(Y, {
                                      size: "sm",
                                      variant: "outline",
                                      className: "flex-1",
                                      children: "Voir détails",
                                    }),
                                    t.jsx(Y, {
                                      size: "sm",
                                      className:
                                        "flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                      children: "Planifier audit",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        ],
                      },
                      v.id
                    )
                  ),
                }),
              ],
            }),
          s === "status" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className: "grid lg:grid-cols-3 gap-6",
                  children: [
                    t.jsxs(G, {
                      className: "border-l-4 border-green-500",
                      children: [
                        t.jsx(pe, {
                          children: t.jsxs(xe, {
                            className: "flex items-center gap-2 text-green-700",
                            children: [
                              t.jsx(vt, { className: "w-5 h-5" }),
                              "Normes Validées",
                            ],
                          }),
                        }),
                        t.jsxs(Q, {
                          children: [
                            t.jsx("p", {
                              className:
                                "text-4xl font-bold text-green-600 mb-2",
                              children: "12",
                            }),
                            t.jsx("p", {
                              className: "text-sm text-gray-600",
                              children: "Conformité totale atteinte",
                            }),
                            t.jsxs("div", {
                              className: "mt-4 space-y-2",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between text-sm",
                                  children: [
                                    t.jsx("span", {
                                      children: "ISO 45001:2018",
                                    }),
                                    t.jsx(Ne, {
                                      className: "bg-green-100 text-green-800",
                                      children: "94%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between text-sm",
                                  children: [
                                    t.jsx("span", {
                                      children: "Code du Travail",
                                    }),
                                    t.jsx(Ne, {
                                      className: "bg-green-100 text-green-800",
                                      children: "88%",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      className: "border-l-4 border-red-500",
                      children: [
                        t.jsx(pe, {
                          children: t.jsxs(xe, {
                            className: "flex items-center gap-2 text-red-700",
                            children: [
                              t.jsx(Gg, { className: "w-5 h-5" }),
                              "Normes Manquantes",
                            ],
                          }),
                        }),
                        t.jsxs(Q, {
                          children: [
                            t.jsx("p", {
                              className: "text-4xl font-bold text-red-600 mb-2",
                              children: "5",
                            }),
                            t.jsx("p", {
                              className: "text-sm text-gray-600",
                              children: "Actions requises",
                            }),
                            t.jsxs("div", {
                              className: "mt-4 space-y-2",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between text-sm",
                                  children: [
                                    t.jsx("span", {
                                      children: "OSHA Standards",
                                    }),
                                    t.jsx(Ne, {
                                      className: "bg-red-100 text-red-800",
                                      children: "65%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between text-sm",
                                  children: [
                                    t.jsx("span", {
                                      children: "Directive Machines",
                                    }),
                                    t.jsx(Ne, {
                                      className:
                                        "bg-orange-100 text-orange-800",
                                      children: "78%",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      className: "border-l-4 border-blue-500",
                      children: [
                        t.jsx(pe, {
                          children: t.jsxs(xe, {
                            className: "flex items-center gap-2 text-blue-700",
                            children: [
                              t.jsx(hr, { className: "w-5 h-5" }),
                              "Objectifs de Conformité",
                            ],
                          }),
                        }),
                        t.jsxs(Q, {
                          children: [
                            t.jsx("p", {
                              className:
                                "text-4xl font-bold text-blue-600 mb-2",
                              children: "8",
                            }),
                            t.jsx("p", {
                              className: "text-sm text-gray-600",
                              children: "En cours de réalisation",
                            }),
                            t.jsxs("div", {
                              className: "mt-4",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex justify-between text-sm mb-2",
                                  children: [
                                    t.jsx("span", {
                                      children: "Progression globale",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: "82%",
                                    }),
                                  ],
                                }),
                                t.jsx(fr, { value: 82, className: "h-2" }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsxs(xe, {
                        className: "flex items-center justify-between",
                        children: [
                          t.jsx("span", {
                            children: "Intégration CAPA - Actions Correctives",
                          }),
                          t.jsxs(Y, {
                            size: "sm",
                            className:
                              "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                            children: [
                              t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                              "Créer action CAPA",
                            ],
                          }),
                        ],
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-3",
                        children: [
                          t.jsxs("div", {
                            className:
                              "flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-3",
                                children: [
                                  t.jsx(qt, {
                                    className: "w-5 h-5 text-orange-600",
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("p", {
                                        className: "font-medium",
                                        children:
                                          "OSHA Standards - Non-conformité détectée",
                                      }),
                                      t.jsx("p", {
                                        className: "text-sm text-gray-600",
                                        children:
                                          "Action corrective requise pour atteindre 85%",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx(Y, {
                                size: "sm",
                                variant: "outline",
                                children: "Planifier CAPA",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-3",
                                children: [
                                  t.jsx(Wn, {
                                    className: "w-5 h-5 text-blue-600",
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("p", {
                                        className: "font-medium",
                                        children:
                                          "Directive Machines - Amélioration continue",
                                      }),
                                      t.jsx("p", {
                                        className: "text-sm text-gray-600",
                                        children: "3 actions CAPA en cours",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx(Y, {
                                size: "sm",
                                variant: "outline",
                                children: "Voir actions",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "compliance" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className: "grid lg:grid-cols-3 gap-6 mb-8",
                  children: [
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Conformité Globale",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-[var(--sahtee-blue-primary)]",
                                  children: "87%",
                                }),
                              ],
                            }),
                            t.jsx(vt, { className: "w-8 h-8 text-green-500" }),
                          ],
                        }),
                      }),
                    }),
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Audits en cours",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-[var(--sahtee-blue-secondary)]",
                                  children: "3",
                                }),
                              ],
                            }),
                            t.jsx(Wn, { className: "w-8 h-8 text-blue-500" }),
                          ],
                        }),
                      }),
                    }),
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Actions correctives",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-orange-500",
                                  children: "12",
                                }),
                              ],
                            }),
                            t.jsx(ln, { className: "w-8 h-8 text-orange-500" }),
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Vue d'ensemble de la conformité",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: p.map((v) =>
                          t.jsxs(
                            "div",
                            {
                              className:
                                "flex items-center justify-between p-4 bg-gray-50 rounded-lg",
                              children: [
                                t.jsxs("div", {
                                  className: "flex items-center gap-4",
                                  children: [
                                    t.jsx("div", {
                                      className:
                                        "w-2 h-2 rounded-full bg-[var(--sahtee-blue-primary)]",
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("h4", {
                                          className: "font-medium",
                                          children: v.name,
                                        }),
                                        t.jsx("p", {
                                          className: "text-sm text-gray-600",
                                          children: v.category,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex items-center gap-4",
                                  children: [
                                    t.jsxs("div", {
                                      className: "text-right",
                                      children: [
                                        t.jsxs("div", {
                                          className: "font-medium",
                                          children: [v.progress, "%"],
                                        }),
                                        t.jsx("div", {
                                          className: "text-sm text-gray-500",
                                          children: "Conformité",
                                        }),
                                      ],
                                    }),
                                    t.jsx(Ne, {
                                      className: x(v.status),
                                      children: v.status,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            v.id
                          )
                        ),
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "audits" &&
            t.jsx("div", {
              className: "space-y-6",
              children: t.jsxs(G, {
                children: [
                  t.jsx(pe, {
                    children: t.jsx(xe, {
                      children: "Audits récents et programmés",
                    }),
                  }),
                  t.jsx(Q, {
                    children: t.jsx("div", {
                      className: "space-y-4",
                      children: m.map((v) =>
                        t.jsxs(
                          "div",
                          {
                            className:
                              "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-4",
                                children: [
                                  t.jsx("div", {
                                    className: `w-3 h-3 rounded-full ${
                                      v.status === "Terminé"
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }`,
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("h4", {
                                        className: "font-medium",
                                        children: v.title,
                                      }),
                                      t.jsxs("p", {
                                        className: "text-sm text-gray-600",
                                        children: [v.site, " • ", v.auditor],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex items-center gap-4",
                                children: [
                                  t.jsxs("div", {
                                    className: "text-right",
                                    children: [
                                      t.jsx("div", {
                                        className: "font-medium",
                                        children: v.date,
                                      }),
                                      t.jsx("div", {
                                        className: "text-sm text-gray-500",
                                        children:
                                          v.status === "Terminé"
                                            ? `Score: ${v.score}%`
                                            : v.status,
                                      }),
                                    ],
                                  }),
                                  t.jsx(Y, {
                                    size: "sm",
                                    variant: "outline",
                                    children:
                                      v.status === "Terminé"
                                        ? "Voir rapport"
                                        : "Modifier",
                                  }),
                                ],
                              }),
                            ],
                          },
                          v.id
                        )
                      ),
                    }),
                  }),
                ],
              }),
            }),
        ],
      }),
      a &&
        t.jsxs("div", {
          className:
            "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          children: [
            t.jsx("div", {
              className: "fixed inset-0 bg-black/60",
              onClick: () => c(!1),
            }),
            t.jsxs("div", {
              className:
                "relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 border border-gray-200",
              children: [
                t.jsxs("div", {
                  className: "flex flex-col gap-2 mb-4",
                  children: [
                    t.jsx("h2", {
                      className: "text-lg font-semibold",
                      children: "Importer données juridiques",
                    }),
                    t.jsx("p", {
                      className: "text-sm text-gray-600",
                      children:
                        "Importez vos données de conformité juridique depuis un fichier Excel, CSV ou PDF.",
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "grid gap-4 py-4",
                  children: [
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "file-upload",
                          children: "Fichier à importer",
                        }),
                        t.jsx(St, {
                          id: "file-upload",
                          type: "file",
                          accept: ".xlsx,.xls,.csv,.pdf",
                          className: "cursor-pointer",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "category",
                          children: "Catégorie",
                        }),
                        t.jsxs("select", {
                          id: "category",
                          className:
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          children: [
                            t.jsx("option", {
                              value: "",
                              children: "Sélectionner une catégorie",
                            }),
                            t.jsx("option", { value: "iso", children: "ISO" }),
                            t.jsx("option", {
                              value: "osha",
                              children: "OSHA",
                            }),
                            t.jsx("option", { value: "cor", children: "COR" }),
                            t.jsx("option", { value: "iap", children: "IAP" }),
                            t.jsx("option", {
                              value: "other",
                              children: "Autre",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className:
                    "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4",
                  children: [
                    t.jsx(Y, {
                      type: "button",
                      variant: "outline",
                      onClick: () => c(!1),
                      children: "Annuler",
                    }),
                    t.jsx(Y, {
                      type: "button",
                      className:
                        "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                      onClick: () => {
                        alert("Importation en cours..."), c(!1);
                      },
                      children: "Importer",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      u &&
        t.jsxs("div", {
          className:
            "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          children: [
            t.jsx("div", {
              className: "fixed inset-0 bg-black/60",
              onClick: () => f(!1),
            }),
            t.jsxs("div", {
              className:
                "relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 border border-gray-200",
              children: [
                t.jsxs("div", {
                  className: "flex flex-col gap-2 mb-4",
                  children: [
                    t.jsx("h2", {
                      className: "text-lg font-semibold",
                      children: "Créer un nouvel audit",
                    }),
                    t.jsx("p", {
                      className: "text-sm text-gray-600",
                      children:
                        "Planifiez un nouvel audit de conformité pour votre organisation.",
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "grid gap-4 py-4",
                  children: [
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "audit-title",
                          children: "Titre de l'audit",
                        }),
                        t.jsx(St, {
                          id: "audit-title",
                          placeholder: "Ex: Audit ISO 45001 - Site Principal",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, { htmlFor: "audit-site", children: "Site" }),
                        t.jsx(St, {
                          id: "audit-site",
                          placeholder: "Ex: Site Principal, Atelier Production",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "audit-auditor",
                          children: "Auditeur",
                        }),
                        t.jsx(St, {
                          id: "audit-auditor",
                          placeholder: "Ex: Bureau Veritas, TÜV SÜD",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "audit-date",
                          children: "Date prévue",
                        }),
                        t.jsx(St, { id: "audit-date", type: "date" }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "grid gap-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "audit-norm",
                          children: "Norme concernée",
                        }),
                        t.jsxs("select", {
                          id: "audit-norm",
                          className:
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          children: [
                            t.jsx("option", {
                              value: "",
                              children: "Sélectionner une norme",
                            }),
                            t.jsx("option", {
                              value: "iso45001",
                              children: "ISO 45001:2018",
                            }),
                            t.jsx("option", {
                              value: "machines",
                              children: "Directive Machines 2006/42/CE",
                            }),
                            t.jsx("option", {
                              value: "osha",
                              children: "OSHA Standards",
                            }),
                            t.jsx("option", {
                              value: "travail",
                              children: "Code du Travail - Livre IV",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className:
                    "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4",
                  children: [
                    t.jsx(Y, {
                      type: "button",
                      variant: "outline",
                      onClick: () => f(!1),
                      children: "Annuler",
                    }),
                    t.jsx(Y, {
                      type: "button",
                      className:
                        "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                      onClick: () => {
                        alert("Audit créé avec succès!"), f(!1);
                      },
                      children: "Créer l'audit",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function cy() {
  const [s, l] = j.useState("roi"),
    [a, c] = j.useState({
      accidents: "",
      absenteeism: "",
      turnover: "",
      employees: "",
      averageSalary: "",
      trainingCosts: "",
      equipmentCosts: "",
    }),
    [u, f] = j.useState({
      currentCosts: 0,
      preventionCosts: 0,
      savings: 0,
      roi: 0,
      paybackPeriod: 0,
    }),
    p = () => {
      const g = parseInt(a.accidents) || 0,
        S = parseFloat(a.absenteeism) || 0,
        A = parseFloat(a.turnover) || 0,
        T = parseInt(a.employees) || 0,
        b = parseFloat(a.averageSalary) || 0,
        E = parseFloat(a.trainingCosts) || 0,
        I = parseFloat(a.equipmentCosts) || 0,
        z = g * 15e3,
        O = (S / 100) * T * b * 0.2,
        D = (A / 100) * T * b * 0.5,
        q = z + O + D,
        Z = E + I,
        H = q * 0.4,
        he = H - Z,
        ye = Z > 0 ? (he / Z) * 100 : 0,
        Ae = H > 0 ? Z / (H / 12) : 0;
      f({
        currentCosts: q,
        preventionCosts: Z,
        savings: he,
        roi: ye,
        paybackPeriod: Ae,
      });
    },
    m = {
      transportation: { value: 450, unit: "kg CO₂/mois" },
      energy: { value: 1200, unit: "kg CO₂/mois" },
      waste: { value: 280, unit: "kg CO₂/mois" },
      digitalFootprint: { value: 150, unit: "kg CO₂/mois" },
      total: { value: 2080, unit: "kg CO₂/mois" },
    },
    x = [
      {
        category: "Taux de fréquence",
        yourValue: 12.5,
        benchmark: 15.2,
        unit: "/1000h",
        status: "good",
      },
      {
        category: "Taux de gravité",
        yourValue: 0.8,
        benchmark: 1.2,
        unit: "/1000h",
        status: "good",
      },
      {
        category: "Absentéisme",
        yourValue: 6.2,
        benchmark: 4.8,
        unit: "%",
        status: "poor",
      },
      {
        category: "Turnover",
        yourValue: 8.5,
        benchmark: 12.1,
        unit: "%",
        status: "good",
      },
      {
        category: "Coût par employé",
        yourValue: 2400,
        benchmark: 3100,
        unit: "€/an",
        status: "good",
      },
    ],
    v = (g) => {
      switch (g) {
        case "good":
          return "text-green-600";
        case "poor":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    },
    N = (g) => {
      switch (g) {
        case "good":
          return "↓";
        case "poor":
          return "↑";
        default:
          return "→";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Impact Calculator",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "ROI sécurité, analyse des coûts et empreinte carbone",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                    "Exporter analyse",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                    "Nouveau calcul",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b px-6",
        children: t.jsxs("div", {
          className: "flex space-x-8",
          children: [
            t.jsxs("button", {
              onClick: () => l("roi"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "roi"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Zg, { className: "w-4 h-4 inline-block mr-2" }),
                "ROI Sécurité",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("costs"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "costs"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Un, { className: "w-4 h-4 inline-block mr-2" }),
                "Analyse des Coûts",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("carbon"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "carbon"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Am, { className: "w-4 h-4 inline-block mr-2" }),
                "Empreinte Carbone",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("benchmarks"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "benchmarks"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(er, { className: "w-4 h-4 inline-block mr-2" }),
                "Benchmarks",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "roi" &&
            t.jsxs("div", {
              className: "grid lg:grid-cols-2 gap-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsxs(xe, {
                        className: "flex items-center gap-2",
                        children: [
                          t.jsx(Nl, {
                            className:
                              "w-5 h-5 text-[var(--sahtee-blue-primary)]",
                          }),
                          "Calculateur ROI Sécurité",
                        ],
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Accidents annuels",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    value: a.accidents,
                                    onChange: (g) =>
                                      c({ ...a, accidents: g.target.value }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "12",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Taux absentéisme (%)",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    step: "0.1",
                                    value: a.absenteeism,
                                    onChange: (g) =>
                                      c({ ...a, absenteeism: g.target.value }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "4.5",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Turnover (%)",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    step: "0.1",
                                    value: a.turnover,
                                    onChange: (g) =>
                                      c({ ...a, turnover: g.target.value }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "8.2",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Nombre d'employés",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    value: a.employees,
                                    onChange: (g) =>
                                      c({ ...a, employees: g.target.value }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "150",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("label", {
                                className: "block text-sm font-medium mb-1",
                                children: "Salaire moyen annuel (€)",
                              }),
                              t.jsx("input", {
                                type: "number",
                                value: a.averageSalary,
                                onChange: (g) =>
                                  c({ ...a, averageSalary: g.target.value }),
                                className:
                                  "w-full p-2 border rounded-lg text-sm",
                                placeholder: "45000",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Coûts formation (€)",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    value: a.trainingCosts,
                                    onChange: (g) =>
                                      c({
                                        ...a,
                                        trainingCosts: g.target.value,
                                      }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "25000",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-1",
                                    children: "Coûts équipement (€)",
                                  }),
                                  t.jsx("input", {
                                    type: "number",
                                    value: a.equipmentCosts,
                                    onChange: (g) =>
                                      c({
                                        ...a,
                                        equipmentCosts: g.target.value,
                                      }),
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    placeholder: "15000",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsx(Y, {
                            onClick: p,
                            className:
                              "w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                            children: "Calculer le ROI",
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Résultats du calcul ROI",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-6",
                        children: [
                          t.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-red-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className:
                                      "text-2xl font-bold text-red-600",
                                    children: [
                                      u.currentCosts.toLocaleString("fr-FR"),
                                      "€",
                                    ],
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-red-700",
                                    children: "Coûts actuels annuels",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-blue-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className:
                                      "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                                    children: [
                                      u.preventionCosts.toLocaleString("fr-FR"),
                                      "€",
                                    ],
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-blue-700",
                                    children: "Investissement prévention",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "text-center p-6 bg-green-50 rounded-lg border-2 border-green-200",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "text-3xl font-bold text-green-600 mb-2",
                                children: [
                                  u.savings.toLocaleString("fr-FR"),
                                  "€",
                                ],
                              }),
                              t.jsx("div", {
                                className: "text-sm text-green-700 mb-4",
                                children: "Économies nettes annuelles",
                              }),
                              t.jsxs("div", {
                                className: "grid grid-cols-2 gap-4 text-sm",
                                children: [
                                  t.jsxs("div", {
                                    children: [
                                      t.jsxs("div", {
                                        className: "font-bold text-lg",
                                        children: [u.roi.toFixed(1), "%"],
                                      }),
                                      t.jsx("div", {
                                        className: "text-green-600",
                                        children: "ROI",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsxs("div", {
                                        className: "font-bold text-lg",
                                        children: [
                                          u.paybackPeriod.toFixed(1),
                                          " mois",
                                        ],
                                      }),
                                      t.jsx("div", {
                                        className: "text-green-600",
                                        children: "Période de retour",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-2",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Analyse détaillée",
                              }),
                              t.jsxs("ul", {
                                className: "text-sm space-y-1 text-gray-600",
                                children: [
                                  t.jsx("li", {
                                    children:
                                      "• Réduction estimée des accidents: 40%",
                                  }),
                                  t.jsx("li", {
                                    children:
                                      "• Diminution de l'absentéisme: 25%",
                                  }),
                                  t.jsx("li", {
                                    children:
                                      "• Amélioration de la productivité: 15%",
                                  }),
                                  t.jsx("li", {
                                    children:
                                      "• Réduction des primes d'assurance: 10%",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "costs" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className: "grid lg:grid-cols-3 gap-6",
                  children: [
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, {
                            className: "text-center",
                            children: "Coûts Directs",
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Accidents du travail",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "180,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Maladies professionnelles",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "95,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Équipements de protection",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "45,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Formations SST",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "25,000€",
                                  }),
                                ],
                              }),
                              t.jsx("hr", {}),
                              t.jsxs("div", {
                                className: "flex justify-between font-bold",
                                children: [
                                  t.jsx("span", { children: "Total" }),
                                  t.jsx("span", {
                                    className:
                                      "text-[var(--sahtee-blue-primary)]",
                                    children: "345,000€",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, {
                            className: "text-center",
                            children: "Coûts Indirects",
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Absentéisme",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "125,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Perte de productivité",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "89,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Turnover",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "156,000€",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm",
                                    children: "Image de marque",
                                  }),
                                  t.jsx("span", {
                                    className: "font-medium",
                                    children: "35,000€",
                                  }),
                                ],
                              }),
                              t.jsx("hr", {}),
                              t.jsxs("div", {
                                className: "flex justify-between font-bold",
                                children: [
                                  t.jsx("span", { children: "Total" }),
                                  t.jsx("span", {
                                    className: "text-orange-500",
                                    children: "405,000€",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, {
                            className: "text-center",
                            children: "Coût Total SST",
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsxs("div", {
                            className: "text-center space-y-4",
                            children: [
                              t.jsx("div", {
                                className: "text-4xl font-bold text-red-500",
                                children: "750,000€",
                              }),
                              t.jsx("div", {
                                className: "text-sm text-gray-600",
                                children: "Coût annuel total",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  t.jsx("div", {
                                    className: "text-lg font-medium",
                                    children: "5,000€",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-gray-600",
                                    children: "Par employé/an",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  t.jsx("div", {
                                    className: "text-lg font-medium",
                                    children: "2.1%",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-gray-600",
                                    children: "Du chiffre d'affaires",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Évolution des coûts SST",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: t.jsxs("div", {
                          className: "grid lg:grid-cols-2 gap-6",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("h4", {
                                  className: "font-medium mb-3",
                                  children: "Répartition par catégorie",
                                }),
                                t.jsxs("div", {
                                  className: "space-y-3",
                                  children: [
                                    t.jsxs("div", {
                                      children: [
                                        t.jsxs("div", {
                                          className:
                                            "flex justify-between text-sm mb-1",
                                          children: [
                                            t.jsx("span", {
                                              children: "Accidents (46%)",
                                            }),
                                            t.jsx("span", {
                                              children: "345,000€",
                                            }),
                                          ],
                                        }),
                                        t.jsx(fr, {
                                          value: 46,
                                          className: "h-2",
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsxs("div", {
                                          className:
                                            "flex justify-between text-sm mb-1",
                                          children: [
                                            t.jsx("span", {
                                              children: "Coûts indirects (54%)",
                                            }),
                                            t.jsx("span", {
                                              children: "405,000€",
                                            }),
                                          ],
                                        }),
                                        t.jsx(fr, {
                                          value: 54,
                                          className: "h-2 bg-orange-200",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.jsxs("div", {
                              children: [
                                t.jsx("h4", {
                                  className: "font-medium mb-3",
                                  children: "Tendance mensuelle",
                                }),
                                t.jsxs("div", {
                                  className: "text-sm space-y-2",
                                  children: [
                                    t.jsxs("div", {
                                      className: "flex justify-between",
                                      children: [
                                        t.jsx("span", {
                                          children: "Janvier 2024",
                                        }),
                                        t.jsx("span", {
                                          className: "text-red-500",
                                          children: "+12%",
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex justify-between",
                                      children: [
                                        t.jsx("span", {
                                          children: "Décembre 2023",
                                        }),
                                        t.jsx("span", {
                                          className: "text-red-500",
                                          children: "+8%",
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex justify-between",
                                      children: [
                                        t.jsx("span", {
                                          children: "Novembre 2023",
                                        }),
                                        t.jsx("span", {
                                          className: "text-green-500",
                                          children: "-3%",
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex justify-between",
                                      children: [
                                        t.jsx("span", {
                                          children: "Octobre 2023",
                                        }),
                                        t.jsx("span", {
                                          className: "text-green-500",
                                          children: "-7%",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "carbon" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className: "grid lg:grid-cols-2 gap-6",
                  children: [
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsxs(xe, {
                            className: "flex items-center gap-2",
                            children: [
                              t.jsx(Am, {
                                className: "w-5 h-5 text-green-500",
                              }),
                              "Empreinte Carbone SST",
                            ],
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-green-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-3xl font-bold text-green-600",
                                    children:
                                      m.total.value.toLocaleString("fr-FR"),
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-green-700",
                                    children: m.total.unit,
                                  }),
                                  t.jsx("div", {
                                    className: "text-xs text-gray-600 mt-1",
                                    children: "Empreinte totale",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "space-y-3",
                                children: [
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center",
                                    children: [
                                      t.jsx("span", {
                                        className: "text-sm",
                                        children: "Transport employés",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          m.transportation.value,
                                          " ",
                                          m.transportation.unit,
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center",
                                    children: [
                                      t.jsx("span", {
                                        className: "text-sm",
                                        children: "Consommation énergétique",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          m.energy.value,
                                          " ",
                                          m.energy.unit,
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center",
                                    children: [
                                      t.jsx("span", {
                                        className: "text-sm",
                                        children: "Gestion des déchets",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          m.waste.value,
                                          " ",
                                          m.waste.unit,
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center",
                                    children: [
                                      t.jsx("span", {
                                        className: "text-sm",
                                        children: "Empreinte numérique",
                                      }),
                                      t.jsxs("span", {
                                        className: "font-medium",
                                        children: [
                                          m.digitalFootprint.value,
                                          " ",
                                          m.digitalFootprint.unit,
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, {
                            children: "Actions de réduction",
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "p-3 bg-green-50 rounded-lg border-l-4 border-green-500",
                                children: [
                                  t.jsx("h4", {
                                    className: "font-medium text-green-900",
                                    children: "Télétravail",
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-green-700",
                                    children:
                                      "Réduction transport: -180 kg CO₂/mois",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500",
                                children: [
                                  t.jsx("h4", {
                                    className: "font-medium text-blue-900",
                                    children: "Optimisation énergétique",
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-blue-700",
                                    children:
                                      "LED + isolation: -200 kg CO₂/mois",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500",
                                children: [
                                  t.jsx("h4", {
                                    className: "font-medium text-purple-900",
                                    children: "Déchets valorisés",
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-purple-700",
                                    children: "Recyclage: -50 kg CO₂/mois",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500",
                                children: [
                                  t.jsx("h4", {
                                    className: "font-medium text-orange-900",
                                    children: "Dématérialisation",
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-orange-700",
                                    children: "Paperless: -25 kg CO₂/mois",
                                  }),
                                ],
                              }),
                              t.jsx("div", {
                                className: "pt-3 border-t",
                                children: t.jsxs("div", {
                                  className: "text-center",
                                  children: [
                                    t.jsx("div", {
                                      className:
                                        "text-xl font-bold text-green-600",
                                      children: "-455 kg CO₂/mois",
                                    }),
                                    t.jsx("div", {
                                      className: "text-sm text-gray-600",
                                      children: "Réduction potentielle totale",
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Objectifs de réduction carbone",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-6",
                        children: [
                          t.jsxs("div", {
                            children: [
                              t.jsxs("div", {
                                className: "flex justify-between text-sm mb-2",
                                children: [
                                  t.jsx("span", {
                                    children: "Objectif 2024: -20% d'émissions",
                                  }),
                                  t.jsx("span", {
                                    children: "Progression: 65%",
                                  }),
                                ],
                              }),
                              t.jsx(fr, { value: 65, className: "h-3" }),
                              t.jsx("div", {
                                className: "text-xs text-gray-600 mt-1",
                                children:
                                  "Réduction actuelle: 270 kg CO₂/mois sur 415 kg objectif",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "grid lg:grid-cols-3 gap-4",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-gray-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className: "text-xl font-bold",
                                    children: "2,080",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-gray-600",
                                    children: "kg CO₂/mois actuel",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-blue-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-xl font-bold text-[var(--sahtee-blue-primary)]",
                                    children: "1,665",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-blue-700",
                                    children: "kg CO₂/mois objectif",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-green-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-xl font-bold text-green-600",
                                    children: "1,625",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-green-700",
                                    children: "kg CO₂/mois possible",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "benchmarks" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Comparaison sectorielle",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: x.map((g, S) =>
                          t.jsxs(
                            "div",
                            {
                              className:
                                "flex items-center justify-between p-4 bg-gray-50 rounded-lg",
                              children: [
                                t.jsxs("div", {
                                  className: "flex-1",
                                  children: [
                                    t.jsx("h4", {
                                      className: "font-medium",
                                      children: g.category,
                                    }),
                                    t.jsxs("div", {
                                      className: "flex items-center gap-4 mt-1",
                                      children: [
                                        t.jsxs("div", {
                                          className: "text-sm",
                                          children: [
                                            t.jsxs("span", {
                                              className: "text-gray-600",
                                              children: [
                                                "Votre résultat:",
                                                " ",
                                              ],
                                            }),
                                            t.jsxs("span", {
                                              className: `font-medium ${v(
                                                g.status
                                              )}`,
                                              children: [
                                                g.yourValue,
                                                " ",
                                                g.unit,
                                              ],
                                            }),
                                          ],
                                        }),
                                        t.jsxs("div", {
                                          className: "text-sm",
                                          children: [
                                            t.jsxs("span", {
                                              className: "text-gray-600",
                                              children: [
                                                "Moyenne secteur:",
                                                " ",
                                              ],
                                            }),
                                            t.jsxs("span", {
                                              className: "font-medium",
                                              children: [
                                                g.benchmark,
                                                " ",
                                                g.unit,
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    t.jsx(Ne, {
                                      className:
                                        g.status === "good"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800",
                                      children:
                                        g.status === "good"
                                          ? "Bon"
                                          : "À améliorer",
                                    }),
                                    t.jsx("span", {
                                      className: `text-2xl ${v(g.status)}`,
                                      children: N(g.status),
                                    }),
                                  ],
                                }),
                              ],
                            },
                            S
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Positionnement sectoriel",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "grid lg:grid-cols-2 gap-6",
                        children: [
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Performance globale",
                              }),
                              t.jsxs("div", {
                                className: "space-y-3",
                                children: [
                                  t.jsxs("div", {
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex justify-between text-sm mb-1",
                                        children: [
                                          t.jsx("span", {
                                            children: "Score SST global",
                                          }),
                                          t.jsx("span", {
                                            className: "font-medium",
                                            children: "72/100",
                                          }),
                                        ],
                                      }),
                                      t.jsx(fr, {
                                        value: 72,
                                        className: "h-2",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "text-sm text-gray-600",
                                    children: [
                                      "Vous êtes dans le ",
                                      t.jsx("strong", {
                                        children: "75e percentile",
                                      }),
                                      " de votre secteur",
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("h4", {
                                className: "font-medium mb-3",
                                children: "Axes d'amélioration prioritaires",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2 text-sm",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "1. Réduction absentéisme",
                                      }),
                                      t.jsx(Ne, {
                                        className: "bg-red-100 text-red-800",
                                        children: "Priorité 1",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "2. Formation continue",
                                      }),
                                      t.jsx(Ne, {
                                        className:
                                          "bg-orange-100 text-orange-800",
                                        children: "Priorité 2",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "3. Équipements ergonomiques",
                                      }),
                                      t.jsx(Ne, {
                                        className:
                                          "bg-yellow-100 text-yellow-800",
                                        children: "Priorité 3",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function dy() {
  const [s, l] = j.useState("chat"),
    [a, c] = j.useState(""),
    [u, f] = j.useState([
      {
        id: 1,
        type: "bot",
        message:
          "Bonjour ! Je suis l'assistant SAHTEE pour la sécurité chimique. Comment puis-je vous aider aujourd'hui ?",
        timestamp: "2024-01-20 09:00",
      },
      {
        id: 2,
        type: "user",
        message:
          "Quelles sont les précautions pour manipuler l'acide chlorhydrique ?",
        timestamp: "2024-01-20 09:01",
      },
      {
        id: 3,
        type: "bot",
        message: `Pour l'acide chlorhydrique (HCl), voici les précautions essentielles :

🧤 **EPI obligatoires** :
- Gants en nitrile ou néoprène
- Lunettes de sécurité étanches
- Blouse de laboratoire
- Sorbonne ventilée

⚠️ **Dangers** :
- Corrosif pour la peau et les yeux
- Vapeurs irritantes pour les voies respiratoires
- Réaction violente avec les bases

📋 **Stockage** :
- Local ventilé, à température ambiante
- Séparé des bases et métaux
- Contenant étanche et étiqueté

Besoin de plus d'informations sur un point particulier ?`,
        timestamp: "2024-01-20 09:01",
      },
    ]),
    p = [
      {
        id: 1,
        question: "Comment stocker les produits chimiques incompatibles ?",
        answer:
          "Les produits incompatibles doivent être stockés dans des zones séparées avec des systèmes de ventilation indépendants. Utilisez la matrice de compatibilité pour vérifier les incompatibilités.",
        category: "Stockage",
        views: 245,
      },
      {
        id: 2,
        question: "Que faire en cas de déversement d'acide ?",
        answer: `1. Évacuer la zone
2. Porter les EPI appropriés
3. Neutraliser avec un absorbant spécialisé
4. Ventiler la zone
5. Éliminer selon la procédure des déchets dangereux`,
        category: "Urgence",
        views: 189,
      },
      {
        id: 3,
        question: "Quels EPI pour manipuler des solvants ?",
        answer:
          "Pour les solvants organiques : gants en nitrile, lunettes de sécurité, blouse, et travail sous sorbonne. Vérifier la fiche de données de sécurité pour les spécificités.",
        category: "EPI",
        views: 156,
      },
      {
        id: 4,
        question: "Comment interpréter les pictogrammes de danger ?",
        answer:
          "Chaque pictogramme indique un type de danger spécifique. Le rouge indique un danger immédiat, l'orange un danger pour la santé, etc. Consultez la réglementation CLP.",
        category: "Réglementation",
        views: 198,
      },
    ],
    m = [
      { label: "Fiche de sécurité", icon: ln, action: "fds" },
      { label: "Matrice compatibilité", icon: qt, action: "matrix" },
      { label: "Procédure déversement", icon: Pm, action: "spill" },
      { label: "Contact urgence", icon: _o, action: "emergency" },
    ],
    x = [
      { query: "Stockage acétone", time: "Il y a 2h", user: "M. Dubois" },
      {
        query: "EPI manipulation bases",
        time: "Il y a 4h",
        user: "Mme Martin",
      },
      {
        query: "Procédure lavage oculaire",
        time: "Il y a 6h",
        user: "Dr. Petit",
      },
      { query: "Ventilation laboratoire", time: "Hier", user: "J. Durand" },
    ],
    v = () => {
      if (a.trim()) {
        const g = {
          id: u.length + 1,
          type: "user",
          message: a,
          timestamp: new Date().toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        f([...u, g]),
          c(""),
          setTimeout(() => {
            const S = {
              id: u.length + 2,
              type: "bot",
              message:
                "Je traite votre demande concernant la sécurité chimique. Voici les informations pertinentes...",
              timestamp: new Date().toLocaleString("fr-FR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            f((A) => [...A, S]);
          }, 1e3);
      }
    },
    N = (g) => {
      switch (g) {
        case "Stockage":
          return "bg-blue-100 text-blue-800";
        case "Urgence":
          return "bg-red-100 text-red-800";
        case "EPI":
          return "bg-green-100 text-green-800";
        case "Réglementation":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "SafetyBot",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Assistant IA instantané pour la sécurité chimique et réglementaire",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs("div", {
                  className: "flex items-center gap-2 text-sm",
                  children: [
                    t.jsx("div", {
                      className: "w-2 h-2 bg-green-500 rounded-full",
                    }),
                    t.jsx("span", { children: "Assistant en ligne" }),
                  ],
                }),
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(ln, { className: "w-4 h-4 mr-2" }),
                    "Base de connaissances",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "p-6 pb-0",
        children: t.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
          children: [
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Questions traitées",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                          children: "1,247",
                        }),
                      ],
                    }),
                    t.jsx(_o, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Temps de réponse moyen",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-green-500",
                          children: "2.3s",
                        }),
                      ],
                    }),
                    t.jsx(Wn, { className: "w-6 h-6 text-green-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Satisfaction utilisateurs",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-secondary)]",
                          children: "94%",
                        }),
                      ],
                    }),
                    t.jsx(Vn, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-secondary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Substances référencées",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-purple-500",
                          children: "2,856",
                        }),
                      ],
                    }),
                    t.jsx(ln, { className: "w-6 h-6 text-purple-500" }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b px-6",
        children: t.jsxs("div", {
          className: "flex space-x-8",
          children: [
            t.jsxs("button", {
              onClick: () => l("chat"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "chat"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Vn, { className: "w-4 h-4 inline-block mr-2" }),
                "Chat Assistant",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("faq"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "faq"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Pm, { className: "w-4 h-4 inline-block mr-2" }),
                "FAQ Chimique",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("analytics"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "analytics"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(_o, { className: "w-4 h-4 inline-block mr-2" }),
                "Analytiques",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "chat" &&
            t.jsxs("div", {
              className: "grid lg:grid-cols-3 gap-6",
              children: [
                t.jsx("div", {
                  className: "lg:col-span-2",
                  children: t.jsxs(G, {
                    className: "h-[600px] flex flex-col",
                    children: [
                      t.jsx(pe, {
                        className: "border-b",
                        children: t.jsxs(xe, {
                          className: "flex items-center gap-2",
                          children: [
                            t.jsx(Vn, {
                              className:
                                "w-5 h-5 text-[var(--sahtee-blue-primary)]",
                            }),
                            "Assistant Sécurité Chimique",
                          ],
                        }),
                      }),
                      t.jsx(Q, {
                        className: "flex-1 p-0 overflow-hidden",
                        children: t.jsxs("div", {
                          className: "h-full flex flex-col",
                          children: [
                            t.jsx("div", {
                              className: "flex-1 overflow-y-auto p-4 space-y-4",
                              children: u.map((g) =>
                                t.jsx(
                                  "div",
                                  {
                                    className: `flex ${
                                      g.type === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`,
                                    children: t.jsxs("div", {
                                      className: `max-w-[80%] rounded-lg p-3 ${
                                        g.type === "user"
                                          ? "bg-[var(--sahtee-blue-primary)] text-white"
                                          : "bg-gray-100 text-gray-900"
                                      }`,
                                      children: [
                                        t.jsx("div", {
                                          className:
                                            "whitespace-pre-wrap text-sm",
                                          children: g.message,
                                        }),
                                        t.jsx("div", {
                                          className: `text-xs mt-1 ${
                                            g.type === "user"
                                              ? "text-blue-200"
                                              : "text-gray-500"
                                          }`,
                                          children: g.timestamp,
                                        }),
                                      ],
                                    }),
                                  },
                                  g.id
                                )
                              ),
                            }),
                            t.jsx("div", {
                              className: "border-t p-4",
                              children: t.jsxs("div", {
                                className: "flex gap-2",
                                children: [
                                  t.jsx("input", {
                                    type: "text",
                                    value: a,
                                    onChange: (g) => c(g.target.value),
                                    onKeyPress: (g) => g.key === "Enter" && v(),
                                    placeholder:
                                      "Posez votre question sur la sécurité chimique...",
                                    className:
                                      "flex-1 p-2 border rounded-lg text-sm",
                                  }),
                                  t.jsx(Y, {
                                    onClick: v,
                                    className:
                                      "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                    children: t.jsx(Lv, {
                                      className: "w-4 h-4",
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
                t.jsxs("div", {
                  className: "space-y-6",
                  children: [
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, { children: "Actions rapides" }),
                        }),
                        t.jsx(Q, {
                          children: t.jsx("div", {
                            className: "grid grid-cols-2 gap-2",
                            children: m.map((g, S) =>
                              t.jsxs(
                                Y,
                                {
                                  variant: "outline",
                                  size: "sm",
                                  className: "h-auto p-3 flex flex-col gap-1",
                                  children: [
                                    t.jsx(g.icon, { className: "w-4 h-4" }),
                                    t.jsx("span", {
                                      className: "text-xs",
                                      children: g.label,
                                    }),
                                  ],
                                },
                                S
                              )
                            ),
                          }),
                        }),
                      ],
                    }),
                    t.jsxs(G, {
                      children: [
                        t.jsx(pe, {
                          children: t.jsx(xe, {
                            children: "Requêtes récentes",
                          }),
                        }),
                        t.jsx(Q, {
                          children: t.jsx("div", {
                            className: "space-y-3",
                            children: x.map((g, S) =>
                              t.jsxs(
                                "div",
                                {
                                  className: "text-sm",
                                  children: [
                                    t.jsxs("div", {
                                      className:
                                        "font-medium text-[var(--sahtee-blue-primary)]",
                                      children: ['"', g.query, '"'],
                                    }),
                                    t.jsxs("div", {
                                      className: "text-xs text-gray-500",
                                      children: [g.user, " • ", g.time],
                                    }),
                                  ],
                                },
                                S
                              )
                            ),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          s === "faq" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsx("div", {
                  className:
                    "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm",
                  children: t.jsxs("div", {
                    className: "relative flex-1",
                    children: [
                      t.jsx(Kn, {
                        className:
                          "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                      }),
                      t.jsx("input", {
                        type: "text",
                        placeholder: "Rechercher dans la FAQ...",
                        className:
                          "pl-10 pr-4 py-2 border rounded-lg text-sm w-full",
                      }),
                    ],
                  }),
                }),
                t.jsx("div", {
                  className: "space-y-4",
                  children: p.map((g) =>
                    t.jsx(
                      G,
                      {
                        className: "hover:shadow-md transition-shadow",
                        children: t.jsxs(Q, {
                          className: "p-6",
                          children: [
                            t.jsxs("div", {
                              className:
                                "flex items-start justify-between mb-3",
                              children: [
                                t.jsx("h4", {
                                  className: "font-medium text-lg flex-1",
                                  children: g.question,
                                }),
                                t.jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    t.jsx(Ne, {
                                      className: N(g.category),
                                      children: g.category,
                                    }),
                                    t.jsxs("span", {
                                      className: "text-xs text-gray-500",
                                      children: [g.views, " vues"],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.jsx("div", {
                              className:
                                "text-gray-600 whitespace-pre-wrap text-sm leading-relaxed",
                              children: g.answer,
                            }),
                          ],
                        }),
                      },
                      g.id
                    )
                  ),
                }),
              ],
            }),
          s === "analytics" &&
            t.jsx("div", {
              className: "space-y-6",
              children: t.jsxs(G, {
                children: [
                  t.jsx(pe, {
                    children: t.jsx(xe, {
                      children: "Statistiques d'utilisation",
                    }),
                  }),
                  t.jsx(Q, {
                    children: t.jsxs("div", {
                      className: "grid lg:grid-cols-2 gap-6",
                      children: [
                        t.jsxs("div", {
                          children: [
                            t.jsx("h4", {
                              className: "font-medium mb-3",
                              children: "Questions par catégorie",
                            }),
                            t.jsxs("div", {
                              className: "space-y-2",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex justify-between items-center",
                                  children: [
                                    t.jsx("span", {
                                      className: "text-sm",
                                      children: "EPI et protection",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: "35%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex justify-between items-center",
                                  children: [
                                    t.jsx("span", {
                                      className: "text-sm",
                                      children: "Stockage",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: "28%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex justify-between items-center",
                                  children: [
                                    t.jsx("span", {
                                      className: "text-sm",
                                      children: "Procédures d'urgence",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: "20%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex justify-between items-center",
                                  children: [
                                    t.jsx("span", {
                                      className: "text-sm",
                                      children: "Réglementation",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: "17%",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        t.jsxs("div", {
                          children: [
                            t.jsx("h4", {
                              className: "font-medium mb-3",
                              children: "Satisfaction par mois",
                            }),
                            t.jsxs("div", {
                              className: "space-y-2 text-sm",
                              children: [
                                t.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    t.jsx("span", { children: "Janvier 2024" }),
                                    t.jsx("span", {
                                      className: "font-medium text-green-600",
                                      children: "94%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    t.jsx("span", {
                                      children: "Décembre 2023",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium text-green-600",
                                      children: "91%",
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex justify-between",
                                  children: [
                                    t.jsx("span", {
                                      children: "Novembre 2023",
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium text-green-600",
                                      children: "88%",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            }),
        ],
      }),
    ],
  });
}
function uy() {
  const [s, l] = j.useState("epi"),
    [a, c] = j.useState("all"),
    u = [
      {
        id: 1,
        name: "Gants nitrile haute résistance",
        brand: "SafeGuard Pro",
        category: "Gants",
        price: "€45.90",
        rating: 4.8,
        reviews: 124,
        image:
          "https://images.unsplash.com/photo-1635862532821-88bd99afb5dd?w=300&h=200&fit=crop",
        description:
          "Gants jetables en nitrile, résistants aux produits chimiques",
        features: ["Sans poudre", "Résistant chimique", "Grippage renforcé"],
        certifications: ["EN 374", "EN 420"],
        neutral: !0,
      },
      {
        id: 2,
        name: "Masque respiratoire FFP3",
        brand: "ProtectAir",
        category: "Protection respiratoire",
        price: "€12.50",
        rating: 4.6,
        reviews: 89,
        image:
          "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&h=200&fit=crop",
        description: "Masque de protection contre particules fines et aérosols",
        features: [
          "Filtration 99%",
          "Soupape expiratoire",
          "Élastiques confort",
        ],
        certifications: ["EN 149", "FFP3"],
        neutral: !0,
      },
      {
        id: 3,
        name: "Chaussures de sécurité S3",
        brand: "WorkSafe",
        category: "Chaussures",
        price: "€89.99",
        rating: 4.5,
        reviews: 156,
        image:
          "https://images.unsplash.com/photo-1544966503-7cc4ac7b567a?w=300&h=200&fit=crop",
        description:
          "Chaussures hautes avec coque de protection et semelle anti-perforation",
        features: ["Coque composite", "Anti-perforation", "Imperméable"],
        certifications: ["EN ISO 20345", "S3"],
        neutral: !0,
      },
      {
        id: 4,
        name: "Lunettes de protection étanches",
        brand: "ClearVision",
        category: "Protection oculaire",
        price: "€28.75",
        rating: 4.7,
        reviews: 67,
        image:
          "https://images.unsplash.com/photo-1577985051167-0d49aec6c35c?w=300&h=200&fit=crop",
        description: "Lunettes panoramiques avec ventilation indirecte",
        features: ["Anti-buée", "UV400", "Réglables"],
        certifications: ["EN 166"],
        neutral: !0,
      },
    ],
    f = [
      {
        id: 5,
        name: "Support dorsal ergonomique",
        brand: "ErgoSupport",
        category: "Support postural",
        price: "€125.00",
        rating: 4.4,
        reviews: 78,
        image:
          "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=300&h=200&fit=crop",
        description: "Ceinture de maintien lombaire pour travaux physiques",
        features: ["Ajustable", "Respirant", "Support lombaire"],
        certifications: ["ISO 11228"],
        neutral: !0,
      },
      {
        id: 6,
        name: "Tapis anti-fatigue",
        brand: "ComfortFloor",
        category: "Aménagement poste",
        price: "€67.50",
        rating: 4.3,
        reviews: 93,
        image:
          "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=300&h=200&fit=crop",
        description: "Tapis ergonomique pour postes de travail debout",
        features: ["Anti-dérapant", "Mousse mémoire", "Facile entretien"],
        certifications: ["EN ISO 24343"],
        neutral: !0,
      },
      {
        id: 7,
        name: "Aide à la manutention",
        brand: "LiftAssist",
        category: "Manutention",
        price: "€340.00",
        rating: 4.9,
        reviews: 45,
        image:
          "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=300&h=200&fit=crop",
        description: "Système d'assistance pour levage de charges lourdes",
        features: ["Capacité 50kg", "Portable", "Réduction effort 80%"],
        certifications: ["EN 1005"],
        neutral: !0,
      },
      {
        id: 8,
        name: "Siège ergonomique atelier",
        brand: "WorkSeat Pro",
        category: "Assise",
        price: "€245.90",
        rating: 4.6,
        reviews: 112,
        image:
          "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop",
        description: "Siège réglable pour postes de travail industriels",
        features: [
          "Hauteur variable",
          "Support lombaire",
          "Roulettes tout terrain",
        ],
        certifications: ["EN 1335"],
        neutral: !0,
      },
    ],
    p = [
      { id: "all", name: "Tous", count: u.length + f.length },
      { id: "gants", name: "Gants", count: 1 },
      { id: "respiratoire", name: "Protection respiratoire", count: 1 },
      { id: "chaussures", name: "Chaussures", count: 1 },
      { id: "oculaire", name: "Protection oculaire", count: 1 },
      { id: "ergonomie", name: "Ergonomie", count: 4 },
    ],
    m = [
      {
        id: 1,
        title: "Kit protection laboratoire",
        description: "Ensemble complet pour travail en laboratoire chimique",
        products: ["Gants nitrile", "Lunettes étanches", "Masque FFP3"],
        savings: "15%",
        price: "€78.50",
      },
      {
        id: 2,
        title: "Pack ergonomie bureau",
        description: "Solution complète pour améliorer le confort au bureau",
        products: ["Support dorsal", "Tapis anti-fatigue", "Siège ergonomique"],
        savings: "20%",
        price: "€385.90",
      },
    ],
    x = [...u, ...f],
    v = s === "epi" ? u : s === "ergonomy" ? f : x,
    N = ({ product: g }) =>
      t.jsxs(G, {
        className: "group hover:shadow-lg transition-all duration-300",
        children: [
          t.jsxs("div", {
            className: "relative overflow-hidden",
            children: [
              t.jsx("img", {
                src: g.image,
                alt: g.name,
                className:
                  "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300",
              }),
              t.jsx("div", {
                className: "absolute top-2 left-2",
                children:
                  g.neutral &&
                  t.jsx(Ne, {
                    className: "bg-[var(--sahtee-blue-primary)] text-white",
                    children: "Recommandé SAHTEE",
                  }),
              }),
              t.jsx("div", {
                className:
                  "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                children: t.jsx(Y, {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 w-8 p-0 bg-white",
                  children: t.jsx(qs, { className: "w-4 h-4" }),
                }),
              }),
            ],
          }),
          t.jsx(Q, {
            className: "p-4",
            children: t.jsxs("div", {
              className: "space-y-3",
              children: [
                t.jsxs("div", {
                  children: [
                    t.jsx("h4", {
                      className: "font-medium line-clamp-2",
                      children: g.name,
                    }),
                    t.jsx("p", {
                      className: "text-sm text-gray-600",
                      children: g.brand,
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    t.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [
                        t.jsx(Yo, {
                          className: "w-4 h-4 fill-yellow-400 text-yellow-400",
                        }),
                        t.jsx("span", {
                          className: "text-sm font-medium",
                          children: g.rating,
                        }),
                      ],
                    }),
                    t.jsxs("span", {
                      className: "text-xs text-gray-500",
                      children: ["(", g.reviews, " avis)"],
                    }),
                  ],
                }),
                t.jsx("p", {
                  className: "text-xs text-gray-600 line-clamp-2",
                  children: g.description,
                }),
                t.jsx("div", {
                  className: "flex flex-wrap gap-1",
                  children: g.features
                    .slice(0, 2)
                    .map((S, A) =>
                      t.jsx(
                        Ne,
                        {
                          variant: "outline",
                          className: "text-xs",
                          children: S,
                        },
                        A
                      )
                    ),
                }),
                t.jsxs("div", {
                  className: "flex items-center justify-between pt-2",
                  children: [
                    t.jsx("div", {
                      className:
                        "text-lg font-bold text-[var(--sahtee-blue-primary)]",
                      children: g.price,
                    }),
                    t.jsxs("div", {
                      className: "flex gap-1",
                      children: [
                        t.jsx(Y, {
                          size: "sm",
                          variant: "outline",
                          className: "h-8 w-8 p-0",
                          children: t.jsx(tv, { className: "w-4 h-4" }),
                        }),
                        t.jsxs(Y, {
                          size: "sm",
                          className:
                            "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                          children: [
                            t.jsx(zo, { className: "w-4 h-4 mr-1" }),
                            "Ajouter",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      });
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Marketplace SST",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Recommandations neutres d'EPI et solutions ergonomiques",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs("div", {
                  className: "flex items-center gap-2 text-sm",
                  children: [
                    t.jsx(Rm, { className: "w-4 h-4" }),
                    t.jsx("span", { children: "2,856 produits certifiés" }),
                  ],
                }),
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(qs, { className: "w-4 h-4 mr-2" }),
                    "Favoris (12)",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(zo, { className: "w-4 h-4 mr-2" }),
                    "Panier (3)",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsxs("div", {
        className: "flex",
        children: [
          t.jsxs("div", {
            className: "w-64 bg-white border-r min-h-screen p-4",
            children: [
              t.jsxs("div", {
                className: "relative mb-6",
                children: [
                  t.jsx(Kn, {
                    className:
                      "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                  }),
                  t.jsx("input", {
                    type: "text",
                    placeholder: "Rechercher...",
                    className:
                      "pl-10 pr-4 py-2 border rounded-lg text-sm w-full",
                  }),
                ],
              }),
              t.jsxs("div", {
                className: "space-y-2 mb-6",
                children: [
                  t.jsx("h3", {
                    className: "font-medium text-sm text-gray-900 mb-3",
                    children: "Catégories",
                  }),
                  p.map((g) =>
                    t.jsxs(
                      "button",
                      {
                        onClick: () => c(g.id),
                        className: `w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                          a === g.id
                            ? "bg-[var(--sahtee-neutral)] text-[var(--sahtee-blue-primary)]"
                            : "hover:bg-gray-50"
                        }`,
                        children: [
                          t.jsx("span", { children: g.name }),
                          t.jsxs("span", {
                            className: "text-xs text-gray-500",
                            children: ["(", g.count, ")"],
                          }),
                        ],
                      },
                      g.id
                    )
                  ),
                ],
              }),
              t.jsxs("div", {
                className: "space-y-4",
                children: [
                  t.jsx("h3", {
                    className: "font-medium text-sm text-gray-900",
                    children: "Filtres",
                  }),
                  t.jsxs("div", {
                    children: [
                      t.jsx("label", {
                        className:
                          "block text-xs font-medium text-gray-700 mb-2",
                        children: "Prix",
                      }),
                      t.jsxs("div", {
                        className: "space-y-2",
                        children: [
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "Moins de €50",
                            ],
                          }),
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "€50 - €100",
                            ],
                          }),
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "Plus de €100",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  t.jsxs("div", {
                    children: [
                      t.jsx("label", {
                        className:
                          "block text-xs font-medium text-gray-700 mb-2",
                        children: "Certification",
                      }),
                      t.jsxs("div", {
                        className: "space-y-2",
                        children: [
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "EN 374",
                            ],
                          }),
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "EN 166",
                            ],
                          }),
                          t.jsxs("label", {
                            className: "flex items-center text-xs",
                            children: [
                              t.jsx("input", {
                                type: "checkbox",
                                className: "mr-2",
                              }),
                              "ISO 20345",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          t.jsxs("div", {
            className: "flex-1",
            children: [
              t.jsx("div", {
                className: "bg-white border-b px-6",
                children: t.jsxs("div", {
                  className: "flex space-x-8",
                  children: [
                    t.jsxs("button", {
                      onClick: () => l("epi"),
                      className: `py-4 px-2 border-b-2 transition-colors ${
                        s === "epi"
                          ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`,
                      children: [
                        t.jsx(uc, { className: "w-4 h-4 inline-block mr-2" }),
                        "Équipements de Protection",
                      ],
                    }),
                    t.jsxs("button", {
                      onClick: () => l("ergonomy"),
                      className: `py-4 px-2 border-b-2 transition-colors ${
                        s === "ergonomy"
                          ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`,
                      children: [
                        t.jsx(Rm, { className: "w-4 h-4 inline-block mr-2" }),
                        "Solutions Ergonomiques",
                      ],
                    }),
                    t.jsxs("button", {
                      onClick: () => l("recommendations"),
                      className: `py-4 px-2 border-b-2 transition-colors ${
                        s === "recommendations"
                          ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`,
                      children: [
                        t.jsx(Yo, { className: "w-4 h-4 inline-block mr-2" }),
                        "Recommandations",
                      ],
                    }),
                  ],
                }),
              }),
              t.jsx("main", {
                className: "p-6",
                children:
                  s === "recommendations"
                    ? t.jsx("div", {
                        className: "space-y-6",
                        children: t.jsxs(G, {
                          children: [
                            t.jsx(pe, {
                              children: t.jsx(xe, {
                                children: "Packs recommandés SAHTEE",
                              }),
                            }),
                            t.jsx(Q, {
                              children: t.jsx("div", {
                                className: "grid lg:grid-cols-2 gap-6",
                                children: m.map((g) =>
                                  t.jsx(
                                    G,
                                    {
                                      className:
                                        "border-[var(--sahtee-blue-primary)] border-2",
                                      children: t.jsx(Q, {
                                        className: "p-6",
                                        children: t.jsxs("div", {
                                          className: "space-y-4",
                                          children: [
                                            t.jsxs("div", {
                                              className:
                                                "flex items-start justify-between",
                                              children: [
                                                t.jsxs("div", {
                                                  children: [
                                                    t.jsx("h4", {
                                                      className:
                                                        "font-semibold text-lg",
                                                      children: g.title,
                                                    }),
                                                    t.jsx("p", {
                                                      className:
                                                        "text-sm text-gray-600",
                                                      children: g.description,
                                                    }),
                                                  ],
                                                }),
                                                t.jsxs(Ne, {
                                                  className:
                                                    "bg-green-100 text-green-800",
                                                  children: ["-", g.savings],
                                                }),
                                              ],
                                            }),
                                            t.jsxs("div", {
                                              children: [
                                                t.jsx("h5", {
                                                  className:
                                                    "font-medium text-sm mb-2",
                                                  children: "Inclus :",
                                                }),
                                                t.jsx("ul", {
                                                  className: "space-y-1",
                                                  children: g.products.map(
                                                    (S, A) =>
                                                      t.jsxs(
                                                        "li",
                                                        {
                                                          className:
                                                            "text-sm text-gray-600",
                                                          children: ["• ", S],
                                                        },
                                                        A
                                                      )
                                                  ),
                                                }),
                                              ],
                                            }),
                                            t.jsxs("div", {
                                              className:
                                                "flex items-center justify-between pt-4 border-t",
                                              children: [
                                                t.jsx("div", {
                                                  className:
                                                    "text-xl font-bold text-[var(--sahtee-blue-primary)]",
                                                  children: g.price,
                                                }),
                                                t.jsxs(Y, {
                                                  className:
                                                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                                  children: [
                                                    t.jsx(zo, {
                                                      className: "w-4 h-4 mr-2",
                                                    }),
                                                    "Ajouter le pack",
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      }),
                                    },
                                    g.id
                                  )
                                ),
                              }),
                            }),
                          ],
                        }),
                      })
                    : t.jsxs("div", {
                        className: "space-y-6",
                        children: [
                          t.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("h2", {
                                    className: "text-xl font-semibold",
                                    children:
                                      s === "epi"
                                        ? "Équipements de Protection Individuelle"
                                        : "Solutions Ergonomiques",
                                  }),
                                  t.jsxs("p", {
                                    className: "text-gray-600",
                                    children: [v.length, " produits trouvés"],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  t.jsx("span", {
                                    className: "text-sm text-gray-600",
                                    children: "Trier par :",
                                  }),
                                  t.jsxs("select", {
                                    className:
                                      "border rounded px-3 py-1 text-sm",
                                    children: [
                                      t.jsx("option", {
                                        children: "Recommandés",
                                      }),
                                      t.jsx("option", {
                                        children: "Prix croissant",
                                      }),
                                      t.jsx("option", {
                                        children: "Prix décroissant",
                                      }),
                                      t.jsx("option", {
                                        children: "Mieux notés",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsx("div", {
                            className:
                              "grid lg:grid-cols-3 xl:grid-cols-4 gap-6",
                            children: v.map((g) =>
                              t.jsx(N, { product: g }, g.id)
                            ),
                          }),
                        ],
                      }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function my() {
  const [s, l] = j.useState("incidents"),
    a = [
      {
        id: 1,
        title: "Glissade dans l'entrepôt",
        location: "Zone C - Entrepôt",
        reporter: "Jean Dupont",
        reportedAt: "2024-01-20 14:30",
        severity: "Moyen",
        status: "En traitement",
        description: "Sol glissant près de la zone de livraison",
        photos: 2,
        qrCodeUsed: !0,
      },
      {
        id: 2,
        title: "Fuite produit chimique",
        location: "Laboratoire A",
        reporter: "Marie Martin",
        reportedAt: "2024-01-20 09:15",
        severity: "Élevé",
        status: "Résolu",
        description: "Fuite mineure d'acide chlorhydrique",
        photos: 3,
        qrCodeUsed: !1,
      },
      {
        id: 3,
        title: "Équipement défaillant",
        location: "Atelier B - Poste 3",
        reporter: "Paul Dubois",
        reportedAt: "2024-01-19 16:45",
        severity: "Faible",
        status: "En attente",
        description: "Protection manquante sur machine",
        photos: 1,
        qrCodeUsed: !0,
      },
    ],
    c = [
      {
        id: 1,
        title: "Rappel formation obligatoire",
        message: "Votre formation 'Manipulation Chimique' expire dans 7 jours",
        type: "warning",
        sentAt: "2024-01-20 08:00",
        sent: 156,
        opened: 142,
      },
      {
        id: 2,
        title: "Nouvel incident déclaré",
        message: "Un incident a été signalé en Zone C - Entrepôt",
        type: "alert",
        sentAt: "2024-01-20 14:35",
        sent: 23,
        opened: 18,
      },
      {
        id: 3,
        title: "Quiz sécurité mensuel",
        message: "Le quiz de janvier est maintenant disponible",
        type: "info",
        sentAt: "2024-01-15 09:00",
        sent: 245,
        opened: 198,
      },
    ],
    u = [
      {
        id: 1,
        title: "Sécurité en laboratoire",
        questions: 10,
        duration: "5 min",
        completed: 23,
        total: 45,
        averageScore: 87,
        active: !0,
      },
      {
        id: 2,
        title: "Gestes et postures",
        questions: 8,
        duration: "3 min",
        completed: 45,
        total: 45,
        averageScore: 92,
        active: !1,
      },
    ],
    f = (x) => {
      switch (x) {
        case "Élevé":
          return "bg-red-100 text-red-800";
        case "Moyen":
          return "bg-orange-100 text-orange-800";
        case "Faible":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    p = (x) => {
      switch (x) {
        case "Résolu":
          return "bg-green-100 text-green-800";
        case "En traitement":
          return "bg-blue-100 text-blue-800";
        case "En attente":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    m = (x) => {
      switch (x) {
        case "alert":
          return "border-red-200 bg-red-50";
        case "warning":
          return "border-orange-200 bg-orange-50";
        case "info":
          return "border-blue-200 bg-blue-50";
        default:
          return "border-gray-200 bg-gray-50";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Application Mobile & QR Code",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Déclaration d'incidents, notifications et quiz interactifs",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                    "Rapport mobile",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(To, { className: "w-4 h-4 mr-2" }),
                    "Générer QR Code",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "p-6 pb-0",
        children: t.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
          children: [
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Incidents déclarés",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                          children: a.length,
                        }),
                      ],
                    }),
                    t.jsx(qt, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Utilisateurs actifs",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-green-500",
                          children: "156",
                        }),
                      ],
                    }),
                    t.jsx(tr, { className: "w-6 h-6 text-green-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "QR Codes scannés",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-secondary)]",
                          children: "89",
                        }),
                      ],
                    }),
                    t.jsx(To, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-secondary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Taux d'ouverture notif.",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-purple-500",
                          children: "84%",
                        }),
                      ],
                    }),
                    t.jsx(Wo, { className: "w-6 h-6 text-purple-500" }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b px-6",
        children: t.jsxs("div", {
          className: "flex space-x-8",
          children: [
            t.jsxs("button", {
              onClick: () => l("incidents"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "incidents"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(qt, { className: "w-4 h-4 inline-block mr-2" }),
                "Incidents déclarés",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("notifications"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "notifications"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Wo, { className: "w-4 h-4 inline-block mr-2" }),
                "Notifications",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("quizzes"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "quizzes"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(vt, { className: "w-4 h-4 inline-block mr-2" }),
                "Quiz",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "incidents" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Incidents déclarés via l'application mobile",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: a.map((x) =>
                          t.jsx(
                            "div",
                            {
                              className:
                                "border rounded-lg p-4 hover:bg-gray-50",
                              children: t.jsxs("div", {
                                className:
                                  "flex items-start justify-between mb-3",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex-1",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-2 mb-2",
                                        children: [
                                          t.jsx("h4", {
                                            className: "font-medium",
                                            children: x.title,
                                          }),
                                          t.jsx(Ne, {
                                            className: f(x.severity),
                                            children: x.severity,
                                          }),
                                          t.jsx(Ne, {
                                            className: p(x.status),
                                            children: x.status,
                                          }),
                                          x.qrCodeUsed &&
                                            t.jsxs(Ne, {
                                              variant: "outline",
                                              className:
                                                "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]",
                                              children: [
                                                t.jsx(To, {
                                                  className: "w-3 h-3 mr-1",
                                                }),
                                                "QR Code",
                                              ],
                                            }),
                                        ],
                                      }),
                                      t.jsx("p", {
                                        className: "text-sm text-gray-600 mb-2",
                                        children: x.description,
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-4 text-xs text-gray-500",
                                        children: [
                                          t.jsxs("div", {
                                            className:
                                              "flex items-center gap-1",
                                            children: [
                                              t.jsx(kf, {
                                                className: "w-3 h-3",
                                              }),
                                              t.jsx("span", {
                                                children: x.location,
                                              }),
                                            ],
                                          }),
                                          t.jsxs("div", {
                                            className:
                                              "flex items-center gap-1",
                                            children: [
                                              t.jsx(tr, {
                                                className: "w-3 h-3",
                                              }),
                                              t.jsxs("span", {
                                                children: [
                                                  "Signalé par ",
                                                  x.reporter,
                                                ],
                                              }),
                                            ],
                                          }),
                                          t.jsxs("div", {
                                            className:
                                              "flex items-center gap-1",
                                            children: [
                                              t.jsx(Mg, {
                                                className: "w-3 h-3",
                                              }),
                                              t.jsxs("span", {
                                                children: [
                                                  x.photos,
                                                  " photo(s)",
                                                ],
                                              }),
                                            ],
                                          }),
                                          t.jsx("span", {
                                            children: x.reportedAt,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsx(Y, {
                                    size: "sm",
                                    variant: "outline",
                                    children: "Voir détails",
                                  }),
                                ],
                              }),
                            },
                            x.id
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, { children: "Gestion des QR Codes" }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "grid lg:grid-cols-2 gap-6",
                        children: [
                          t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "QR Codes actifs par zone",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children: "Entrepôt - Zone A",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "12 QR Codes",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children: "Laboratoire",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "8 QR Codes",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children: "Atelier Production",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "15 QR Codes",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-4",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Utilisation cette semaine",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2 text-sm",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "QR Codes scannés",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "89",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "Incidents déclarés via QR",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "2",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                      t.jsx("span", {
                                        children: "Quiz commencés via QR",
                                      }),
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "34",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "notifications" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Notifications push envoyées",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: c.map((x) =>
                          t.jsx(
                            "div",
                            {
                              className: `border rounded-lg p-4 ${m(x.type)}`,
                              children: t.jsxs("div", {
                                className:
                                  "flex items-start justify-between mb-3",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex-1",
                                    children: [
                                      t.jsx("h4", {
                                        className: "font-medium mb-1",
                                        children: x.title,
                                      }),
                                      t.jsx("p", {
                                        className: "text-sm text-gray-600 mb-2",
                                        children: x.message,
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-4 text-xs text-gray-500",
                                        children: [
                                          t.jsxs("span", {
                                            children: ["Envoyé le ", x.sentAt],
                                          }),
                                          t.jsxs("span", {
                                            children: [
                                              x.sent,
                                              " destinataires",
                                            ],
                                          }),
                                          t.jsxs("span", {
                                            children: [
                                              x.opened,
                                              " ouvertures (",
                                              Math.round(
                                                (x.opened / x.sent) * 100
                                              ),
                                              "%)",
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                      t.jsx(Y, {
                                        size: "sm",
                                        variant: "outline",
                                        children: "Statistiques",
                                      }),
                                      t.jsx(Y, {
                                        size: "sm",
                                        variant: "outline",
                                        children: "Renvoyer",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            },
                            x.id
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Envoyer une nouvelle notification",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "grid lg:grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-2",
                                    children: "Titre",
                                  }),
                                  t.jsx("input", {
                                    type: "text",
                                    placeholder: "Titre de la notification",
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-2",
                                    children: "Type",
                                  }),
                                  t.jsxs("select", {
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    children: [
                                      t.jsx("option", {
                                        value: "info",
                                        children: "Information",
                                      }),
                                      t.jsx("option", {
                                        value: "warning",
                                        children: "Avertissement",
                                      }),
                                      t.jsx("option", {
                                        value: "alert",
                                        children: "Alerte",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("label", {
                                className: "block text-sm font-medium mb-2",
                                children: "Message",
                              }),
                              t.jsx("textarea", {
                                placeholder: "Contenu de la notification",
                                className:
                                  "w-full p-2 border rounded-lg text-sm h-24",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "flex justify-end gap-2",
                            children: [
                              t.jsx(Y, {
                                variant: "outline",
                                children: "Programmer",
                              }),
                              t.jsx(Y, {
                                className:
                                  "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                children: "Envoyer maintenant",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "quizzes" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, { children: "Quiz de sécurité" }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: u.map((x) =>
                          t.jsx(
                            "div",
                            {
                              className:
                                "border rounded-lg p-4 hover:bg-gray-50",
                              children: t.jsxs("div", {
                                className:
                                  "flex items-center justify-between mb-3",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex-1",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-2 mb-2",
                                        children: [
                                          t.jsx("h4", {
                                            className: "font-medium",
                                            children: x.title,
                                          }),
                                          t.jsx(Ne, {
                                            className: x.active
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800",
                                            children: x.active
                                              ? "Actif"
                                              : "Terminé",
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center gap-4 text-sm text-gray-600",
                                        children: [
                                          t.jsxs("span", {
                                            children: [
                                              x.questions,
                                              " questions",
                                            ],
                                          }),
                                          t.jsxs("span", {
                                            children: ["Durée: ", x.duration],
                                          }),
                                          t.jsxs("span", {
                                            children: [
                                              "Complété: ",
                                              x.completed,
                                              "/",
                                              x.total,
                                            ],
                                          }),
                                          t.jsxs("span", {
                                            children: [
                                              "Score moyen: ",
                                              x.averageScore,
                                              "%",
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                      t.jsx(Y, {
                                        size: "sm",
                                        variant: "outline",
                                        children: "Voir résultats",
                                      }),
                                      x.active &&
                                        t.jsx(Y, {
                                          size: "sm",
                                          className:
                                            "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                          children: "Modifier",
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                            },
                            x.id
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Créer un nouveau quiz",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "grid lg:grid-cols-2 gap-4",
                            children: [
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-2",
                                    children: "Titre du quiz",
                                  }),
                                  t.jsx("input", {
                                    type: "text",
                                    placeholder: "Ex: Sécurité incendie",
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("label", {
                                    className: "block text-sm font-medium mb-2",
                                    children: "Catégorie",
                                  }),
                                  t.jsxs("select", {
                                    className:
                                      "w-full p-2 border rounded-lg text-sm",
                                    children: [
                                      t.jsx("option", {
                                        value: "security",
                                        children: "Sécurité",
                                      }),
                                      t.jsx("option", {
                                        value: "ergonomics",
                                        children: "Ergonomie",
                                      }),
                                      t.jsx("option", {
                                        value: "chemical",
                                        children: "Chimique",
                                      }),
                                      t.jsx("option", {
                                        value: "general",
                                        children: "Général",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "flex justify-end gap-2",
                            children: [
                              t.jsx(Y, {
                                variant: "outline",
                                children: "Enregistrer brouillon",
                              }),
                              t.jsx(Y, {
                                className:
                                  "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                children: "Créer & Publier",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function fy() {
  const [s, l] = j.useState("overview"),
    a = [
      { category: "TMS", cases: 15, trend: "+12%", color: "bg-red-500" },
      {
        category: "Troubles respiratoires",
        cases: 8,
        trend: "-5%",
        color: "bg-orange-500",
      },
      {
        category: "Allergies professionnelles",
        cases: 6,
        trend: "+8%",
        color: "bg-yellow-500",
      },
      {
        category: "Fatigue chronique",
        cases: 12,
        trend: "+15%",
        color: "bg-purple-500",
      },
      {
        category: "Troubles auditifs",
        cases: 4,
        trend: "0%",
        color: "bg-blue-500",
      },
      {
        category: "Stress professionnel",
        cases: 18,
        trend: "+22%",
        color: "bg-indigo-500",
      },
    ],
    c = [
      {
        id: 1,
        employeeId: "EMP001",
        employeeName: "Marie Dubois",
        department: "Production",
        conditions: ["TMS - Épaule droite", "Allergie latex"],
        lastVisit: "2024-01-15",
        nextVisit: "2024-07-15",
        restrictions: ["Port charges &gt; 10kg", "Éviter contact latex"],
        status: "Suivi actif",
      },
      {
        id: 2,
        employeeId: "EMP002",
        employeeName: "Jean Martin",
        department: "Laboratoire",
        conditions: ["Trouble respiratoire", "Dermatite contact"],
        lastVisit: "2024-01-10",
        nextVisit: "2024-04-10",
        restrictions: ["Poste ventilé obligatoire", "Gants nitrile"],
        status: "Amélioration",
      },
      {
        id: 3,
        employeeId: "EMP003",
        employeeName: "Sophie Durand",
        department: "Administration",
        conditions: ["Stress professionnel", "Fatigue chronique"],
        lastVisit: "2024-01-08",
        nextVisit: "2024-03-08",
        restrictions: ["Pauses fréquentes", "Télétravail 2j/sem"],
        status: "Surveillance",
      },
    ],
    u = [
      {
        substance: "Poussières de silice",
        exposedWorkers: 23,
        limit: "0.05 mg/m³",
        currentLevel: "0.03 mg/m³",
        riskLevel: "Faible",
        lastMeasurement: "2024-01-10",
      },
      {
        substance: "Bruit",
        exposedWorkers: 67,
        limit: "85 dB(A)",
        currentLevel: "78 dB(A)",
        riskLevel: "Acceptable",
        lastMeasurement: "2024-01-15",
      },
      {
        substance: "Vapeurs de solvants",
        exposedWorkers: 12,
        limit: "50 ppm",
        currentLevel: "45 ppm",
        riskLevel: "Modéré",
        lastMeasurement: "2024-01-12",
      },
      {
        substance: "Vibrations main-bras",
        exposedWorkers: 34,
        limit: "2.5 m/s²",
        currentLevel: "1.8 m/s²",
        riskLevel: "Faible",
        lastMeasurement: "2024-01-18",
      },
    ],
    f = (m) => {
      switch (m) {
        case "Faible":
          return "bg-green-100 text-green-800";
        case "Acceptable":
          return "bg-blue-100 text-blue-800";
        case "Modéré":
          return "bg-orange-100 text-orange-800";
        case "Élevé":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    p = (m) => {
      switch (m) {
        case "Suivi actif":
          return "bg-orange-100 text-orange-800";
        case "Amélioration":
          return "bg-green-100 text-green-800";
        case "Surveillance":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Health Meter",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children:
                    "Surveillance de la santé collective et suivi des maladies professionnelles",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                    "Rapport santé",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(ln, { className: "w-4 h-4 mr-2" }),
                    "Nouvelle déclaration",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "p-6 pb-0",
        children: t.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
          children: [
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Cas actifs",
                        }),
                        t.jsx("p", {
                          className:
                            "text-2xl font-bold text-[var(--sahtee-blue-primary)]",
                          children: "63",
                        }),
                      ],
                    }),
                    t.jsx(qs, {
                      className: "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Employés sous surveillance",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-orange-500",
                          children: "89",
                        }),
                      ],
                    }),
                    t.jsx(tr, { className: "w-6 h-6 text-orange-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Évolution mensuelle",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-red-500",
                          children: "+12%",
                        }),
                      ],
                    }),
                    t.jsx(er, { className: "w-6 h-6 text-red-500" }),
                  ],
                }),
              }),
            }),
            t.jsx(G, {
              children: t.jsx(Q, {
                className: "p-4",
                children: t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      children: [
                        t.jsx("p", {
                          className: "text-sm text-gray-600",
                          children: "Alertes expositions",
                        }),
                        t.jsx("p", {
                          className: "text-2xl font-bold text-yellow-500",
                          children: "3",
                        }),
                      ],
                    }),
                    t.jsx(il, { className: "w-6 h-6 text-yellow-500" }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b px-6",
        children: t.jsxs("div", {
          className: "flex space-x-8",
          children: [
            t.jsxs("button", {
              onClick: () => l("overview"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "overview"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(er, { className: "w-4 h-4 inline-block mr-2" }),
                "Vue d'ensemble",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("files"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "files"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(ln, { className: "w-4 h-4 inline-block mr-2" }),
                "Fiches médicales",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("exposure"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "exposure"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(il, { className: "w-4 h-4 inline-block mr-2" }),
                "Expositions",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "overview" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Répartition des maladies professionnelles",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "grid lg:grid-cols-2 gap-6",
                        children: a.map((m, x) =>
                          t.jsxs(
                            "div",
                            {
                              className:
                                "flex items-center justify-between p-4 bg-gray-50 rounded-lg",
                              children: [
                                t.jsxs("div", {
                                  className: "flex items-center gap-3",
                                  children: [
                                    t.jsx("div", {
                                      className: `w-4 h-4 rounded-full ${m.color}`,
                                    }),
                                    t.jsx("span", {
                                      className: "font-medium",
                                      children: m.category,
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex items-center gap-3",
                                  children: [
                                    t.jsx("span", {
                                      className: "text-lg font-bold",
                                      children: m.cases,
                                    }),
                                    t.jsx(Ne, {
                                      className: m.trend.startsWith("+")
                                        ? "bg-red-100 text-red-800"
                                        : m.trend.startsWith("-")
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800",
                                      children: m.trend,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            x
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Évolution de la santé collective",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className: "grid lg:grid-cols-3 gap-4",
                            children: [
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-red-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-red-600",
                                    children: "+15%",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-red-700",
                                    children: "TMS ce trimestre",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-orange-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-orange-600",
                                    children: "8.2%",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-orange-700",
                                    children: "Taux absentéisme santé",
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className:
                                  "text-center p-4 bg-blue-50 rounded-lg",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-blue-600",
                                    children: "72h",
                                  }),
                                  t.jsx("div", {
                                    className: "text-sm text-blue-700",
                                    children: "Durée moyenne arrêt",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              t.jsx("h4", {
                                className: "font-medium",
                                children: "Actions prioritaires",
                              }),
                              t.jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children:
                                          "Révision postes de travail (TMS)",
                                      }),
                                      t.jsx(Ne, {
                                        className: "bg-red-100 text-red-800",
                                        children: "Urgent",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children:
                                          "Formation gestes et postures",
                                      }),
                                      t.jsx(Ne, {
                                        className:
                                          "bg-orange-100 text-orange-800",
                                        children: "Important",
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex justify-between items-center p-3 bg-gray-50 rounded",
                                    children: [
                                      t.jsx("span", {
                                        children:
                                          "Amélioration ventilation zones chimiques",
                                      }),
                                      t.jsx(Ne, {
                                        className:
                                          "bg-yellow-100 text-yellow-800",
                                        children: "Planifié",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          s === "files" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className:
                    "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm",
                  children: [
                    t.jsxs("div", {
                      className: "relative flex-1",
                      children: [
                        t.jsx(Kn, {
                          className:
                            "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                        }),
                        t.jsx("input", {
                          type: "text",
                          placeholder: "Rechercher un employé...",
                          className:
                            "pl-10 pr-4 py-2 border rounded-lg text-sm w-full",
                        }),
                      ],
                    }),
                    t.jsxs(Y, {
                      variant: "outline",
                      size: "sm",
                      children: [
                        t.jsx(wl, { className: "w-4 h-4 mr-2" }),
                        "Filtres",
                      ],
                    }),
                  ],
                }),
                t.jsx("div", {
                  className: "space-y-4",
                  children: c.map((m) =>
                    t.jsx(
                      G,
                      {
                        className: "hover:shadow-md transition-shadow",
                        children: t.jsx(Q, {
                          className: "p-6",
                          children: t.jsxs("div", {
                            className: "flex items-start justify-between mb-4",
                            children: [
                              t.jsxs("div", {
                                className: "flex-1",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [
                                      t.jsx("h4", {
                                        className: "font-semibold",
                                        children: m.employeeName,
                                      }),
                                      t.jsxs("span", {
                                        className: "text-sm text-gray-500",
                                        children: ["(", m.employeeId, ")"],
                                      }),
                                      t.jsx(Ne, {
                                        className: p(m.status),
                                        children: m.status,
                                      }),
                                    ],
                                  }),
                                  t.jsx("p", {
                                    className: "text-sm text-gray-600 mb-3",
                                    children: m.department,
                                  }),
                                  t.jsxs("div", {
                                    className: "grid lg:grid-cols-2 gap-4",
                                    children: [
                                      t.jsxs("div", {
                                        children: [
                                          t.jsx("h5", {
                                            className:
                                              "font-medium text-sm mb-2",
                                            children: "Conditions médicales",
                                          }),
                                          t.jsx("div", {
                                            className: "space-y-1",
                                            children: m.conditions.map((x, v) =>
                                              t.jsx(
                                                "div",
                                                {
                                                  className:
                                                    "text-sm text-red-700 bg-red-50 px-2 py-1 rounded",
                                                  children: x,
                                                },
                                                v
                                              )
                                            ),
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        children: [
                                          t.jsx("h5", {
                                            className:
                                              "font-medium text-sm mb-2",
                                            children: "Restrictions de poste",
                                          }),
                                          t.jsx("div", {
                                            className: "space-y-1",
                                            children: m.restrictions.map(
                                              (x, v) =>
                                                t.jsx(
                                                  "div",
                                                  {
                                                    className:
                                                      "text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded",
                                                    children: x,
                                                  },
                                                  v
                                                )
                                            ),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className:
                                      "flex items-center gap-4 mt-4 text-xs text-gray-500",
                                    children: [
                                      t.jsxs("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                          t.jsx(Go, { className: "w-3 h-3" }),
                                          t.jsxs("span", {
                                            children: [
                                              "Dernière visite: ",
                                              m.lastVisit,
                                            ],
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                          t.jsx(Go, { className: "w-3 h-3" }),
                                          t.jsxs("span", {
                                            children: [
                                              "Prochaine visite: ",
                                              m.nextVisit,
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex gap-2",
                                children: [
                                  t.jsx(Y, {
                                    size: "sm",
                                    variant: "outline",
                                    children: "Voir dossier",
                                  }),
                                  t.jsx(Y, {
                                    size: "sm",
                                    className:
                                      "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                    children: "Modifier",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      },
                      m.id
                    )
                  ),
                }),
              ],
            }),
          s === "exposure" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Suivi des expositions professionnelles",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsx("div", {
                        className: "space-y-4",
                        children: u.map((m, x) =>
                          t.jsxs(
                            "div",
                            {
                              className: "border rounded-lg p-4",
                              children: [
                                t.jsxs("div", {
                                  className:
                                    "flex items-center justify-between mb-3",
                                  children: [
                                    t.jsxs("div", {
                                      className: "flex-1",
                                      children: [
                                        t.jsx("h4", {
                                          className: "font-medium",
                                          children: m.substance,
                                        }),
                                        t.jsxs("p", {
                                          className: "text-sm text-gray-600",
                                          children: [
                                            m.exposedWorkers,
                                            " travailleurs exposés",
                                          ],
                                        }),
                                      ],
                                    }),
                                    t.jsx(Ne, {
                                      className: f(m.riskLevel),
                                      children: m.riskLevel,
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className:
                                    "grid lg:grid-cols-4 gap-4 text-sm",
                                  children: [
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-gray-600",
                                          children: "Limite réglementaire",
                                        }),
                                        t.jsx("div", {
                                          className: "font-medium",
                                          children: m.limit,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-gray-600",
                                          children: "Niveau actuel",
                                        }),
                                        t.jsx("div", {
                                          className: "font-medium",
                                          children: m.currentLevel,
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      children: [
                                        t.jsx("span", {
                                          className: "text-gray-600",
                                          children: "Dernière mesure",
                                        }),
                                        t.jsx("div", {
                                          className: "font-medium",
                                          children: m.lastMeasurement,
                                        }),
                                      ],
                                    }),
                                    t.jsx("div", {
                                      className: "flex justify-end",
                                      children: t.jsx(Y, {
                                        size: "sm",
                                        variant: "outline",
                                        children: "Voir historique",
                                      }),
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "mt-3",
                                  children: [
                                    t.jsxs("div", {
                                      className:
                                        "flex justify-between text-xs mb-1",
                                      children: [
                                        t.jsx("span", {
                                          children: "Niveau d'exposition",
                                        }),
                                        t.jsxs("span", {
                                          children: [
                                            Math.round(
                                              (parseFloat(m.currentLevel) /
                                                parseFloat(m.limit)) *
                                                100
                                            ),
                                            "% de la limite",
                                          ],
                                        }),
                                      ],
                                    }),
                                    t.jsx(fr, {
                                      value:
                                        (parseFloat(m.currentLevel) /
                                          parseFloat(m.limit)) *
                                        100,
                                      className: "h-2",
                                    }),
                                  ],
                                }),
                              ],
                            },
                            x
                          )
                        ),
                      }),
                    }),
                  ],
                }),
                t.jsxs(G, {
                  children: [
                    t.jsx(pe, {
                      children: t.jsx(xe, {
                        children: "Alertes et recommandations",
                      }),
                    }),
                    t.jsx(Q, {
                      children: t.jsxs("div", {
                        className: "space-y-3",
                        children: [
                          t.jsxs("div", {
                            className:
                              "flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500",
                            children: [
                              t.jsx(il, {
                                className: "w-4 h-4 text-orange-500 mt-0.5",
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("p", {
                                    className:
                                      "text-sm font-medium text-orange-900",
                                    children:
                                      "Vapeurs de solvants - Niveau modéré",
                                  }),
                                  t.jsx("p", {
                                    className: "text-xs text-orange-700",
                                    children:
                                      "Révision du système de ventilation recommandée",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500",
                            children: [
                              t.jsx(il, {
                                className: "w-4 h-4 text-green-500 mt-0.5",
                              }),
                              t.jsxs("div", {
                                children: [
                                  t.jsx("p", {
                                    className:
                                      "text-sm font-medium text-green-900",
                                    children: "Bruit - Niveau acceptable",
                                  }),
                                  t.jsx("p", {
                                    className: "text-xs text-green-700",
                                    children:
                                      "Maintenir les mesures de protection actuelles",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function hy() {
  const [s, l] = j.useState("catalog"),
    a = [
      {
        id: 1,
        title: "Manipulation Manuelle des Charges",
        description:
          "Techniques de manutention sécurisée et prévention des TMS",
        category: "Ergonomie",
        duration: "2h 30min",
        level: "Débutant",
        rating: 4.8,
        enrolled: 24,
        completed: 18,
        thumbnail:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
        modules: 8,
        certifiable: !0,
        mandatory: !0,
      },
      {
        id: 2,
        title: "Sécurité Chimique en Laboratoire",
        description:
          "Manipulation sécurisée des produits chimiques et équipements de protection",
        category: "Chimique",
        duration: "3h 15min",
        level: "Intermédiaire",
        rating: 4.9,
        enrolled: 12,
        completed: 8,
        thumbnail:
          "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=200&fit=crop",
        modules: 12,
        certifiable: !0,
        mandatory: !0,
      },
      {
        id: 3,
        title: "Conduite en Sécurité d'Équipements",
        description:
          "Utilisation sécurisée des machines et équipements industriels",
        category: "Machines",
        duration: "4h 00min",
        level: "Avancé",
        rating: 4.7,
        enrolled: 8,
        completed: 5,
        thumbnail:
          "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=300&h=200&fit=crop",
        modules: 15,
        certifiable: !0,
        mandatory: !1,
      },
      {
        id: 4,
        title: "Gestion du Stress au Travail",
        description:
          "Techniques de gestion du stress et prévention des risques psychosociaux",
        category: "Psychosocial",
        duration: "1h 45min",
        level: "Débutant",
        rating: 4.6,
        enrolled: 32,
        completed: 28,
        thumbnail:
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop",
        modules: 6,
        certifiable: !1,
        mandatory: !1,
      },
    ],
    c = [
      {
        id: 1,
        courseId: 1,
        progress: 75,
        lastAccessed: "2024-01-20",
        completedModules: 6,
        totalModules: 8,
        status: "En cours",
        certificateEarned: !1,
      },
      {
        id: 2,
        courseId: 2,
        progress: 100,
        lastAccessed: "2024-01-15",
        completedModules: 12,
        totalModules: 12,
        status: "Terminé",
        certificateEarned: !0,
      },
    ],
    u = [
      {
        id: 1,
        courseName: "Sécurité Chimique en Laboratoire",
        issuedDate: "2024-01-15",
        expiryDate: "2025-01-15",
        certificateNumber: "SCHT-2024-001",
        status: "Valide",
      },
      {
        id: 2,
        courseName: "Manipulation Manuelle des Charges",
        issuedDate: "2023-06-10",
        expiryDate: "2024-06-10",
        certificateNumber: "MMC-2023-024",
        status: "Expire bientôt",
      },
    ],
    f = (m) => {
      switch (m) {
        case "Ergonomie":
          return "bg-blue-100 text-blue-800";
        case "Chimique":
          return "bg-orange-100 text-orange-800";
        case "Machines":
          return "bg-green-100 text-green-800";
        case "Psychosocial":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
    p = (m) => {
      switch (m) {
        case "Débutant":
          return "bg-green-50 text-green-700";
        case "Intermédiaire":
          return "bg-yellow-50 text-yellow-700";
        case "Avancé":
          return "bg-red-50 text-red-700";
        default:
          return "bg-gray-50 text-gray-700";
      }
    };
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)]",
    children: [
      t.jsx("header", {
        className: "bg-white shadow-sm border-b p-4",
        children: t.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            t.jsxs("div", {
              children: [
                t.jsx("h1", {
                  className: "text-2xl text-gray-900",
                  children: "Formation Continue",
                }),
                t.jsx("p", {
                  className: "text-gray-600",
                  children: "Système de gestion de l'apprentissage (LMS)",
                }),
              ],
            }),
            t.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                t.jsxs(Y, {
                  variant: "outline",
                  size: "sm",
                  children: [
                    t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                    "Rapport formations",
                  ],
                }),
                t.jsxs(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                  children: [
                    t.jsx(Gn, { className: "w-4 h-4 mr-2" }),
                    "Nouvelle formation",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      t.jsx("div", {
        className: "bg-white border-b",
        children: t.jsxs("div", {
          className: "flex space-x-8 px-6",
          children: [
            t.jsxs("button", {
              onClick: () => l("catalog"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "catalog"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(Mo, { className: "w-4 h-4 inline-block mr-2" }),
                "Catalogue",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("mytrainings"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "mytrainings"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(tr, { className: "w-4 h-4 inline-block mr-2" }),
                "Mes formations",
              ],
            }),
            t.jsxs("button", {
              onClick: () => l("certificates"),
              className: `py-4 px-2 border-b-2 transition-colors ${
                s === "certificates"
                  ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`,
              children: [
                t.jsx(sl, { className: "w-4 h-4 inline-block mr-2" }),
                "Certifications",
              ],
            }),
          ],
        }),
      }),
      t.jsxs("main", {
        className: "p-6",
        children: [
          s === "catalog" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className:
                    "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm",
                  children: [
                    t.jsxs("div", {
                      className: "relative flex-1",
                      children: [
                        t.jsx(Kn, {
                          className:
                            "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                        }),
                        t.jsx("input", {
                          type: "text",
                          placeholder: "Rechercher une formation...",
                          className:
                            "pl-10 pr-4 py-2 border rounded-lg text-sm w-full",
                        }),
                      ],
                    }),
                    t.jsxs(Y, {
                      variant: "outline",
                      size: "sm",
                      children: [
                        t.jsx(wl, { className: "w-4 h-4 mr-2" }),
                        "Filtres",
                      ],
                    }),
                  ],
                }),
                t.jsx("div", {
                  className: "grid lg:grid-cols-2 gap-6",
                  children: a.map((m) =>
                    t.jsxs(
                      G,
                      {
                        className: "hover:shadow-md transition-shadow",
                        children: [
                          t.jsx("div", {
                            className:
                              "aspect-video bg-gray-200 rounded-t-lg overflow-hidden",
                            children: t.jsx("img", {
                              src: m.thumbnail,
                              alt: m.title,
                              className: "w-full h-full object-cover",
                            }),
                          }),
                          t.jsx(Q, {
                            className: "p-6",
                            children: t.jsxs("div", {
                              className: "space-y-4",
                              children: [
                                t.jsxs("div", {
                                  children: [
                                    t.jsxs("div", {
                                      className:
                                        "flex items-start justify-between mb-2",
                                      children: [
                                        t.jsx("h3", {
                                          className: "font-semibold text-lg",
                                          children: m.title,
                                        }),
                                        m.mandatory &&
                                          t.jsx(Ne, {
                                            className:
                                              "bg-red-100 text-red-800",
                                            children: "Obligatoire",
                                          }),
                                      ],
                                    }),
                                    t.jsx("p", {
                                      className: "text-gray-600 text-sm",
                                      children: m.description,
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex flex-wrap gap-2",
                                  children: [
                                    t.jsx(Ne, {
                                      className: f(m.category),
                                      children: m.category,
                                    }),
                                    t.jsx(Ne, {
                                      variant: "outline",
                                      className: p(m.level),
                                      children: m.level,
                                    }),
                                    m.certifiable &&
                                      t.jsxs(Ne, {
                                        variant: "outline",
                                        className:
                                          "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]",
                                        children: [
                                          t.jsx(sl, {
                                            className: "w-3 h-3 mr-1",
                                          }),
                                          "Certifiant",
                                        ],
                                      }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "grid grid-cols-2 gap-4 text-sm",
                                  children: [
                                    t.jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        t.jsx(Wn, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        t.jsx("span", { children: m.duration }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        t.jsx(Mo, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        t.jsxs("span", {
                                          children: [m.modules, " modules"],
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        t.jsx(Yo, {
                                          className: "w-4 h-4 text-yellow-400",
                                        }),
                                        t.jsxs("span", {
                                          children: [m.rating, " / 5"],
                                        }),
                                      ],
                                    }),
                                    t.jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        t.jsx(tr, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        t.jsxs("span", {
                                          children: [m.enrolled, " inscrits"],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                t.jsxs("div", {
                                  className: "flex gap-2 pt-2",
                                  children: [
                                    t.jsxs(Y, {
                                      size: "sm",
                                      variant: "outline",
                                      className: "flex-1",
                                      children: [
                                        t.jsx(Ko, {
                                          className: "w-4 h-4 mr-2",
                                        }),
                                        "Aperçu",
                                      ],
                                    }),
                                    t.jsx(Y, {
                                      size: "sm",
                                      className:
                                        "flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                      children: "S'inscrire",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        ],
                      },
                      m.id
                    )
                  ),
                }),
              ],
            }),
          s === "mytrainings" &&
            t.jsxs("div", {
              className: "space-y-6",
              children: [
                t.jsxs("div", {
                  className: "grid lg:grid-cols-3 gap-6 mb-8",
                  children: [
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Formations en cours",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-[var(--sahtee-blue-primary)]",
                                  children: "1",
                                }),
                              ],
                            }),
                            t.jsx(Wn, {
                              className:
                                "w-8 h-8 text-[var(--sahtee-blue-primary)]",
                            }),
                          ],
                        }),
                      }),
                    }),
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Formations terminées",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-green-500",
                                  children: "1",
                                }),
                              ],
                            }),
                            t.jsx(sl, { className: "w-8 h-8 text-green-500" }),
                          ],
                        }),
                      }),
                    }),
                    t.jsx(G, {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: "Heures de formation",
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-3xl font-bold text-[var(--sahtee-blue-secondary)]",
                                  children: "5h 45min",
                                }),
                              ],
                            }),
                            t.jsx(Mo, {
                              className:
                                "w-8 h-8 text-[var(--sahtee-blue-secondary)]",
                            }),
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
                t.jsx("div", {
                  className: "space-y-4",
                  children: c.map((m) => {
                    const x = a.find((v) => v.id === m.courseId);
                    return x
                      ? t.jsx(
                          G,
                          {
                            children: t.jsx(Q, {
                              className: "p-6",
                              children: t.jsxs("div", {
                                className: "flex items-center gap-6",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0",
                                    children: t.jsx("img", {
                                      src: x.thumbnail,
                                      alt: x.title,
                                      className: "w-full h-full object-cover",
                                    }),
                                  }),
                                  t.jsxs("div", {
                                    className: "flex-1",
                                    children: [
                                      t.jsxs("div", {
                                        className:
                                          "flex items-start justify-between mb-2",
                                        children: [
                                          t.jsxs("div", {
                                            children: [
                                              t.jsx("h4", {
                                                className: "font-semibold",
                                                children: x.title,
                                              }),
                                              t.jsx("p", {
                                                className:
                                                  "text-sm text-gray-600",
                                                children: x.category,
                                              }),
                                            ],
                                          }),
                                          t.jsx(Ne, {
                                            className:
                                              m.status === "Terminé"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-blue-100 text-blue-800",
                                            children: m.status,
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className: "space-y-2",
                                        children: [
                                          t.jsxs("div", {
                                            className:
                                              "flex justify-between text-sm",
                                            children: [
                                              t.jsx("span", {
                                                children: "Progression",
                                              }),
                                              t.jsxs("span", {
                                                children: [
                                                  m.progress,
                                                  "% (",
                                                  m.completedModules,
                                                  "/",
                                                  m.totalModules,
                                                  " modules)",
                                                ],
                                              }),
                                            ],
                                          }),
                                          t.jsx(fr, {
                                            value: m.progress,
                                            className: "h-2",
                                          }),
                                        ],
                                      }),
                                      t.jsxs("div", {
                                        className:
                                          "flex items-center justify-between mt-4",
                                        children: [
                                          t.jsxs("span", {
                                            className: "text-sm text-gray-500",
                                            children: [
                                              "Dernier accès: ",
                                              m.lastAccessed,
                                            ],
                                          }),
                                          t.jsxs("div", {
                                            className: "flex gap-2",
                                            children: [
                                              m.certificateEarned &&
                                                t.jsxs(Y, {
                                                  size: "sm",
                                                  variant: "outline",
                                                  children: [
                                                    t.jsx(Fr, {
                                                      className: "w-4 h-4 mr-2",
                                                    }),
                                                    "Certificat",
                                                  ],
                                                }),
                                              t.jsxs(Y, {
                                                size: "sm",
                                                className:
                                                  "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]",
                                                children: [
                                                  t.jsx(Ko, {
                                                    className: "w-4 h-4 mr-2",
                                                  }),
                                                  m.status === "Terminé"
                                                    ? "Revoir"
                                                    : "Continuer",
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          },
                          m.id
                        )
                      : null;
                  }),
                }),
              ],
            }),
          s === "certificates" &&
            t.jsx("div", {
              className: "space-y-6",
              children: t.jsxs(G, {
                children: [
                  t.jsx(pe, {
                    children: t.jsx(xe, { children: "Mes certifications" }),
                  }),
                  t.jsx(Q, {
                    children: t.jsx("div", {
                      className: "space-y-4",
                      children: u.map((m) =>
                        t.jsxs(
                          "div",
                          {
                            className:
                              "flex items-center justify-between p-4 border rounded-lg",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-4",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "bg-[var(--sahtee-neutral)] rounded-full p-3",
                                    children: t.jsx(sl, {
                                      className:
                                        "w-6 h-6 text-[var(--sahtee-blue-primary)]",
                                    }),
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("h4", {
                                        className: "font-medium",
                                        children: m.courseName,
                                      }),
                                      t.jsxs("p", {
                                        className: "text-sm text-gray-600",
                                        children: ["N° ", m.certificateNumber],
                                      }),
                                      t.jsxs("p", {
                                        className: "text-sm text-gray-500",
                                        children: [
                                          "Délivré le ",
                                          m.issuedDate,
                                          " • Expire le ",
                                          m.expiryDate,
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  t.jsx(Ne, {
                                    className:
                                      m.status === "Valide"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-orange-100 text-orange-800",
                                    children: m.status,
                                  }),
                                  t.jsxs(Y, {
                                    size: "sm",
                                    variant: "outline",
                                    children: [
                                      t.jsx(Fr, { className: "w-4 h-4 mr-2" }),
                                      "Télécharger",
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          },
                          m.id
                        )
                      ),
                    }),
                  }),
                ],
              }),
            }),
        ],
      }),
    ],
  });
}
const Zf = "/assets/2c9287bd076e1cc144dd8b599ad076a48185b78b-CqVTnLIT.png";
function py() {
  const [s, l] = j.useState(!0),
    [a, c] = j.useState("dashboard"),
    [u, f] = j.useState("bar"),
    p = () => {
      window.location.reload();
    },
    m = [
      {
        id: "dashboard",
        icon: fv,
        title: "360° Board",
        color: "text-[var(--sahtee-blue-primary)]",
      },
      {
        id: "audit",
        icon: Sl,
        title: "Conformity Room",
        color: "text-[var(--sahtee-blue-secondary)]",
      },
      {
        id: "actions",
        icon: hr,
        title: "CAPA Room",
        color: "text-[var(--sahtee-blue-light)]",
      },
      {
        id: "formation",
        icon: Qo,
        title: "Formation",
        color: "text-[var(--sahtee-blue-secondary)]",
      },
      {
        id: "mobile",
        icon: Ef,
        title: "Mobile App",
        color: "text-[var(--sahtee-blue-primary)]",
      },
      {
        id: "maladies",
        icon: qs,
        title: "Health Meter",
        color: "text-[var(--sahtee-blue-light)]",
      },
      {
        id: "chatbot",
        icon: Vn,
        title: "SafetyBot",
        color: "text-[var(--sahtee-blue-secondary)]",
      },
      {
        id: "marketplace",
        icon: uc,
        title: "Marketplace",
        color: "text-[var(--sahtee-blue-primary)]",
      },
      {
        id: "calcul",
        icon: Nl,
        title: "Impact Calculator",
        color: "text-[var(--sahtee-blue-light)]",
      },
      {
        id: "analyse",
        icon: er,
        title: "Analyses Avancées",
        color: "text-[var(--sahtee-blue-secondary)]",
      },
    ],
    x = [
      { type: "Physiques", value: 23, trend: "+2", color: "bg-red-500" },
      { type: "Chimiques", value: 15, trend: "-1", color: "bg-orange-500" },
      { type: "Biologiques", value: 8, trend: "0", color: "bg-yellow-500" },
      { type: "Psychosociaux", value: 12, trend: "+3", color: "bg-purple-500" },
      {
        type: "Organisationnels",
        value: 18,
        trend: "-2",
        color: "bg-blue-500",
      },
      { type: "Machines", value: 31, trend: "+1", color: "bg-green-500" },
    ],
    v = [
      {
        label: "Taux de fréquence",
        value: "2.3",
        unit: "/1000h",
        trend: "down",
        color: "text-green-600",
      },
      {
        label: "Taux de gravité",
        value: "0.45",
        unit: "/1000h",
        trend: "down",
        color: "text-green-600",
      },
      {
        label: "Absentéisme",
        value: "4.2%",
        unit: "",
        trend: "up",
        color: "text-red-600",
      },
      {
        label: "Heures travaillées",
        value: "12,450",
        unit: "h",
        trend: "up",
        color: "text-blue-600",
      },
      {
        label: "Conformité",
        value: "87%",
        unit: "",
        trend: "up",
        color: "text-blue-600",
      },
    ],
    N = () => {
      switch (a) {
        case "audit":
          return t.jsx(oy, {});
        case "actions":
          return t.jsx(W0, {});
        case "formation":
          return t.jsx(hy, {});
        case "mobile":
          return t.jsx(my, {});
        case "maladies":
          return t.jsx(fy, {});
        case "chatbot":
          return t.jsx(dy, {});
        case "marketplace":
          return t.jsx(uy, {});
        case "calcul":
          return t.jsx(cy, {});
        case "analyse":
          return t.jsx(iy, {});
        default:
          return g();
      }
    },
    g = () =>
      t.jsxs(t.Fragment, {
        children: [
          t.jsx("header", {
            className: "bg-white shadow-sm border-b p-4",
            children: t.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                t.jsxs("div", {
                  children: [
                    t.jsx("h1", {
                      className: "text-2xl text-gray-900",
                      children: "360° Board",
                    }),
                    t.jsx("p", {
                      className: "text-gray-600",
                      children:
                        "Vue panoramique et centralisée de la santé et sécurité au travail",
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "flex items-center gap-4",
                  children: [
                    t.jsxs(Y, {
                      variant: "outline",
                      size: "sm",
                      className:
                        "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                      children: [
                        t.jsx(Pf, { className: "w-4 h-4 mr-2" }),
                        "Importer documents",
                      ],
                    }),
                    t.jsxs("div", {
                      className: "relative",
                      children: [
                        t.jsx(Kn, {
                          className:
                            "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                        }),
                        t.jsx("input", {
                          type: "text",
                          placeholder: "Rechercher...",
                          className:
                            "pl-10 pr-4 py-2 border rounded-lg text-sm w-64",
                        }),
                      ],
                    }),
                    t.jsxs(Y, {
                      variant: "ghost",
                      size: "sm",
                      className: "relative",
                      children: [
                        t.jsx(Wo, { className: "w-4 h-4" }),
                        t.jsx(Ne, {
                          className:
                            "absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs",
                          children: "3",
                        }),
                      ],
                    }),
                    t.jsx(Y, {
                      variant: "ghost",
                      size: "sm",
                      children: t.jsx(Fv, { className: "w-4 h-4" }),
                    }),
                    t.jsx(Y, {
                      variant: "ghost",
                      size: "sm",
                      children: t.jsx(Af, { className: "w-4 h-4" }),
                    }),
                  ],
                }),
              ],
            }),
          }),
          t.jsxs("main", {
            className: "p-6",
            children: [
              t.jsx("div", {
                className:
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
                children: v.map((S, A) =>
                  t.jsx(
                    G,
                    {
                      children: t.jsx(Q, {
                        className: "p-6",
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs("div", {
                              children: [
                                t.jsx("p", {
                                  className: "text-sm text-gray-600 mb-1",
                                  children: S.label,
                                }),
                                t.jsxs("p", {
                                  className: "text-2xl",
                                  children: [
                                    S.value,
                                    t.jsx("span", {
                                      className: "text-sm text-gray-500 ml-1",
                                      children: S.unit,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.jsx("div", {
                              className: `${S.color}`,
                              children:
                                S.trend === "up"
                                  ? t.jsx(er, { className: "w-6 h-6" })
                                  : t.jsx(Em, {
                                      className: "w-6 h-6 rotate-180",
                                    }),
                            }),
                          ],
                        }),
                      }),
                    },
                    A
                  )
                ),
              }),
              t.jsxs("div", {
                className: "grid lg:grid-cols-2 gap-6 mb-8",
                children: [
                  t.jsxs(G, {
                    children: [
                      t.jsx(pe, {
                        children: t.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            t.jsxs(xe, {
                              className: "flex items-center gap-2",
                              children: [
                                t.jsx(Un, {
                                  className:
                                    "w-5 h-5 text-[var(--sahtee-blue-primary)]",
                                }),
                                "Cartographie des Risques",
                              ],
                            }),
                            t.jsxs("div", {
                              className: "flex items-center gap-2",
                              children: [
                                t.jsx("span", {
                                  className: "text-xs text-gray-500",
                                  children: "Type de graphique:",
                                }),
                                t.jsxs("div", {
                                  className:
                                    "flex gap-1 bg-gray-100 p-1 rounded-lg",
                                  children: [
                                    t.jsx("button", {
                                      type: "button",
                                      onClick: () => f("bar"),
                                      className: `p-1.5 rounded ${
                                        u === "bar"
                                          ? "bg-white shadow-sm"
                                          : "hover:bg-gray-200"
                                      }`,
                                      title: "Graphique en barres",
                                      children: t.jsx(Un, {
                                        className: "w-4 h-4",
                                      }),
                                    }),
                                    t.jsx("button", {
                                      type: "button",
                                      onClick: () => f("pie"),
                                      className: `p-1.5 rounded ${
                                        u === "pie"
                                          ? "bg-white shadow-sm"
                                          : "hover:bg-gray-200"
                                      }`,
                                      title: "Graphique circulaire",
                                      children: t.jsx(wf, {
                                        className: "w-4 h-4",
                                      }),
                                    }),
                                    t.jsx("button", {
                                      type: "button",
                                      onClick: () => f("line"),
                                      className: `p-1.5 rounded ${
                                        u === "line"
                                          ? "bg-white shadow-sm"
                                          : "hover:bg-gray-200"
                                      }`,
                                      title: "Graphique linéaire",
                                      children: t.jsx(Nf, {
                                        className: "w-4 h-4",
                                      }),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      t.jsx(Q, {
                        children: t.jsx("div", {
                          className: "space-y-4",
                          children: x.map((S, A) =>
                            t.jsxs(
                              "div",
                              {
                                className:
                                  "flex items-center justify-between p-3 bg-gray-50 rounded-lg",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                      t.jsx("div", {
                                        className: `w-3 h-3 rounded-full ${S.color}`,
                                      }),
                                      t.jsx("span", {
                                        className: "text-sm",
                                        children: S.type,
                                      }),
                                    ],
                                  }),
                                  t.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: S.value,
                                      }),
                                      t.jsx(Ne, {
                                        variant: S.trend.startsWith("+")
                                          ? "destructive"
                                          : S.trend.startsWith("-")
                                          ? "default"
                                          : "secondary",
                                        className: "text-xs",
                                        children: S.trend,
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              A
                            )
                          ),
                        }),
                      }),
                    ],
                  }),
                  t.jsxs(G, {
                    children: [
                      t.jsx(pe, {
                        children: t.jsxs(xe, {
                          className: "flex items-center gap-2",
                          children: [
                            t.jsx(qt, { className: "w-5 h-5 text-orange-600" }),
                            "Alertes & Actions",
                          ],
                        }),
                      }),
                      t.jsx(Q, {
                        children: t.jsxs("div", {
                          className: "space-y-3",
                          children: [
                            t.jsxs("div", {
                              className:
                                "flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500",
                              children: [
                                t.jsx(qt, {
                                  className: "w-4 h-4 text-red-500 mt-0.5",
                                }),
                                t.jsxs("div", {
                                  children: [
                                    t.jsx("p", {
                                      className:
                                        "text-sm font-medium text-red-900",
                                      children: "Incident critique - Site A",
                                    }),
                                    t.jsx("p", {
                                      className: "text-xs text-red-700",
                                      children:
                                        "Action corrective requise immédiatement",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.jsxs("div", {
                              className:
                                "flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500",
                              children: [
                                t.jsx(Em, {
                                  className: "w-4 h-4 text-yellow-500 mt-0.5",
                                }),
                                t.jsxs("div", {
                                  children: [
                                    t.jsx("p", {
                                      className:
                                        "text-sm font-medium text-yellow-900",
                                      children: "Formation expire dans 7 jours",
                                    }),
                                    t.jsx("p", {
                                      className: "text-xs text-yellow-700",
                                      children: "15 collaborateurs concernés",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            t.jsxs("div", {
                              className:
                                "flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500",
                              children: [
                                t.jsx(vt, {
                                  className: "w-4 h-4 text-green-500 mt-0.5",
                                }),
                                t.jsxs("div", {
                                  children: [
                                    t.jsx("p", {
                                      className:
                                        "text-sm font-medium text-green-900",
                                      children: "Audit ISO 45001 complété",
                                    }),
                                    t.jsx("p", {
                                      className: "text-xs text-green-700",
                                      children: "Conformité: 94%",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              t.jsxs(G, {
                children: [
                  t.jsx(pe, {
                    children: t.jsxs(xe, {
                      className: "flex items-center gap-2",
                      children: [
                        t.jsx(tr, {
                          className:
                            "w-5 h-5 text-[var(--sahtee-blue-secondary)]",
                        }),
                        "Activité Récente",
                      ],
                    }),
                  }),
                  t.jsxs(Q, {
                    children: [
                      t.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          t.jsxs("div", {
                            className:
                              "flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-3",
                                children: [
                                  t.jsx("div", {
                                    className:
                                      "bg-[var(--sahtee-neutral)] rounded-full p-2",
                                    children: t.jsx(Qo, {
                                      className:
                                        "w-4 h-4 text-[var(--sahtee-blue-primary)]",
                                    }),
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("p", {
                                        className: "text-sm font-medium",
                                        children:
                                          'Formation "Manipulation Chimique" terminée',
                                      }),
                                      t.jsx("p", {
                                        className: "text-xs text-gray-600",
                                        children:
                                          "par Marie Dubois - Site Production",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx("span", {
                                className: "text-xs text-gray-500",
                                children: "Il y a 2h",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-3",
                                children: [
                                  t.jsx("div", {
                                    className: "bg-red-100 rounded-full p-2",
                                    children: t.jsx(qt, {
                                      className: "w-4 h-4 text-red-600",
                                    }),
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("p", {
                                        className: "text-sm font-medium",
                                        children:
                                          "Incident déclaré via l'app mobile",
                                      }),
                                      t.jsx("p", {
                                        className: "text-xs text-gray-600",
                                        children: "Glissade - Entrepôt Zone C",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx("span", {
                                className: "text-xs text-gray-500",
                                children: "Il y a 4h",
                              }),
                            ],
                          }),
                          t.jsxs("div", {
                            className:
                              "flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg",
                            children: [
                              t.jsxs("div", {
                                className: "flex items-center gap-3",
                                children: [
                                  t.jsx("div", {
                                    className: "bg-green-100 rounded-full p-2",
                                    children: t.jsx(vt, {
                                      className: "w-4 h-4 text-green-600",
                                    }),
                                  }),
                                  t.jsxs("div", {
                                    children: [
                                      t.jsx("p", {
                                        className: "text-sm font-medium",
                                        children:
                                          "Plan d'action correctif validé",
                                      }),
                                      t.jsx("p", {
                                        className: "text-xs text-gray-600",
                                        children:
                                          "Amélioration éclairage - Atelier B",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              t.jsx("span", {
                                className: "text-xs text-gray-500",
                                children: "Hier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      t.jsx("div", {
                        className: "mt-6 text-center",
                        children: t.jsx(Y, {
                          variant: "outline",
                          className:
                            "text-sm border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                          children: "Exporter rapport complet",
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
  return t.jsxs("div", {
    className: "min-h-screen bg-[var(--background)] flex",
    children: [
      t.jsxs("div", {
        className: `${
          s ? "w-64" : "w-16"
        } bg-white shadow-lg transition-all duration-300 fixed h-full z-30 border-r border-[var(--sahtee-neutral)]`,
        children: [
          t.jsx("div", {
            className: "p-4 border-b border-[var(--sahtee-neutral)]",
            children: t.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                s &&
                  t.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      t.jsx("img", {
                        src: Zf,
                        alt: "SAHTEE",
                        className: "h-8",
                      }),
                      t.jsx(Y, {
                        variant: "ghost",
                        size: "sm",
                        onClick: p,
                        className:
                          "text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]",
                        children: t.jsx(jg, { className: "w-4 h-4" }),
                      }),
                    ],
                  }),
                t.jsx(Y, {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => l(!s),
                  className:
                    "ml-auto text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]",
                  children: t.jsx(Cf, { className: "w-4 h-4" }),
                }),
              ],
            }),
          }),
          t.jsx("nav", {
            className: "p-2",
            children: m.map((S) =>
              t.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => c(S.id),
                  className: `w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                    a === S.id
                      ? "bg-[var(--sahtee-neutral)] text-[var(--sahtee-blue-primary)] border-r-4 border-[var(--sahtee-blue-primary)]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`,
                  children: [
                    t.jsx(S.icon, { className: `w-5 h-5 ${S.color}` }),
                    s &&
                      t.jsx("span", {
                        className: "text-sm",
                        children: S.title,
                      }),
                  ],
                },
                S.id
              )
            ),
          }),
          s &&
            t.jsx("div", {
              className: "absolute bottom-4 left-4 right-4",
              children: t.jsx(Y, {
                variant: "outline",
                size: "sm",
                className:
                  "w-full text-xs border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                children: "Demander support SAHTEE",
              }),
            }),
        ],
      }),
      t.jsx("div", {
        className: `flex-1 ${
          s ? "ml-64" : "ml-16"
        } transition-all duration-300`,
        children: N(),
      }),
    ],
  });
}
const xy = [
  {
    title: "360° Board",
    icon: wf,
    description:
      "Pilotez votre santé et sécurité au travail en un seul regard.",
  },
  {
    title: "Conformity Room",
    icon: Hv,
    description: "Gardez le contrôle sur vos normes, audits et certifications.",
  },
  {
    title: "CAPA Room",
    icon: _v,
    description: "Agissez vite, suivez vos actions préventives et correctives.",
  },
  {
    title: "Health Meter",
    icon: dv,
    description: "Prenez le pouls du bien-être et de la santé au travail.",
  },
  {
    title: "SafetyBot",
    icon: Vn,
    description:
      "Votre assistant intelligent pour les risques chimiques et la sécurité.",
  },
  {
    title: "ErgoLab",
    icon: Sv,
    description:
      "Analysez et optimisez les postures et environnements de travail.",
  },
  {
    title: "Impact Calculator",
    icon: Nf,
    description: "Mesurez vos gains, votre ROI et votre impact durable.",
  },
];
function gy() {
  return t.jsx("section", {
    className: "py-20",
    style: { backgroundColor: "#f0f4ff" },
    children: t.jsxs("div", {
      className: "max-w-screen-2xl mx-auto px-6",
      children: [
        t.jsxs("div", {
          className: "text-center mb-10",
          children: [
            t.jsx("h2", {
              className: "text-4xl mb-4 text-gray-900",
              children: "Nos fonctionnalités clés",
            }),
            t.jsx("p", {
              className: "text-lg text-gray-600",
              children: "Aperçu rapide des 7 modules",
            }),
          ],
        }),
        t.jsx("div", {
          className: "flex flex-row gap-8 overflow-x-auto",
          children: xy.map((s) =>
            t.jsx(
              "div",
              {
                className:
                  "flex-1 min-w-[220px] bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1",
                children: t.jsxs("div", {
                  className:
                    "p-6 flex flex-col items-center text-center gap-4 h-full min-h-[260px]",
                  children: [
                    t.jsx("h3", {
                      className: "text-base font-semibold text-gray-900",
                      children: s.title,
                    }),
                    t.jsx("span", {
                      className:
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow",
                      children: t.jsx(s.icon, { className: "h-6 w-6" }),
                    }),
                    t.jsx("p", {
                      className:
                        "text-sm text-gray-600 leading-relaxed flex-grow",
                      children: s.description,
                    }),
                  ],
                }),
              },
              s.title
            )
          ),
        }),
      ],
    }),
  });
}
function vy({ onNavigate: s }) {
  return t.jsxs("footer", {
    className: "py-16 relative overflow-hidden",
    style: { backgroundColor: "#f6f9ee" },
    children: [
      t.jsx("div", {
        className: "absolute inset-0 opacity-10",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300814e'%3E%3Cpath d='M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        },
      }),
      t.jsxs("div", {
        className: "max-w-7xl mx-auto px-6 relative z-10",
        children: [
          t.jsxs("div", {
            className: "grid lg:grid-cols-3 gap-12 items-start",
            children: [
              t.jsxs("div", {
                children: [
                  t.jsx("p", {
                    className: "text-gray-600 leading-relaxed mb-6",
                    children:
                      "La plateforme digitale pour une santé et sécurité au travail inclusive. Prévenir, c'est Performer.",
                  }),
                  t.jsx(Y, {
                    variant: "outline",
                    className:
                      "border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
                    children: "Accéder à la plateforme",
                  }),
                ],
              }),
              t.jsxs("div", {
                children: [
                  t.jsx("h3", {
                    className: "text-xl mb-6 text-gray-900",
                    children: "Contactez-nous",
                  }),
                  t.jsxs("div", {
                    className: "space-y-4",
                    children: [
                      t.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          t.jsx("div", {
                            className: "bg-green-100 rounded-full p-2",
                            children: t.jsx(kf, {
                              className: "w-4 h-4 text-green-600",
                            }),
                          }),
                          t.jsxs("div", {
                            children: [
                              t.jsx("p", {
                                className: "text-gray-900",
                                children: "Healthcare Innovation",
                              }),
                              t.jsx("p", {
                                className: "text-gray-600 text-sm",
                                children: "Cluster HealthTech Tunisie",
                              }),
                            ],
                          }),
                        ],
                      }),
                      t.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          t.jsx("div", {
                            className: "bg-blue-100 rounded-full p-2",
                            children: t.jsx(iv, {
                              className: "w-4 h-4 text-blue-600",
                            }),
                          }),
                          t.jsx("a", {
                            href: "https://www.sahtee.tn",
                            className:
                              "text-gray-600 hover:text-blue-600 transition-colors",
                            children: "www.sahtee.tn",
                          }),
                        ],
                      }),
                      t.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          t.jsx("div", {
                            className: "bg-green-100 rounded-full p-2",
                            children: t.jsx(yv, {
                              className: "w-4 h-4 text-green-600",
                            }),
                          }),
                          t.jsx("a", {
                            href: "mailto:contact@sahtee.tn",
                            className:
                              "text-gray-600 hover:text-green-600 transition-colors",
                            children: "contact@sahtee.tn",
                          }),
                        ],
                      }),
                      t.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          t.jsx("div", {
                            className: "bg-blue-100 rounded-full p-2",
                            children: t.jsx(Ev, {
                              className: "w-4 h-4 text-blue-600",
                            }),
                          }),
                          t.jsx("a", {
                            href: "tel:+216",
                            className:
                              "text-gray-600 hover:text-blue-600 transition-colors",
                            children: "+216 ...",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              t.jsxs("div", {
                children: [
                  t.jsx("h3", {
                    className: "text-xl mb-6 text-gray-900",
                    children: "Liens rapides",
                  }),
                  t.jsxs("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: [
                      t.jsxs("div", {
                        className: "space-y-3",
                        children: [
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-green-600 transition-colors",
                            children: "À propos",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-green-600 transition-colors",
                            children: "Fonctionnalités",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-green-600 transition-colors",
                            children: "Secteurs",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-green-600 transition-colors",
                            children: "Blog",
                          }),
                        ],
                      }),
                      t.jsxs("div", {
                        className: "space-y-3",
                        children: [
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-blue-600 transition-colors",
                            children: "Support",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-blue-600 transition-colors",
                            children: "Documentation",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-blue-600 transition-colors",
                            children: "Tarifs",
                          }),
                          t.jsx("a", {
                            href: "#",
                            className:
                              "block text-gray-600 hover:text-blue-600 transition-colors",
                            children: "Contact",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          t.jsx("div", {
            className: "border-t border-gray-300 mt-12 pt-8 text-center",
            children: t.jsx("p", {
              className: "text-gray-600",
              children:
                "© 2024 SAHTEE - Healthcare Innovation. Tous droits réservés.",
            }),
          }),
        ],
      }),
    ],
  });
}
function yy({ heroImage: s, onNavigate: l }) {
  return t.jsxs("section", {
    className:
      "relative min-h-screen flex items-center justify-center overflow-hidden",
    children: [
      t.jsx("div", {
        className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
        style: { backgroundImage: `url(${s})` },
        children: t.jsx("div", {
          className:
            "absolute inset-0 bg-gradient-to-r from-[var(--sahtee-blue-primary)]/80 to-[var(--sahtee-blue-secondary)]/60",
        }),
      }),
      t.jsxs("div", {
        className:
          "relative z-10 max-w-6xl mx-auto px-6 text-center text-white",
        children: [
          t.jsxs("h1", {
            className: "mb-6 tracking-tight",
            children: [
              t.jsx("img", {
                src: Zf,
                alt: "SAHTEE",
                className:
                  "inline-block h-40 md:h-48 w-auto mx-auto filter brightness-0 invert rounded-[11px] pt-[-21px] pr-[5px] pb-[5px] pl-[-12px] mx-[60px] my-[-15px]",
              }),
              t.jsx("span", {
                className: "block text-2xl md:text-3xl mt-4 text-blue-300",
                children: "Prévenir, c'est Performer",
              }),
            ],
          }),
          t.jsx("h2", {
            className: "text-xl md:text-2xl mb-8 text-blue-200",
            children: "Vers des environnements de travail durables",
          }),
          t.jsx("p", {
            className:
              "text-lg md:text-xl mb-12 max-w-4xl mx-auto leading-relaxed text-gray-100",
            children:
              "La plateforme digitale pour une santé et sécurité au travail inclusive. Réduisez vos risques, engagez vos équipes et construisez une culture de prévention durable.",
          }),
          t.jsxs("div", {
            className: "flex flex-col sm:flex-row gap-4 justify-center",
            children: [
              t.jsx(Y, {
                size: "lg",
                className:
                  "bg-[var(--sahtee-blue-secondary)] hover:bg-[var(--sahtee-blue-primary)] text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300",
                onClick: () => l?.("dashboard"),
                children: "Demander une démonstration",
              }),
              t.jsx(Y, {
                variant: "outline",
                size: "lg",
                className:
                  "border-white text-white hover:bg-white hover:text-[var(--sahtee-blue-primary)] px-8 py-4 text-lg rounded-lg transition-all duration-300 bg-[var(--sahtee-blue-primary)]/40",
                onClick: () => l?.("login"),
                children: "Connexion / Inscription",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const pc = "/assets/da3a2e0089c3ad8d081375417ace1d5ec5c73acd-XFvMUeYq.png";
function jy({ onNavigate: s }) {
  const [l, a] = j.useState(""),
    [c, u] = j.useState(""),
    f = (p) => {
      p.preventDefault(), s?.("dashboard");
    };
  return t.jsx("div", {
    className:
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] px-4",
    children: t.jsxs(G, {
      className: "w-full max-w-md shadow-2xl",
      children: [
        t.jsxs(pe, {
          className: "space-y-4 text-center",
          children: [
            t.jsx("div", {
              className: "flex justify-center",
              children: t.jsx("img", {
                src: pc,
                alt: "SAHTEE",
                className: "h-16",
              }),
            }),
            t.jsx(xe, {
              className: "text-[var(--sahtee-blue-primary)]",
              children: "Connexion à SAHTEE",
            }),
            t.jsx(Uf, {
              children:
                "Accédez à votre plateforme de santé et sécurité au travail",
            }),
          ],
        }),
        t.jsxs("form", {
          onSubmit: f,
          children: [
            t.jsxs(Q, {
              className: "space-y-4",
              children: [
                t.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    t.jsx(Xe, { htmlFor: "email", children: "Adresse e-mail" }),
                    t.jsx(St, {
                      id: "email",
                      type: "email",
                      placeholder: "votre.email@entreprise.com",
                      value: l,
                      onChange: (p) => a(p.target.value),
                      required: !0,
                      className:
                        "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    t.jsx(Xe, {
                      htmlFor: "password",
                      children: "Mot de passe",
                    }),
                    t.jsx(St, {
                      id: "password",
                      type: "password",
                      placeholder: "••••••••",
                      value: c,
                      onChange: (p) => u(p.target.value),
                      required: !0,
                      className:
                        "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    t.jsxs("div", {
                      className: "flex items-center space-x-2",
                      children: [
                        t.jsx("input", {
                          type: "checkbox",
                          id: "remember",
                          className:
                            "rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                        t.jsx(Xe, {
                          htmlFor: "remember",
                          className: "text-sm cursor-pointer",
                          children: "Se souvenir de moi",
                        }),
                      ],
                    }),
                    t.jsx("button", {
                      type: "button",
                      className:
                        "text-sm text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors",
                      children: "Mot de passe oublié ?",
                    }),
                  ],
                }),
              ],
            }),
            t.jsxs(Wf, {
              className: "flex flex-col space-y-4",
              children: [
                t.jsx(Y, {
                  type: "submit",
                  className:
                    "w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white",
                  children: "Se connecter",
                }),
                t.jsxs("div", {
                  className: "text-center text-sm",
                  children: [
                    t.jsx("span", {
                      className: "text-gray-600",
                      children: "Vous n'avez pas de compte ? ",
                    }),
                    t.jsx("button", {
                      type: "button",
                      onClick: () => s?.("signup"),
                      className:
                        "text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors",
                      children: "Créer un compte",
                    }),
                  ],
                }),
                t.jsx("button", {
                  type: "button",
                  onClick: () => s?.("homepage"),
                  className:
                    "text-sm text-gray-600 hover:text-[var(--sahtee-blue-primary)] transition-colors",
                  children: "← Retour à l'accueil",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function by({ onNavigate: s }) {
  const [l, a] = j.useState(!1),
    c = [
      { label: "Pourquoi SAHTEE", href: "#home" },
      { label: "Fonctionnalités", href: "#features" },
      { label: "Secteurs", href: "#sectors" },
      { label: "À propos", href: "#about" },
      { label: "Contact", href: "#contact" },
    ];
  return t.jsx("nav", {
    className: "fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50",
    children: t.jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        t.jsxs("div", {
          className: "flex justify-between items-center py-4",
          children: [
            t.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                t.jsx("img", { src: pc, alt: "SAHTEE", className: "h-12" }),
                t.jsx("span", {
                  className: "text-2xl text-[var(--sahtee-blue-primary)]",
                  children: "SAHTEE",
                }),
              ],
            }),
            t.jsx("div", {
              className: "hidden lg:flex items-center space-x-8",
              children: c.map((u, f) =>
                t.jsx(
                  "a",
                  {
                    href: u.href,
                    className:
                      "text-gray-700 hover:text-[var(--sahtee-blue-primary)] transition-colors duration-200",
                    children: u.label,
                  },
                  f
                )
              ),
            }),
            t.jsxs("div", {
              className: "hidden lg:flex items-center space-x-4",
              children: [
                t.jsx(Y, {
                  variant: "outline",
                  className:
                    "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                  onClick: () => s?.("login"),
                  children: "Connexion",
                }),
                t.jsx(Y, {
                  className:
                    "bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white",
                  onClick: () => s?.("dashboard"),
                  children: "Démonstration",
                }),
              ],
            }),
            t.jsx("button", {
              className: "lg:hidden",
              onClick: () => a(!l),
              children: l
                ? t.jsx(e0, { className: "w-6 h-6 text-gray-700" })
                : t.jsx(Cf, { className: "w-6 h-6 text-gray-700" }),
            }),
          ],
        }),
        l &&
          t.jsx("div", {
            className: "lg:hidden border-t border-gray-200 py-4",
            children: t.jsxs("div", {
              className: "space-y-4",
              children: [
                c.map((u, f) =>
                  t.jsx(
                    "a",
                    {
                      href: u.href,
                      className:
                        "block py-2 text-gray-700 hover:text-[var(--sahtee-blue-primary)] transition-colors duration-200",
                      onClick: () => a(!1),
                      children: u.label,
                    },
                    f
                  )
                ),
                t.jsxs("div", {
                  className: "pt-4 space-y-2",
                  children: [
                    t.jsx(Y, {
                      variant: "outline",
                      className:
                        "w-full border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                      onClick: () => {
                        s?.("login"), a(!1);
                      },
                      children: "Connexion",
                    }),
                    t.jsx(Y, {
                      className:
                        "w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white",
                      onClick: () => {
                        s?.("dashboard"), a(!1);
                      },
                      children: "Démonstration",
                    }),
                  ],
                }),
              ],
            }),
          }),
      ],
    }),
  });
}
function Ny() {
  const s = [
    {
      icon: tr,
      title: "Accessibilité",
      description:
        "Une plateforme simple, fluide et intuitive, conçue pour tous les profils d'utilisateurs.",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: gv,
      title: "Innovation digitale",
      description:
        "Technologies de pointe pour révolutionner la santé et sécurité au travail",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: ov,
      title: "Participation",
      description:
        "Impliquer activement les entreprises, les travailleurs et les experts pour construire ensemble une culture de sécurité vivante.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: zv,
      title: "Éthique & inclusion",
      description:
        "Protéger les données, respecter la diversité culturelle et valoriser l'inclusion.",
      color: "from-blue-300 to-blue-500",
    },
  ];
  return t.jsx("section", {
    className: "py-20 bg-white",
    children: t.jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        t.jsxs("div", {
          className: "text-center mb-16",
          children: [
            t.jsx("h2", {
              className: "text-4xl mb-6 text-gray-900",
              children: "Nos principes",
            }),
            t.jsx("p", {
              className: "text-xl text-gray-600 max-w-3xl mx-auto",
              children:
                "Les valeurs qui guident notre approche de la santé et sécurité au travail",
            }),
          ],
        }),
        t.jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
          children: s.map((l, a) =>
            t.jsxs(
              "div",
              {
                className:
                  "text-center group hover:-translate-y-2 transition-all duration-300",
                children: [
                  t.jsx("div", {
                    className: `bg-gradient-to-br ${l.color} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`,
                    children: t.jsx(l.icon, {
                      className: "w-10 h-10 text-white",
                    }),
                  }),
                  t.jsx("h3", {
                    className:
                      "text-xl mb-4 text-gray-900 group-hover:text-green-600 transition-colors",
                    children: l.title,
                  }),
                  t.jsx("p", {
                    className: "text-gray-600 leading-relaxed",
                    children: l.description,
                  }),
                ],
              },
              a
            )
          ),
        }),
      ],
    }),
  });
}
function wy({ dashboardImage: s }) {
  const [l, a] = j.useState(0),
    c = [
      {
        icon: Un,
        title: "Tableau de bord général",
        description:
          "Vue panoramique : cartographie risques (physiques, chimiques, biologiques, psychosociaux, organisationnels, machines). Indicateurs clés (taux fréquence, gravité, absentéisme). Tableaux personnalisables avec filtres par site, secteur, service.",
        features: [
          "Cartographie des risques",
          "KPIs en temps réel",
          "Rapports automatisés",
          "Alertes intelligentes",
        ],
      },
      {
        icon: Sl,
        title: "Audit Room (conformité)",
        description:
          "Bibliothèque réglementaire complète, suivi de conformité en temps réel, progression selon les normes ISO, OSHA et réglementations locales.",
        features: [
          "Base réglementaire",
          "Suivi conformité",
          "Normes ISO/OSHA",
          "Audits automatisés",
        ],
      },
      {
        icon: hr,
        title: "Plans d'action préventifs & correctifs",
        description:
          "Gestion hiérarchisée des actions correctives et préventives avec interface type Kanban. Priorisation automatique selon criticité des risques.",
        features: [
          "Interface Kanban",
          "Priorisation auto",
          "Suivi temps réel",
          "Validation workflow",
        ],
      },
      {
        icon: Qo,
        title: "Formation continue (e-learning)",
        description:
          "Plateforme LMS intégrée avec vidéos interactives, quiz adaptatifs, certifications numériques et suivi des compétences.",
        features: [
          "Vidéos interactives",
          "Quiz adaptatifs",
          "Certifications",
          "Suivi compétences",
        ],
      },
      {
        icon: Ef,
        title: "Application mobile / QR Code",
        description:
          "Application mobile pour déclaration d'incidents, notifications push, quiz de sensibilisation et accès aux procédures via QR codes.",
        features: [
          "App mobile native",
          "QR codes",
          "Notifications push",
          "Mode offline",
        ],
      },
      {
        icon: qs,
        title: "Suivi maladies professionnelles",
        description:
          "Surveillance de la santé collective avec courbes épidémiologiques, fiches d'exposition, analyses des causes et prévention ciblée.",
        features: [
          "Surveillance collective",
          "Courbes épidémiologiques",
          "Fiches exposition",
          "Prévention ciblée",
        ],
      },
      {
        icon: Vn,
        title: "Chatbot chimique",
        description:
          "Assistant intelligent pour information instantanée sur les substances chimiques, FDS automatisées et aide à l'évaluation des risques.",
        features: [
          "IA conversationnelle",
          "Base FDS",
          "Évaluation risques",
          "Support 24/7",
        ],
      },
      {
        icon: uc,
        title: "Marketplace SST",
        description:
          "Recommandations neutres d'équipements de protection individuelle et solutions ergonomiques adaptées aux postes de travail.",
        features: [
          "Catalogue EPI",
          "Recommandations",
          "Comparatifs neutres",
          "Ergonomie postes",
        ],
      },
      {
        icon: Nl,
        title: "Moteur de calcul SST",
        description:
          "Calculs ROI sécurité, évaluation coûts directs/indirects des accidents, empreinte carbone et indicateurs de performance.",
        features: [
          "ROI sécurité",
          "Coûts accidents",
          "Empreinte carbone",
          "Indicateurs performance",
        ],
      },
      {
        icon: er,
        title: "Outils d'analyse avancée",
        description:
          "Méthodes RULA, REBA, NIOSH, Liberty Mutual, Six Sigma, analyses JSA/JHA pour évaluation ergonomique et prévention ciblée.",
        features: [
          "Méthodes RULA/REBA",
          "Analyse NIOSH",
          "Six Sigma",
          "JSA/JHA",
        ],
      },
    ];
  return t.jsx("section", {
    className: "py-20 bg-white",
    children: t.jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        t.jsxs("div", {
          className: "text-center mb-16",
          children: [
            t.jsx("h2", {
              className: "text-4xl mb-6 text-gray-900",
              children: "Aperçu de la plateforme",
            }),
            t.jsx("p", {
              className: "text-xl text-gray-600 max-w-3xl mx-auto",
              children:
                "Explorez nos modules interconnectés pour une gestion complète de la SST",
            }),
          ],
        }),
        t.jsxs("div", {
          className: "grid lg:grid-cols-2 gap-12",
          children: [
            t.jsx("div", {
              className: "space-y-4",
              children: c.map((u, f) =>
                t.jsx(
                  "div",
                  {
                    onClick: () => a(f),
                    className: `p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      l === f
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-[var(--sahtee-blue-primary)] shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`,
                    children: t.jsxs("div", {
                      className: "flex items-center gap-4",
                      children: [
                        t.jsx("div", {
                          className: `rounded-full p-2 ${
                            l === f
                              ? "bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)]"
                              : "bg-gray-400"
                          }`,
                          children: t.jsx(u.icon, {
                            className: "w-5 h-5 text-white",
                          }),
                        }),
                        t.jsx("h3", {
                          className: `text-lg ${
                            l === f
                              ? "text-[var(--sahtee-blue-primary)]"
                              : "text-gray-700"
                          }`,
                          children: u.title,
                        }),
                      ],
                    }),
                  },
                  f
                )
              ),
            }),
            t.jsxs("div", {
              className:
                "bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg",
              children: [
                t.jsxs("div", {
                  className: "flex items-center gap-4 mb-6",
                  children: [
                    t.jsx("div", {
                      className:
                        "bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-full p-3",
                      children: (() => {
                        const u = c[l].icon;
                        return t.jsx(u, { className: "w-8 h-8 text-white" });
                      })(),
                    }),
                    t.jsx("h3", {
                      className: "text-2xl text-gray-900",
                      children: c[l].title,
                    }),
                  ],
                }),
                t.jsx("p", {
                  className: "text-gray-600 leading-relaxed mb-8",
                  children: c[l].description,
                }),
                t.jsx("div", {
                  className: "grid grid-cols-2 gap-4 mb-8",
                  children: c[l].features.map((u, f) =>
                    t.jsxs(
                      "div",
                      {
                        className: "flex items-center gap-2",
                        children: [
                          t.jsx("div", {
                            className:
                              "w-2 h-2 bg-[var(--sahtee-blue-primary)] rounded-full",
                          }),
                          t.jsx("span", {
                            className: "text-sm text-gray-600",
                            children: u,
                          }),
                        ],
                      },
                      f
                    )
                  ),
                }),
                t.jsx("div", {
                  className: "bg-white rounded-lg p-4 shadow-inner",
                  children: t.jsx("img", {
                    src: s,
                    alt: "Dashboard Preview",
                    className: "w-full rounded-lg",
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Hm(s, [l, a]) {
  return Math.min(a, Math.max(l, s));
}
function Ge(s, l, { checkForDefaultPrevented: a = !0 } = {}) {
  return function (u) {
    if ((s?.(u), a === !1 || !u.defaultPrevented)) return l?.(u);
  };
}
function Sy(s) {
  const l = s + "CollectionProvider",
    [a, c] = kl(l),
    [u, f] = a(l, { collectionRef: { current: null }, itemMap: new Map() }),
    p = (b) => {
      const { scope: E, children: I } = b,
        z = Lr.useRef(null),
        O = Lr.useRef(new Map()).current;
      return t.jsx(u, { scope: E, itemMap: O, collectionRef: z, children: I });
    };
  p.displayName = l;
  const m = s + "CollectionSlot",
    x = Bs(m),
    v = Lr.forwardRef((b, E) => {
      const { scope: I, children: z } = b,
        O = f(m, I),
        D = st(E, O.collectionRef);
      return t.jsx(x, { ref: D, children: z });
    });
  v.displayName = m;
  const N = s + "CollectionItemSlot",
    g = "data-radix-collection-item",
    S = Bs(N),
    A = Lr.forwardRef((b, E) => {
      const { scope: I, children: z, ...O } = b,
        D = Lr.useRef(null),
        q = st(E, D),
        Z = f(N, I);
      return (
        Lr.useEffect(
          () => (
            Z.itemMap.set(D, { ref: D, ...O }), () => void Z.itemMap.delete(D)
          )
        ),
        t.jsx(S, { [g]: "", ref: q, children: z })
      );
    });
  A.displayName = N;
  function T(b) {
    const E = f(s + "CollectionConsumer", b);
    return Lr.useCallback(() => {
      const z = E.collectionRef.current;
      if (!z) return [];
      const O = Array.from(z.querySelectorAll(`[${g}]`));
      return Array.from(E.itemMap.values()).sort(
        (Z, U) => O.indexOf(Z.ref.current) - O.indexOf(U.ref.current)
      );
    }, [E.collectionRef, E.itemMap]);
  }
  return [{ Provider: p, Slot: v, ItemSlot: A }, T, c];
}
var ky = j.createContext(void 0);
function Cy(s) {
  const l = j.useContext(ky);
  return s || l || "ltr";
}
function an(s) {
  const l = j.useRef(s);
  return (
    j.useEffect(() => {
      l.current = s;
    }),
    j.useMemo(
      () =>
        (...a) =>
          l.current?.(...a),
      []
    )
  );
}
function Ey(s, l = globalThis?.document) {
  const a = an(s);
  j.useEffect(() => {
    const c = (u) => {
      u.key === "Escape" && a(u);
    };
    return (
      l.addEventListener("keydown", c, { capture: !0 }),
      () => l.removeEventListener("keydown", c, { capture: !0 })
    );
  }, [a, l]);
}
var Py = "DismissableLayer",
  ec = "dismissableLayer.update",
  Ay = "dismissableLayer.pointerDownOutside",
  Ry = "dismissableLayer.focusOutside",
  Vm,
  Jf = j.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  eh = j.forwardRef((s, l) => {
    const {
        disableOutsidePointerEvents: a = !1,
        onEscapeKeyDown: c,
        onPointerDownOutside: u,
        onFocusOutside: f,
        onInteractOutside: p,
        onDismiss: m,
        ...x
      } = s,
      v = j.useContext(Jf),
      [N, g] = j.useState(null),
      S = N?.ownerDocument ?? globalThis?.document,
      [, A] = j.useState({}),
      T = st(l, (U) => g(U)),
      b = Array.from(v.layers),
      [E] = [...v.layersWithOutsidePointerEventsDisabled].slice(-1),
      I = b.indexOf(E),
      z = N ? b.indexOf(N) : -1,
      O = v.layersWithOutsidePointerEventsDisabled.size > 0,
      D = z >= I,
      q = Ty((U) => {
        const H = U.target,
          he = [...v.branches].some((ye) => ye.contains(H));
        !D || he || (u?.(U), p?.(U), U.defaultPrevented || m?.());
      }, S),
      Z = zy((U) => {
        const H = U.target;
        [...v.branches].some((ye) => ye.contains(H)) ||
          (f?.(U), p?.(U), U.defaultPrevented || m?.());
      }, S);
    return (
      Ey((U) => {
        z === v.layers.size - 1 &&
          (c?.(U), !U.defaultPrevented && m && (U.preventDefault(), m()));
      }, S),
      j.useEffect(() => {
        if (N)
          return (
            a &&
              (v.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((Vm = S.body.style.pointerEvents),
                (S.body.style.pointerEvents = "none")),
              v.layersWithOutsidePointerEventsDisabled.add(N)),
            v.layers.add(N),
            qm(),
            () => {
              a &&
                v.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (S.body.style.pointerEvents = Vm);
            }
          );
      }, [N, S, a, v]),
      j.useEffect(
        () => () => {
          N &&
            (v.layers.delete(N),
            v.layersWithOutsidePointerEventsDisabled.delete(N),
            qm());
        },
        [N, v]
      ),
      j.useEffect(() => {
        const U = () => A({});
        return (
          document.addEventListener(ec, U),
          () => document.removeEventListener(ec, U)
        );
      }, []),
      t.jsx($e.div, {
        ...x,
        ref: T,
        style: {
          pointerEvents: O ? (D ? "auto" : "none") : void 0,
          ...s.style,
        },
        onFocusCapture: Ge(s.onFocusCapture, Z.onFocusCapture),
        onBlurCapture: Ge(s.onBlurCapture, Z.onBlurCapture),
        onPointerDownCapture: Ge(
          s.onPointerDownCapture,
          q.onPointerDownCapture
        ),
      })
    );
  });
eh.displayName = Py;
var My = "DismissableLayerBranch",
  _y = j.forwardRef((s, l) => {
    const a = j.useContext(Jf),
      c = j.useRef(null),
      u = st(l, c);
    return (
      j.useEffect(() => {
        const f = c.current;
        if (f)
          return (
            a.branches.add(f),
            () => {
              a.branches.delete(f);
            }
          );
      }, [a.branches]),
      t.jsx($e.div, { ...s, ref: u })
    );
  });
_y.displayName = My;
function Ty(s, l = globalThis?.document) {
  const a = an(s),
    c = j.useRef(!1),
    u = j.useRef(() => {});
  return (
    j.useEffect(() => {
      const f = (m) => {
          if (m.target && !c.current) {
            let x = function () {
              th(Ay, a, v, { discrete: !0 });
            };
            const v = { originalEvent: m };
            m.pointerType === "touch"
              ? (l.removeEventListener("click", u.current),
                (u.current = x),
                l.addEventListener("click", u.current, { once: !0 }))
              : x();
          } else l.removeEventListener("click", u.current);
          c.current = !1;
        },
        p = window.setTimeout(() => {
          l.addEventListener("pointerdown", f);
        }, 0);
      return () => {
        window.clearTimeout(p),
          l.removeEventListener("pointerdown", f),
          l.removeEventListener("click", u.current);
      };
    }, [l, a]),
    { onPointerDownCapture: () => (c.current = !0) }
  );
}
function zy(s, l = globalThis?.document) {
  const a = an(s),
    c = j.useRef(!1);
  return (
    j.useEffect(() => {
      const u = (f) => {
        f.target &&
          !c.current &&
          th(Ry, a, { originalEvent: f }, { discrete: !1 });
      };
      return (
        l.addEventListener("focusin", u),
        () => l.removeEventListener("focusin", u)
      );
    }, [l, a]),
    {
      onFocusCapture: () => (c.current = !0),
      onBlurCapture: () => (c.current = !1),
    }
  );
}
function qm() {
  const s = new CustomEvent(ec);
  document.dispatchEvent(s);
}
function th(s, l, a, { discrete: c }) {
  const u = a.originalEvent.target,
    f = new CustomEvent(s, { bubbles: !1, cancelable: !0, detail: a });
  l && u.addEventListener(s, l, { once: !0 }),
    c ? Y0(u, f) : u.dispatchEvent(f);
}
var Lo = 0;
function Iy() {
  j.useEffect(() => {
    const s = document.querySelectorAll("[data-radix-focus-guard]");
    return (
      document.body.insertAdjacentElement("afterbegin", s[0] ?? Bm()),
      document.body.insertAdjacentElement("beforeend", s[1] ?? Bm()),
      Lo++,
      () => {
        Lo === 1 &&
          document
            .querySelectorAll("[data-radix-focus-guard]")
            .forEach((l) => l.remove()),
          Lo--;
      }
    );
  }, []);
}
function Bm() {
  const s = document.createElement("span");
  return (
    s.setAttribute("data-radix-focus-guard", ""),
    (s.tabIndex = 0),
    (s.style.outline = "none"),
    (s.style.opacity = "0"),
    (s.style.position = "fixed"),
    (s.style.pointerEvents = "none"),
    s
  );
}
var Do = "focusScope.autoFocusOnMount",
  Fo = "focusScope.autoFocusOnUnmount",
  Um = { bubbles: !1, cancelable: !0 },
  Oy = "FocusScope",
  rh = j.forwardRef((s, l) => {
    const {
        loop: a = !1,
        trapped: c = !1,
        onMountAutoFocus: u,
        onUnmountAutoFocus: f,
        ...p
      } = s,
      [m, x] = j.useState(null),
      v = an(u),
      N = an(f),
      g = j.useRef(null),
      S = st(l, (b) => x(b)),
      A = j.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    j.useEffect(() => {
      if (c) {
        let b = function (O) {
            if (A.paused || !m) return;
            const D = O.target;
            m.contains(D) ? (g.current = D) : Dr(g.current, { select: !0 });
          },
          E = function (O) {
            if (A.paused || !m) return;
            const D = O.relatedTarget;
            D !== null && (m.contains(D) || Dr(g.current, { select: !0 }));
          },
          I = function (O) {
            if (document.activeElement === document.body)
              for (const q of O) q.removedNodes.length > 0 && Dr(m);
          };
        document.addEventListener("focusin", b),
          document.addEventListener("focusout", E);
        const z = new MutationObserver(I);
        return (
          m && z.observe(m, { childList: !0, subtree: !0 }),
          () => {
            document.removeEventListener("focusin", b),
              document.removeEventListener("focusout", E),
              z.disconnect();
          }
        );
      }
    }, [c, m, A.paused]),
      j.useEffect(() => {
        if (m) {
          Gm.add(A);
          const b = document.activeElement;
          if (!m.contains(b)) {
            const I = new CustomEvent(Do, Um);
            m.addEventListener(Do, v),
              m.dispatchEvent(I),
              I.defaultPrevented ||
                (Ly(Vy(nh(m)), { select: !0 }),
                document.activeElement === b && Dr(m));
          }
          return () => {
            m.removeEventListener(Do, v),
              setTimeout(() => {
                const I = new CustomEvent(Fo, Um);
                m.addEventListener(Fo, N),
                  m.dispatchEvent(I),
                  I.defaultPrevented || Dr(b ?? document.body, { select: !0 }),
                  m.removeEventListener(Fo, N),
                  Gm.remove(A);
              }, 0);
          };
        }
      }, [m, v, N, A]);
    const T = j.useCallback(
      (b) => {
        if ((!a && !c) || A.paused) return;
        const E = b.key === "Tab" && !b.altKey && !b.ctrlKey && !b.metaKey,
          I = document.activeElement;
        if (E && I) {
          const z = b.currentTarget,
            [O, D] = Dy(z);
          O && D
            ? !b.shiftKey && I === D
              ? (b.preventDefault(), a && Dr(O, { select: !0 }))
              : b.shiftKey &&
                I === O &&
                (b.preventDefault(), a && Dr(D, { select: !0 }))
            : I === z && b.preventDefault();
        }
      },
      [a, c, A.paused]
    );
    return t.jsx($e.div, { tabIndex: -1, ...p, ref: S, onKeyDown: T });
  });
rh.displayName = Oy;
function Ly(s, { select: l = !1 } = {}) {
  const a = document.activeElement;
  for (const c of s)
    if ((Dr(c, { select: l }), document.activeElement !== a)) return;
}
function Dy(s) {
  const l = nh(s),
    a = Wm(l, s),
    c = Wm(l.reverse(), s);
  return [a, c];
}
function nh(s) {
  const l = [],
    a = document.createTreeWalker(s, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (c) => {
        const u = c.tagName === "INPUT" && c.type === "hidden";
        return c.disabled || c.hidden || u
          ? NodeFilter.FILTER_SKIP
          : c.tabIndex >= 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });
  for (; a.nextNode(); ) l.push(a.currentNode);
  return l;
}
function Wm(s, l) {
  for (const a of s) if (!Fy(a, { upTo: l })) return a;
}
function Fy(s, { upTo: l }) {
  if (getComputedStyle(s).visibility === "hidden") return !0;
  for (; s; ) {
    if (l !== void 0 && s === l) return !1;
    if (getComputedStyle(s).display === "none") return !0;
    s = s.parentElement;
  }
  return !1;
}
function $y(s) {
  return s instanceof HTMLInputElement && "select" in s;
}
function Dr(s, { select: l = !1 } = {}) {
  if (s && s.focus) {
    const a = document.activeElement;
    s.focus({ preventScroll: !0 }), s !== a && $y(s) && l && s.select();
  }
}
var Gm = Hy();
function Hy() {
  let s = [];
  return {
    add(l) {
      const a = s[0];
      l !== a && a?.pause(), (s = Qm(s, l)), s.unshift(l);
    },
    remove(l) {
      (s = Qm(s, l)), s[0]?.resume();
    },
  };
}
function Qm(s, l) {
  const a = [...s],
    c = a.indexOf(l);
  return c !== -1 && a.splice(c, 1), a;
}
function Vy(s) {
  return s.filter((l) => l.tagName !== "A");
}
var yt = globalThis?.document ? j.useLayoutEffect : () => {},
  qy = yf[" useId ".trim().toString()] || (() => {}),
  By = 0;
function xc(s) {
  const [l, a] = j.useState(qy());
  return (
    yt(() => {
      a((c) => c ?? String(By++));
    }, [s]),
    s || (l ? `radix-${l}` : "")
  );
}
const Uy = ["top", "right", "bottom", "left"],
  $r = Math.min,
  kt = Math.max,
  gl = Math.round,
  ol = Math.floor,
  Jt = (s) => ({ x: s, y: s }),
  Wy = { left: "right", right: "left", bottom: "top", top: "bottom" },
  Gy = { start: "end", end: "start" };
function tc(s, l, a) {
  return kt(s, $r(l, a));
}
function pr(s, l) {
  return typeof s == "function" ? s(l) : s;
}
function xr(s) {
  return s.split("-")[0];
}
function Zn(s) {
  return s.split("-")[1];
}
function gc(s) {
  return s === "x" ? "y" : "x";
}
function vc(s) {
  return s === "y" ? "height" : "width";
}
const Qy = new Set(["top", "bottom"]);
function Zt(s) {
  return Qy.has(xr(s)) ? "y" : "x";
}
function yc(s) {
  return gc(Zt(s));
}
function Ky(s, l, a) {
  a === void 0 && (a = !1);
  const c = Zn(s),
    u = yc(s),
    f = vc(u);
  let p =
    u === "x"
      ? c === (a ? "end" : "start")
        ? "right"
        : "left"
      : c === "start"
      ? "bottom"
      : "top";
  return l.reference[f] > l.floating[f] && (p = vl(p)), [p, vl(p)];
}
function Yy(s) {
  const l = vl(s);
  return [rc(s), l, rc(l)];
}
function rc(s) {
  return s.replace(/start|end/g, (l) => Gy[l]);
}
const Km = ["left", "right"],
  Ym = ["right", "left"],
  Xy = ["top", "bottom"],
  Zy = ["bottom", "top"];
function Jy(s, l, a) {
  switch (s) {
    case "top":
    case "bottom":
      return a ? (l ? Ym : Km) : l ? Km : Ym;
    case "left":
    case "right":
      return l ? Xy : Zy;
    default:
      return [];
  }
}
function ej(s, l, a, c) {
  const u = Zn(s);
  let f = Jy(xr(s), a === "start", c);
  return (
    u && ((f = f.map((p) => p + "-" + u)), l && (f = f.concat(f.map(rc)))), f
  );
}
function vl(s) {
  return s.replace(/left|right|bottom|top/g, (l) => Wy[l]);
}
function tj(s) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...s };
}
function sh(s) {
  return typeof s != "number"
    ? tj(s)
    : { top: s, right: s, bottom: s, left: s };
}
function yl(s) {
  const { x: l, y: a, width: c, height: u } = s;
  return {
    width: c,
    height: u,
    top: a,
    left: l,
    right: l + c,
    bottom: a + u,
    x: l,
    y: a,
  };
}
function Xm(s, l, a) {
  let { reference: c, floating: u } = s;
  const f = Zt(l),
    p = yc(l),
    m = vc(p),
    x = xr(l),
    v = f === "y",
    N = c.x + c.width / 2 - u.width / 2,
    g = c.y + c.height / 2 - u.height / 2,
    S = c[m] / 2 - u[m] / 2;
  let A;
  switch (x) {
    case "top":
      A = { x: N, y: c.y - u.height };
      break;
    case "bottom":
      A = { x: N, y: c.y + c.height };
      break;
    case "right":
      A = { x: c.x + c.width, y: g };
      break;
    case "left":
      A = { x: c.x - u.width, y: g };
      break;
    default:
      A = { x: c.x, y: c.y };
  }
  switch (Zn(l)) {
    case "start":
      A[p] -= S * (a && v ? -1 : 1);
      break;
    case "end":
      A[p] += S * (a && v ? -1 : 1);
      break;
  }
  return A;
}
const rj = async (s, l, a) => {
  const {
      placement: c = "bottom",
      strategy: u = "absolute",
      middleware: f = [],
      platform: p,
    } = a,
    m = f.filter(Boolean),
    x = await (p.isRTL == null ? void 0 : p.isRTL(l));
  let v = await p.getElementRects({ reference: s, floating: l, strategy: u }),
    { x: N, y: g } = Xm(v, c, x),
    S = c,
    A = {},
    T = 0;
  for (let b = 0; b < m.length; b++) {
    const { name: E, fn: I } = m[b],
      {
        x: z,
        y: O,
        data: D,
        reset: q,
      } = await I({
        x: N,
        y: g,
        initialPlacement: c,
        placement: S,
        strategy: u,
        middlewareData: A,
        rects: v,
        platform: p,
        elements: { reference: s, floating: l },
      });
    (N = z ?? N),
      (g = O ?? g),
      (A = { ...A, [E]: { ...A[E], ...D } }),
      q &&
        T <= 50 &&
        (T++,
        typeof q == "object" &&
          (q.placement && (S = q.placement),
          q.rects &&
            (v =
              q.rects === !0
                ? await p.getElementRects({
                    reference: s,
                    floating: l,
                    strategy: u,
                  })
                : q.rects),
          ({ x: N, y: g } = Xm(v, S, x))),
        (b = -1));
  }
  return { x: N, y: g, placement: S, strategy: u, middlewareData: A };
};
async function Us(s, l) {
  var a;
  l === void 0 && (l = {});
  const { x: c, y: u, platform: f, rects: p, elements: m, strategy: x } = s,
    {
      boundary: v = "clippingAncestors",
      rootBoundary: N = "viewport",
      elementContext: g = "floating",
      altBoundary: S = !1,
      padding: A = 0,
    } = pr(l, s),
    T = sh(A),
    E = m[S ? (g === "floating" ? "reference" : "floating") : g],
    I = yl(
      await f.getClippingRect({
        element:
          (a = await (f.isElement == null ? void 0 : f.isElement(E))) == null ||
          a
            ? E
            : E.contextElement ||
              (await (f.getDocumentElement == null
                ? void 0
                : f.getDocumentElement(m.floating))),
        boundary: v,
        rootBoundary: N,
        strategy: x,
      })
    ),
    z =
      g === "floating"
        ? { x: c, y: u, width: p.floating.width, height: p.floating.height }
        : p.reference,
    O = await (f.getOffsetParent == null
      ? void 0
      : f.getOffsetParent(m.floating)),
    D = (await (f.isElement == null ? void 0 : f.isElement(O)))
      ? (await (f.getScale == null ? void 0 : f.getScale(O))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    q = yl(
      f.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await f.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: m,
            rect: z,
            offsetParent: O,
            strategy: x,
          })
        : z
    );
  return {
    top: (I.top - q.top + T.top) / D.y,
    bottom: (q.bottom - I.bottom + T.bottom) / D.y,
    left: (I.left - q.left + T.left) / D.x,
    right: (q.right - I.right + T.right) / D.x,
  };
}
const nj = (s) => ({
    name: "arrow",
    options: s,
    async fn(l) {
      const {
          x: a,
          y: c,
          placement: u,
          rects: f,
          platform: p,
          elements: m,
          middlewareData: x,
        } = l,
        { element: v, padding: N = 0 } = pr(s, l) || {};
      if (v == null) return {};
      const g = sh(N),
        S = { x: a, y: c },
        A = yc(u),
        T = vc(A),
        b = await p.getDimensions(v),
        E = A === "y",
        I = E ? "top" : "left",
        z = E ? "bottom" : "right",
        O = E ? "clientHeight" : "clientWidth",
        D = f.reference[T] + f.reference[A] - S[A] - f.floating[T],
        q = S[A] - f.reference[A],
        Z = await (p.getOffsetParent == null ? void 0 : p.getOffsetParent(v));
      let U = Z ? Z[O] : 0;
      (!U || !(await (p.isElement == null ? void 0 : p.isElement(Z)))) &&
        (U = m.floating[O] || f.floating[T]);
      const H = D / 2 - q / 2,
        he = U / 2 - b[T] / 2 - 1,
        ye = $r(g[I], he),
        Ae = $r(g[z], he),
        Ce = ye,
        je = U - b[T] - Ae,
        ge = U / 2 - b[T] / 2 + H,
        Ee = tc(Ce, ge, je),
        de =
          !x.arrow &&
          Zn(u) != null &&
          ge !== Ee &&
          f.reference[T] / 2 - (ge < Ce ? ye : Ae) - b[T] / 2 < 0,
        le = de ? (ge < Ce ? ge - Ce : ge - je) : 0;
      return {
        [A]: S[A] + le,
        data: {
          [A]: Ee,
          centerOffset: ge - Ee - le,
          ...(de && { alignmentOffset: le }),
        },
        reset: de,
      };
    },
  }),
  sj = function (s) {
    return (
      s === void 0 && (s = {}),
      {
        name: "flip",
        options: s,
        async fn(l) {
          var a, c;
          const {
              placement: u,
              middlewareData: f,
              rects: p,
              initialPlacement: m,
              platform: x,
              elements: v,
            } = l,
            {
              mainAxis: N = !0,
              crossAxis: g = !0,
              fallbackPlacements: S,
              fallbackStrategy: A = "bestFit",
              fallbackAxisSideDirection: T = "none",
              flipAlignment: b = !0,
              ...E
            } = pr(s, l);
          if ((a = f.arrow) != null && a.alignmentOffset) return {};
          const I = xr(u),
            z = Zt(m),
            O = xr(m) === m,
            D = await (x.isRTL == null ? void 0 : x.isRTL(v.floating)),
            q = S || (O || !b ? [vl(m)] : Yy(m)),
            Z = T !== "none";
          !S && Z && q.push(...ej(m, b, T, D));
          const U = [m, ...q],
            H = await Us(l, E),
            he = [];
          let ye = ((c = f.flip) == null ? void 0 : c.overflows) || [];
          if ((N && he.push(H[I]), g)) {
            const ge = Ky(u, p, D);
            he.push(H[ge[0]], H[ge[1]]);
          }
          if (
            ((ye = [...ye, { placement: u, overflows: he }]),
            !he.every((ge) => ge <= 0))
          ) {
            var Ae, Ce;
            const ge = (((Ae = f.flip) == null ? void 0 : Ae.index) || 0) + 1,
              Ee = U[ge];
            if (
              Ee &&
              (!(g === "alignment" ? z !== Zt(Ee) : !1) ||
                ye.every((P) =>
                  Zt(P.placement) === z ? P.overflows[0] > 0 : !0
                ))
            )
              return {
                data: { index: ge, overflows: ye },
                reset: { placement: Ee },
              };
            let de =
              (Ce = ye
                .filter((le) => le.overflows[0] <= 0)
                .sort((le, P) => le.overflows[1] - P.overflows[1])[0]) == null
                ? void 0
                : Ce.placement;
            if (!de)
              switch (A) {
                case "bestFit": {
                  var je;
                  const le =
                    (je = ye
                      .filter((P) => {
                        if (Z) {
                          const X = Zt(P.placement);
                          return X === z || X === "y";
                        }
                        return !0;
                      })
                      .map((P) => [
                        P.placement,
                        P.overflows
                          .filter((X) => X > 0)
                          .reduce((X, K) => X + K, 0),
                      ])
                      .sort((P, X) => P[1] - X[1])[0]) == null
                      ? void 0
                      : je[0];
                  le && (de = le);
                  break;
                }
                case "initialPlacement":
                  de = m;
                  break;
              }
            if (u !== de) return { reset: { placement: de } };
          }
          return {};
        },
      }
    );
  };
function Zm(s, l) {
  return {
    top: s.top - l.height,
    right: s.right - l.width,
    bottom: s.bottom - l.height,
    left: s.left - l.width,
  };
}
function Jm(s) {
  return Uy.some((l) => s[l] >= 0);
}
const ij = function (s) {
    return (
      s === void 0 && (s = {}),
      {
        name: "hide",
        options: s,
        async fn(l) {
          const { rects: a } = l,
            { strategy: c = "referenceHidden", ...u } = pr(s, l);
          switch (c) {
            case "referenceHidden": {
              const f = await Us(l, { ...u, elementContext: "reference" }),
                p = Zm(f, a.reference);
              return {
                data: { referenceHiddenOffsets: p, referenceHidden: Jm(p) },
              };
            }
            case "escaped": {
              const f = await Us(l, { ...u, altBoundary: !0 }),
                p = Zm(f, a.floating);
              return { data: { escapedOffsets: p, escaped: Jm(p) } };
            }
            default:
              return {};
          }
        },
      }
    );
  },
  ih = new Set(["left", "top"]);
async function lj(s, l) {
  const { placement: a, platform: c, elements: u } = s,
    f = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)),
    p = xr(a),
    m = Zn(a),
    x = Zt(a) === "y",
    v = ih.has(p) ? -1 : 1,
    N = f && x ? -1 : 1,
    g = pr(l, s);
  let {
    mainAxis: S,
    crossAxis: A,
    alignmentAxis: T,
  } = typeof g == "number"
    ? { mainAxis: g, crossAxis: 0, alignmentAxis: null }
    : {
        mainAxis: g.mainAxis || 0,
        crossAxis: g.crossAxis || 0,
        alignmentAxis: g.alignmentAxis,
      };
  return (
    m && typeof T == "number" && (A = m === "end" ? T * -1 : T),
    x ? { x: A * N, y: S * v } : { x: S * v, y: A * N }
  );
}
const aj = function (s) {
    return (
      s === void 0 && (s = 0),
      {
        name: "offset",
        options: s,
        async fn(l) {
          var a, c;
          const { x: u, y: f, placement: p, middlewareData: m } = l,
            x = await lj(l, s);
          return p === ((a = m.offset) == null ? void 0 : a.placement) &&
            (c = m.arrow) != null &&
            c.alignmentOffset
            ? {}
            : { x: u + x.x, y: f + x.y, data: { ...x, placement: p } };
        },
      }
    );
  },
  oj = function (s) {
    return (
      s === void 0 && (s = {}),
      {
        name: "shift",
        options: s,
        async fn(l) {
          const { x: a, y: c, placement: u } = l,
            {
              mainAxis: f = !0,
              crossAxis: p = !1,
              limiter: m = {
                fn: (E) => {
                  let { x: I, y: z } = E;
                  return { x: I, y: z };
                },
              },
              ...x
            } = pr(s, l),
            v = { x: a, y: c },
            N = await Us(l, x),
            g = Zt(xr(u)),
            S = gc(g);
          let A = v[S],
            T = v[g];
          if (f) {
            const E = S === "y" ? "top" : "left",
              I = S === "y" ? "bottom" : "right",
              z = A + N[E],
              O = A - N[I];
            A = tc(z, A, O);
          }
          if (p) {
            const E = g === "y" ? "top" : "left",
              I = g === "y" ? "bottom" : "right",
              z = T + N[E],
              O = T - N[I];
            T = tc(z, T, O);
          }
          const b = m.fn({ ...l, [S]: A, [g]: T });
          return {
            ...b,
            data: { x: b.x - a, y: b.y - c, enabled: { [S]: f, [g]: p } },
          };
        },
      }
    );
  },
  cj = function (s) {
    return (
      s === void 0 && (s = {}),
      {
        options: s,
        fn(l) {
          const { x: a, y: c, placement: u, rects: f, middlewareData: p } = l,
            { offset: m = 0, mainAxis: x = !0, crossAxis: v = !0 } = pr(s, l),
            N = { x: a, y: c },
            g = Zt(u),
            S = gc(g);
          let A = N[S],
            T = N[g];
          const b = pr(m, l),
            E =
              typeof b == "number"
                ? { mainAxis: b, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...b };
          if (x) {
            const O = S === "y" ? "height" : "width",
              D = f.reference[S] - f.floating[O] + E.mainAxis,
              q = f.reference[S] + f.reference[O] - E.mainAxis;
            A < D ? (A = D) : A > q && (A = q);
          }
          if (v) {
            var I, z;
            const O = S === "y" ? "width" : "height",
              D = ih.has(xr(u)),
              q =
                f.reference[g] -
                f.floating[O] +
                ((D && ((I = p.offset) == null ? void 0 : I[g])) || 0) +
                (D ? 0 : E.crossAxis),
              Z =
                f.reference[g] +
                f.reference[O] +
                (D ? 0 : ((z = p.offset) == null ? void 0 : z[g]) || 0) -
                (D ? E.crossAxis : 0);
            T < q ? (T = q) : T > Z && (T = Z);
          }
          return { [S]: A, [g]: T };
        },
      }
    );
  },
  dj = function (s) {
    return (
      s === void 0 && (s = {}),
      {
        name: "size",
        options: s,
        async fn(l) {
          var a, c;
          const { placement: u, rects: f, platform: p, elements: m } = l,
            { apply: x = () => {}, ...v } = pr(s, l),
            N = await Us(l, v),
            g = xr(u),
            S = Zn(u),
            A = Zt(u) === "y",
            { width: T, height: b } = f.floating;
          let E, I;
          g === "top" || g === "bottom"
            ? ((E = g),
              (I =
                S ===
                ((await (p.isRTL == null ? void 0 : p.isRTL(m.floating)))
                  ? "start"
                  : "end")
                  ? "left"
                  : "right"))
            : ((I = g), (E = S === "end" ? "top" : "bottom"));
          const z = b - N.top - N.bottom,
            O = T - N.left - N.right,
            D = $r(b - N[E], z),
            q = $r(T - N[I], O),
            Z = !l.middlewareData.shift;
          let U = D,
            H = q;
          if (
            ((a = l.middlewareData.shift) != null && a.enabled.x && (H = O),
            (c = l.middlewareData.shift) != null && c.enabled.y && (U = z),
            Z && !S)
          ) {
            const ye = kt(N.left, 0),
              Ae = kt(N.right, 0),
              Ce = kt(N.top, 0),
              je = kt(N.bottom, 0);
            A
              ? (H =
                  T -
                  2 * (ye !== 0 || Ae !== 0 ? ye + Ae : kt(N.left, N.right)))
              : (U =
                  b -
                  2 * (Ce !== 0 || je !== 0 ? Ce + je : kt(N.top, N.bottom)));
          }
          await x({ ...l, availableWidth: H, availableHeight: U });
          const he = await p.getDimensions(m.floating);
          return T !== he.width || b !== he.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function Cl() {
  return typeof window < "u";
}
function Jn(s) {
  return lh(s) ? (s.nodeName || "").toLowerCase() : "#document";
}
function Ct(s) {
  var l;
  return (
    (s == null || (l = s.ownerDocument) == null ? void 0 : l.defaultView) ||
    window
  );
}
function nr(s) {
  var l;
  return (l = (lh(s) ? s.ownerDocument : s.document) || window.document) == null
    ? void 0
    : l.documentElement;
}
function lh(s) {
  return Cl() ? s instanceof Node || s instanceof Ct(s).Node : !1;
}
function Bt(s) {
  return Cl() ? s instanceof Element || s instanceof Ct(s).Element : !1;
}
function rr(s) {
  return Cl() ? s instanceof HTMLElement || s instanceof Ct(s).HTMLElement : !1;
}
function ef(s) {
  return !Cl() || typeof ShadowRoot > "u"
    ? !1
    : s instanceof ShadowRoot || s instanceof Ct(s).ShadowRoot;
}
const uj = new Set(["inline", "contents"]);
function Qs(s) {
  const { overflow: l, overflowX: a, overflowY: c, display: u } = Ut(s);
  return /auto|scroll|overlay|hidden|clip/.test(l + c + a) && !uj.has(u);
}
const mj = new Set(["table", "td", "th"]);
function fj(s) {
  return mj.has(Jn(s));
}
const hj = [":popover-open", ":modal"];
function El(s) {
  return hj.some((l) => {
    try {
      return s.matches(l);
    } catch {
      return !1;
    }
  });
}
const pj = ["transform", "translate", "scale", "rotate", "perspective"],
  xj = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
  gj = ["paint", "layout", "strict", "content"];
function jc(s) {
  const l = bc(),
    a = Bt(s) ? Ut(s) : s;
  return (
    pj.some((c) => (a[c] ? a[c] !== "none" : !1)) ||
    (a.containerType ? a.containerType !== "normal" : !1) ||
    (!l && (a.backdropFilter ? a.backdropFilter !== "none" : !1)) ||
    (!l && (a.filter ? a.filter !== "none" : !1)) ||
    xj.some((c) => (a.willChange || "").includes(c)) ||
    gj.some((c) => (a.contain || "").includes(c))
  );
}
function vj(s) {
  let l = Hr(s);
  for (; rr(l) && !Qn(l); ) {
    if (jc(l)) return l;
    if (El(l)) return null;
    l = Hr(l);
  }
  return null;
}
function bc() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none");
}
const yj = new Set(["html", "body", "#document"]);
function Qn(s) {
  return yj.has(Jn(s));
}
function Ut(s) {
  return Ct(s).getComputedStyle(s);
}
function Pl(s) {
  return Bt(s)
    ? { scrollLeft: s.scrollLeft, scrollTop: s.scrollTop }
    : { scrollLeft: s.scrollX, scrollTop: s.scrollY };
}
function Hr(s) {
  if (Jn(s) === "html") return s;
  const l = s.assignedSlot || s.parentNode || (ef(s) && s.host) || nr(s);
  return ef(l) ? l.host : l;
}
function ah(s) {
  const l = Hr(s);
  return Qn(l)
    ? s.ownerDocument
      ? s.ownerDocument.body
      : s.body
    : rr(l) && Qs(l)
    ? l
    : ah(l);
}
function Ws(s, l, a) {
  var c;
  l === void 0 && (l = []), a === void 0 && (a = !0);
  const u = ah(s),
    f = u === ((c = s.ownerDocument) == null ? void 0 : c.body),
    p = Ct(u);
  if (f) {
    const m = nc(p);
    return l.concat(
      p,
      p.visualViewport || [],
      Qs(u) ? u : [],
      m && a ? Ws(m) : []
    );
  }
  return l.concat(u, Ws(u, [], a));
}
function nc(s) {
  return s.parent && Object.getPrototypeOf(s.parent) ? s.frameElement : null;
}
function oh(s) {
  const l = Ut(s);
  let a = parseFloat(l.width) || 0,
    c = parseFloat(l.height) || 0;
  const u = rr(s),
    f = u ? s.offsetWidth : a,
    p = u ? s.offsetHeight : c,
    m = gl(a) !== f || gl(c) !== p;
  return m && ((a = f), (c = p)), { width: a, height: c, $: m };
}
function Nc(s) {
  return Bt(s) ? s : s.contextElement;
}
function qn(s) {
  const l = Nc(s);
  if (!rr(l)) return Jt(1);
  const a = l.getBoundingClientRect(),
    { width: c, height: u, $: f } = oh(l);
  let p = (f ? gl(a.width) : a.width) / c,
    m = (f ? gl(a.height) : a.height) / u;
  return (
    (!p || !Number.isFinite(p)) && (p = 1),
    (!m || !Number.isFinite(m)) && (m = 1),
    { x: p, y: m }
  );
}
const jj = Jt(0);
function ch(s) {
  const l = Ct(s);
  return !bc() || !l.visualViewport
    ? jj
    : { x: l.visualViewport.offsetLeft, y: l.visualViewport.offsetTop };
}
function bj(s, l, a) {
  return l === void 0 && (l = !1), !a || (l && a !== Ct(s)) ? !1 : l;
}
function on(s, l, a, c) {
  l === void 0 && (l = !1), a === void 0 && (a = !1);
  const u = s.getBoundingClientRect(),
    f = Nc(s);
  let p = Jt(1);
  l && (c ? Bt(c) && (p = qn(c)) : (p = qn(s)));
  const m = bj(f, a, c) ? ch(f) : Jt(0);
  let x = (u.left + m.x) / p.x,
    v = (u.top + m.y) / p.y,
    N = u.width / p.x,
    g = u.height / p.y;
  if (f) {
    const S = Ct(f),
      A = c && Bt(c) ? Ct(c) : c;
    let T = S,
      b = nc(T);
    for (; b && c && A !== T; ) {
      const E = qn(b),
        I = b.getBoundingClientRect(),
        z = Ut(b),
        O = I.left + (b.clientLeft + parseFloat(z.paddingLeft)) * E.x,
        D = I.top + (b.clientTop + parseFloat(z.paddingTop)) * E.y;
      (x *= E.x),
        (v *= E.y),
        (N *= E.x),
        (g *= E.y),
        (x += O),
        (v += D),
        (T = Ct(b)),
        (b = nc(T));
    }
  }
  return yl({ width: N, height: g, x, y: v });
}
function Al(s, l) {
  const a = Pl(s).scrollLeft;
  return l ? l.left + a : on(nr(s)).left + a;
}
function dh(s, l) {
  const a = s.getBoundingClientRect(),
    c = a.left + l.scrollLeft - Al(s, a),
    u = a.top + l.scrollTop;
  return { x: c, y: u };
}
function Nj(s) {
  let { elements: l, rect: a, offsetParent: c, strategy: u } = s;
  const f = u === "fixed",
    p = nr(c),
    m = l ? El(l.floating) : !1;
  if (c === p || (m && f)) return a;
  let x = { scrollLeft: 0, scrollTop: 0 },
    v = Jt(1);
  const N = Jt(0),
    g = rr(c);
  if (
    (g || (!g && !f)) &&
    ((Jn(c) !== "body" || Qs(p)) && (x = Pl(c)), rr(c))
  ) {
    const A = on(c);
    (v = qn(c)), (N.x = A.x + c.clientLeft), (N.y = A.y + c.clientTop);
  }
  const S = p && !g && !f ? dh(p, x) : Jt(0);
  return {
    width: a.width * v.x,
    height: a.height * v.y,
    x: a.x * v.x - x.scrollLeft * v.x + N.x + S.x,
    y: a.y * v.y - x.scrollTop * v.y + N.y + S.y,
  };
}
function wj(s) {
  return Array.from(s.getClientRects());
}
function Sj(s) {
  const l = nr(s),
    a = Pl(s),
    c = s.ownerDocument.body,
    u = kt(l.scrollWidth, l.clientWidth, c.scrollWidth, c.clientWidth),
    f = kt(l.scrollHeight, l.clientHeight, c.scrollHeight, c.clientHeight);
  let p = -a.scrollLeft + Al(s);
  const m = -a.scrollTop;
  return (
    Ut(c).direction === "rtl" && (p += kt(l.clientWidth, c.clientWidth) - u),
    { width: u, height: f, x: p, y: m }
  );
}
const tf = 25;
function kj(s, l) {
  const a = Ct(s),
    c = nr(s),
    u = a.visualViewport;
  let f = c.clientWidth,
    p = c.clientHeight,
    m = 0,
    x = 0;
  if (u) {
    (f = u.width), (p = u.height);
    const N = bc();
    (!N || (N && l === "fixed")) && ((m = u.offsetLeft), (x = u.offsetTop));
  }
  const v = Al(c);
  if (v <= 0) {
    const N = c.ownerDocument,
      g = N.body,
      S = getComputedStyle(g),
      A =
        (N.compatMode === "CSS1Compat" &&
          parseFloat(S.marginLeft) + parseFloat(S.marginRight)) ||
        0,
      T = Math.abs(c.clientWidth - g.clientWidth - A);
    T <= tf && (f -= T);
  } else v <= tf && (f += v);
  return { width: f, height: p, x: m, y: x };
}
const Cj = new Set(["absolute", "fixed"]);
function Ej(s, l) {
  const a = on(s, !0, l === "fixed"),
    c = a.top + s.clientTop,
    u = a.left + s.clientLeft,
    f = rr(s) ? qn(s) : Jt(1),
    p = s.clientWidth * f.x,
    m = s.clientHeight * f.y,
    x = u * f.x,
    v = c * f.y;
  return { width: p, height: m, x, y: v };
}
function rf(s, l, a) {
  let c;
  if (l === "viewport") c = kj(s, a);
  else if (l === "document") c = Sj(nr(s));
  else if (Bt(l)) c = Ej(l, a);
  else {
    const u = ch(s);
    c = { x: l.x - u.x, y: l.y - u.y, width: l.width, height: l.height };
  }
  return yl(c);
}
function uh(s, l) {
  const a = Hr(s);
  return a === l || !Bt(a) || Qn(a)
    ? !1
    : Ut(a).position === "fixed" || uh(a, l);
}
function Pj(s, l) {
  const a = l.get(s);
  if (a) return a;
  let c = Ws(s, [], !1).filter((m) => Bt(m) && Jn(m) !== "body"),
    u = null;
  const f = Ut(s).position === "fixed";
  let p = f ? Hr(s) : s;
  for (; Bt(p) && !Qn(p); ) {
    const m = Ut(p),
      x = jc(p);
    !x && m.position === "fixed" && (u = null),
      (
        f
          ? !x && !u
          : (!x && m.position === "static" && !!u && Cj.has(u.position)) ||
            (Qs(p) && !x && uh(s, p))
      )
        ? (c = c.filter((N) => N !== p))
        : (u = m),
      (p = Hr(p));
  }
  return l.set(s, c), c;
}
function Aj(s) {
  let { element: l, boundary: a, rootBoundary: c, strategy: u } = s;
  const p = [
      ...(a === "clippingAncestors"
        ? El(l)
          ? []
          : Pj(l, this._c)
        : [].concat(a)),
      c,
    ],
    m = p[0],
    x = p.reduce((v, N) => {
      const g = rf(l, N, u);
      return (
        (v.top = kt(g.top, v.top)),
        (v.right = $r(g.right, v.right)),
        (v.bottom = $r(g.bottom, v.bottom)),
        (v.left = kt(g.left, v.left)),
        v
      );
    }, rf(l, m, u));
  return {
    width: x.right - x.left,
    height: x.bottom - x.top,
    x: x.left,
    y: x.top,
  };
}
function Rj(s) {
  const { width: l, height: a } = oh(s);
  return { width: l, height: a };
}
function Mj(s, l, a) {
  const c = rr(l),
    u = nr(l),
    f = a === "fixed",
    p = on(s, !0, f, l);
  let m = { scrollLeft: 0, scrollTop: 0 };
  const x = Jt(0);
  function v() {
    x.x = Al(u);
  }
  if (c || (!c && !f))
    if (((Jn(l) !== "body" || Qs(u)) && (m = Pl(l)), c)) {
      const A = on(l, !0, f, l);
      (x.x = A.x + l.clientLeft), (x.y = A.y + l.clientTop);
    } else u && v();
  f && !c && u && v();
  const N = u && !c && !f ? dh(u, m) : Jt(0),
    g = p.left + m.scrollLeft - x.x - N.x,
    S = p.top + m.scrollTop - x.y - N.y;
  return { x: g, y: S, width: p.width, height: p.height };
}
function $o(s) {
  return Ut(s).position === "static";
}
function nf(s, l) {
  if (!rr(s) || Ut(s).position === "fixed") return null;
  if (l) return l(s);
  let a = s.offsetParent;
  return nr(s) === a && (a = a.ownerDocument.body), a;
}
function mh(s, l) {
  const a = Ct(s);
  if (El(s)) return a;
  if (!rr(s)) {
    let u = Hr(s);
    for (; u && !Qn(u); ) {
      if (Bt(u) && !$o(u)) return u;
      u = Hr(u);
    }
    return a;
  }
  let c = nf(s, l);
  for (; c && fj(c) && $o(c); ) c = nf(c, l);
  return c && Qn(c) && $o(c) && !jc(c) ? a : c || vj(s) || a;
}
const _j = async function (s) {
  const l = this.getOffsetParent || mh,
    a = this.getDimensions,
    c = await a(s.floating);
  return {
    reference: Mj(s.reference, await l(s.floating), s.strategy),
    floating: { x: 0, y: 0, width: c.width, height: c.height },
  };
};
function Tj(s) {
  return Ut(s).direction === "rtl";
}
const zj = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Nj,
  getDocumentElement: nr,
  getClippingRect: Aj,
  getOffsetParent: mh,
  getElementRects: _j,
  getClientRects: wj,
  getDimensions: Rj,
  getScale: qn,
  isElement: Bt,
  isRTL: Tj,
};
function fh(s, l) {
  return (
    s.x === l.x && s.y === l.y && s.width === l.width && s.height === l.height
  );
}
function Ij(s, l) {
  let a = null,
    c;
  const u = nr(s);
  function f() {
    var m;
    clearTimeout(c), (m = a) == null || m.disconnect(), (a = null);
  }
  function p(m, x) {
    m === void 0 && (m = !1), x === void 0 && (x = 1), f();
    const v = s.getBoundingClientRect(),
      { left: N, top: g, width: S, height: A } = v;
    if ((m || l(), !S || !A)) return;
    const T = ol(g),
      b = ol(u.clientWidth - (N + S)),
      E = ol(u.clientHeight - (g + A)),
      I = ol(N),
      O = {
        rootMargin: -T + "px " + -b + "px " + -E + "px " + -I + "px",
        threshold: kt(0, $r(1, x)) || 1,
      };
    let D = !0;
    function q(Z) {
      const U = Z[0].intersectionRatio;
      if (U !== x) {
        if (!D) return p();
        U
          ? p(!1, U)
          : (c = setTimeout(() => {
              p(!1, 1e-7);
            }, 1e3));
      }
      U === 1 && !fh(v, s.getBoundingClientRect()) && p(), (D = !1);
    }
    try {
      a = new IntersectionObserver(q, { ...O, root: u.ownerDocument });
    } catch {
      a = new IntersectionObserver(q, O);
    }
    a.observe(s);
  }
  return p(!0), f;
}
function Oj(s, l, a, c) {
  c === void 0 && (c = {});
  const {
      ancestorScroll: u = !0,
      ancestorResize: f = !0,
      elementResize: p = typeof ResizeObserver == "function",
      layoutShift: m = typeof IntersectionObserver == "function",
      animationFrame: x = !1,
    } = c,
    v = Nc(s),
    N = u || f ? [...(v ? Ws(v) : []), ...Ws(l)] : [];
  N.forEach((I) => {
    u && I.addEventListener("scroll", a, { passive: !0 }),
      f && I.addEventListener("resize", a);
  });
  const g = v && m ? Ij(v, a) : null;
  let S = -1,
    A = null;
  p &&
    ((A = new ResizeObserver((I) => {
      let [z] = I;
      z &&
        z.target === v &&
        A &&
        (A.unobserve(l),
        cancelAnimationFrame(S),
        (S = requestAnimationFrame(() => {
          var O;
          (O = A) == null || O.observe(l);
        }))),
        a();
    })),
    v && !x && A.observe(v),
    A.observe(l));
  let T,
    b = x ? on(s) : null;
  x && E();
  function E() {
    const I = on(s);
    b && !fh(b, I) && a(), (b = I), (T = requestAnimationFrame(E));
  }
  return (
    a(),
    () => {
      var I;
      N.forEach((z) => {
        u && z.removeEventListener("scroll", a),
          f && z.removeEventListener("resize", a);
      }),
        g?.(),
        (I = A) == null || I.disconnect(),
        (A = null),
        x && cancelAnimationFrame(T);
    }
  );
}
const Lj = aj,
  Dj = oj,
  Fj = sj,
  $j = dj,
  Hj = ij,
  sf = nj,
  Vj = cj,
  qj = (s, l, a) => {
    const c = new Map(),
      u = { platform: zj, ...a },
      f = { ...u.platform, _c: c };
    return rj(s, l, { ...u, platform: f });
  };
var Bj = typeof document < "u",
  Uj = function () {},
  fl = Bj ? j.useLayoutEffect : Uj;
function jl(s, l) {
  if (s === l) return !0;
  if (typeof s != typeof l) return !1;
  if (typeof s == "function" && s.toString() === l.toString()) return !0;
  let a, c, u;
  if (s && l && typeof s == "object") {
    if (Array.isArray(s)) {
      if (((a = s.length), a !== l.length)) return !1;
      for (c = a; c-- !== 0; ) if (!jl(s[c], l[c])) return !1;
      return !0;
    }
    if (((u = Object.keys(s)), (a = u.length), a !== Object.keys(l).length))
      return !1;
    for (c = a; c-- !== 0; ) if (!{}.hasOwnProperty.call(l, u[c])) return !1;
    for (c = a; c-- !== 0; ) {
      const f = u[c];
      if (!(f === "_owner" && s.$$typeof) && !jl(s[f], l[f])) return !1;
    }
    return !0;
  }
  return s !== s && l !== l;
}
function hh(s) {
  return typeof window > "u"
    ? 1
    : (s.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function lf(s, l) {
  const a = hh(s);
  return Math.round(l * a) / a;
}
function Ho(s) {
  const l = j.useRef(s);
  return (
    fl(() => {
      l.current = s;
    }),
    l
  );
}
function Wj(s) {
  s === void 0 && (s = {});
  const {
      placement: l = "bottom",
      strategy: a = "absolute",
      middleware: c = [],
      platform: u,
      elements: { reference: f, floating: p } = {},
      transform: m = !0,
      whileElementsMounted: x,
      open: v,
    } = s,
    [N, g] = j.useState({
      x: 0,
      y: 0,
      strategy: a,
      placement: l,
      middlewareData: {},
      isPositioned: !1,
    }),
    [S, A] = j.useState(c);
  jl(S, c) || A(c);
  const [T, b] = j.useState(null),
    [E, I] = j.useState(null),
    z = j.useCallback((P) => {
      P !== Z.current && ((Z.current = P), b(P));
    }, []),
    O = j.useCallback((P) => {
      P !== U.current && ((U.current = P), I(P));
    }, []),
    D = f || T,
    q = p || E,
    Z = j.useRef(null),
    U = j.useRef(null),
    H = j.useRef(N),
    he = x != null,
    ye = Ho(x),
    Ae = Ho(u),
    Ce = Ho(v),
    je = j.useCallback(() => {
      if (!Z.current || !U.current) return;
      const P = { placement: l, strategy: a, middleware: S };
      Ae.current && (P.platform = Ae.current),
        qj(Z.current, U.current, P).then((X) => {
          const K = { ...X, isPositioned: Ce.current !== !1 };
          ge.current &&
            !jl(H.current, K) &&
            ((H.current = K),
            Gs.flushSync(() => {
              g(K);
            }));
        });
    }, [S, l, a, Ae, Ce]);
  fl(() => {
    v === !1 &&
      H.current.isPositioned &&
      ((H.current.isPositioned = !1), g((P) => ({ ...P, isPositioned: !1 })));
  }, [v]);
  const ge = j.useRef(!1);
  fl(
    () => (
      (ge.current = !0),
      () => {
        ge.current = !1;
      }
    ),
    []
  ),
    fl(() => {
      if ((D && (Z.current = D), q && (U.current = q), D && q)) {
        if (ye.current) return ye.current(D, q, je);
        je();
      }
    }, [D, q, je, ye, he]);
  const Ee = j.useMemo(
      () => ({ reference: Z, floating: U, setReference: z, setFloating: O }),
      [z, O]
    ),
    de = j.useMemo(() => ({ reference: D, floating: q }), [D, q]),
    le = j.useMemo(() => {
      const P = { position: a, left: 0, top: 0 };
      if (!de.floating) return P;
      const X = lf(de.floating, N.x),
        K = lf(de.floating, N.y);
      return m
        ? {
            ...P,
            transform: "translate(" + X + "px, " + K + "px)",
            ...(hh(de.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: a, left: X, top: K };
    }, [a, m, de.floating, N.x, N.y]);
  return j.useMemo(
    () => ({ ...N, update: je, refs: Ee, elements: de, floatingStyles: le }),
    [N, je, Ee, de, le]
  );
}
const Gj = (s) => {
    function l(a) {
      return {}.hasOwnProperty.call(a, "current");
    }
    return {
      name: "arrow",
      options: s,
      fn(a) {
        const { element: c, padding: u } = typeof s == "function" ? s(a) : s;
        return c && l(c)
          ? c.current != null
            ? sf({ element: c.current, padding: u }).fn(a)
            : {}
          : c
          ? sf({ element: c, padding: u }).fn(a)
          : {};
      },
    };
  },
  Qj = (s, l) => ({ ...Lj(s), options: [s, l] }),
  Kj = (s, l) => ({ ...Dj(s), options: [s, l] }),
  Yj = (s, l) => ({ ...Vj(s), options: [s, l] }),
  Xj = (s, l) => ({ ...Fj(s), options: [s, l] }),
  Zj = (s, l) => ({ ...$j(s), options: [s, l] }),
  Jj = (s, l) => ({ ...Hj(s), options: [s, l] }),
  e1 = (s, l) => ({ ...Gj(s), options: [s, l] });
var t1 = "Arrow",
  ph = j.forwardRef((s, l) => {
    const { children: a, width: c = 10, height: u = 5, ...f } = s;
    return t.jsx($e.svg, {
      ...f,
      ref: l,
      width: c,
      height: u,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: s.asChild ? a : t.jsx("polygon", { points: "0,0 30,0 15,10" }),
    });
  });
ph.displayName = t1;
var r1 = ph;
function n1(s) {
  const [l, a] = j.useState(void 0);
  return (
    yt(() => {
      if (s) {
        a({ width: s.offsetWidth, height: s.offsetHeight });
        const c = new ResizeObserver((u) => {
          if (!Array.isArray(u) || !u.length) return;
          const f = u[0];
          let p, m;
          if ("borderBoxSize" in f) {
            const x = f.borderBoxSize,
              v = Array.isArray(x) ? x[0] : x;
            (p = v.inlineSize), (m = v.blockSize);
          } else (p = s.offsetWidth), (m = s.offsetHeight);
          a({ width: p, height: m });
        });
        return c.observe(s, { box: "border-box" }), () => c.unobserve(s);
      } else a(void 0);
    }, [s]),
    l
  );
}
var wc = "Popper",
  [xh, gh] = kl(wc),
  [s1, vh] = xh(wc),
  yh = (s) => {
    const { __scopePopper: l, children: a } = s,
      [c, u] = j.useState(null);
    return t.jsx(s1, { scope: l, anchor: c, onAnchorChange: u, children: a });
  };
yh.displayName = wc;
var jh = "PopperAnchor",
  bh = j.forwardRef((s, l) => {
    const { __scopePopper: a, virtualRef: c, ...u } = s,
      f = vh(jh, a),
      p = j.useRef(null),
      m = st(l, p),
      x = j.useRef(null);
    return (
      j.useEffect(() => {
        const v = x.current;
        (x.current = c?.current || p.current),
          v !== x.current && f.onAnchorChange(x.current);
      }),
      c ? null : t.jsx($e.div, { ...u, ref: m })
    );
  });
bh.displayName = jh;
var Sc = "PopperContent",
  [i1, l1] = xh(Sc),
  Nh = j.forwardRef((s, l) => {
    const {
        __scopePopper: a,
        side: c = "bottom",
        sideOffset: u = 0,
        align: f = "center",
        alignOffset: p = 0,
        arrowPadding: m = 0,
        avoidCollisions: x = !0,
        collisionBoundary: v = [],
        collisionPadding: N = 0,
        sticky: g = "partial",
        hideWhenDetached: S = !1,
        updatePositionStrategy: A = "optimized",
        onPlaced: T,
        ...b
      } = s,
      E = vh(Sc, a),
      [I, z] = j.useState(null),
      O = st(l, (B) => z(B)),
      [D, q] = j.useState(null),
      Z = n1(D),
      U = Z?.width ?? 0,
      H = Z?.height ?? 0,
      he = c + (f !== "center" ? "-" + f : ""),
      ye =
        typeof N == "number"
          ? N
          : { top: 0, right: 0, bottom: 0, left: 0, ...N },
      Ae = Array.isArray(v) ? v : [v],
      Ce = Ae.length > 0,
      je = { padding: ye, boundary: Ae.filter(o1), altBoundary: Ce },
      {
        refs: ge,
        floatingStyles: Ee,
        placement: de,
        isPositioned: le,
        middlewareData: P,
      } = Wj({
        strategy: "fixed",
        placement: he,
        whileElementsMounted: (...B) =>
          Oj(...B, { animationFrame: A === "always" }),
        elements: { reference: E.anchor },
        middleware: [
          Qj({ mainAxis: u + H, alignmentAxis: p }),
          x &&
            Kj({
              mainAxis: !0,
              crossAxis: !1,
              limiter: g === "partial" ? Yj() : void 0,
              ...je,
            }),
          x && Xj({ ...je }),
          Zj({
            ...je,
            apply: ({
              elements: B,
              rects: ue,
              availableWidth: be,
              availableHeight: Se,
            }) => {
              const { width: Me, height: Ie } = ue.reference,
                tt = B.floating.style;
              tt.setProperty("--radix-popper-available-width", `${be}px`),
                tt.setProperty("--radix-popper-available-height", `${Se}px`),
                tt.setProperty("--radix-popper-anchor-width", `${Me}px`),
                tt.setProperty("--radix-popper-anchor-height", `${Ie}px`);
            },
          }),
          D && e1({ element: D, padding: m }),
          c1({ arrowWidth: U, arrowHeight: H }),
          S && Jj({ strategy: "referenceHidden", ...je }),
        ],
      }),
      [X, K] = kh(de),
      C = an(T);
    yt(() => {
      le && C?.();
    }, [le, C]);
    const L = P.arrow?.x,
      ae = P.arrow?.y,
      oe = P.arrow?.centerOffset !== 0,
      [we, ke] = j.useState();
    return (
      yt(() => {
        I && ke(window.getComputedStyle(I).zIndex);
      }, [I]),
      t.jsx("div", {
        ref: ge.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...Ee,
          transform: le ? Ee.transform : "translate(0, -200%)",
          minWidth: "max-content",
          zIndex: we,
          "--radix-popper-transform-origin": [
            P.transformOrigin?.x,
            P.transformOrigin?.y,
          ].join(" "),
          ...(P.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none",
          }),
        },
        dir: s.dir,
        children: t.jsx(i1, {
          scope: a,
          placedSide: X,
          onArrowChange: q,
          arrowX: L,
          arrowY: ae,
          shouldHideArrow: oe,
          children: t.jsx($e.div, {
            "data-side": X,
            "data-align": K,
            ...b,
            ref: O,
            style: { ...b.style, animation: le ? void 0 : "none" },
          }),
        }),
      })
    );
  });
Nh.displayName = Sc;
var wh = "PopperArrow",
  a1 = { top: "bottom", right: "left", bottom: "top", left: "right" },
  Sh = j.forwardRef(function (l, a) {
    const { __scopePopper: c, ...u } = l,
      f = l1(wh, c),
      p = a1[f.placedSide];
    return t.jsx("span", {
      ref: f.onArrowChange,
      style: {
        position: "absolute",
        left: f.arrowX,
        top: f.arrowY,
        [p]: 0,
        transformOrigin: {
          top: "",
          right: "0 0",
          bottom: "center 0",
          left: "100% 0",
        }[f.placedSide],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: "rotate(180deg)",
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[f.placedSide],
        visibility: f.shouldHideArrow ? "hidden" : void 0,
      },
      children: t.jsx(r1, {
        ...u,
        ref: a,
        style: { ...u.style, display: "block" },
      }),
    });
  });
Sh.displayName = wh;
function o1(s) {
  return s !== null;
}
var c1 = (s) => ({
  name: "transformOrigin",
  options: s,
  fn(l) {
    const { placement: a, rects: c, middlewareData: u } = l,
      p = u.arrow?.centerOffset !== 0,
      m = p ? 0 : s.arrowWidth,
      x = p ? 0 : s.arrowHeight,
      [v, N] = kh(a),
      g = { start: "0%", center: "50%", end: "100%" }[N],
      S = (u.arrow?.x ?? 0) + m / 2,
      A = (u.arrow?.y ?? 0) + x / 2;
    let T = "",
      b = "";
    return (
      v === "bottom"
        ? ((T = p ? g : `${S}px`), (b = `${-x}px`))
        : v === "top"
        ? ((T = p ? g : `${S}px`), (b = `${c.floating.height + x}px`))
        : v === "right"
        ? ((T = `${-x}px`), (b = p ? g : `${A}px`))
        : v === "left" &&
          ((T = `${c.floating.width + x}px`), (b = p ? g : `${A}px`)),
      { data: { x: T, y: b } }
    );
  },
});
function kh(s) {
  const [l, a = "center"] = s.split("-");
  return [l, a];
}
var d1 = yh,
  u1 = bh,
  m1 = Nh,
  f1 = Sh,
  h1 = "Portal",
  Ch = j.forwardRef((s, l) => {
    const { container: a, ...c } = s,
      [u, f] = j.useState(!1);
    yt(() => f(!0), []);
    const p = a || (u && globalThis?.document?.body);
    return p ? Q0.createPortal(t.jsx($e.div, { ...c, ref: l }), p) : null;
  });
Ch.displayName = h1;
var p1 = yf[" useInsertionEffect ".trim().toString()] || yt;
function af({ prop: s, defaultProp: l, onChange: a = () => {}, caller: c }) {
  const [u, f, p] = x1({ defaultProp: l, onChange: a }),
    m = s !== void 0,
    x = m ? s : u;
  {
    const N = j.useRef(s !== void 0);
    j.useEffect(() => {
      const g = N.current;
      g !== m &&
        console.warn(
          `${c} is changing from ${g ? "controlled" : "uncontrolled"} to ${
            m ? "controlled" : "uncontrolled"
          }. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        ),
        (N.current = m);
    }, [m, c]);
  }
  const v = j.useCallback(
    (N) => {
      if (m) {
        const g = g1(N) ? N(s) : N;
        g !== s && p.current?.(g);
      } else f(N);
    },
    [m, s, f, p]
  );
  return [x, v];
}
function x1({ defaultProp: s, onChange: l }) {
  const [a, c] = j.useState(s),
    u = j.useRef(a),
    f = j.useRef(l);
  return (
    p1(() => {
      f.current = l;
    }, [l]),
    j.useEffect(() => {
      u.current !== a && (f.current?.(a), (u.current = a));
    }, [a, u]),
    [a, c, f]
  );
}
function g1(s) {
  return typeof s == "function";
}
function v1(s) {
  const l = j.useRef({ value: s, previous: s });
  return j.useMemo(
    () => (
      l.current.value !== s &&
        ((l.current.previous = l.current.value), (l.current.value = s)),
      l.current.previous
    ),
    [s]
  );
}
var Eh = Object.freeze({
    position: "absolute",
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal",
  }),
  y1 = "VisuallyHidden",
  j1 = j.forwardRef((s, l) =>
    t.jsx($e.span, { ...s, ref: l, style: { ...Eh, ...s.style } })
  );
j1.displayName = y1;
var b1 = function (s) {
    if (typeof document > "u") return null;
    var l = Array.isArray(s) ? s[0] : s;
    return l.ownerDocument.body;
  },
  Fn = new WeakMap(),
  cl = new WeakMap(),
  dl = {},
  Vo = 0,
  Ph = function (s) {
    return s && (s.host || Ph(s.parentNode));
  },
  N1 = function (s, l) {
    return l
      .map(function (a) {
        if (s.contains(a)) return a;
        var c = Ph(a);
        return c && s.contains(c)
          ? c
          : (console.error(
              "aria-hidden",
              a,
              "in not contained inside",
              s,
              ". Doing nothing"
            ),
            null);
      })
      .filter(function (a) {
        return !!a;
      });
  },
  w1 = function (s, l, a, c) {
    var u = N1(l, Array.isArray(s) ? s : [s]);
    dl[a] || (dl[a] = new WeakMap());
    var f = dl[a],
      p = [],
      m = new Set(),
      x = new Set(u),
      v = function (g) {
        !g || m.has(g) || (m.add(g), v(g.parentNode));
      };
    u.forEach(v);
    var N = function (g) {
      !g ||
        x.has(g) ||
        Array.prototype.forEach.call(g.children, function (S) {
          if (m.has(S)) N(S);
          else
            try {
              var A = S.getAttribute(c),
                T = A !== null && A !== "false",
                b = (Fn.get(S) || 0) + 1,
                E = (f.get(S) || 0) + 1;
              Fn.set(S, b),
                f.set(S, E),
                p.push(S),
                b === 1 && T && cl.set(S, !0),
                E === 1 && S.setAttribute(a, "true"),
                T || S.setAttribute(c, "true");
            } catch (I) {
              console.error("aria-hidden: cannot operate on ", S, I);
            }
        });
    };
    return (
      N(l),
      m.clear(),
      Vo++,
      function () {
        p.forEach(function (g) {
          var S = Fn.get(g) - 1,
            A = f.get(g) - 1;
          Fn.set(g, S),
            f.set(g, A),
            S || (cl.has(g) || g.removeAttribute(c), cl.delete(g)),
            A || g.removeAttribute(a);
        }),
          Vo--,
          Vo ||
            ((Fn = new WeakMap()),
            (Fn = new WeakMap()),
            (cl = new WeakMap()),
            (dl = {}));
      }
    );
  },
  S1 = function (s, l, a) {
    a === void 0 && (a = "data-aria-hidden");
    var c = Array.from(Array.isArray(s) ? s : [s]),
      u = b1(s);
    return u
      ? (c.push.apply(c, Array.from(u.querySelectorAll("[aria-live], script"))),
        w1(c, u, a, "aria-hidden"))
      : function () {
          return null;
        };
  },
  Xt = function () {
    return (
      (Xt =
        Object.assign ||
        function (l) {
          for (var a, c = 1, u = arguments.length; c < u; c++) {
            a = arguments[c];
            for (var f in a)
              Object.prototype.hasOwnProperty.call(a, f) && (l[f] = a[f]);
          }
          return l;
        }),
      Xt.apply(this, arguments)
    );
  };
function Ah(s, l) {
  var a = {};
  for (var c in s)
    Object.prototype.hasOwnProperty.call(s, c) &&
      l.indexOf(c) < 0 &&
      (a[c] = s[c]);
  if (s != null && typeof Object.getOwnPropertySymbols == "function")
    for (var u = 0, c = Object.getOwnPropertySymbols(s); u < c.length; u++)
      l.indexOf(c[u]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(s, c[u]) &&
        (a[c[u]] = s[c[u]]);
  return a;
}
function k1(s, l, a) {
  if (a || arguments.length === 2)
    for (var c = 0, u = l.length, f; c < u; c++)
      (f || !(c in l)) &&
        (f || (f = Array.prototype.slice.call(l, 0, c)), (f[c] = l[c]));
  return s.concat(f || Array.prototype.slice.call(l));
}
var hl = "right-scroll-bar-position",
  pl = "width-before-scroll-bar",
  C1 = "with-scroll-bars-hidden",
  E1 = "--removed-body-scroll-bar-size";
function qo(s, l) {
  return typeof s == "function" ? s(l) : s && (s.current = l), s;
}
function P1(s, l) {
  var a = j.useState(function () {
    return {
      value: s,
      callback: l,
      facade: {
        get current() {
          return a.value;
        },
        set current(c) {
          var u = a.value;
          u !== c && ((a.value = c), a.callback(c, u));
        },
      },
    };
  })[0];
  return (a.callback = l), a.facade;
}
var A1 = typeof window < "u" ? j.useLayoutEffect : j.useEffect,
  of = new WeakMap();
function R1(s, l) {
  var a = P1(null, function (c) {
    return s.forEach(function (u) {
      return qo(u, c);
    });
  });
  return (
    A1(
      function () {
        var c = of.get(a);
        if (c) {
          var u = new Set(c),
            f = new Set(s),
            p = a.current;
          u.forEach(function (m) {
            f.has(m) || qo(m, null);
          }),
            f.forEach(function (m) {
              u.has(m) || qo(m, p);
            });
        }
        of.set(a, s);
      },
      [s]
    ),
    a
  );
}
function M1(s) {
  return s;
}
function _1(s, l) {
  l === void 0 && (l = M1);
  var a = [],
    c = !1,
    u = {
      read: function () {
        if (c)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`."
          );
        return a.length ? a[a.length - 1] : s;
      },
      useMedium: function (f) {
        var p = l(f, c);
        return (
          a.push(p),
          function () {
            a = a.filter(function (m) {
              return m !== p;
            });
          }
        );
      },
      assignSyncMedium: function (f) {
        for (c = !0; a.length; ) {
          var p = a;
          (a = []), p.forEach(f);
        }
        a = {
          push: function (m) {
            return f(m);
          },
          filter: function () {
            return a;
          },
        };
      },
      assignMedium: function (f) {
        c = !0;
        var p = [];
        if (a.length) {
          var m = a;
          (a = []), m.forEach(f), (p = a);
        }
        var x = function () {
            var N = p;
            (p = []), N.forEach(f);
          },
          v = function () {
            return Promise.resolve().then(x);
          };
        v(),
          (a = {
            push: function (N) {
              p.push(N), v();
            },
            filter: function (N) {
              return (p = p.filter(N)), a;
            },
          });
      },
    };
  return u;
}
function T1(s) {
  s === void 0 && (s = {});
  var l = _1(null);
  return (l.options = Xt({ async: !0, ssr: !1 }, s)), l;
}
var Rh = function (s) {
  var l = s.sideCar,
    a = Ah(s, ["sideCar"]);
  if (!l)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car"
    );
  var c = l.read();
  if (!c) throw new Error("Sidecar medium not found");
  return j.createElement(c, Xt({}, a));
};
Rh.isSideCarExport = !0;
function z1(s, l) {
  return s.useMedium(l), Rh;
}
var Mh = T1(),
  Bo = function () {},
  Rl = j.forwardRef(function (s, l) {
    var a = j.useRef(null),
      c = j.useState({
        onScrollCapture: Bo,
        onWheelCapture: Bo,
        onTouchMoveCapture: Bo,
      }),
      u = c[0],
      f = c[1],
      p = s.forwardProps,
      m = s.children,
      x = s.className,
      v = s.removeScrollBar,
      N = s.enabled,
      g = s.shards,
      S = s.sideCar,
      A = s.noRelative,
      T = s.noIsolation,
      b = s.inert,
      E = s.allowPinchZoom,
      I = s.as,
      z = I === void 0 ? "div" : I,
      O = s.gapMode,
      D = Ah(s, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noRelative",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      q = S,
      Z = R1([a, l]),
      U = Xt(Xt({}, D), u);
    return j.createElement(
      j.Fragment,
      null,
      N &&
        j.createElement(q, {
          sideCar: Mh,
          removeScrollBar: v,
          shards: g,
          noRelative: A,
          noIsolation: T,
          inert: b,
          setCallbacks: f,
          allowPinchZoom: !!E,
          lockRef: a,
          gapMode: O,
        }),
      p
        ? j.cloneElement(j.Children.only(m), Xt(Xt({}, U), { ref: Z }))
        : j.createElement(z, Xt({}, U, { className: x, ref: Z }), m)
    );
  });
Rl.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Rl.classNames = { fullWidth: pl, zeroRight: hl };
var I1 = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function O1() {
  if (!document) return null;
  var s = document.createElement("style");
  s.type = "text/css";
  var l = I1();
  return l && s.setAttribute("nonce", l), s;
}
function L1(s, l) {
  s.styleSheet
    ? (s.styleSheet.cssText = l)
    : s.appendChild(document.createTextNode(l));
}
function D1(s) {
  var l = document.head || document.getElementsByTagName("head")[0];
  l.appendChild(s);
}
var F1 = function () {
    var s = 0,
      l = null;
    return {
      add: function (a) {
        s == 0 && (l = O1()) && (L1(l, a), D1(l)), s++;
      },
      remove: function () {
        s--,
          !s && l && (l.parentNode && l.parentNode.removeChild(l), (l = null));
      },
    };
  },
  $1 = function () {
    var s = F1();
    return function (l, a) {
      j.useEffect(
        function () {
          return (
            s.add(l),
            function () {
              s.remove();
            }
          );
        },
        [l && a]
      );
    };
  },
  _h = function () {
    var s = $1(),
      l = function (a) {
        var c = a.styles,
          u = a.dynamic;
        return s(c, u), null;
      };
    return l;
  },
  H1 = { left: 0, top: 0, right: 0, gap: 0 },
  Uo = function (s) {
    return parseInt(s || "", 10) || 0;
  },
  V1 = function (s) {
    var l = window.getComputedStyle(document.body),
      a = l[s === "padding" ? "paddingLeft" : "marginLeft"],
      c = l[s === "padding" ? "paddingTop" : "marginTop"],
      u = l[s === "padding" ? "paddingRight" : "marginRight"];
    return [Uo(a), Uo(c), Uo(u)];
  },
  q1 = function (s) {
    if ((s === void 0 && (s = "margin"), typeof window > "u")) return H1;
    var l = V1(s),
      a = document.documentElement.clientWidth,
      c = window.innerWidth;
    return {
      left: l[0],
      top: l[1],
      right: l[2],
      gap: Math.max(0, c - a + l[2] - l[0]),
    };
  },
  B1 = _h(),
  Bn = "data-scroll-locked",
  U1 = function (s, l, a, c) {
    var u = s.left,
      f = s.top,
      p = s.right,
      m = s.gap;
    return (
      a === void 0 && (a = "margin"),
      `
  .`
        .concat(
          C1,
          ` {
   overflow: hidden `
        )
        .concat(
          c,
          `;
   padding-right: `
        )
        .concat(m, "px ")
        .concat(
          c,
          `;
  }
  body[`
        )
        .concat(
          Bn,
          `] {
    overflow: hidden `
        )
        .concat(
          c,
          `;
    overscroll-behavior: contain;
    `
        )
        .concat(
          [
            l && "position: relative ".concat(c, ";"),
            a === "margin" &&
              `
    padding-left: `
                .concat(
                  u,
                  `px;
    padding-top: `
                )
                .concat(
                  f,
                  `px;
    padding-right: `
                )
                .concat(
                  p,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `
                )
                .concat(m, "px ")
                .concat(
                  c,
                  `;
    `
                ),
            a === "padding" &&
              "padding-right: ".concat(m, "px ").concat(c, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`
        )
        .concat(
          hl,
          ` {
    right: `
        )
        .concat(m, "px ")
        .concat(
          c,
          `;
  }
  
  .`
        )
        .concat(
          pl,
          ` {
    margin-right: `
        )
        .concat(m, "px ")
        .concat(
          c,
          `;
  }
  
  .`
        )
        .concat(hl, " .")
        .concat(
          hl,
          ` {
    right: 0 `
        )
        .concat(
          c,
          `;
  }
  
  .`
        )
        .concat(pl, " .")
        .concat(
          pl,
          ` {
    margin-right: 0 `
        )
        .concat(
          c,
          `;
  }
  
  body[`
        )
        .concat(
          Bn,
          `] {
    `
        )
        .concat(E1, ": ")
        .concat(
          m,
          `px;
  }
`
        )
    );
  },
  cf = function () {
    var s = parseInt(document.body.getAttribute(Bn) || "0", 10);
    return isFinite(s) ? s : 0;
  },
  W1 = function () {
    j.useEffect(function () {
      return (
        document.body.setAttribute(Bn, (cf() + 1).toString()),
        function () {
          var s = cf() - 1;
          s <= 0
            ? document.body.removeAttribute(Bn)
            : document.body.setAttribute(Bn, s.toString());
        }
      );
    }, []);
  },
  G1 = function (s) {
    var l = s.noRelative,
      a = s.noImportant,
      c = s.gapMode,
      u = c === void 0 ? "margin" : c;
    W1();
    var f = j.useMemo(
      function () {
        return q1(u);
      },
      [u]
    );
    return j.createElement(B1, { styles: U1(f, !l, u, a ? "" : "!important") });
  },
  sc = !1;
if (typeof window < "u")
  try {
    var ul = Object.defineProperty({}, "passive", {
      get: function () {
        return (sc = !0), !0;
      },
    });
    window.addEventListener("test", ul, ul),
      window.removeEventListener("test", ul, ul);
  } catch {
    sc = !1;
  }
var $n = sc ? { passive: !1 } : !1,
  Q1 = function (s) {
    return s.tagName === "TEXTAREA";
  },
  Th = function (s, l) {
    if (!(s instanceof Element)) return !1;
    var a = window.getComputedStyle(s);
    return (
      a[l] !== "hidden" &&
      !(a.overflowY === a.overflowX && !Q1(s) && a[l] === "visible")
    );
  },
  K1 = function (s) {
    return Th(s, "overflowY");
  },
  Y1 = function (s) {
    return Th(s, "overflowX");
  },
  df = function (s, l) {
    var a = l.ownerDocument,
      c = l;
    do {
      typeof ShadowRoot < "u" && c instanceof ShadowRoot && (c = c.host);
      var u = zh(s, c);
      if (u) {
        var f = Ih(s, c),
          p = f[1],
          m = f[2];
        if (p > m) return !0;
      }
      c = c.parentNode;
    } while (c && c !== a.body);
    return !1;
  },
  X1 = function (s) {
    var l = s.scrollTop,
      a = s.scrollHeight,
      c = s.clientHeight;
    return [l, a, c];
  },
  Z1 = function (s) {
    var l = s.scrollLeft,
      a = s.scrollWidth,
      c = s.clientWidth;
    return [l, a, c];
  },
  zh = function (s, l) {
    return s === "v" ? K1(l) : Y1(l);
  },
  Ih = function (s, l) {
    return s === "v" ? X1(l) : Z1(l);
  },
  J1 = function (s, l) {
    return s === "h" && l === "rtl" ? -1 : 1;
  },
  eb = function (s, l, a, c, u) {
    var f = J1(s, window.getComputedStyle(l).direction),
      p = f * c,
      m = a.target,
      x = l.contains(m),
      v = !1,
      N = p > 0,
      g = 0,
      S = 0;
    do {
      if (!m) break;
      var A = Ih(s, m),
        T = A[0],
        b = A[1],
        E = A[2],
        I = b - E - f * T;
      (T || I) && zh(s, m) && ((g += I), (S += T));
      var z = m.parentNode;
      m = z && z.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? z.host : z;
    } while ((!x && m !== document.body) || (x && (l.contains(m) || l === m)));
    return ((N && Math.abs(g) < 1) || (!N && Math.abs(S) < 1)) && (v = !0), v;
  },
  ml = function (s) {
    return "changedTouches" in s
      ? [s.changedTouches[0].clientX, s.changedTouches[0].clientY]
      : [0, 0];
  },
  uf = function (s) {
    return [s.deltaX, s.deltaY];
  },
  mf = function (s) {
    return s && "current" in s ? s.current : s;
  },
  tb = function (s, l) {
    return s[0] === l[0] && s[1] === l[1];
  },
  rb = function (s) {
    return `
  .block-interactivity-`
      .concat(
        s,
        ` {pointer-events: none;}
  .allow-interactivity-`
      )
      .concat(
        s,
        ` {pointer-events: all;}
`
      );
  },
  nb = 0,
  Hn = [];
function sb(s) {
  var l = j.useRef([]),
    a = j.useRef([0, 0]),
    c = j.useRef(),
    u = j.useState(nb++)[0],
    f = j.useState(_h)[0],
    p = j.useRef(s);
  j.useEffect(
    function () {
      p.current = s;
    },
    [s]
  ),
    j.useEffect(
      function () {
        if (s.inert) {
          document.body.classList.add("block-interactivity-".concat(u));
          var b = k1([s.lockRef.current], (s.shards || []).map(mf), !0).filter(
            Boolean
          );
          return (
            b.forEach(function (E) {
              return E.classList.add("allow-interactivity-".concat(u));
            }),
            function () {
              document.body.classList.remove("block-interactivity-".concat(u)),
                b.forEach(function (E) {
                  return E.classList.remove("allow-interactivity-".concat(u));
                });
            }
          );
        }
      },
      [s.inert, s.lockRef.current, s.shards]
    );
  var m = j.useCallback(function (b, E) {
      if (
        ("touches" in b && b.touches.length === 2) ||
        (b.type === "wheel" && b.ctrlKey)
      )
        return !p.current.allowPinchZoom;
      var I = ml(b),
        z = a.current,
        O = "deltaX" in b ? b.deltaX : z[0] - I[0],
        D = "deltaY" in b ? b.deltaY : z[1] - I[1],
        q,
        Z = b.target,
        U = Math.abs(O) > Math.abs(D) ? "h" : "v";
      if ("touches" in b && U === "h" && Z.type === "range") return !1;
      var H = df(U, Z);
      if (!H) return !0;
      if ((H ? (q = U) : ((q = U === "v" ? "h" : "v"), (H = df(U, Z))), !H))
        return !1;
      if (
        (!c.current && "changedTouches" in b && (O || D) && (c.current = q), !q)
      )
        return !0;
      var he = c.current || q;
      return eb(he, E, b, he === "h" ? O : D);
    }, []),
    x = j.useCallback(function (b) {
      var E = b;
      if (!(!Hn.length || Hn[Hn.length - 1] !== f)) {
        var I = "deltaY" in E ? uf(E) : ml(E),
          z = l.current.filter(function (q) {
            return (
              q.name === E.type &&
              (q.target === E.target || E.target === q.shadowParent) &&
              tb(q.delta, I)
            );
          })[0];
        if (z && z.should) {
          E.cancelable && E.preventDefault();
          return;
        }
        if (!z) {
          var O = (p.current.shards || [])
              .map(mf)
              .filter(Boolean)
              .filter(function (q) {
                return q.contains(E.target);
              }),
            D = O.length > 0 ? m(E, O[0]) : !p.current.noIsolation;
          D && E.cancelable && E.preventDefault();
        }
      }
    }, []),
    v = j.useCallback(function (b, E, I, z) {
      var O = { name: b, delta: E, target: I, should: z, shadowParent: ib(I) };
      l.current.push(O),
        setTimeout(function () {
          l.current = l.current.filter(function (D) {
            return D !== O;
          });
        }, 1);
    }, []),
    N = j.useCallback(function (b) {
      (a.current = ml(b)), (c.current = void 0);
    }, []),
    g = j.useCallback(function (b) {
      v(b.type, uf(b), b.target, m(b, s.lockRef.current));
    }, []),
    S = j.useCallback(function (b) {
      v(b.type, ml(b), b.target, m(b, s.lockRef.current));
    }, []);
  j.useEffect(function () {
    return (
      Hn.push(f),
      s.setCallbacks({
        onScrollCapture: g,
        onWheelCapture: g,
        onTouchMoveCapture: S,
      }),
      document.addEventListener("wheel", x, $n),
      document.addEventListener("touchmove", x, $n),
      document.addEventListener("touchstart", N, $n),
      function () {
        (Hn = Hn.filter(function (b) {
          return b !== f;
        })),
          document.removeEventListener("wheel", x, $n),
          document.removeEventListener("touchmove", x, $n),
          document.removeEventListener("touchstart", N, $n);
      }
    );
  }, []);
  var A = s.removeScrollBar,
    T = s.inert;
  return j.createElement(
    j.Fragment,
    null,
    T ? j.createElement(f, { styles: rb(u) }) : null,
    A
      ? j.createElement(G1, { noRelative: s.noRelative, gapMode: s.gapMode })
      : null
  );
}
function ib(s) {
  for (var l = null; s !== null; )
    s instanceof ShadowRoot && ((l = s.host), (s = s.host)), (s = s.parentNode);
  return l;
}
const lb = z1(Mh, sb);
var Oh = j.forwardRef(function (s, l) {
  return j.createElement(Rl, Xt({}, s, { ref: l, sideCar: lb }));
});
Oh.classNames = Rl.classNames;
var ab = [" ", "Enter", "ArrowUp", "ArrowDown"],
  ob = [" ", "Enter"],
  cn = "Select",
  [Ml, _l, cb] = Sy(cn),
  [es] = kl(cn, [cb, gh]),
  Tl = gh(),
  [db, Vr] = es(cn),
  [ub, mb] = es(cn),
  Lh = (s) => {
    const {
        __scopeSelect: l,
        children: a,
        open: c,
        defaultOpen: u,
        onOpenChange: f,
        value: p,
        defaultValue: m,
        onValueChange: x,
        dir: v,
        name: N,
        autoComplete: g,
        disabled: S,
        required: A,
        form: T,
      } = s,
      b = Tl(l),
      [E, I] = j.useState(null),
      [z, O] = j.useState(null),
      [D, q] = j.useState(!1),
      Z = Cy(v),
      [U, H] = af({ prop: c, defaultProp: u ?? !1, onChange: f, caller: cn }),
      [he, ye] = af({ prop: p, defaultProp: m, onChange: x, caller: cn }),
      Ae = j.useRef(null),
      Ce = E ? T || !!E.closest("form") : !0,
      [je, ge] = j.useState(new Set()),
      Ee = Array.from(je)
        .map((de) => de.props.value)
        .join(";");
    return t.jsx(d1, {
      ...b,
      children: t.jsxs(db, {
        required: A,
        scope: l,
        trigger: E,
        onTriggerChange: I,
        valueNode: z,
        onValueNodeChange: O,
        valueNodeHasChildren: D,
        onValueNodeHasChildrenChange: q,
        contentId: xc(),
        value: he,
        onValueChange: ye,
        open: U,
        onOpenChange: H,
        dir: Z,
        triggerPointerDownPosRef: Ae,
        disabled: S,
        children: [
          t.jsx(Ml.Provider, {
            scope: l,
            children: t.jsx(ub, {
              scope: s.__scopeSelect,
              onNativeOptionAdd: j.useCallback((de) => {
                ge((le) => new Set(le).add(de));
              }, []),
              onNativeOptionRemove: j.useCallback((de) => {
                ge((le) => {
                  const P = new Set(le);
                  return P.delete(de), P;
                });
              }, []),
              children: a,
            }),
          }),
          Ce
            ? t.jsxs(
                ip,
                {
                  "aria-hidden": !0,
                  required: A,
                  tabIndex: -1,
                  name: N,
                  autoComplete: g,
                  value: he,
                  onChange: (de) => ye(de.target.value),
                  disabled: S,
                  form: T,
                  children: [
                    he === void 0 ? t.jsx("option", { value: "" }) : null,
                    Array.from(je),
                  ],
                },
                Ee
              )
            : null,
        ],
      }),
    });
  };
Lh.displayName = cn;
var Dh = "SelectTrigger",
  Fh = j.forwardRef((s, l) => {
    const { __scopeSelect: a, disabled: c = !1, ...u } = s,
      f = Tl(a),
      p = Vr(Dh, a),
      m = p.disabled || c,
      x = st(l, p.onTriggerChange),
      v = _l(a),
      N = j.useRef("touch"),
      [g, S, A] = ap((b) => {
        const E = v().filter((O) => !O.disabled),
          I = E.find((O) => O.value === p.value),
          z = op(E, b, I);
        z !== void 0 && p.onValueChange(z.value);
      }),
      T = (b) => {
        m || (p.onOpenChange(!0), A()),
          b &&
            (p.triggerPointerDownPosRef.current = {
              x: Math.round(b.pageX),
              y: Math.round(b.pageY),
            });
      };
    return t.jsx(u1, {
      asChild: !0,
      ...f,
      children: t.jsx($e.button, {
        type: "button",
        role: "combobox",
        "aria-controls": p.contentId,
        "aria-expanded": p.open,
        "aria-required": p.required,
        "aria-autocomplete": "none",
        dir: p.dir,
        "data-state": p.open ? "open" : "closed",
        disabled: m,
        "data-disabled": m ? "" : void 0,
        "data-placeholder": lp(p.value) ? "" : void 0,
        ...u,
        ref: x,
        onClick: Ge(u.onClick, (b) => {
          b.currentTarget.focus(), N.current !== "mouse" && T(b);
        }),
        onPointerDown: Ge(u.onPointerDown, (b) => {
          N.current = b.pointerType;
          const E = b.target;
          E.hasPointerCapture(b.pointerId) &&
            E.releasePointerCapture(b.pointerId),
            b.button === 0 &&
              b.ctrlKey === !1 &&
              b.pointerType === "mouse" &&
              (T(b), b.preventDefault());
        }),
        onKeyDown: Ge(u.onKeyDown, (b) => {
          const E = g.current !== "";
          !(b.ctrlKey || b.altKey || b.metaKey) &&
            b.key.length === 1 &&
            S(b.key),
            !(E && b.key === " ") &&
              ab.includes(b.key) &&
              (T(), b.preventDefault());
        }),
      }),
    });
  });
Fh.displayName = Dh;
var $h = "SelectValue",
  Hh = j.forwardRef((s, l) => {
    const {
        __scopeSelect: a,
        className: c,
        style: u,
        children: f,
        placeholder: p = "",
        ...m
      } = s,
      x = Vr($h, a),
      { onValueNodeHasChildrenChange: v } = x,
      N = f !== void 0,
      g = st(l, x.onValueNodeChange);
    return (
      yt(() => {
        v(N);
      }, [v, N]),
      t.jsx($e.span, {
        ...m,
        ref: g,
        style: { pointerEvents: "none" },
        children: lp(x.value) ? t.jsx(t.Fragment, { children: p }) : f,
      })
    );
  });
Hh.displayName = $h;
var fb = "SelectIcon",
  Vh = j.forwardRef((s, l) => {
    const { __scopeSelect: a, children: c, ...u } = s;
    return t.jsx($e.span, {
      "aria-hidden": !0,
      ...u,
      ref: l,
      children: c || "▼",
    });
  });
Vh.displayName = fb;
var hb = "SelectPortal",
  qh = (s) => t.jsx(Ch, { asChild: !0, ...s });
qh.displayName = hb;
var dn = "SelectContent",
  Bh = j.forwardRef((s, l) => {
    const a = Vr(dn, s.__scopeSelect),
      [c, u] = j.useState();
    if (
      (yt(() => {
        u(new DocumentFragment());
      }, []),
      !a.open)
    ) {
      const f = c;
      return f
        ? Gs.createPortal(
            t.jsx(Uh, {
              scope: s.__scopeSelect,
              children: t.jsx(Ml.Slot, {
                scope: s.__scopeSelect,
                children: t.jsx("div", { children: s.children }),
              }),
            }),
            f
          )
        : null;
    }
    return t.jsx(Wh, { ...s, ref: l });
  });
Bh.displayName = dn;
var Vt = 10,
  [Uh, qr] = es(dn),
  pb = "SelectContentImpl",
  xb = Bs("SelectContent.RemoveScroll"),
  Wh = j.forwardRef((s, l) => {
    const {
        __scopeSelect: a,
        position: c = "item-aligned",
        onCloseAutoFocus: u,
        onEscapeKeyDown: f,
        onPointerDownOutside: p,
        side: m,
        sideOffset: x,
        align: v,
        alignOffset: N,
        arrowPadding: g,
        collisionBoundary: S,
        collisionPadding: A,
        sticky: T,
        hideWhenDetached: b,
        avoidCollisions: E,
        ...I
      } = s,
      z = Vr(dn, a),
      [O, D] = j.useState(null),
      [q, Z] = j.useState(null),
      U = st(l, (B) => D(B)),
      [H, he] = j.useState(null),
      [ye, Ae] = j.useState(null),
      Ce = _l(a),
      [je, ge] = j.useState(!1),
      Ee = j.useRef(!1);
    j.useEffect(() => {
      if (O) return S1(O);
    }, [O]),
      Iy();
    const de = j.useCallback(
        (B) => {
          const [ue, ...be] = Ce().map((Ie) => Ie.ref.current),
            [Se] = be.slice(-1),
            Me = document.activeElement;
          for (const Ie of B)
            if (
              Ie === Me ||
              (Ie?.scrollIntoView({ block: "nearest" }),
              Ie === ue && q && (q.scrollTop = 0),
              Ie === Se && q && (q.scrollTop = q.scrollHeight),
              Ie?.focus(),
              document.activeElement !== Me)
            )
              return;
        },
        [Ce, q]
      ),
      le = j.useCallback(() => de([H, O]), [de, H, O]);
    j.useEffect(() => {
      je && le();
    }, [je, le]);
    const { onOpenChange: P, triggerPointerDownPosRef: X } = z;
    j.useEffect(() => {
      if (O) {
        let B = { x: 0, y: 0 };
        const ue = (Se) => {
            B = {
              x: Math.abs(Math.round(Se.pageX) - (X.current?.x ?? 0)),
              y: Math.abs(Math.round(Se.pageY) - (X.current?.y ?? 0)),
            };
          },
          be = (Se) => {
            B.x <= 10 && B.y <= 10
              ? Se.preventDefault()
              : O.contains(Se.target) || P(!1),
              document.removeEventListener("pointermove", ue),
              (X.current = null);
          };
        return (
          X.current !== null &&
            (document.addEventListener("pointermove", ue),
            document.addEventListener("pointerup", be, {
              capture: !0,
              once: !0,
            })),
          () => {
            document.removeEventListener("pointermove", ue),
              document.removeEventListener("pointerup", be, { capture: !0 });
          }
        );
      }
    }, [O, P, X]),
      j.useEffect(() => {
        const B = () => P(!1);
        return (
          window.addEventListener("blur", B),
          window.addEventListener("resize", B),
          () => {
            window.removeEventListener("blur", B),
              window.removeEventListener("resize", B);
          }
        );
      }, [P]);
    const [K, C] = ap((B) => {
        const ue = Ce().filter((Me) => !Me.disabled),
          be = ue.find((Me) => Me.ref.current === document.activeElement),
          Se = op(ue, B, be);
        Se && setTimeout(() => Se.ref.current.focus());
      }),
      L = j.useCallback(
        (B, ue, be) => {
          const Se = !Ee.current && !be;
          ((z.value !== void 0 && z.value === ue) || Se) &&
            (he(B), Se && (Ee.current = !0));
        },
        [z.value]
      ),
      ae = j.useCallback(() => O?.focus(), [O]),
      oe = j.useCallback(
        (B, ue, be) => {
          const Se = !Ee.current && !be;
          ((z.value !== void 0 && z.value === ue) || Se) && Ae(B);
        },
        [z.value]
      ),
      we = c === "popper" ? ic : Gh,
      ke =
        we === ic
          ? {
              side: m,
              sideOffset: x,
              align: v,
              alignOffset: N,
              arrowPadding: g,
              collisionBoundary: S,
              collisionPadding: A,
              sticky: T,
              hideWhenDetached: b,
              avoidCollisions: E,
            }
          : {};
    return t.jsx(Uh, {
      scope: a,
      content: O,
      viewport: q,
      onViewportChange: Z,
      itemRefCallback: L,
      selectedItem: H,
      onItemLeave: ae,
      itemTextRefCallback: oe,
      focusSelectedItem: le,
      selectedItemText: ye,
      position: c,
      isPositioned: je,
      searchRef: K,
      children: t.jsx(Oh, {
        as: xb,
        allowPinchZoom: !0,
        children: t.jsx(rh, {
          asChild: !0,
          trapped: z.open,
          onMountAutoFocus: (B) => {
            B.preventDefault();
          },
          onUnmountAutoFocus: Ge(u, (B) => {
            z.trigger?.focus({ preventScroll: !0 }), B.preventDefault();
          }),
          children: t.jsx(eh, {
            asChild: !0,
            disableOutsidePointerEvents: !0,
            onEscapeKeyDown: f,
            onPointerDownOutside: p,
            onFocusOutside: (B) => B.preventDefault(),
            onDismiss: () => z.onOpenChange(!1),
            children: t.jsx(we, {
              role: "listbox",
              id: z.contentId,
              "data-state": z.open ? "open" : "closed",
              dir: z.dir,
              onContextMenu: (B) => B.preventDefault(),
              ...I,
              ...ke,
              onPlaced: () => ge(!0),
              ref: U,
              style: {
                display: "flex",
                flexDirection: "column",
                outline: "none",
                ...I.style,
              },
              onKeyDown: Ge(I.onKeyDown, (B) => {
                const ue = B.ctrlKey || B.altKey || B.metaKey;
                if (
                  (B.key === "Tab" && B.preventDefault(),
                  !ue && B.key.length === 1 && C(B.key),
                  ["ArrowUp", "ArrowDown", "Home", "End"].includes(B.key))
                ) {
                  let Se = Ce()
                    .filter((Me) => !Me.disabled)
                    .map((Me) => Me.ref.current);
                  if (
                    (["ArrowUp", "End"].includes(B.key) &&
                      (Se = Se.slice().reverse()),
                    ["ArrowUp", "ArrowDown"].includes(B.key))
                  ) {
                    const Me = B.target,
                      Ie = Se.indexOf(Me);
                    Se = Se.slice(Ie + 1);
                  }
                  setTimeout(() => de(Se)), B.preventDefault();
                }
              }),
            }),
          }),
        }),
      }),
    });
  });
Wh.displayName = pb;
var gb = "SelectItemAlignedPosition",
  Gh = j.forwardRef((s, l) => {
    const { __scopeSelect: a, onPlaced: c, ...u } = s,
      f = Vr(dn, a),
      p = qr(dn, a),
      [m, x] = j.useState(null),
      [v, N] = j.useState(null),
      g = st(l, (U) => N(U)),
      S = _l(a),
      A = j.useRef(!1),
      T = j.useRef(!0),
      {
        viewport: b,
        selectedItem: E,
        selectedItemText: I,
        focusSelectedItem: z,
      } = p,
      O = j.useCallback(() => {
        if (f.trigger && f.valueNode && m && v && b && E && I) {
          const U = f.trigger.getBoundingClientRect(),
            H = v.getBoundingClientRect(),
            he = f.valueNode.getBoundingClientRect(),
            ye = I.getBoundingClientRect();
          if (f.dir !== "rtl") {
            const Me = ye.left - H.left,
              Ie = he.left - Me,
              tt = U.left - Ie,
              zt = U.width + tt,
              un = Math.max(zt, H.width),
              mn = window.innerWidth - Vt,
              Br = Hm(Ie, [Vt, Math.max(Vt, mn - un)]);
            (m.style.minWidth = zt + "px"), (m.style.left = Br + "px");
          } else {
            const Me = H.right - ye.right,
              Ie = window.innerWidth - he.right - Me,
              tt = window.innerWidth - U.right - Ie,
              zt = U.width + tt,
              un = Math.max(zt, H.width),
              mn = window.innerWidth - Vt,
              Br = Hm(Ie, [Vt, Math.max(Vt, mn - un)]);
            (m.style.minWidth = zt + "px"), (m.style.right = Br + "px");
          }
          const Ae = S(),
            Ce = window.innerHeight - Vt * 2,
            je = b.scrollHeight,
            ge = window.getComputedStyle(v),
            Ee = parseInt(ge.borderTopWidth, 10),
            de = parseInt(ge.paddingTop, 10),
            le = parseInt(ge.borderBottomWidth, 10),
            P = parseInt(ge.paddingBottom, 10),
            X = Ee + de + je + P + le,
            K = Math.min(E.offsetHeight * 5, X),
            C = window.getComputedStyle(b),
            L = parseInt(C.paddingTop, 10),
            ae = parseInt(C.paddingBottom, 10),
            oe = U.top + U.height / 2 - Vt,
            we = Ce - oe,
            ke = E.offsetHeight / 2,
            B = E.offsetTop + ke,
            ue = Ee + de + B,
            be = X - ue;
          if (ue <= oe) {
            const Me = Ae.length > 0 && E === Ae[Ae.length - 1].ref.current;
            m.style.bottom = "0px";
            const Ie = v.clientHeight - b.offsetTop - b.offsetHeight,
              tt = Math.max(we, ke + (Me ? ae : 0) + Ie + le),
              zt = ue + tt;
            m.style.height = zt + "px";
          } else {
            const Me = Ae.length > 0 && E === Ae[0].ref.current;
            m.style.top = "0px";
            const tt = Math.max(oe, Ee + b.offsetTop + (Me ? L : 0) + ke) + be;
            (m.style.height = tt + "px"), (b.scrollTop = ue - oe + b.offsetTop);
          }
          (m.style.margin = `${Vt}px 0`),
            (m.style.minHeight = K + "px"),
            (m.style.maxHeight = Ce + "px"),
            c?.(),
            requestAnimationFrame(() => (A.current = !0));
        }
      }, [S, f.trigger, f.valueNode, m, v, b, E, I, f.dir, c]);
    yt(() => O(), [O]);
    const [D, q] = j.useState();
    yt(() => {
      v && q(window.getComputedStyle(v).zIndex);
    }, [v]);
    const Z = j.useCallback(
      (U) => {
        U && T.current === !0 && (O(), z?.(), (T.current = !1));
      },
      [O, z]
    );
    return t.jsx(yb, {
      scope: a,
      contentWrapper: m,
      shouldExpandOnScrollRef: A,
      onScrollButtonChange: Z,
      children: t.jsx("div", {
        ref: x,
        style: {
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          zIndex: D,
        },
        children: t.jsx($e.div, {
          ...u,
          ref: g,
          style: { boxSizing: "border-box", maxHeight: "100%", ...u.style },
        }),
      }),
    });
  });
Gh.displayName = gb;
var vb = "SelectPopperPosition",
  ic = j.forwardRef((s, l) => {
    const {
        __scopeSelect: a,
        align: c = "start",
        collisionPadding: u = Vt,
        ...f
      } = s,
      p = Tl(a);
    return t.jsx(m1, {
      ...p,
      ...f,
      ref: l,
      align: c,
      collisionPadding: u,
      style: {
        boxSizing: "border-box",
        ...f.style,
        "--radix-select-content-transform-origin":
          "var(--radix-popper-transform-origin)",
        "--radix-select-content-available-width":
          "var(--radix-popper-available-width)",
        "--radix-select-content-available-height":
          "var(--radix-popper-available-height)",
        "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-select-trigger-height": "var(--radix-popper-anchor-height)",
      },
    });
  });
ic.displayName = vb;
var [yb, kc] = es(dn, {}),
  lc = "SelectViewport",
  Qh = j.forwardRef((s, l) => {
    const { __scopeSelect: a, nonce: c, ...u } = s,
      f = qr(lc, a),
      p = kc(lc, a),
      m = st(l, f.onViewportChange),
      x = j.useRef(0);
    return t.jsxs(t.Fragment, {
      children: [
        t.jsx("style", {
          dangerouslySetInnerHTML: {
            __html:
              "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}",
          },
          nonce: c,
        }),
        t.jsx(Ml.Slot, {
          scope: a,
          children: t.jsx($e.div, {
            "data-radix-select-viewport": "",
            role: "presentation",
            ...u,
            ref: m,
            style: {
              position: "relative",
              flex: 1,
              overflow: "hidden auto",
              ...u.style,
            },
            onScroll: Ge(u.onScroll, (v) => {
              const N = v.currentTarget,
                { contentWrapper: g, shouldExpandOnScrollRef: S } = p;
              if (S?.current && g) {
                const A = Math.abs(x.current - N.scrollTop);
                if (A > 0) {
                  const T = window.innerHeight - Vt * 2,
                    b = parseFloat(g.style.minHeight),
                    E = parseFloat(g.style.height),
                    I = Math.max(b, E);
                  if (I < T) {
                    const z = I + A,
                      O = Math.min(T, z),
                      D = z - O;
                    (g.style.height = O + "px"),
                      g.style.bottom === "0px" &&
                        ((N.scrollTop = D > 0 ? D : 0),
                        (g.style.justifyContent = "flex-end"));
                  }
                }
              }
              x.current = N.scrollTop;
            }),
          }),
        }),
      ],
    });
  });
Qh.displayName = lc;
var Kh = "SelectGroup",
  [jb, bb] = es(Kh),
  Nb = j.forwardRef((s, l) => {
    const { __scopeSelect: a, ...c } = s,
      u = xc();
    return t.jsx(jb, {
      scope: a,
      id: u,
      children: t.jsx($e.div, {
        role: "group",
        "aria-labelledby": u,
        ...c,
        ref: l,
      }),
    });
  });
Nb.displayName = Kh;
var Yh = "SelectLabel",
  wb = j.forwardRef((s, l) => {
    const { __scopeSelect: a, ...c } = s,
      u = bb(Yh, a);
    return t.jsx($e.div, { id: u.id, ...c, ref: l });
  });
wb.displayName = Yh;
var bl = "SelectItem",
  [Sb, Xh] = es(bl),
  Zh = j.forwardRef((s, l) => {
    const {
        __scopeSelect: a,
        value: c,
        disabled: u = !1,
        textValue: f,
        ...p
      } = s,
      m = Vr(bl, a),
      x = qr(bl, a),
      v = m.value === c,
      [N, g] = j.useState(f ?? ""),
      [S, A] = j.useState(!1),
      T = st(l, (z) => x.itemRefCallback?.(z, c, u)),
      b = xc(),
      E = j.useRef("touch"),
      I = () => {
        u || (m.onValueChange(c), m.onOpenChange(!1));
      };
    if (c === "")
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    return t.jsx(Sb, {
      scope: a,
      value: c,
      disabled: u,
      textId: b,
      isSelected: v,
      onItemTextChange: j.useCallback((z) => {
        g((O) => O || (z?.textContent ?? "").trim());
      }, []),
      children: t.jsx(Ml.ItemSlot, {
        scope: a,
        value: c,
        disabled: u,
        textValue: N,
        children: t.jsx($e.div, {
          role: "option",
          "aria-labelledby": b,
          "data-highlighted": S ? "" : void 0,
          "aria-selected": v && S,
          "data-state": v ? "checked" : "unchecked",
          "aria-disabled": u || void 0,
          "data-disabled": u ? "" : void 0,
          tabIndex: u ? void 0 : -1,
          ...p,
          ref: T,
          onFocus: Ge(p.onFocus, () => A(!0)),
          onBlur: Ge(p.onBlur, () => A(!1)),
          onClick: Ge(p.onClick, () => {
            E.current !== "mouse" && I();
          }),
          onPointerUp: Ge(p.onPointerUp, () => {
            E.current === "mouse" && I();
          }),
          onPointerDown: Ge(p.onPointerDown, (z) => {
            E.current = z.pointerType;
          }),
          onPointerMove: Ge(p.onPointerMove, (z) => {
            (E.current = z.pointerType),
              u
                ? x.onItemLeave?.()
                : E.current === "mouse" &&
                  z.currentTarget.focus({ preventScroll: !0 });
          }),
          onPointerLeave: Ge(p.onPointerLeave, (z) => {
            z.currentTarget === document.activeElement && x.onItemLeave?.();
          }),
          onKeyDown: Ge(p.onKeyDown, (z) => {
            (x.searchRef?.current !== "" && z.key === " ") ||
              (ob.includes(z.key) && I(), z.key === " " && z.preventDefault());
          }),
        }),
      }),
    });
  });
Zh.displayName = bl;
var Vs = "SelectItemText",
  Jh = j.forwardRef((s, l) => {
    const { __scopeSelect: a, className: c, style: u, ...f } = s,
      p = Vr(Vs, a),
      m = qr(Vs, a),
      x = Xh(Vs, a),
      v = mb(Vs, a),
      [N, g] = j.useState(null),
      S = st(
        l,
        (I) => g(I),
        x.onItemTextChange,
        (I) => m.itemTextRefCallback?.(I, x.value, x.disabled)
      ),
      A = N?.textContent,
      T = j.useMemo(
        () =>
          t.jsx(
            "option",
            { value: x.value, disabled: x.disabled, children: A },
            x.value
          ),
        [x.disabled, x.value, A]
      ),
      { onNativeOptionAdd: b, onNativeOptionRemove: E } = v;
    return (
      yt(() => (b(T), () => E(T)), [b, E, T]),
      t.jsxs(t.Fragment, {
        children: [
          t.jsx($e.span, { id: x.textId, ...f, ref: S }),
          x.isSelected && p.valueNode && !p.valueNodeHasChildren
            ? Gs.createPortal(f.children, p.valueNode)
            : null,
        ],
      })
    );
  });
Jh.displayName = Vs;
var ep = "SelectItemIndicator",
  tp = j.forwardRef((s, l) => {
    const { __scopeSelect: a, ...c } = s;
    return Xh(ep, a).isSelected
      ? t.jsx($e.span, { "aria-hidden": !0, ...c, ref: l })
      : null;
  });
tp.displayName = ep;
var ac = "SelectScrollUpButton",
  rp = j.forwardRef((s, l) => {
    const a = qr(ac, s.__scopeSelect),
      c = kc(ac, s.__scopeSelect),
      [u, f] = j.useState(!1),
      p = st(l, c.onScrollButtonChange);
    return (
      yt(() => {
        if (a.viewport && a.isPositioned) {
          let m = function () {
            const v = x.scrollTop > 0;
            f(v);
          };
          const x = a.viewport;
          return (
            m(),
            x.addEventListener("scroll", m),
            () => x.removeEventListener("scroll", m)
          );
        }
      }, [a.viewport, a.isPositioned]),
      u
        ? t.jsx(sp, {
            ...s,
            ref: p,
            onAutoScroll: () => {
              const { viewport: m, selectedItem: x } = a;
              m && x && (m.scrollTop = m.scrollTop - x.offsetHeight);
            },
          })
        : null
    );
  });
rp.displayName = ac;
var oc = "SelectScrollDownButton",
  np = j.forwardRef((s, l) => {
    const a = qr(oc, s.__scopeSelect),
      c = kc(oc, s.__scopeSelect),
      [u, f] = j.useState(!1),
      p = st(l, c.onScrollButtonChange);
    return (
      yt(() => {
        if (a.viewport && a.isPositioned) {
          let m = function () {
            const v = x.scrollHeight - x.clientHeight,
              N = Math.ceil(x.scrollTop) < v;
            f(N);
          };
          const x = a.viewport;
          return (
            m(),
            x.addEventListener("scroll", m),
            () => x.removeEventListener("scroll", m)
          );
        }
      }, [a.viewport, a.isPositioned]),
      u
        ? t.jsx(sp, {
            ...s,
            ref: p,
            onAutoScroll: () => {
              const { viewport: m, selectedItem: x } = a;
              m && x && (m.scrollTop = m.scrollTop + x.offsetHeight);
            },
          })
        : null
    );
  });
np.displayName = oc;
var sp = j.forwardRef((s, l) => {
    const { __scopeSelect: a, onAutoScroll: c, ...u } = s,
      f = qr("SelectScrollButton", a),
      p = j.useRef(null),
      m = _l(a),
      x = j.useCallback(() => {
        p.current !== null &&
          (window.clearInterval(p.current), (p.current = null));
      }, []);
    return (
      j.useEffect(() => () => x(), [x]),
      yt(() => {
        m()
          .find((N) => N.ref.current === document.activeElement)
          ?.ref.current?.scrollIntoView({ block: "nearest" });
      }, [m]),
      t.jsx($e.div, {
        "aria-hidden": !0,
        ...u,
        ref: l,
        style: { flexShrink: 0, ...u.style },
        onPointerDown: Ge(u.onPointerDown, () => {
          p.current === null && (p.current = window.setInterval(c, 50));
        }),
        onPointerMove: Ge(u.onPointerMove, () => {
          f.onItemLeave?.(),
            p.current === null && (p.current = window.setInterval(c, 50));
        }),
        onPointerLeave: Ge(u.onPointerLeave, () => {
          x();
        }),
      })
    );
  }),
  kb = "SelectSeparator",
  Cb = j.forwardRef((s, l) => {
    const { __scopeSelect: a, ...c } = s;
    return t.jsx($e.div, { "aria-hidden": !0, ...c, ref: l });
  });
Cb.displayName = kb;
var cc = "SelectArrow",
  Eb = j.forwardRef((s, l) => {
    const { __scopeSelect: a, ...c } = s,
      u = Tl(a),
      f = Vr(cc, a),
      p = qr(cc, a);
    return f.open && p.position === "popper"
      ? t.jsx(f1, { ...u, ...c, ref: l })
      : null;
  });
Eb.displayName = cc;
var Pb = "SelectBubbleInput",
  ip = j.forwardRef(({ __scopeSelect: s, value: l, ...a }, c) => {
    const u = j.useRef(null),
      f = st(c, u),
      p = v1(l);
    return (
      j.useEffect(() => {
        const m = u.current;
        if (!m) return;
        const x = window.HTMLSelectElement.prototype,
          N = Object.getOwnPropertyDescriptor(x, "value").set;
        if (p !== l && N) {
          const g = new Event("change", { bubbles: !0 });
          N.call(m, l), m.dispatchEvent(g);
        }
      }, [p, l]),
      t.jsx($e.select, {
        ...a,
        style: { ...Eh, ...a.style },
        ref: f,
        defaultValue: l,
      })
    );
  });
ip.displayName = Pb;
function lp(s) {
  return s === "" || s === void 0;
}
function ap(s) {
  const l = an(s),
    a = j.useRef(""),
    c = j.useRef(0),
    u = j.useCallback(
      (p) => {
        const m = a.current + p;
        l(m),
          (function x(v) {
            (a.current = v),
              window.clearTimeout(c.current),
              v !== "" && (c.current = window.setTimeout(() => x(""), 1e3));
          })(m);
      },
      [l]
    ),
    f = j.useCallback(() => {
      (a.current = ""), window.clearTimeout(c.current);
    }, []);
  return j.useEffect(() => () => window.clearTimeout(c.current), []), [a, u, f];
}
function op(s, l, a) {
  const u = l.length > 1 && Array.from(l).every((v) => v === l[0]) ? l[0] : l,
    f = a ? s.indexOf(a) : -1;
  let p = Ab(s, Math.max(f, 0));
  u.length === 1 && (p = p.filter((v) => v !== a));
  const x = p.find((v) =>
    v.textValue.toLowerCase().startsWith(u.toLowerCase())
  );
  return x !== a ? x : void 0;
}
function Ab(s, l) {
  return s.map((a, c) => s[(l + c) % s.length]);
}
var Rb = Lh,
  Mb = Fh,
  _b = Hh,
  Tb = Vh,
  zb = qh,
  Ib = Bh,
  Ob = Qh,
  Lb = Zh,
  Db = Jh,
  Fb = tp,
  $b = rp,
  Hb = np;
function ff({ ...s }) {
  return t.jsx(Rb, { "data-slot": "select", ...s });
}
function hf({ ...s }) {
  return t.jsx(_b, { "data-slot": "select-value", ...s });
}
function pf({ className: s, size: l = "default", children: a, ...c }) {
  return t.jsxs(Mb, {
    "data-slot": "select-trigger",
    "data-size": l,
    className: it(
      "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      s
    ),
    ...c,
    children: [
      a,
      t.jsx(Tb, {
        asChild: !0,
        children: t.jsx(Sf, { className: "size-4 opacity-50" }),
      }),
    ],
  });
}
function xf({ className: s, children: l, position: a = "popper", ...c }) {
  return t.jsx(zb, {
    children: t.jsxs(Ib, {
      "data-slot": "select-content",
      className: it(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        a === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        s
      ),
      position: a,
      ...c,
      children: [
        t.jsx(Vb, {}),
        t.jsx(Ob, {
          className: it(
            "p-1",
            a === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          ),
          children: l,
        }),
        t.jsx(qb, {}),
      ],
    }),
  });
}
function Tt({ className: s, children: l, ...a }) {
  return t.jsxs(Lb, {
    "data-slot": "select-item",
    className: it(
      "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      s
    ),
    ...a,
    children: [
      t.jsx("span", {
        className: "absolute right-2 flex size-3.5 items-center justify-center",
        children: t.jsx(Fb, { children: t.jsx(Og, { className: "size-4" }) }),
      }),
      t.jsx(Db, { children: l }),
    ],
  });
}
function Vb({ className: s, ...l }) {
  return t.jsx($b, {
    "data-slot": "select-scroll-up-button",
    className: it("flex cursor-default items-center justify-center py-1", s),
    ...l,
    children: t.jsx(qg, { className: "size-4" }),
  });
}
function qb({ className: s, ...l }) {
  return t.jsx(Hb, {
    "data-slot": "select-scroll-down-button",
    className: it("flex cursor-default items-center justify-center py-1", s),
    ...l,
    children: t.jsx(Sf, { className: "size-4" }),
  });
}
function Bb({ onNavigate: s }) {
  const [l, a] = j.useState({
      companyName: "",
      fullName: "",
      email: "",
      phone: "",
      sector: "",
      employeeCount: "",
      password: "",
      confirmPassword: "",
    }),
    c = (f) => {
      if ((f.preventDefault(), l.password !== l.confirmPassword)) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }
      s?.("dashboard");
    },
    u = (f, p) => {
      a((m) => ({ ...m, [f]: p }));
    };
  return t.jsx("div", {
    className:
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] px-4 py-8",
    children: t.jsxs(G, {
      className: "w-full max-w-2xl shadow-2xl",
      children: [
        t.jsxs(pe, {
          className: "space-y-4 text-center",
          children: [
            t.jsx("div", {
              className: "flex justify-center",
              children: t.jsx("img", {
                src: pc,
                alt: "SAHTEE",
                className: "h-16",
              }),
            }),
            t.jsx(xe, {
              className: "text-[var(--sahtee-blue-primary)]",
              children: "Créer votre compte SAHTEE",
            }),
            t.jsx(Uf, {
              children:
                "Commencez votre transformation digitale en santé et sécurité au travail",
            }),
          ],
        }),
        t.jsxs("form", {
          onSubmit: c,
          children: [
            t.jsxs(Q, {
              className: "space-y-4",
              children: [
                t.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "companyName",
                          children: "Nom de l'entreprise *",
                        }),
                        t.jsx(St, {
                          id: "companyName",
                          type: "text",
                          placeholder: "ACME Industries",
                          value: l.companyName,
                          onChange: (f) => u("companyName", f.target.value),
                          required: !0,
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "fullName",
                          children: "Nom complet *",
                        }),
                        t.jsx(St, {
                          id: "fullName",
                          type: "text",
                          placeholder: "Jean Dupont",
                          value: l.fullName,
                          onChange: (f) => u("fullName", f.target.value),
                          required: !0,
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "email",
                          children: "Adresse e-mail professionnelle *",
                        }),
                        t.jsx(St, {
                          id: "email",
                          type: "email",
                          placeholder: "jean.dupont@entreprise.com",
                          value: l.email,
                          onChange: (f) => u("email", f.target.value),
                          required: !0,
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, { htmlFor: "phone", children: "Téléphone" }),
                        t.jsx(St, {
                          id: "phone",
                          type: "tel",
                          placeholder: "+33 6 12 34 56 78",
                          value: l.phone,
                          onChange: (f) => u("phone", f.target.value),
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "sector",
                          children: "Secteur d'activité *",
                        }),
                        t.jsxs(ff, {
                          value: l.sector,
                          onValueChange: (f) => u("sector", f),
                          required: !0,
                          children: [
                            t.jsx(pf, {
                              className:
                                "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                              children: t.jsx(hf, {
                                placeholder: "Sélectionnez un secteur",
                              }),
                            }),
                            t.jsxs(xf, {
                              children: [
                                t.jsx(Tt, {
                                  value: "manufacturing",
                                  children: "Industrie manufacturière",
                                }),
                                t.jsx(Tt, {
                                  value: "food",
                                  children: "Agroalimentaire",
                                }),
                                t.jsx(Tt, {
                                  value: "healthcare",
                                  children: "Santé",
                                }),
                                t.jsx(Tt, {
                                  value: "construction",
                                  children: "Construction / BTP",
                                }),
                                t.jsx(Tt, {
                                  value: "logistics",
                                  children: "Logistique",
                                }),
                                t.jsx(Tt, {
                                  value: "services",
                                  children: "Services",
                                }),
                                t.jsx(Tt, {
                                  value: "other",
                                  children: "Autre",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "employeeCount",
                          children: "Nombre d'employés *",
                        }),
                        t.jsxs(ff, {
                          value: l.employeeCount,
                          onValueChange: (f) => u("employeeCount", f),
                          required: !0,
                          children: [
                            t.jsx(pf, {
                              className:
                                "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                              children: t.jsx(hf, {
                                placeholder: "Sélectionnez une tranche",
                              }),
                            }),
                            t.jsxs(xf, {
                              children: [
                                t.jsx(Tt, {
                                  value: "1-10",
                                  children: "1-10 employés",
                                }),
                                t.jsx(Tt, {
                                  value: "11-50",
                                  children: "11-50 employés",
                                }),
                                t.jsx(Tt, {
                                  value: "51-200",
                                  children: "51-200 employés",
                                }),
                                t.jsx(Tt, {
                                  value: "201-500",
                                  children: "201-500 employés",
                                }),
                                t.jsx(Tt, {
                                  value: "500+",
                                  children: "500+ employés",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "password",
                          children: "Mot de passe *",
                        }),
                        t.jsx(St, {
                          id: "password",
                          type: "password",
                          placeholder: "••••••••",
                          value: l.password,
                          onChange: (f) => u("password", f.target.value),
                          required: !0,
                          minLength: 8,
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                    t.jsxs("div", {
                      className: "space-y-2",
                      children: [
                        t.jsx(Xe, {
                          htmlFor: "confirmPassword",
                          children: "Confirmer le mot de passe *",
                        }),
                        t.jsx(St, {
                          id: "confirmPassword",
                          type: "password",
                          placeholder: "••••••••",
                          value: l.confirmPassword,
                          onChange: (f) => u("confirmPassword", f.target.value),
                          required: !0,
                          minLength: 8,
                          className:
                            "border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                        }),
                      ],
                    }),
                  ],
                }),
                t.jsxs("div", {
                  className: "flex items-start space-x-2 pt-2",
                  children: [
                    t.jsx("input", {
                      type: "checkbox",
                      id: "terms",
                      required: !0,
                      className:
                        "mt-1 rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]",
                    }),
                    t.jsxs(Xe, {
                      htmlFor: "terms",
                      className: "text-sm cursor-pointer leading-relaxed",
                      children: [
                        "J'accepte les ",
                        t.jsx("span", {
                          className:
                            "text-[var(--sahtee-blue-primary)] hover:underline",
                          children: "conditions générales d'utilisation",
                        }),
                        " et la ",
                        t.jsx("span", {
                          className:
                            "text-[var(--sahtee-blue-primary)] hover:underline",
                          children: "politique de confidentialité",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            t.jsxs(Wf, {
              className: "flex flex-col space-y-4",
              children: [
                t.jsx(Y, {
                  type: "submit",
                  className:
                    "w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white",
                  children: "Créer mon compte",
                }),
                t.jsxs("div", {
                  className: "text-center text-sm",
                  children: [
                    t.jsx("span", {
                      className: "text-gray-600",
                      children: "Vous avez déjà un compte ? ",
                    }),
                    t.jsx("button", {
                      type: "button",
                      onClick: () => s?.("login"),
                      className:
                        "text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors",
                      children: "Se connecter",
                    }),
                  ],
                }),
                t.jsx("button", {
                  type: "button",
                  onClick: () => s?.("homepage"),
                  className:
                    "text-sm text-gray-600 hover:text-[var(--sahtee-blue-primary)] transition-colors",
                  children: "← Retour à l'accueil",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Ub({ sectorImages: s }) {
  const [l, a] = j.useState(0),
    c = [
      {
        icon: "🧵",
        title: "Textile",
        description:
          "Prévention des troubles musculo-squelettiques et amélioration de l'ergonomie des postes dans les ateliers de production textile.",
        image: s.textile,
      },
      {
        icon: "🍞",
        title: "Agroalimentaire",
        description:
          "Sécurité sanitaire, prévention des risques biologiques et maîtrise des procédés de production et de manutention.",
        image: s.food,
      },
      {
        icon: "🌾",
        title: "Agricole",
        description:
          "Protection contre les pesticides, prévention des accidents liés aux machines et aux conditions climatiques.",
        image: s.agriculture,
      },
      {
        icon: "🏗️",
        title: "BTP (Bâtiment & Travaux Publics)",
        description:
          "Réduction des risques de chute, sécurité des manutentions et conformité réglementaire sur site.",
        image: s.construction,
      },
      {
        icon: "💊",
        title: "Pharmaceutique",
        description:
          "Sécurité biologique et chimique, traçabilité des procédés et conformité aux standards internationaux.",
        image: s.pharmaceutical,
      },
    ],
    u = () => {
      a((p) => (p + 1) % c.length);
    },
    f = () => {
      a((p) => (p - 1 + c.length) % c.length);
    };
  return t.jsx("section", {
    className: "py-20",
    style: { backgroundColor: "#f0f4ff" },
    children: t.jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        t.jsxs("div", {
          className: "text-center mb-16",
          children: [
            t.jsx("h2", {
              className: "text-4xl mb-6 text-gray-900",
              children: "Secteurs visés",
            }),
            t.jsx("p", {
              className: "text-xl text-gray-600 max-w-3xl mx-auto",
              children: "Des solutions adaptées à chaque secteur d'activité",
            }),
          ],
        }),
        t.jsxs("div", {
          className: "relative flex items-center gap-4",
          children: [
            t.jsx("button", {
              onClick: f,
              className:
                "flex-shrink-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10",
              type: "button",
              "aria-label": "Previous slide",
              children: t.jsx(Fg, { className: "w-6 h-6 text-gray-600" }),
            }),
            t.jsxs("div", {
              className: "flex-1",
              children: [
                t.jsx("div", {
                  className: "overflow-hidden rounded-2xl",
                  children: t.jsx("div", {
                    className:
                      "flex transition-transform duration-500 ease-in-out",
                    style: { transform: `translateX(-${l * 100}%)` },
                    children: c.map((p, m) =>
                      t.jsx(
                        "div",
                        {
                          className: "w-full flex-shrink-0",
                          children: t.jsxs("div", {
                            className:
                              "grid lg:grid-cols-2 gap-8 items-center min-h-[500px]",
                            children: [
                              t.jsxs("div", {
                                className: "order-2 lg:order-1 px-8",
                                children: [
                                  t.jsxs("div", {
                                    className: "flex items-center gap-4 mb-6",
                                    children: [
                                      t.jsx("span", {
                                        className: "text-5xl",
                                        children: p.icon,
                                      }),
                                      t.jsx("h3", {
                                        className: "text-3xl text-gray-900",
                                        children: p.title,
                                      }),
                                    ],
                                  }),
                                  t.jsx("p", {
                                    className:
                                      "text-xl text-gray-600 leading-relaxed mb-8",
                                    children: p.description,
                                  }),
                                  t.jsx(Y, {
                                    variant: "outline",
                                    className:
                                      "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white",
                                    children: "En savoir plus",
                                  }),
                                ],
                              }),
                              t.jsx("div", {
                                className: "order-1 lg:order-2",
                                children: t.jsx("img", {
                                  src: p.image,
                                  alt: p.title,
                                  className:
                                    "w-full h-80 object-cover rounded-xl shadow-lg",
                                }),
                              }),
                            ],
                          }),
                        },
                        m
                      )
                    ),
                  }),
                }),
                t.jsx("div", {
                  className: "flex justify-center mt-8 space-x-2",
                  children: c.map((p, m) =>
                    t.jsx(
                      "button",
                      {
                        onClick: () => a(m),
                        type: "button",
                        "aria-label": `Go to slide ${m + 1}`,
                        className: `w-3 h-3 rounded-full transition-all duration-300 ${
                          m === l
                            ? "bg-[var(--sahtee-blue-primary)] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`,
                      },
                      m
                    )
                  ),
                }),
              ],
            }),
            t.jsx("button", {
              onClick: u,
              className:
                "flex-shrink-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10",
              type: "button",
              "aria-label": "Next slide",
              children: t.jsx(Hg, { className: "w-6 h-6 text-gray-600" }),
            }),
          ],
        }),
      ],
    }),
  });
}
function Wb({ dashboardImage: s }) {
  const l = [
      {
        icon: Yg,
        verb: "COLLECTER",
        description: "les données du terrain",
        color: "from-blue-500 to-blue-600",
        angle: 0,
      },
      {
        icon: er,
        verb: "ANALYSER",
        description: "les indicateurs clés",
        color: "from-cyan-500 to-cyan-600",
        angle: 60,
      },
      {
        icon: qt,
        verb: "DÉTECTER",
        description: "les failles et signaux faibles",
        color: "from-orange-500 to-orange-600",
        angle: 120,
      },
      {
        icon: hr,
        verb: "RÉAGIR",
        description: "par des actions ciblées et mesurables",
        color: "from-red-500 to-red-600",
        angle: 180,
      },
      {
        icon: Sl,
        verb: "SE CONFORMER",
        description: "aux normes et exigences internationales",
        color: "from-purple-500 to-purple-600",
        angle: 240,
      },
      {
        icon: Mm,
        verb: "SE PERFORMER",
        description: "durablement",
        color: "from-green-500 to-green-600",
        angle: 300,
      },
    ],
    a = (c, u = 220) => {
      const f = ((c - 90) * Math.PI) / 180,
        p = Math.cos(f) * u,
        m = Math.sin(f) * u;
      return { x: p, y: m };
    };
  return t.jsx("section", {
    className: "py-20 bg-gradient-to-b from-white to-gray-50",
    children: t.jsx("div", {
      className: "max-w-7xl mx-auto px-6",
      children: t.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
        children: [
          t.jsxs("div", {
            className: "space-y-6",
            children: [
              t.jsx("h2", {
                className: "text-4xl md:text-5xl font-bold text-gray-900",
                children: "Pourquoi SAHTEE ?",
              }),
              t.jsx("p", {
                className: "text-xl text-gray-600 leading-relaxed",
                children:
                  "Parce que chaque entreprise doit transformer la prévention en levier de performance durable.",
              }),
            ],
          }),
          t.jsx("div", {
            className: "relative",
            children: t.jsxs("div", {
              className: "relative w-full",
              style: { minHeight: "550px" },
              children: [
                t.jsx("div", {
                  className:
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
                  style: { width: "180px", height: "180px" },
                  children: t.jsx("div", {
                    className:
                      "absolute inset-0 rounded-full bg-white shadow-lg flex items-center justify-center",
                    children: t.jsxs("div", {
                      className: "text-center p-4",
                      children: [
                        t.jsx("div", {
                          className:
                            "mx-auto mb-2 flex items-center justify-center",
                          children: t.jsx(Mm, {
                            className: "w-8 h-8",
                            style: { color: "var(--sahtee-blue-primary)" },
                            strokeWidth: 2.5,
                          }),
                        }),
                        t.jsx("h3", {
                          className: "text-sm font-bold text-gray-900 mb-1",
                          children: "Cycle de Performance",
                        }),
                        t.jsx("p", {
                          className: "text-xs text-gray-600 leading-tight",
                          children: "De la prévention à la performance",
                        }),
                      ],
                    }),
                  }),
                }),
                t.jsx("div", {
                  children: l.map((c, u) => {
                    const f = c.icon,
                      p = a(c.angle);
                    return t.jsx(
                      "div",
                      {
                        className: "absolute z-10",
                        style: {
                          left: "50%",
                          top: "50%",
                          transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
                        },
                        children: t.jsxs("div", {
                          className: "relative group",
                          children: [
                            t.jsxs("div", {
                              className: "relative w-44 text-center",
                              children: [
                                t.jsx("div", {
                                  className:
                                    "mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                                  children: t.jsx(f, {
                                    className: "w-10 h-10 flex-shrink-0",
                                    style: {
                                      color: "var(--sahtee-blue-primary)",
                                    },
                                    strokeWidth: 2,
                                  }),
                                }),
                                t.jsx("h4", {
                                  className:
                                    "text-sm font-bold mb-1 text-gray-900",
                                  children: c.verb,
                                }),
                                t.jsx("p", {
                                  className:
                                    "text-xs text-gray-600 leading-relaxed",
                                  children: c.description,
                                }),
                              ],
                            }),
                            t.jsx("div", {
                              className:
                                "absolute top-5 left-1/2 pointer-events-none opacity-10",
                              style: {
                                width: "1px",
                                height: "70px",
                                background: "rgba(156, 163, 175, 0.6)",
                                transform: `translate(-50%, -50%) rotate(${
                                  c.angle + 90
                                }deg)`,
                                transformOrigin: "center",
                              },
                            }),
                          ],
                        }),
                      },
                      u
                    );
                  }),
                }),
                t.jsx("svg", {
                  className:
                    "absolute inset-0 w-full h-full pointer-events-none opacity-10",
                  viewBox: "0 0 100 100",
                  children: t.jsx("circle", {
                    cx: "50",
                    cy: "50",
                    r: "30",
                    fill: "none",
                    stroke: "#3B82F6",
                    strokeWidth: "0.3",
                    strokeDasharray: "1,3",
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    }),
  });
}
function Gb() {
  const [s, l] = j.useState("homepage"),
    a =
      "https://images.unsplash.com/photo-1735494032948-14ef288fc9d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrcGxhY2UlMjBzYWZldHklMjBjb25zdHJ1Y3Rpb24lMjB3b3JrZXJzfGVufDF8fHx8MTc1ODcyNjExMXww&ixlib=rb-4.1.0&q=80&w=1080",
    c =
      "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc1ODcyMDk2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    u = {
      textile:
        "https://images.unsplash.com/photo-1675176785803-bffbbb0cd2f4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      food: "https://images.unsplash.com/photo-1668838352480-c9fb3048053a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJvY2Vzc2luZyUyMGluZHVzdHJ5fGVufDF8fHx8MTc1ODcyNjIwNnww&ixlib=rb-4.1.0&q=80&w=1080",
      agriculture:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm1lciUyMHRyYWN0b3J8ZW58MXx8fHwxNzU4NzI2MjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      construction:
        "https://images.unsplash.com/photo-1680538993407-aeacacd7354a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzU4NjcyNjg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pharmaceutical:
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjZXV0aWNhbCUyMGxhYm9yYXRvcnl8ZW58MXx8fHwxNzU4NzI0MDMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    };
  return s === "dashboard"
    ? t.jsx(py, {})
    : s === "login"
    ? t.jsx(jy, { onNavigate: l })
    : s === "signup"
    ? t.jsx(Bb, { onNavigate: l })
    : t.jsxs("div", {
        className: "min-h-screen",
        children: [
          t.jsx(by, { onNavigate: l }),
          t.jsxs("main", {
            children: [
              t.jsx("section", {
                id: "home",
                children: t.jsx(yy, { heroImage: a, onNavigate: l }),
              }),
              t.jsx("section", { id: "about", children: t.jsx(r0, {}) }),
              t.jsx(Wb, { dashboardImage: c }),
              t.jsx("section", { id: "features", children: t.jsx(gy, {}) }),
              t.jsx(Ny, {}),
              t.jsx("section", {
                id: "sectors",
                children: t.jsx(Ub, { sectorImages: u }),
              }),
              t.jsx(B0, {}),
              t.jsx(wy, { dashboardImage: c }),
              t.jsx(q0, {}),
            ],
          }),
          t.jsx("section", {
            id: "contact",
            children: t.jsx(vy, { onNavigate: l }),
          }),
        ],
      });
}
function Qb() {
  return t.jsx(Gb, {});
}
fg.createRoot(document.getElementById("root")).render(t.jsx(Qb, {}));
