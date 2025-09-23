(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/src/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Authentication utilities for JWT token management and permission verification
__turbopack_context__.s([
    "AuthManager",
    ()=>AuthManager,
    "PermissionManager",
    ()=>PermissionManager,
    "ROLE_PERMISSIONS",
    ()=>ROLE_PERMISSIONS,
    "requireAuth",
    ()=>requireAuth,
    "requirePermission",
    ()=>requirePermission,
    "requireRole",
    ()=>requireRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
;
// API base URL used for frontend-to-backend requests.
// Prefer reading from environment variable NEXT_PUBLIC_API_BASE_URL so you can easily switch between dev/staging/prod.
// Fallback to Spring Boot's common default port (8080) when not provided.
//设置默认请求地址为localhost:8080/api
const API_BASE_URL = typeof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' && __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL ? "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL, "/api") : 'http://localhost:8080/api';
const ROLE_PERMISSIONS = {
    admin: [
        'user:read',
        'user:write',
        'user:delete',
        'device:read',
        'device:write',
        'device:delete',
        'project:read',
        'project:write',
        'project:delete',
        'service:read',
        'service:write',
        'service:delete',
        'monitoring:read',
        'monitoring:write',
        'alert:read',
        'alert:write',
        'alert:delete',
        'system:read',
        'system:write'
    ],
    operator: [
        'user:read',
        'device:read',
        'device:write',
        'project:read',
        'project:write',
        'service:read',
        'service:write',
        'monitoring:read',
        'alert:read',
        'alert:write'
    ],
    viewer: [
        'user:read',
        'device:read',
        'project:read',
        'service:read',
        'monitoring:read',
        'alert:read'
    ]
};
class AuthManager {
    // Get stored token
    static getToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem(this.TOKEN_KEY);
    }
    // Set token
    static setToken(token) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem(this.TOKEN_KEY, token);
    }
    // Remove token
    static removeToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    // Get stored user
    static getUser() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            // Add permissions based on role
            user.permissions = ROLE_PERMISSIONS[user.role] || [];
            return user;
        } catch (e) {
            return null;
        }
    }
    // Set user
    static setUser(user) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    // Check if token is expired
    /**
   * Check if a JWT token is expired.
   * This version is defensive: if the token is not a valid JWT (e.g., a mock token without three parts),
   * it will assume the token is NOT expired to avoid accidental logout in demo mode.
   *
   * Why: Our backend's mock /signin returns "mock-jwt-token" for testing, which is not a real JWT,
   * and the previous implementation would treat it as expired immediately.
   */ static isTokenExpired(token) {
        try {
            const parts = token.split('.');
            // If token is not in JWT format (header.payload.signature), treat it as not expired
            if (parts.length !== 3) {
                return false;
            }
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;
            // If payload.exp exists and is a number, compare with current time; otherwise assume not expired
            return typeof payload.exp === 'number' ? payload.exp < currentTime : false;
        } catch (e) {
            // On any parsing error, assume not expired to keep user logged in
            return false;
        }
    }
    // Check if user is authenticated
    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        if (this.isTokenExpired(token)) {
            this.removeToken();
            return false;
        }
        return true;
    }
    // Get current auth state
    static getAuthState() {
        const token = this.getToken();
        const user = this.getUser();
        const isAuthenticated = this.isAuthenticated();
        return {
            isAuthenticated,
            user: isAuthenticated ? user : null,
            token: isAuthenticated ? token : null
        };
    }
    // Login
    /**
   * Perform login by calling backend API and storing JWT + user info locally.
   *
   * Flow:
   * 1) Try POST `${API_BASE_URL}/auth/signin` with { username, password }.
   *    - Expected response (JwtResponseDto): { token, type, id, username, email, roles }
   *    - Save token to localStorage; map backend roles (e.g., ROLE_ADMIN/ROLE_OPERATOR/ROLE_USER)
   *      to our app roles ('admin' | 'operator' | 'viewer') and assign permissions.
   * 2) If /auth/signin fails (e.g., backend not ready), fall back to POST `${API_BASE_URL}/auth/login`.
   *    - This endpoint returns a simple success flag. We'll store a mock token and basic user info so
   *      the rest of the app can run for demo/testing.
   *
   * Returns: { success, message, user? }
   */ static async login(username, password) {
        try {
            // Attempt real signin endpoint first
            //使用axios发送POST请求 
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(API_BASE_URL, "/auth/signin"), {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = res.data || {};
            const token = data.token;
            // 2.1) 如果后端没有返回 token，视为失败并给出清晰的提示（这在联调早期很常见）
            if (!token) {
                return {
                    success: false,
                    message: 'Login failed: token is missing in server response.'
                };
            }
            // 2.2) 角色数组（如 ["ROLE_USER", "ROLE_ADMIN"]），用于前端权限映射
            const roles = Array.isArray(data.roles) ? data.roles : [];
            // Map backend roles to frontend roles used in our app
            const mappedRole = roles.includes('ROLE_ADMIN') ? 'admin' : roles.includes('ROLE_OPERATOR') ? 'operator' : 'viewer';
            var _data_id, _data_username, _data_username1, _data_email;
            const user = {
                id: String((_data_id = data.id) !== null && _data_id !== void 0 ? _data_id : '1'),
                username: (_data_username = data.username) !== null && _data_username !== void 0 ? _data_username : username,
                name: (_data_username1 = data.username) !== null && _data_username1 !== void 0 ? _data_username1 : username,
                email: (_data_email = data.email) !== null && _data_email !== void 0 ? _data_email : "".concat(username, "@example.com"),
                role: mappedRole,
                permissions: ROLE_PERMISSIONS[mappedRole]
            };
            // Persist token and user
            this.setToken(token);
            this.setUser(user);
            return {
                success: true,
                message: 'Login successful',
                user
            };
        } catch (error) {
            // 捕获失败并尽可能提取后端返回的详细错误信息
            // error.response：后端有响应（例如 400/401/500 等）
            // error.request：请求发出但未收到响应（网络/跨域/后端未启动）
            // error.message：Axios/JS 层面的错误消息
            let detailedMessage = 'Login failed. Please check your credentials or server status.';
            if (error === null || error === void 0 ? void 0 : error.response) {
                const status = error.response.status;
                const data = error.response.data;
                // 尝试从后端响应体中提取错误信息字段
                const serverMsg = typeof data === 'string' ? data : (data === null || data === void 0 ? void 0 : data.message) || (data === null || data === void 0 ? void 0 : data.error) || (data === null || data === void 0 ? void 0 : data.detail) || '';
                if (status === 401) {
                    detailedMessage = serverMsg || 'Invalid username or password.';
                } else if (status === 400) {
                    detailedMessage = serverMsg || 'Bad request. Please verify the input format.';
                } else if (status >= 500) {
                    detailedMessage = serverMsg || 'Server error. Please try again later.';
                } else {
                    detailedMessage = serverMsg || "Request failed with status ".concat(status, ".");
                }
            } else if (error === null || error === void 0 ? void 0 : error.request) {
                // 请求已发出但没有收到响应（大多是网络问题或后端未启动/地址不对）
                detailedMessage = 'Unable to reach the server. Please confirm the backend is running and NEXT_PUBLIC_API_BASE_URL is correct.';
            } else if (error === null || error === void 0 ? void 0 : error.message) {
                // 其他 Axios/JS 层面错误
                detailedMessage = error.message;
            }
            return {
                success: false,
                message: detailedMessage
            };
        }
    }
    /**
   * Register a new user by calling the backend signup API.
   *
   * What it does:
   * - Sends a POST request to `${API_BASE_URL}/auth/signup` with { username, email, password }.
   * - Expects the backend to return a `UserResponseDto` (id, username, email, roles, ...).
   * - Maps backend roles (e.g., ROLE_ADMIN/ROLE_OPERATOR/ROLE_USER) to our app roles
   *   ('admin' | 'operator' | 'viewer'), and prepares a `User` object for UI feedback.
   * - Does NOT log the user in automatically; the caller should redirect to the login page.
   *
   * Error handling:
   * - Provides detailed error messages based on HTTP status codes and server response body.
   * - Common cases: 400 (validation), 409 (conflict), 500 (server errors).
   *
   * Returns: { success, message, user? }
   */ static async register(payload) {
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(API_BASE_URL, "/auth/signup"), payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = res.data || {};
            const rolesFromServer = Array.isArray(data.roles) ? data.roles : [];
            const mappedRole = rolesFromServer.includes('ROLE_ADMIN') ? 'admin' : rolesFromServer.includes('ROLE_OPERATOR') ? 'operator' : 'viewer';
            var _data_id, _data_username, _data_username1, _data_email;
            const user = {
                id: String((_data_id = data.id) !== null && _data_id !== void 0 ? _data_id : ''),
                username: (_data_username = data.username) !== null && _data_username !== void 0 ? _data_username : payload.username,
                name: (_data_username1 = data.username) !== null && _data_username1 !== void 0 ? _data_username1 : payload.username,
                email: (_data_email = data.email) !== null && _data_email !== void 0 ? _data_email : payload.email,
                role: mappedRole,
                permissions: ROLE_PERMISSIONS[mappedRole]
            };
            // 这里不进行自动登录，也不保存 token；注册后通常需要用户主动登录
            return {
                success: true,
                message: 'Registration successful! Please sign in.',
                user
            };
        } catch (error) {
            let detailedMessage = 'Registration failed. Please try again later.';
            if (error === null || error === void 0 ? void 0 : error.response) {
                const status = error.response.status;
                const data = error.response.data;
                const serverMsg = typeof data === 'string' ? data : (data === null || data === void 0 ? void 0 : data.message) || (data === null || data === void 0 ? void 0 : data.error) || (data === null || data === void 0 ? void 0 : data.detail) || '';
                if (status === 400) {
                    detailedMessage = serverMsg || 'Invalid input. Please check your username, email, and password.';
                // } else if (status === 409) {
                //   detailedMessage = serverMsg || 'User already exists. Try a different username or email.';
                // } else if (status >= 500) {
                //   detailedMessage = serverMsg || 'Server error. Please try again later.';
                // } 
                } else {
                    detailedMessage = serverMsg || "Request failed with status ".concat(status, ".");
                }
            } else if (error === null || error === void 0 ? void 0 : error.request) {
                detailedMessage = 'Unable to reach the server. Please ensure the backend is running on the correct URL.';
            } else if (error === null || error === void 0 ? void 0 : error.message) {
                detailedMessage = error.message;
            }
            return {
                success: false,
                message: detailedMessage
            };
        }
    }
    // Logout
    static logout() {
        this.removeToken();
        // Redirect to login page
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = '/auth/login';
        }
    }
    // Generate mock JWT token
    static generateMockToken(role) {
        const header = btoa(JSON.stringify({
            alg: 'HS256',
            typ: 'JWT'
        }));
        const payload = btoa(JSON.stringify({
            sub: role === 'admin' ? '1' : '2',
            name: role === 'admin' ? 'Administrator' : 'System Operator',
            role: role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
        }));
        const signature = btoa('mock-signature');
        return "".concat(header, ".").concat(payload, ".").concat(signature);
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(AuthManager, "TOKEN_KEY", 'auth_token');
(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(AuthManager, "USER_KEY", 'auth_user');
(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(AuthManager, "REFRESH_TOKEN_KEY", 'refresh_token');
class PermissionManager {
    // Check if user has specific permission
    static hasPermission(permission, user) {
        if (!user) {
            const currentUser = AuthManager.getUser();
            if (!currentUser) return false;
            user = currentUser;
        }
        return user.permissions.includes(permission);
    }
    // Check if user has any of the specified permissions
    static hasAnyPermission(permissions, user) {
        return permissions.some((permission)=>this.hasPermission(permission, user));
    }
    // Check if user has all specified permissions
    static hasAllPermissions(permissions, user) {
        return permissions.every((permission)=>this.hasPermission(permission, user));
    }
    // Check if user has specific role
    static hasRole(role, user) {
        if (!user) {
            const currentUser = AuthManager.getUser();
            if (!currentUser) return false;
            user = currentUser;
        }
        return user.role === role;
    }
    // Check if user has minimum role level
    static hasMinimumRole(minRole, user) {
        if (!user) {
            const currentUser = AuthManager.getUser();
            if (!currentUser) return false;
            user = currentUser;
        }
        const roleHierarchy = {
            viewer: 1,
            operator: 2,
            admin: 3
        };
        const userLevel = roleHierarchy[user.role];
        const minLevel = roleHierarchy[minRole];
        return userLevel >= minLevel;
    }
}
const requireAuth = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!AuthManager.isAuthenticated()) {
        window.location.href = '/auth/login';
        return false;
    }
    return true;
};
const requirePermission = (permission)=>{
    if (!requireAuth()) return false;
    if (!PermissionManager.hasPermission(permission)) {
        // Redirect to unauthorized page or show error
        console.error("Access denied: Missing permission '".concat(permission, "'"));
        return false;
    }
    return true;
};
const requireRole = (role)=>{
    if (!requireAuth()) return false;
    if (!PermissionManager.hasRole(role)) {
        console.error("Access denied: Required role '".concat(role, "'"));
        return false;
    }
    return true;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/components/Authentication/LoginForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/form/index.js [app-client] (ecmascript) <export default as Form>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$input$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/input/index.js [app-client] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$button$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/button/index.js [app-client] (ecmascript) <locals> <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$message$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__message$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/message/index.js [app-client] (ecmascript) <export default as message>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$checkbox$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/checkbox/index.js [app-client] (ecmascript) <export default as Checkbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$divider$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/divider/index.js [app-client] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$UserOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserOutlined$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/icons/es/icons/UserOutlined.js [app-client] (ecmascript) <export default as UserOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$LockOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOutlined$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/icons/es/icons/LockOutlined.js [app-client] (ecmascript) <export default as LockOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EyeInvisibleOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeInvisibleOutlined$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/icons/es/icons/EyeInvisibleOutlined.js [app-client] (ecmascript) <export default as EyeInvisibleOutlined>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EyeTwoTone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeTwoTone$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/icons/es/icons/EyeTwoTone.js [app-client] (ecmascript) <export default as EyeTwoTone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const LoginForm = (param)=>{
    let { onLogin, loading = false } = param;
    _s();
    const [form] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].useForm();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (values)=>{
        setIsLoading(true);
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthManager"].login(values.username, values.password);
            if (result.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$message$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__message$3e$__["message"].success('Login successful!');
                if (onLogin) {
                    onLogin(values);
                }
                // Redirect to main page
                window.location.href = '/';
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$message$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__message$3e$__["message"].error(result.message);
            }
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$message$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__message$3e$__["message"].error('Login failed. Please try again.');
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"], {
                form: form,
                name: "login",
                onFinish: handleSubmit,
                autoComplete: "off",
                size: "large",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].Item, {
                        name: "username",
                        rules: [
                            {
                                required: true,
                                message: 'Please input your username!'
                            },
                            {
                                min: 3,
                                message: 'Username must be at least 3 characters!'
                            }
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$input$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            prefix: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$UserOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserOutlined$3e$__["UserOutlined"], {}, void 0, false, {
                                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                lineNumber: 66,
                                columnNumber: 23
                            }, void 0),
                            placeholder: "Username"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].Item, {
                        name: "password",
                        rules: [
                            {
                                required: true,
                                message: 'Please input your password!'
                            },
                            {
                                min: 6,
                                message: 'Password must be at least 6 characters!'
                            }
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$input$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"].Password, {
                            prefix: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$LockOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockOutlined$3e$__["LockOutlined"], {}, void 0, false, {
                                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                lineNumber: 79,
                                columnNumber: 23
                            }, void 0),
                            placeholder: "Password",
                            iconRender: (visible)=>visible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EyeTwoTone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeTwoTone$3e$__["EyeTwoTone"], {}, void 0, false, {
                                    fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                    lineNumber: 81,
                                    columnNumber: 51
                                }, void 0) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EyeInvisibleOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeInvisibleOutlined$3e$__["EyeInvisibleOutlined"], {}, void 0, false, {
                                    fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                    lineNumber: 81,
                                    columnNumber: 68
                                }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].Item, {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].Item, {
                                    name: "remember",
                                    valuePropName: "checked",
                                    noStyle: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$checkbox$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                        children: "Remember me"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                        lineNumber: 88,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/auth/forgot-password",
                                    style: {
                                        color: '#1890ff'
                                    },
                                    children: "Forgot password?"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                    lineNumber: 90,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                            lineNumber: 86,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].Item, {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$button$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__Button$3e$__["Button"], {
                            type: "primary",
                            htmlType: "submit",
                            loading: isLoading || loading,
                            style: {
                                width: '100%',
                                height: '40px'
                            },
                            children: "Sign In"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$divider$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                        children: "Or"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: '#666'
                                },
                                children: "Don't have an account? "
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/auth/register",
                                style: {
                                    color: '#1890ff',
                                    fontWeight: 'medium'
                                },
                                children: "Sign up now"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#999'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "Demo Mode: Enter any username and password to login"
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
                lineNumber: 117,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/Authentication/LoginForm.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LoginForm, "dB0Q/qCYFKgwX+vw8DZOWdhXqis=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$form$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Form$3e$__["Form"].useForm
    ];
});
_c = LoginForm;
const __TURBOPACK__default__export__ = LoginForm;
var _c;
__turbopack_context__.k.register(_c, "LoginForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/app/auth/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$card$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/card/index.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$row$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Row$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/row/index.js [app-client] (ecmascript) <export default as Row>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$col$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Col$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/col/index.js [app-client] (ecmascript) <export default as Col>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$Authentication$2f$LoginForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/Authentication/LoginForm.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const LoginPage = ()=>{
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginPage.useEffect": ()=>{
            // Redirect if already authenticated
            if (__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthManager"].isAuthenticated()) {
                router.push('/');
            }
        }
    }["LoginPage.useEffect"], [
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$row$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Row$3e$__["Row"], {
            justify: "center",
            style: {
                width: '100%'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$col$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Col$3e$__["Col"], {
                xs: 20,
                sm: 16,
                md: 12,
                lg: 8,
                xl: 6,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$card$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                    style: {
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        border: 'none'
                    },
                    styles: {
                        body: {
                            padding: '32px'
                        }
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                marginBottom: '30px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        marginBottom: '8px'
                                    },
                                    children: "Host Management System"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: '#6b7280',
                                        fontSize: '16px',
                                        margin: 0
                                    },
                                    children: "Sign in to your account"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                                    lineNumber: 47,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$Authentication$2f$LoginForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                    lineNumber: 30,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/frontend/src/app/auth/login/page.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LoginPage, "vQduR7x+OPXj6PSmJyFnf+hU7bg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LoginPage;
const __TURBOPACK__default__export__ = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_src_625b1813._.js.map