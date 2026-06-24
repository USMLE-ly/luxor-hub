import { R as React, r as reactExports, e as useNavigate, j as jsxRuntimeExports } from "./index-DbMNM3HR.js";
import { A as AppLayout } from "./AppLayout-z0hM-vSW.js";
import { d as createLucideIcon, k as clsx, e as useAuth, s as supabase, T as TriangleAlert, B as Button } from "./AppContent-_r6To3FT.js";
import { t as toast } from "./index-eweMusN_.js";
import { t as toDate, d as differenceInCalendarDays, l as millisecondsInHour, n as millisecondsInMinute, j as format } from "./format-CHv4aOWu.js";
import { C as ChartColumn } from "./chart-column-D5f70W29.js";
import { C as Calendar } from "./calendar-DLJ-wAaj.js";
import { D as DollarSign } from "./dollar-sign-CEqsF5cF.js";
import { L as Leaf } from "./leaf-xfWMeBe3.js";
import { m as motion } from "./proxy-BW1EVREd.js";
import { g as getAngledRectangleWidth, i as isNumber, G as Global, a as getStringSize, m as mathSign, b as isFunction, T as Text, s as shallowEqual, f as filterProps, c as get, L as Layer, d as adaptEventsOfChild, e as Label, u as useChartWidth, h as useChartHeight, j as useXAxisOrThrow, k as getTicksOfAxis, l as useYAxisOrThrow, n as generateCategoricalChart, B as Bar, o as formatAxisMap, R as ResponsiveContainer, P as PieChart, p as Pie, C as Cell, q as Tooltip } from "./PieChart-DyhPL4AV.js";
import { S as Sparkles } from "./sparkles-Dn0VJ8Xg.js";
import { L as LoaderCircle } from "./loader-circle-BwBuuCzi.js";
import { S as ShoppingBag } from "./shopping-bag-XUNI31xn.js";
import { C as Clock } from "./clock-Lq0xdoc2.js";
import { R as Recycle } from "./recycle-CYltD8nk.js";
import { H as Heart } from "./heart-9MJilOc4.js";
import "./BottomNav-BJG5rdUS.js";
import "./shirt-DOs4UNgN.js";
import "./index-JsMeU7Bl.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const PackageOpen = createLucideIcon("PackageOpen", [
  ["path", { d: "M12 22v-9", key: "x3hkom" }],
  [
    "path",
    {
      d: "M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z",
      key: "2ntwy6"
    }
  ],
  [
    "path",
    {
      d: "M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13",
      key: "1pmm1c"
    }
  ],
  [
    "path",
    {
      d: "M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z",
      key: "12ttoo"
    }
  ]
]);
function differenceInDays(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const sign = compareLocalAsc(_dateLeft, _dateRight);
  const difference = Math.abs(differenceInCalendarDays(_dateLeft, _dateRight));
  _dateLeft.setDate(_dateLeft.getDate() - sign * difference);
  const isLastDayNotFull = Number(
    compareLocalAsc(_dateLeft, _dateRight) === -sign
  );
  const result = sign * (difference - isLastDayNotFull);
  return result === 0 ? 0 : result;
}
function compareLocalAsc(dateLeft, dateRight) {
  const diff = dateLeft.getFullYear() - dateRight.getFullYear() || dateLeft.getMonth() - dateRight.getMonth() || dateLeft.getDate() - dateRight.getDate() || dateLeft.getHours() - dateRight.getHours() || dateLeft.getMinutes() - dateRight.getMinutes() || dateLeft.getSeconds() - dateRight.getSeconds() || dateLeft.getMilliseconds() - dateRight.getMilliseconds();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return diff;
  }
}
function parseISO(argument, options) {
  const additionalDigits = 2;
  const dateStrings = splitDateString(argument);
  let date;
  if (dateStrings.date) {
    const parseYearResult = parseYear(dateStrings.date, additionalDigits);
    date = parseDate(parseYearResult.restDateString, parseYearResult.year);
  }
  if (!date || isNaN(date.getTime())) {
    return /* @__PURE__ */ new Date(NaN);
  }
  const timestamp = date.getTime();
  let time = 0;
  let offset;
  if (dateStrings.time) {
    time = parseTime(dateStrings.time);
    if (isNaN(time)) {
      return /* @__PURE__ */ new Date(NaN);
    }
  }
  if (dateStrings.timezone) {
    offset = parseTimezone(dateStrings.timezone);
    if (isNaN(offset)) {
      return /* @__PURE__ */ new Date(NaN);
    }
  } else {
    const dirtyDate = new Date(timestamp + time);
    const result = /* @__PURE__ */ new Date(0);
    result.setFullYear(
      dirtyDate.getUTCFullYear(),
      dirtyDate.getUTCMonth(),
      dirtyDate.getUTCDate()
    );
    result.setHours(
      dirtyDate.getUTCHours(),
      dirtyDate.getUTCMinutes(),
      dirtyDate.getUTCSeconds(),
      dirtyDate.getUTCMilliseconds()
    );
    return result;
  }
  return new Date(timestamp + time + offset);
}
const patterns = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/
};
const dateRegex = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
const timeRegex = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
const timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function splitDateString(dateString) {
  const dateStrings = {};
  const array = dateString.split(patterns.dateTimeDelimiter);
  let timeString;
  if (array.length > 2) {
    return dateStrings;
  }
  if (/:/.test(array[0])) {
    timeString = array[0];
  } else {
    dateStrings.date = array[0];
    timeString = array[1];
    if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
      dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
      timeString = dateString.substr(
        dateStrings.date.length,
        dateString.length
      );
    }
  }
  if (timeString) {
    const token = patterns.timezone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], "");
      dateStrings.timezone = token[1];
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  const regex = new RegExp(
    "^(?:(\\d{4}|[+-]\\d{" + (4 + additionalDigits) + "})|(\\d{2}|[+-]\\d{" + (2 + additionalDigits) + "})$)"
  );
  const captures = dateString.match(regex);
  if (!captures) return { year: NaN, restDateString: "" };
  const year = captures[1] ? parseInt(captures[1]) : null;
  const century = captures[2] ? parseInt(captures[2]) : null;
  return {
    year: century === null ? year : century * 100,
    restDateString: dateString.slice((captures[1] || captures[2]).length)
  };
}
function parseDate(dateString, year) {
  if (year === null) return /* @__PURE__ */ new Date(NaN);
  const captures = dateString.match(dateRegex);
  if (!captures) return /* @__PURE__ */ new Date(NaN);
  const isWeekDate = !!captures[4];
  const dayOfYear = parseDateUnit(captures[1]);
  const month = parseDateUnit(captures[2]) - 1;
  const day = parseDateUnit(captures[3]);
  const week = parseDateUnit(captures[4]);
  const dayOfWeek = parseDateUnit(captures[5]) - 1;
  if (isWeekDate) {
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  } else {
    const date = /* @__PURE__ */ new Date(0);
    if (!validateDate(year, month, day) || !validateDayOfYearDate(year, dayOfYear)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
    return date;
  }
}
function parseDateUnit(value) {
  return value ? parseInt(value) : 1;
}
function parseTime(timeString) {
  const captures = timeString.match(timeRegex);
  if (!captures) return NaN;
  const hours = parseTimeUnit(captures[1]);
  const minutes = parseTimeUnit(captures[2]);
  const seconds = parseTimeUnit(captures[3]);
  if (!validateTime(hours, minutes, seconds)) {
    return NaN;
  }
  return hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1e3;
}
function parseTimeUnit(value) {
  return value && parseFloat(value.replace(",", ".")) || 0;
}
function parseTimezone(timezoneString) {
  if (timezoneString === "Z") return 0;
  const captures = timezoneString.match(timezoneRegex);
  if (!captures) return 0;
  const sign = captures[1] === "+" ? -1 : 1;
  const hours = parseInt(captures[2]);
  const minutes = captures[3] && parseInt(captures[3]) || 0;
  if (!validateTimezone(hours, minutes)) {
    return NaN;
  }
  return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  const fourthOfJanuaryDay = date.getUTCDay() || 7;
  const diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
const daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
  return month >= 0 && month <= 11 && date >= 1 && date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28));
}
function validateDayOfYearDate(year, dayOfYear) {
  return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365);
}
function validateWeekDate(_year, week, day) {
  return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}
function validateTime(hours, minutes, seconds) {
  if (hours === 24) {
    return minutes === 0 && seconds === 0;
  }
  return seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 25;
}
function validateTimezone(_hours, minutes) {
  return minutes >= 0 && minutes <= 59;
}
function getEveryNthWithCondition(array, n, isValid) {
  if (n < 1) {
    return [];
  }
  if (n === 1 && isValid === void 0) {
    return array;
  }
  var result = [];
  for (var i = 0; i < array.length; i += n) {
    {
      result.push(array[i]);
    }
  }
  return result;
}
function getAngledTickWidth(contentSize, unitSize, angle) {
  var size = {
    width: contentSize.width + unitSize.width,
    height: contentSize.height + unitSize.height
  };
  return getAngledRectangleWidth(size, angle);
}
function getTickBoundaries(viewBox, sign, sizeKey) {
  var isWidth = sizeKey === "width";
  var x = viewBox.x, y = viewBox.y, width = viewBox.width, height = viewBox.height;
  if (sign === 1) {
    return {
      start: isWidth ? x : y,
      end: isWidth ? x + width : y + height
    };
  }
  return {
    start: isWidth ? x + width : y + height,
    end: isWidth ? x : y
  };
}
function isVisible(sign, tickPosition, getSize, start, end) {
  if (sign * tickPosition < sign * start || sign * tickPosition > sign * end) {
    return false;
  }
  var size = getSize();
  return sign * (tickPosition - sign * size / 2 - start) >= 0 && sign * (tickPosition + sign * size / 2 - end) <= 0;
}
function getNumberIntervalTicks(ticks, interval) {
  return getEveryNthWithCondition(ticks, interval + 1);
}
function getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap) {
  var result = (ticks || []).slice();
  var initialStart = boundaries.start, end = boundaries.end;
  var index = 0;
  var stepsize = 1;
  var start = initialStart;
  var _loop = function _loop2() {
    var entry = ticks === null || ticks === void 0 ? void 0 : ticks[index];
    if (entry === void 0) {
      return {
        v: getEveryNthWithCondition(ticks, stepsize)
      };
    }
    var i = index;
    var size;
    var getSize = function getSize2() {
      if (size === void 0) {
        size = getTickSize(entry, i);
      }
      return size;
    };
    var tickCoord = entry.coordinate;
    var isShow = index === 0 || isVisible(sign, tickCoord, getSize, start, end);
    if (!isShow) {
      index = 0;
      start = initialStart;
      stepsize += 1;
    }
    if (isShow) {
      start = tickCoord + sign * (getSize() / 2 + minTickGap);
      index += stepsize;
    }
  }, _ret;
  while (stepsize <= result.length) {
    _ret = _loop();
    if (_ret) return _ret.v;
  }
  return [];
}
function _typeof$3(o) {
  "@babel/helpers - typeof";
  return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$3(o);
}
function ownKeys$1(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread$1(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys$1(Object(t), true).forEach(function(r2) {
      _defineProperty$3(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty$3(obj, key, value) {
  key = _toPropertyKey$3(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$3(t) {
  var i = _toPrimitive$3(t, "string");
  return "symbol" == _typeof$3(i) ? i : i + "";
}
function _toPrimitive$3(t, r) {
  if ("object" != _typeof$3(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof$3(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap) {
  var result = (ticks || []).slice();
  var len = result.length;
  var start = boundaries.start;
  var end = boundaries.end;
  var _loop = function _loop2(i2) {
    var entry = result[i2];
    var size;
    var getSize = function getSize2() {
      if (size === void 0) {
        size = getTickSize(entry, i2);
      }
      return size;
    };
    if (i2 === len - 1) {
      var gap = sign * (entry.coordinate + sign * getSize() / 2 - end);
      result[i2] = entry = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        tickCoord: gap > 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i2] = entry = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    var isShow = isVisible(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      end = entry.tickCoord - sign * (getSize() / 2 + minTickGap);
      result[i2] = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (var i = len - 1; i >= 0; i--) {
    _loop(i);
  }
  return result;
}
function getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, preserveEnd) {
  var result = (ticks || []).slice();
  var len = result.length;
  var start = boundaries.start, end = boundaries.end;
  if (preserveEnd) {
    var tail = ticks[len - 1];
    var tailSize = getTickSize(tail, len - 1);
    var tailGap = sign * (tail.coordinate + sign * tailSize / 2 - end);
    result[len - 1] = tail = _objectSpread$1(_objectSpread$1({}, tail), {}, {
      tickCoord: tailGap > 0 ? tail.coordinate - tailGap * sign : tail.coordinate
    });
    var isTailShow = isVisible(sign, tail.tickCoord, function() {
      return tailSize;
    }, start, end);
    if (isTailShow) {
      end = tail.tickCoord - sign * (tailSize / 2 + minTickGap);
      result[len - 1] = _objectSpread$1(_objectSpread$1({}, tail), {}, {
        isShow: true
      });
    }
  }
  var count = preserveEnd ? len - 1 : len;
  var _loop2 = function _loop22(i2) {
    var entry = result[i2];
    var size;
    var getSize = function getSize2() {
      if (size === void 0) {
        size = getTickSize(entry, i2);
      }
      return size;
    };
    if (i2 === 0) {
      var gap = sign * (entry.coordinate - sign * getSize() / 2 - start);
      result[i2] = entry = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        tickCoord: gap < 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i2] = entry = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    var isShow = isVisible(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      start = entry.tickCoord + sign * (getSize() / 2 + minTickGap);
      result[i2] = _objectSpread$1(_objectSpread$1({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (var i = 0; i < count; i++) {
    _loop2(i);
  }
  return result;
}
function getTicks(props, fontSize, letterSpacing) {
  var tick = props.tick, ticks = props.ticks, viewBox = props.viewBox, minTickGap = props.minTickGap, orientation = props.orientation, interval = props.interval, tickFormatter = props.tickFormatter, unit = props.unit, angle = props.angle;
  if (!ticks || !ticks.length || !tick) {
    return [];
  }
  if (isNumber(interval) || Global.isSsr) {
    return getNumberIntervalTicks(ticks, typeof interval === "number" && isNumber(interval) ? interval : 0);
  }
  var candidates = [];
  var sizeKey = orientation === "top" || orientation === "bottom" ? "width" : "height";
  var unitSize = unit && sizeKey === "width" ? getStringSize(unit, {
    fontSize,
    letterSpacing
  }) : {
    width: 0,
    height: 0
  };
  var getTickSize = function getTickSize2(content, index) {
    var value = isFunction(tickFormatter) ? tickFormatter(content.value, index) : content.value;
    return sizeKey === "width" ? getAngledTickWidth(getStringSize(value, {
      fontSize,
      letterSpacing
    }), unitSize, angle) : getStringSize(value, {
      fontSize,
      letterSpacing
    })[sizeKey];
  };
  var sign = ticks.length >= 2 ? mathSign(ticks[1].coordinate - ticks[0].coordinate) : 1;
  var boundaries = getTickBoundaries(viewBox, sign, sizeKey);
  if (interval === "equidistantPreserveStart") {
    return getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  if (interval === "preserveStart" || interval === "preserveStartEnd") {
    candidates = getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, interval === "preserveStartEnd");
  } else {
    candidates = getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  return candidates.filter(function(entry) {
    return entry.isShow;
  });
}
var _excluded = ["viewBox"], _excluded2 = ["viewBox"], _excluded3 = ["ticks"];
function _typeof$2(o) {
  "@babel/helpers - typeof";
  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$2(o);
}
function _extends$2() {
  _extends$2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty$2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _classCallCheck$2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$2(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor);
  }
}
function _createClass$2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper$2(t, o, e) {
  return o = _getPrototypeOf$2(o), _possibleConstructorReturn$2(t, _isNativeReflectConstruct$2() ? Reflect.construct(o, e || [], _getPrototypeOf$2(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn$2(self, call) {
  if (call && (_typeof$2(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized$2(self);
}
function _assertThisInitialized$2(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct$2() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$2 = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf$2(o) {
  _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf$2(o);
}
function _inherits$2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf$2(subClass, superClass);
}
function _setPrototypeOf$2(o, p) {
  _setPrototypeOf$2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf$2(o, p);
}
function _defineProperty$2(obj, key, value) {
  key = _toPropertyKey$2(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$2(t) {
  var i = _toPrimitive$2(t, "string");
  return "symbol" == _typeof$2(i) ? i : i + "";
}
function _toPrimitive$2(t, r) {
  if ("object" != _typeof$2(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof$2(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var CartesianAxis = /* @__PURE__ */ function(_Component) {
  function CartesianAxis2(props) {
    var _this;
    _classCallCheck$2(this, CartesianAxis2);
    _this = _callSuper$2(this, CartesianAxis2, [props]);
    _this.state = {
      fontSize: "",
      letterSpacing: ""
    };
    return _this;
  }
  _inherits$2(CartesianAxis2, _Component);
  return _createClass$2(CartesianAxis2, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(_ref, nextState) {
      var viewBox = _ref.viewBox, restProps = _objectWithoutProperties(_ref, _excluded);
      var _this$props = this.props, viewBoxOld = _this$props.viewBox, restPropsOld = _objectWithoutProperties(_this$props, _excluded2);
      return !shallowEqual(viewBox, viewBoxOld) || !shallowEqual(restProps, restPropsOld) || !shallowEqual(nextState, this.state);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var htmlLayer = this.layerReference;
      if (!htmlLayer) return;
      var tick = htmlLayer.getElementsByClassName("recharts-cartesian-axis-tick-value")[0];
      if (tick) {
        this.setState({
          fontSize: window.getComputedStyle(tick).fontSize,
          letterSpacing: window.getComputedStyle(tick).letterSpacing
        });
      }
    }
    /**
     * Calculate the coordinates of endpoints in ticks
     * @param  {Object} data The data of a simple tick
     * @return {Object} (x1, y1): The coordinate of endpoint close to tick text
     *  (x2, y2): The coordinate of endpoint close to axis
     */
  }, {
    key: "getTickLineCoord",
    value: function getTickLineCoord(data) {
      var _this$props2 = this.props, x = _this$props2.x, y = _this$props2.y, width = _this$props2.width, height = _this$props2.height, orientation = _this$props2.orientation, tickSize = _this$props2.tickSize, mirror = _this$props2.mirror, tickMargin = _this$props2.tickMargin;
      var x1, x2, y1, y2, tx, ty;
      var sign = mirror ? -1 : 1;
      var finalTickSize = data.tickSize || tickSize;
      var tickCoord = isNumber(data.tickCoord) ? data.tickCoord : data.coordinate;
      switch (orientation) {
        case "top":
          x1 = x2 = data.coordinate;
          y2 = y + +!mirror * height;
          y1 = y2 - sign * finalTickSize;
          ty = y1 - sign * tickMargin;
          tx = tickCoord;
          break;
        case "left":
          y1 = y2 = data.coordinate;
          x2 = x + +!mirror * width;
          x1 = x2 - sign * finalTickSize;
          tx = x1 - sign * tickMargin;
          ty = tickCoord;
          break;
        case "right":
          y1 = y2 = data.coordinate;
          x2 = x + +mirror * width;
          x1 = x2 + sign * finalTickSize;
          tx = x1 + sign * tickMargin;
          ty = tickCoord;
          break;
        default:
          x1 = x2 = data.coordinate;
          y2 = y + +mirror * height;
          y1 = y2 + sign * finalTickSize;
          ty = y1 + sign * tickMargin;
          tx = tickCoord;
          break;
      }
      return {
        line: {
          x1,
          y1,
          x2,
          y2
        },
        tick: {
          x: tx,
          y: ty
        }
      };
    }
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor() {
      var _this$props3 = this.props, orientation = _this$props3.orientation, mirror = _this$props3.mirror;
      var textAnchor;
      switch (orientation) {
        case "left":
          textAnchor = mirror ? "start" : "end";
          break;
        case "right":
          textAnchor = mirror ? "end" : "start";
          break;
        default:
          textAnchor = "middle";
          break;
      }
      return textAnchor;
    }
  }, {
    key: "getTickVerticalAnchor",
    value: function getTickVerticalAnchor() {
      var _this$props4 = this.props, orientation = _this$props4.orientation, mirror = _this$props4.mirror;
      var verticalAnchor = "end";
      switch (orientation) {
        case "left":
        case "right":
          verticalAnchor = "middle";
          break;
        case "top":
          verticalAnchor = mirror ? "start" : "end";
          break;
        default:
          verticalAnchor = mirror ? "end" : "start";
          break;
      }
      return verticalAnchor;
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props5 = this.props, x = _this$props5.x, y = _this$props5.y, width = _this$props5.width, height = _this$props5.height, orientation = _this$props5.orientation, mirror = _this$props5.mirror, axisLine = _this$props5.axisLine;
      var props = _objectSpread(_objectSpread(_objectSpread({}, filterProps(this.props, false)), filterProps(axisLine, false)), {}, {
        fill: "none"
      });
      if (orientation === "top" || orientation === "bottom") {
        var needHeight = +(orientation === "top" && !mirror || orientation === "bottom" && mirror);
        props = _objectSpread(_objectSpread({}, props), {}, {
          x1: x,
          y1: y + needHeight * height,
          x2: x + width,
          y2: y + needHeight * height
        });
      } else {
        var needWidth = +(orientation === "left" && !mirror || orientation === "right" && mirror);
        props = _objectSpread(_objectSpread({}, props), {}, {
          x1: x + needWidth * width,
          y1: y,
          x2: x + needWidth * width,
          y2: y + height
        });
      }
      return /* @__PURE__ */ React.createElement("line", _extends$2({}, props, {
        className: clsx("recharts-cartesian-axis-line", get(axisLine, "className"))
      }));
    }
  }, {
    key: "renderTicks",
    value: (
      /**
       * render the ticks
       * @param {Array} ticks The ticks to actually render (overrides what was passed in props)
       * @param {string} fontSize Fontsize to consider for tick spacing
       * @param {string} letterSpacing Letterspacing to consider for tick spacing
       * @return {ReactComponent} renderedTicks
       */
      function renderTicks(ticks, fontSize, letterSpacing) {
        var _this2 = this;
        var _this$props6 = this.props, tickLine = _this$props6.tickLine, stroke = _this$props6.stroke, tick = _this$props6.tick, tickFormatter = _this$props6.tickFormatter, unit = _this$props6.unit;
        var finalTicks = getTicks(_objectSpread(_objectSpread({}, this.props), {}, {
          ticks
        }), fontSize, letterSpacing);
        var textAnchor = this.getTickTextAnchor();
        var verticalAnchor = this.getTickVerticalAnchor();
        var axisProps = filterProps(this.props, false);
        var customTickProps = filterProps(tick, false);
        var tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
          fill: "none"
        }, filterProps(tickLine, false));
        var items = finalTicks.map(function(entry, i) {
          var _this2$getTickLineCoo = _this2.getTickLineCoord(entry), lineCoord = _this2$getTickLineCoo.line, tickCoord = _this2$getTickLineCoo.tick;
          var tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
            textAnchor,
            verticalAnchor
          }, axisProps), {}, {
            stroke: "none",
            fill: stroke
          }, customTickProps), tickCoord), {}, {
            index: i,
            payload: entry,
            visibleTicksCount: finalTicks.length,
            tickFormatter
          });
          return /* @__PURE__ */ React.createElement(Layer, _extends$2({
            className: "recharts-cartesian-axis-tick",
            key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
          }, adaptEventsOfChild(_this2.props, entry, i)), tickLine && /* @__PURE__ */ React.createElement("line", _extends$2({}, tickLineProps, lineCoord, {
            className: clsx("recharts-cartesian-axis-tick-line", get(tickLine, "className"))
          })), tick && CartesianAxis2.renderTickItem(tick, tickProps, "".concat(isFunction(tickFormatter) ? tickFormatter(entry.value, i) : entry.value).concat(unit || "")));
        });
        return /* @__PURE__ */ React.createElement("g", {
          className: "recharts-cartesian-axis-ticks"
        }, items);
      }
    )
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;
      var _this$props7 = this.props, axisLine = _this$props7.axisLine, width = _this$props7.width, height = _this$props7.height, ticksGenerator = _this$props7.ticksGenerator, className = _this$props7.className, hide = _this$props7.hide;
      if (hide) {
        return null;
      }
      var _this$props8 = this.props, ticks = _this$props8.ticks, noTicksProps = _objectWithoutProperties(_this$props8, _excluded3);
      var finalTicks = ticks;
      if (isFunction(ticksGenerator)) {
        finalTicks = ticks && ticks.length > 0 ? ticksGenerator(this.props) : ticksGenerator(noTicksProps);
      }
      if (width <= 0 || height <= 0 || !finalTicks || !finalTicks.length) {
        return null;
      }
      return /* @__PURE__ */ React.createElement(Layer, {
        className: clsx("recharts-cartesian-axis", className),
        ref: function ref(_ref2) {
          _this3.layerReference = _ref2;
        }
      }, axisLine && this.renderAxisLine(), this.renderTicks(finalTicks, this.state.fontSize, this.state.letterSpacing), Label.renderCallByParent(this.props));
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      var combinedClassName = clsx(props.className, "recharts-cartesian-axis-tick-value");
      if (/* @__PURE__ */ React.isValidElement(option)) {
        tickItem = /* @__PURE__ */ React.cloneElement(option, _objectSpread(_objectSpread({}, props), {}, {
          className: combinedClassName
        }));
      } else if (isFunction(option)) {
        tickItem = option(_objectSpread(_objectSpread({}, props), {}, {
          className: combinedClassName
        }));
      } else {
        tickItem = /* @__PURE__ */ React.createElement(Text, _extends$2({}, props, {
          className: "recharts-cartesian-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(reactExports.Component);
_defineProperty$2(CartesianAxis, "displayName", "CartesianAxis");
_defineProperty$2(CartesianAxis, "defaultProps", {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  // The orientation of axis
  orientation: "bottom",
  // The ticks
  ticks: [],
  stroke: "#666",
  tickLine: true,
  axisLine: true,
  tick: true,
  mirror: false,
  minTickGap: 5,
  // The width or height of tick
  tickSize: 6,
  tickMargin: 2,
  interval: "preserveEnd"
});
function _typeof$1(o) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$1(o);
}
function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor);
  }
}
function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper$1(t, o, e) {
  return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn$1(self, call) {
  if (call && (_typeof$1(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized$1(self);
}
function _assertThisInitialized$1(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct$1() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf$1(o) {
  _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf$1(o);
}
function _inherits$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf$1(subClass, superClass);
}
function _setPrototypeOf$1(o, p) {
  _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf$1(o, p);
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$1(t) {
  var i = _toPrimitive$1(t, "string");
  return "symbol" == _typeof$1(i) ? i : i + "";
}
function _toPrimitive$1(t, r) {
  if ("object" != _typeof$1(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof$1(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
function XAxisImpl(_ref) {
  var xAxisId = _ref.xAxisId;
  var width = useChartWidth();
  var height = useChartHeight();
  var axisOptions = useXAxisOrThrow(xAxisId);
  if (axisOptions == null) {
    return null;
  }
  return (
    // @ts-expect-error the axisOptions type is not exactly what CartesianAxis is expecting.
    /* @__PURE__ */ reactExports.createElement(CartesianAxis, _extends$1({}, axisOptions, {
      className: clsx("recharts-".concat(axisOptions.axisType, " ").concat(axisOptions.axisType), axisOptions.className),
      viewBox: {
        x: 0,
        y: 0,
        width,
        height
      },
      ticksGenerator: function ticksGenerator(axis) {
        return getTicksOfAxis(axis, true);
      }
    }))
  );
}
var XAxis = /* @__PURE__ */ function(_React$Component) {
  function XAxis2() {
    _classCallCheck$1(this, XAxis2);
    return _callSuper$1(this, XAxis2, arguments);
  }
  _inherits$1(XAxis2, _React$Component);
  return _createClass$1(XAxis2, [{
    key: "render",
    value: function render() {
      return /* @__PURE__ */ reactExports.createElement(XAxisImpl, this.props);
    }
  }]);
}(reactExports.Component);
_defineProperty$1(XAxis, "displayName", "XAxis");
_defineProperty$1(XAxis, "defaultProps", {
  allowDecimals: true,
  hide: false,
  orientation: "bottom",
  width: 0,
  height: 30,
  mirror: false,
  xAxisId: 0,
  tickCount: 5,
  type: "category",
  padding: {
    left: 0,
    right: 0
  },
  allowDataOverflow: false,
  scale: "auto",
  reversed: false,
  allowDuplicatedCategory: true
});
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var YAxisImpl = function YAxisImpl2(_ref) {
  var yAxisId = _ref.yAxisId;
  var width = useChartWidth();
  var height = useChartHeight();
  var axisOptions = useYAxisOrThrow(yAxisId);
  if (axisOptions == null) {
    return null;
  }
  return (
    // @ts-expect-error the axisOptions type is not exactly what CartesianAxis is expecting.
    /* @__PURE__ */ reactExports.createElement(CartesianAxis, _extends({}, axisOptions, {
      className: clsx("recharts-".concat(axisOptions.axisType, " ").concat(axisOptions.axisType), axisOptions.className),
      viewBox: {
        x: 0,
        y: 0,
        width,
        height
      },
      ticksGenerator: function ticksGenerator(axis) {
        return getTicksOfAxis(axis, true);
      }
    }))
  );
};
var YAxis = /* @__PURE__ */ function(_React$Component) {
  function YAxis2() {
    _classCallCheck(this, YAxis2);
    return _callSuper(this, YAxis2, arguments);
  }
  _inherits(YAxis2, _React$Component);
  return _createClass(YAxis2, [{
    key: "render",
    value: function render() {
      return /* @__PURE__ */ reactExports.createElement(YAxisImpl, this.props);
    }
  }]);
}(reactExports.Component);
_defineProperty(YAxis, "displayName", "YAxis");
_defineProperty(YAxis, "defaultProps", {
  allowDuplicatedCategory: true,
  allowDecimals: true,
  hide: false,
  orientation: "left",
  width: 60,
  height: 0,
  mirror: false,
  yAxisId: 0,
  tickCount: 5,
  type: "number",
  padding: {
    top: 0,
    bottom: 0
  },
  allowDataOverflow: false,
  scale: "auto",
  reversed: false
});
var BarChart = generateCategoricalChart({
  chartName: "BarChart",
  GraphicalChild: Bar,
  defaultTooltipEventType: "axis",
  validateTooltipEventTypes: ["axis", "item"],
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }],
  formatAxisMap
});
const CHART_COLORS = [
  "hsl(43, 74%, 49%)",
  "hsl(43, 80%, 65%)",
  "hsl(43, 70%, 35%)",
  "hsl(240, 5%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)",
  "hsl(280, 50%, 55%)"
];
const CO2_PER_CATEGORY = {
  tops: 5.5,
  bottoms: 8,
  outerwear: 12,
  shoes: 10,
  accessories: 2,
  dresses: 7,
  activewear: 6,
  formal: 9,
  other: 5
};
const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = reactExports.useState([]);
  const [wearLogs, setWearLogs] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [gapAnalysis, setGapAnalysis] = reactExports.useState(null);
  const [gapLoading, setGapLoading] = reactExports.useState(false);
  const [styleProfile, setStyleProfile] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("clothing_items").select("*").eq("user_id", user.id),
      supabase.from("wear_logs").select("*, clothing_items(name, category, price)").eq("user_id", user.id).order("worn_at", { ascending: false }),
      supabase.from("style_profiles").select("*").eq("user_id", user.id).single()
    ]).then(([itemsRes, logsRes, styleRes]) => {
      if (itemsRes.data) setItems(itemsRes.data);
      if (logsRes.data) setWearLogs(logsRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data);
      setLoading(false);
    });
  }, [user]);
  const runGapAnalysis = async () => {
    if (!user) return;
    setGapLoading(true);
    try {
      const resp = await fetch(`${"https://uakkwvdjoqsceewhsfjb.supabase.co"}/functions/v1/wardrobe-gap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2t3dmRqb3FzY2Vld2hzZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjE2ODEsImV4cCI6MjA4NzIzNzY4MX0.2bqKl0gFyNESBduLwg6GNYbFIMwF5XjDw_9xlWd1Nfo"}`
        },
        body: JSON.stringify({ closetItems: items, styleProfile })
      });
      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Rate limited. Try again in a moment.");
          return;
        }
        if (resp.status === 402) {
          toast.error("AI credits exhausted.");
          return;
        }
        throw new Error("Analysis failed");
      }
      const result = await resp.json();
      if (result.gaps) {
        const seen = /* @__PURE__ */ new Set();
        result.gaps = result.gaps.filter((gap) => {
          const key = gap.item.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      setGapAnalysis(result);
      toast.success("Gap analysis complete!");
    } catch {
      toast.error("Failed to run analysis");
    } finally {
      setGapLoading(false);
    }
  };
  const categoryData = items.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.category);
    if (existing) existing.value++;
    else acc.push({ name: item.category, value: 1 });
    return acc;
  }, []);
  const wearCounts = wearLogs.reduce((acc, log) => {
    var _a;
    const name = ((_a = log.clothing_items) == null ? void 0 : _a.name) || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const mostWorn = Object.entries(wearCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  const costPerWear = items.filter((i) => i.price).map((item) => {
    const wears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
    const price = Number(item.price) || 0;
    return { name: item.name || "Unnamed", cpw: wears > 0 ? Math.round(price / wears * 100) / 100 : price, wears, price: item.price };
  }).sort((a, b) => a.cpw - b.cpw).slice(0, 8);
  const underused = items.filter((item) => {
    const wears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
    return wears <= 1;
  });
  const totalItems = items.length;
  const totalWears = wearLogs.length;
  const avgWears = totalItems > 0 ? totalWears / totalItems : 0;
  const sustainabilityScore = Math.min(100, Math.round(avgWears * 15 + (totalItems > 0 ? 20 : 0)));
  const totalValue = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalCO2 = items.reduce((sum, item) => {
    var _a;
    const cat = ((_a = item.category) == null ? void 0 : _a.toLowerCase()) || "other";
    return sum + (CO2_PER_CATEGORY[cat] || CO2_PER_CATEGORY.other);
  }, 0);
  const co2PerWear = totalWears > 0 ? Math.round(totalCO2 / totalWears * 100) / 100 : totalCO2;
  const now = /* @__PURE__ */ new Date();
  const donationCandidates = items.filter((item) => {
    const itemLogs = wearLogs.filter((l) => l.clothing_item_id === item.id);
    if (itemLogs.length === 0) {
      const ownedDays = differenceInDays(now, parseISO(item.created_at));
      return ownedDays > 30;
    }
    const lastWorn = itemLogs.sort((a, b) => new Date(b.worn_at).getTime() - new Date(a.worn_at).getTime())[0];
    return differenceInDays(now, parseISO(lastWorn.worn_at)) > 90;
  });
  const co2ByCategory = Object.entries(
    items.reduce((acc, item) => {
      const cat = item.category || "other";
      acc[cat] = (acc[cat] || 0) + (CO2_PER_CATEGORY[cat.toLowerCase()] || CO2_PER_CATEGORY.other);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(Number(value) * 10) / 10 })).sort((a, b) => b.value - a.value);
  const usedItems = items.filter((item) => wearLogs.some((l) => l.clothing_item_id === item.id));
  const utilizationRate = totalItems > 0 ? Math.round(usedItems.length / totalItems * 100) : 0;
  const statCards = [
    { label: "Total Items", value: totalItems, icon: ChartColumn, color: "text-primary" },
    { label: "Total Wears Logged", value: totalWears, icon: Calendar, color: "text-gold-light" },
    { label: "Closet Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Sustainability", value: `${sustainabilityScore}/100`, icon: Leaf, color: sustainabilityScore > 50 ? "text-green-500" : "text-gold-light" }
  ];
  const priorityColors = {
    high: "text-destructive bg-destructive/10",
    medium: "text-primary bg-primary/10",
    low: "text-muted-foreground bg-secondary"
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-6 w-6 text-primary" }),
        " Wardrobe Analytics"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mt-1 mb-4", children: "Insights into your wardrobe usage" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit overflow-x-auto", children: [
      { key: "overview", label: "📊 Overview" },
      { key: "gaps", label: "🔍 Gaps" },
      { key: "history", label: "📅 History" },
      { key: "sustainability", label: "🌱 Sustainability" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.key),
        className: `px-4 py-2 rounded-lg text-xs font-sans transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`,
        children: tab.label
      },
      tab.key
    )) }),
    activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: statCards.map((stat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 }, className: "glass rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(stat.icon, { className: `h-5 w-5 ${stat.color} mb-3` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-bold text-foreground", children: stat.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs mt-1", children: stat.label })
      ] }, stat.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "glass rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-4", children: "Category Distribution" }),
          categoryData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: categoryData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, dataKey: "value", label: ({ name, value }) => `${name} (${value})`, children: categoryData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" } })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm text-center py-10", children: "No items yet" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "glass rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-4", children: "Most Worn Items" }),
          mostWorn.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mostWorn, layout: "vertical", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", stroke: "hsl(240, 5%, 55%)", fontSize: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 100, stroke: "hsl(240, 5%, 55%)", fontSize: 11, tick: { fill: "hsl(40, 20%, 90%)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "hsl(43, 74%, 49%)", radius: [0, 4, 4, 0] })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm text-center py-10", children: "Log some wears to see data" })
        ] })
      ] }),
      costPerWear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "glass rounded-2xl p-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-primary" }),
          " Cost Per Wear"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: costPerWear.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-secondary/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-foreground", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground", children: [
              "$",
              item.price,
              " · ",
              item.wears,
              " wear",
              item.wears !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-display text-lg font-bold ${item.cpw < 10 ? "text-green-500" : item.cpw < 30 ? "text-primary" : "text-destructive"}`, children: [
            "$",
            item.cpw
          ] })
        ] }, item.name)) })
      ] }),
      underused.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-gold-light" }),
          " Underused Items"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mb-4", children: "These items have been worn once or never." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          underused.slice(0, 12).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1.5 rounded-full text-xs font-sans bg-secondary text-muted-foreground", children: [
            item.name || "Unnamed",
            " (",
            item.category,
            ")"
          ] }, item.id)),
          underused.length > 12 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1.5 rounded-full text-xs font-sans bg-primary/10 text-primary", children: [
            "+",
            underused.length - 12,
            " more"
          ] })
        ] })
      ] })
    ] }),
    activeTab === "gaps" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: !gapAnalysis ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-12 h-12 text-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold text-foreground mb-2", children: "AI Wardrobe Gap Analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mb-6 max-w-md mx-auto", children: "Let AI analyze your closet to find missing essentials, seasonal gaps, and pieces that would elevate your wardrobe." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runGapAnalysis, disabled: gapLoading, className: "gap-2", children: [
        gapLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
        gapLoading ? "Analyzing..." : "Run AI Analysis"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6 flex items-center gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-2xl font-bold text-primary", children: [
          gapAnalysis.overallScore,
          "%"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Wardrobe Completeness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mt-1", children: gapAnalysis.summary })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: gapAnalysis.gaps.map((gap, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.05 },
          className: "glass rounded-xl p-4 flex items-center gap-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-2 py-1 rounded-full text-[10px] font-sans font-bold uppercase ${priorityColors[gap.priority]}`, children: gap.priority }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-medium text-foreground", children: gap.item }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-muted-foreground mt-0.5", children: gap.reason }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-[10px] text-muted-foreground mt-1", children: [
                gap.category,
                " · ",
                gap.estimatedPrice
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/inspiration`), className: "gap-1 text-xs flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-3 h-3" }),
              " Shop"
            ] })
          ]
        },
        i
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: runGapAnalysis, disabled: gapLoading, className: "gap-2", children: [
        gapLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
        "Re-analyze"
      ] })
    ] }) }),
    activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: wearLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold text-foreground mb-2", children: "No Wear History Yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: "Log wears from your closet to see your timeline here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-5 top-0 bottom-0 w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: wearLogs.slice(0, 50).map((log, i) => {
        const itemData = log.clothing_items;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: i * 0.03 },
            className: "flex gap-4 pl-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-3 flex-1 -mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-medium text-foreground", children: (itemData == null ? void 0 : itemData.name) || "Unknown Item" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: format(parseISO(log.worn_at), "MMM d, yyyy") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-muted-foreground", children: (itemData == null ? void 0 : itemData.category) || "other" }),
                  log.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: log.notes })
                ] })
              ] })
            ]
          },
          log.id
        );
      }) })
    ] }) }),
    activeTab === "sustainability" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-5 h-5 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold text-foreground", children: "Sustainability Score" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 rounded-xl bg-green-500/5 border border-green-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-3xl font-bold text-green-500", children: sustainabilityScore }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans mt-1", children: "Overall Score" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 rounded-xl bg-secondary border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-3xl font-bold text-foreground", children: totalCO2.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans mt-1", children: "Total kg CO₂" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 rounded-xl bg-secondary border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-3xl font-bold text-foreground", children: co2PerWear }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans mt-1", children: "kg CO₂ / Wear" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 rounded-xl bg-secondary border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-3xl font-bold text-foreground", children: [
              utilizationRate,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans mt-1", children: "Utilization Rate" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-500 font-sans leading-relaxed", children: [
          "💡 ",
          sustainabilityScore >= 70 ? "Great job! You're making the most of your wardrobe. Keep logging wears to track your impact." : sustainabilityScore >= 40 ? "You're on the right track. Try to wear each item at least 30 times to maximize sustainability." : "Start by logging wears for your items. The more you re-wear, the lower your environmental impact per outfit."
        ] }) })
      ] }),
      co2ByCategory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Recycle, { className: "w-5 h-5 text-green-500" }),
          " CO₂ Impact by Category"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: co2ByCategory, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", stroke: "hsl(240, 5%, 55%)", fontSize: 11, tick: { fill: "hsl(40, 20%, 90%)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "hsl(240, 5%, 55%)", fontSize: 11, tick: { fill: "hsl(40, 20%, 90%)" }, unit: " kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              contentStyle: { background: "hsl(240, 8%, 10%)", border: "1px solid hsl(240, 5%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" },
              formatter: (value) => [`${value} kg CO₂`, "Impact"]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "hsl(150, 50%, 45%)", radius: [4, 4, 0, 0] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans mt-2 text-center", children: "Estimates based on industry averages per garment category" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-5 h-5 text-destructive" }),
          " Consider Donating"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs mb-4", children: "Items not worn in 90+ days or never worn since adding to closet" }),
        donationCandidates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PackageOpen, { className: "w-10 h-10 text-muted-foreground/30 mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "All your items are well-loved! 🎉" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          donationCandidates.slice(0, 15).map((item) => {
            const itemWears = wearLogs.filter((l) => l.clothing_item_id === item.id).length;
            const lastLog = wearLogs.find((l) => l.clothing_item_id === item.id);
            const daysSince = lastLog ? differenceInDays(now, parseISO(lastLog.worn_at)) : differenceInDays(now, parseISO(item.created_at));
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-10 h-10 rounded-lg object-cover flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageOpen, { className: "w-4 h-4 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-foreground truncate", children: item.name || "Unnamed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-sans", children: [
                    item.category,
                    " · ",
                    itemWears,
                    " wear",
                    itemWears !== 1 ? "s" : "",
                    " · ",
                    daysSince,
                    "d unused"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                item.price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground font-sans", children: [
                  "$",
                  item.price
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${itemWears === 0 ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"}`, children: itemWears === 0 ? "Never worn" : "Underused" })
              ] })
            ] }, item.id);
          }),
          donationCandidates.length > 15 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary font-sans text-center pt-2", children: [
            "+",
            donationCandidates.length - 15,
            " more items to consider"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-5 h-5 text-green-500" }),
          " Eco Tips"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          { tip: "Aim for 30+ wears per item to offset production CO₂", icon: "🔄" },
          { tip: "Donate or resell items you haven't worn in 3+ months", icon: "💚" },
          { tip: "Choose natural fabrics — cotton, linen, and wool biodegrade", icon: "🌿" },
          { tip: "Repair before replacing — extend the life of your favorites", icon: "🧵" }
        ].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: t.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground font-sans", children: t.tip })
        ] }, i)) })
      ] })
    ] })
  ] }) });
};
export {
  Analytics as default
};
