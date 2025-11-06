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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMockHandlerRecurringListUpdate = exports.setupMockHandlerRecurringListDelete = exports.setupMockHandlerListCreation = exports.setupMockHandlerDeletion = exports.setupMockHandlerUpdating = exports.setupMockHandlerCreation = void 0;
var msw_1 = require("msw");
var setupTests_1 = require("../setupTests");
// ! Hard 여기 제공 안함
var setupMockHandlerCreation = function (initEvents) {
    if (initEvents === void 0) { initEvents = []; }
    var mockEvents = __spreadArray([], initEvents, true);
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.post('/api/events', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newEvent;
        var request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, request.json()];
                case 1:
                    newEvent = (_c.sent());
                    newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
                    mockEvents.push(newEvent);
                    return [2 /*return*/, msw_1.HttpResponse.json(newEvent, { status: 201 })];
            }
        });
    }); }));
};
exports.setupMockHandlerCreation = setupMockHandlerCreation;
var setupMockHandlerUpdating = function (initEvents) {
    var mockEvents = initEvents
        ? initEvents
        : [
            {
                id: '1',
                title: '기존 회의',
                date: '2025-10-15',
                startTime: '09:00',
                endTime: '10:00',
                description: '기존 팀 미팅',
                location: '회의실 B',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
            },
            {
                id: '2',
                title: '기존 회의2',
                date: '2025-10-15',
                startTime: '11:00',
                endTime: '12:00',
                description: '기존 팀 미팅 2',
                location: '회의실 C',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
            },
        ];
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.put('/api/events/:id', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, updatedEvent, index;
        var params = _b.params, request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    id = params.id;
                    return [4 /*yield*/, request.json()];
                case 1:
                    updatedEvent = (_c.sent());
                    index = mockEvents.findIndex(function (event) { return event.id === id; });
                    mockEvents[index] = __assign(__assign({}, mockEvents[index]), updatedEvent);
                    return [2 /*return*/, msw_1.HttpResponse.json(mockEvents[index])];
            }
        });
    }); }));
};
exports.setupMockHandlerUpdating = setupMockHandlerUpdating;
var setupMockHandlerDeletion = function () {
    var mockEvents = [
        {
            id: '1',
            title: '삭제할 이벤트',
            date: '2025-10-15',
            startTime: '09:00',
            endTime: '10:00',
            description: '삭제할 이벤트입니다',
            location: '어딘가',
            category: '기타',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
        },
    ];
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.delete('/api/events/:id', function (_a) {
        var params = _a.params;
        var id = params.id;
        var index = mockEvents.findIndex(function (event) { return event.id === id; });
        mockEvents.splice(index, 1);
        return new msw_1.HttpResponse(null, { status: 204 });
    }));
};
exports.setupMockHandlerDeletion = setupMockHandlerDeletion;
var setupMockHandlerListCreation = function (initEvents) {
    if (initEvents === void 0) { initEvents = []; }
    var mockEvents = __spreadArray([], initEvents, true);
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.post('/api/events-list', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var eventsRequest, newEvent;
        var request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, request.json()];
                case 1:
                    eventsRequest = (_c.sent());
                    newEvent = eventsRequest.events.map(function (event, index) { return (__assign(__assign({}, event), { id: String(mockEvents.length + index + 1) })); });
                    mockEvents.push.apply(mockEvents, newEvent);
                    return [2 /*return*/, msw_1.HttpResponse.json(newEvent, { status: 201 })];
            }
        });
    }); }));
};
exports.setupMockHandlerListCreation = setupMockHandlerListCreation;
var setupMockHandlerRecurringListDelete = function (initEvents) {
    if (initEvents === void 0) { initEvents = []; }
    var mockEvents = __spreadArray([], initEvents, true);
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.delete('/api/events/:id', function (_a) {
        var params = _a.params;
        var id = params.id;
        var index = mockEvents.findIndex(function (event) { return event.id === id; });
        mockEvents.splice(index, 1);
        return new msw_1.HttpResponse(null, { status: 204 });
    }), msw_1.http.delete('/api/recurring-events/:repeatId', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var repeatId, remainingEvents;
        var params = _b.params;
        return __generator(this, function (_c) {
            repeatId = params.repeatId;
            remainingEvents = mockEvents.filter(function (event) { return event.repeat.id !== repeatId; });
            mockEvents = remainingEvents;
            return [2 /*return*/, msw_1.HttpResponse.json(remainingEvents, { status: 201 })];
        });
    }); }));
};
exports.setupMockHandlerRecurringListDelete = setupMockHandlerRecurringListDelete;
var setupMockHandlerRecurringListUpdate = function (initEvents) {
    if (initEvents === void 0) { initEvents = []; }
    var mockEvents = __spreadArray([], initEvents, true);
    setupTests_1.server.use(msw_1.http.get('/api/events', function () {
        return msw_1.HttpResponse.json({ events: mockEvents });
    }), msw_1.http.put('/api/events/:id', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, updatedEvent, index;
        var params = _b.params, request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    id = params.id;
                    return [4 /*yield*/, request.json()];
                case 1:
                    updatedEvent = (_c.sent());
                    index = mockEvents.findIndex(function (event) { return event.id === id; });
                    mockEvents[index] = __assign(__assign({}, mockEvents[index]), updatedEvent);
                    return [2 /*return*/, msw_1.HttpResponse.json(mockEvents[index])];
            }
        });
    }); }), msw_1.http.put('/api/recurring-events/:repeatId', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var repeatId, updateData, newEvents;
        var params = _b.params, request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    repeatId = params.repeatId;
                    return [4 /*yield*/, request.json()];
                case 1:
                    updateData = (_c.sent());
                    newEvents = mockEvents.map(function (event) {
                        if (event.repeat.id === repeatId) {
                            return __assign(__assign({}, event), { title: updateData.title || event.title, description: updateData.description || event.description, location: updateData.location || event.location, category: updateData.category || event.category, notificationTime: updateData.notificationTime || event.notificationTime, repeat: updateData.repeat ? __assign(__assign({}, event.repeat), updateData.repeat) : event.repeat });
                        }
                        return event;
                    });
                    mockEvents = newEvents;
                    return [2 /*return*/, msw_1.HttpResponse.json(newEvents, { status: 201 })];
            }
        });
    }); }));
};
exports.setupMockHandlerRecurringListUpdate = setupMockHandlerRecurringListUpdate;
