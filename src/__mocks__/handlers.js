"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
var msw_1 = require("msw");
var events_json_1 = require("../__mocks__/response/events.json");
exports.handlers = [
    msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: events_json_1.events });
    }),
    msw_1.http.post('/api/events', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newEvent;
        var request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, request.json()];
                case 1:
                    newEvent = (_c.sent());
                    newEvent.id = String(events_json_1.events.length + 1);
                    return [2 /*return*/, msw_1.HttpResponse.json(newEvent, { status: 201 })];
            }
        });
    }); }),
    msw_1.http.put('/api/events/:id', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, updatedEvent, index;
        var params = _b.params, request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    id = params.id;
                    return [4 /*yield*/, request.json()];
                case 1:
                    updatedEvent = (_c.sent());
                    index = events_json_1.events.findIndex(function (event) { return event.id === id; });
                    if (index !== -1) {
                        return [2 /*return*/, msw_1.HttpResponse.json(__assign(__assign({}, events_json_1.events[index]), updatedEvent))];
                    }
                    return [2 /*return*/, new msw_1.HttpResponse(null, { status: 404 })];
            }
        });
    }); }),
    msw_1.http.delete('/api/events/:id', function (_a) {
        var params = _a.params;
        var id = params.id;
        var index = events_json_1.events.findIndex(function (event) { return event.id === id; });
        if (index !== -1) {
            return new msw_1.HttpResponse(null, { status: 204 });
        }
        return new msw_1.HttpResponse(null, { status: 404 });
    }),
];
