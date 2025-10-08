(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/node_modules/antd/es/typography/style/mixins.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
.typography-title(@fontSize; @fontWeight; @lineHeight; @headingColor; @headingMarginBottom;) {
 margin-bottom: @headingMarginBottom;
 color: @headingColor;
 font-weight: @fontWeight;
 fontSize: @fontSize;
 line-height: @lineHeight;
}
*/ __turbopack_context__.s([
    "getCopyableStyles",
    ()=>getCopyableStyles,
    "getEditableStyles",
    ()=>getEditableStyles,
    "getEllipsisStyles",
    ()=>getEllipsisStyles,
    "getLinkStyles",
    ()=>getLinkStyles,
    "getResetStyles",
    ()=>getResetStyles,
    "getTitleStyles",
    ()=>getTitleStyles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$colors$2f$es$2f$presets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/colors/es/presets.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$cssinjs$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/cssinjs/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$cssinjs$2f$es$2f$util$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@ant-design/cssinjs/es/util/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/style/index.js [app-client] (ecmascript)");
;
;
;
const getTitleStyle = (fontSize, lineHeight, color, token)=>{
    const { titleMarginBottom, fontWeightStrong } = token;
    return {
        marginBottom: titleMarginBottom,
        color,
        fontWeight: fontWeightStrong,
        fontSize,
        lineHeight
    };
};
const getTitleStyles = (token)=>{
    const headings = [
        1,
        2,
        3,
        4,
        5
    ];
    const styles = {};
    headings.forEach((headingLevel)=>{
        styles["\n      h".concat(headingLevel, "&,\n      div&-h").concat(headingLevel, ",\n      div&-h").concat(headingLevel, " > textarea,\n      h").concat(headingLevel, "\n    ")] = getTitleStyle(token["fontSizeHeading".concat(headingLevel)], token["lineHeightHeading".concat(headingLevel)], token.colorTextHeading, token);
    });
    return styles;
};
const getLinkStyles = (token)=>{
    const { componentCls } = token;
    return {
        'a&, a': Object.assign(Object.assign({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["operationUnit"])(token)), {
            userSelect: 'text',
            ["&[disabled], &".concat(componentCls, "-disabled")]: {
                color: token.colorTextDisabled,
                cursor: 'not-allowed',
                '&:active, &:hover': {
                    color: token.colorTextDisabled
                },
                '&:active': {
                    pointerEvents: 'none'
                }
            }
        })
    };
};
const getResetStyles = (token)=>({
        code: {
            margin: '0 0.2em',
            paddingInline: '0.4em',
            paddingBlock: '0.2em 0.1em',
            fontSize: '85%',
            fontFamily: token.fontFamilyCode,
            background: 'rgba(150, 150, 150, 0.1)',
            border: '1px solid rgba(100, 100, 100, 0.2)',
            borderRadius: 3
        },
        kbd: {
            margin: '0 0.2em',
            paddingInline: '0.4em',
            paddingBlock: '0.15em 0.1em',
            fontSize: '90%',
            fontFamily: token.fontFamilyCode,
            background: 'rgba(150, 150, 150, 0.06)',
            border: '1px solid rgba(100, 100, 100, 0.2)',
            borderBottomWidth: 2,
            borderRadius: 3
        },
        mark: {
            padding: 0,
            // FIXME hardcode in v4
            backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$colors$2f$es$2f$presets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gold"][2]
        },
        'u, ins': {
            textDecoration: 'underline',
            textDecorationSkipInk: 'auto'
        },
        's, del': {
            textDecoration: 'line-through'
        },
        strong: {
            fontWeight: token.fontWeightStrong
        },
        // list
        'ul, ol': {
            marginInline: 0,
            marginBlock: '0 1em',
            padding: 0,
            li: {
                marginInline: '20px 0',
                marginBlock: 0,
                paddingInline: '4px 0',
                paddingBlock: 0
            }
        },
        ul: {
            listStyleType: 'circle',
            ul: {
                listStyleType: 'disc'
            }
        },
        ol: {
            listStyleType: 'decimal'
        },
        // pre & block
        'pre, blockquote': {
            margin: '1em 0'
        },
        pre: {
            padding: '0.4em 0.6em',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            background: 'rgba(150, 150, 150, 0.1)',
            border: '1px solid rgba(100, 100, 100, 0.2)',
            borderRadius: 3,
            fontFamily: token.fontFamilyCode,
            // Compatible for marked
            code: {
                display: 'inline',
                margin: 0,
                padding: 0,
                fontSize: 'inherit',
                fontFamily: 'inherit',
                background: 'transparent',
                border: 0
            }
        },
        blockquote: {
            paddingInline: '0.6em 0',
            paddingBlock: 0,
            borderInlineStart: '4px solid rgba(100, 100, 100, 0.2)',
            opacity: 0.85
        }
    });
const getEditableStyles = (token)=>{
    const { componentCls, paddingSM } = token;
    const inputShift = paddingSM;
    return {
        '&-edit-content': {
            position: 'relative',
            'div&': {
                insetInlineStart: token.calc(token.paddingSM).mul(-1).equal(),
                marginTop: token.calc(inputShift).mul(-1).equal(),
                marginBottom: "calc(1em - ".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$ant$2d$design$2f$cssinjs$2f$es$2f$util$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unit"])(inputShift), ")")
            },
            ["".concat(componentCls, "-edit-content-confirm")]: {
                position: 'absolute',
                insetInlineEnd: token.calc(token.marginXS).add(2).equal(),
                insetBlockEnd: token.marginXS,
                color: token.colorIcon,
                // default style
                fontWeight: 'normal',
                fontSize: token.fontSize,
                fontStyle: 'normal',
                pointerEvents: 'none'
            },
            textarea: {
                margin: '0!important',
                // Fix Editable Textarea flash in Firefox
                MozTransition: 'none',
                height: '1em'
            }
        }
    };
};
const getCopyableStyles = (token)=>({
        ["".concat(token.componentCls, "-copy-success")]: {
            ["\n    &,\n    &:hover,\n    &:focus"]: {
                color: token.colorSuccess
            }
        },
        ["".concat(token.componentCls, "-copy-icon-only")]: {
            marginInlineStart: 0
        }
    });
const getEllipsisStyles = ()=>({
        ["\n  a&-ellipsis,\n  span&-ellipsis\n  "]: {
            display: 'inline-block',
            maxWidth: '100%'
        },
        '&-ellipsis-single-line': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // https://blog.csdn.net/iefreer/article/details/50421025
            'a&, span&': {
                verticalAlign: 'bottom'
            },
            '> code': {
                paddingBlock: 0,
                maxWidth: 'calc(100% - 1.2em)',
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                verticalAlign: 'bottom',
                // https://github.com/ant-design/ant-design/issues/45953
                boxSizing: 'content-box'
            }
        },
        '&-ellipsis-multiple-line': {
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
        }
    });
}),
"[project]/frontend/node_modules/antd/es/typography/style/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prepareComponentToken",
    ()=>prepareComponentToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/style/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$theme$2f$util$2f$genStyleUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/theme/util/genStyleUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/style/mixins.js [app-client] (ecmascript)");
;
;
;
const genTypographyStyle = (token)=>{
    const { componentCls, titleMarginTop } = token;
    return {
        [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
            color: token.colorText,
            wordBreak: 'break-word',
            lineHeight: token.lineHeight,
            ["&".concat(componentCls, "-secondary")]: {
                color: token.colorTextDescription
            },
            ["&".concat(componentCls, "-success")]: {
                color: token.colorSuccessText
            },
            ["&".concat(componentCls, "-warning")]: {
                color: token.colorWarningText
            },
            ["&".concat(componentCls, "-danger")]: {
                color: token.colorErrorText,
                'a&:active, a&:focus': {
                    color: token.colorErrorTextActive
                },
                'a&:hover': {
                    color: token.colorErrorTextHover
                }
            },
            ["&".concat(componentCls, "-disabled")]: {
                color: token.colorTextDisabled,
                cursor: 'not-allowed',
                userSelect: 'none'
            },
            ["\n        div&,\n        p\n      "]: {
                marginBottom: '1em'
            }
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTitleStyles"])(token)), {
            ["\n      & + h1".concat(componentCls, ",\n      & + h2").concat(componentCls, ",\n      & + h3").concat(componentCls, ",\n      & + h4").concat(componentCls, ",\n      & + h5").concat(componentCls, "\n      ")]: {
                marginTop: titleMarginTop
            },
            ["\n      div,\n      ul,\n      li,\n      p,\n      h1,\n      h2,\n      h3,\n      h4,\n      h5"]: {
                ["\n        + h1,\n        + h2,\n        + h3,\n        + h4,\n        + h5\n        "]: {
                    marginTop: titleMarginTop
                }
            }
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getResetStyles"])(token)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLinkStyles"])(token)), {
            // Operation
            ["\n        ".concat(componentCls, "-expand,\n        ").concat(componentCls, "-collapse,\n        ").concat(componentCls, "-edit,\n        ").concat(componentCls, "-copy\n      ")]: Object.assign(Object.assign({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["operationUnit"])(token)), {
                marginInlineStart: token.marginXXS
            })
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEditableStyles"])(token)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCopyableStyles"])(token)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$mixins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEllipsisStyles"])()), {
            '&-rtl': {
                direction: 'rtl'
            }
        })
    };
};
const prepareComponentToken = ()=>({
        titleMarginTop: '1.2em',
        titleMarginBottom: '0.5em'
    });
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$theme$2f$util$2f$genStyleUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genStyleHooks"])('Typography', genTypographyStyle, prepareComponentToken);
}),
"[project]/frontend/node_modules/antd/es/typography/Editable.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EnterOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/icons/es/icons/EnterOutlined.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/classnames/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$KeyCode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/KeyCode.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$reactNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/reactNode.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$input$2f$TextArea$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/input/TextArea.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/style/index.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const Editable = (props)=>{
    const { prefixCls, 'aria-label': ariaLabel, className, style, direction, maxLength, autoSize = true, value, onSave, onCancel, onEnd, component, enterIcon = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EnterOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], null) } = props;
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const inComposition = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](false);
    const lastKeyCode = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const [current, setCurrent] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](value);
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Editable.useEffect": ()=>{
            setCurrent(value);
        }
    }["Editable.useEffect"], [
        value
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Editable.useEffect": ()=>{
            var _a;
            if ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.resizableTextArea) {
                const { textArea } = ref.current.resizableTextArea;
                textArea.focus();
                const { length } = textArea.value;
                textArea.setSelectionRange(length, length);
            }
        }
    }["Editable.useEffect"], []);
    const onChange = (param)=>{
        let { target } = param;
        setCurrent(target.value.replace(/[\n\r]/g, ''));
    };
    const onCompositionStart = ()=>{
        inComposition.current = true;
    };
    const onCompositionEnd = ()=>{
        inComposition.current = false;
    };
    const onKeyDown = (param)=>{
        let { keyCode } = param;
        // We don't record keyCode when IME is using
        if (inComposition.current) return;
        lastKeyCode.current = keyCode;
    };
    const confirmChange = ()=>{
        onSave(current.trim());
    };
    const onKeyUp = (param)=>{
        let { keyCode, ctrlKey, altKey, metaKey, shiftKey } = param;
        // Check if it's a real key
        if (lastKeyCode.current !== keyCode || inComposition.current || ctrlKey || altKey || metaKey || shiftKey) {
            return;
        }
        if (keyCode === __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$KeyCode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ENTER) {
            confirmChange();
            onEnd === null || onEnd === void 0 ? void 0 : onEnd();
        } else if (keyCode === __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$KeyCode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ESC) {
            onCancel();
        }
    };
    const onBlur = ()=>{
        confirmChange();
    };
    const [wrapCSSVar, hashId, cssVarCls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(prefixCls);
    const textAreaClassName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(prefixCls, "".concat(prefixCls, "-edit-content"), {
        ["".concat(prefixCls, "-rtl")]: direction === 'rtl',
        ["".concat(prefixCls, "-").concat(component)]: !!component
    }, className, hashId, cssVarCls);
    return wrapCSSVar(/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("div", {
        className: textAreaClassName,
        style: style
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$input$2f$TextArea$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        ref: ref,
        maxLength: maxLength,
        value: current,
        onChange: onChange,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
        onCompositionStart: onCompositionStart,
        onCompositionEnd: onCompositionEnd,
        onBlur: onBlur,
        "aria-label": ariaLabel,
        rows: 1,
        autoSize: autoSize
    }), enterIcon !== null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$reactNode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneElement"])(enterIcon, {
        className: "".concat(prefixCls, "-edit-content-confirm")
    }) : null));
};
const __TURBOPACK__default__export__ = Editable;
}),
"[project]/frontend/node_modules/antd/es/typography/hooks/useCopyClick.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$copy$2d$to$2d$clipboard$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/copy-to-clipboard/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/hooks/useEvent.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$toList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/toList.js [app-client] (ecmascript)");
var __awaiter = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
;
;
;
;
const useCopyClick = (param)=>{
    let { copyConfig, children } = param;
    const [copied, setCopied] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [copyLoading, setCopyLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const copyIdRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const cleanCopyId = ()=>{
        if (copyIdRef.current) {
            clearTimeout(copyIdRef.current);
        }
    };
    const copyOptions = {};
    if (copyConfig.format) {
        copyOptions.format = copyConfig.format;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useCopyClick.useEffect": ()=>cleanCopyId
    }["useCopyClick.useEffect"], []);
    // Keep copy action up to date
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useCopyClick.useEvent[onClick]": (e)=>__awaiter(void 0, void 0, void 0, {
                "useCopyClick.useEvent[onClick]": function*() {
                    var _a;
                    e === null || e === void 0 ? void 0 : e.preventDefault();
                    e === null || e === void 0 ? void 0 : e.stopPropagation();
                    setCopyLoading(true);
                    try {
                        const text = typeof copyConfig.text === 'function' ? yield copyConfig.text() : copyConfig.text;
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$copy$2d$to$2d$clipboard$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(text || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$toList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(children, true).join('') || '', copyOptions);
                        setCopyLoading(false);
                        setCopied(true);
                        // Trigger tips update
                        cleanCopyId();
                        copyIdRef.current = setTimeout({
                            "useCopyClick.useEvent[onClick]": ()=>{
                                setCopied(false);
                            }
                        }["useCopyClick.useEvent[onClick]"], 3000);
                        (_a = copyConfig.onCopy) === null || _a === void 0 ? void 0 : _a.call(copyConfig, e);
                    } catch (error) {
                        setCopyLoading(false);
                        throw error;
                    }
                }
            }["useCopyClick.useEvent[onClick]"])
    }["useCopyClick.useEvent[onClick]"]);
    return {
        copied,
        copyLoading,
        onClick
    };
};
const __TURBOPACK__default__export__ = useCopyClick;
}),
"[project]/frontend/node_modules/antd/es/typography/hooks/useMergedConfig.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useMergedConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function useMergedConfig(propConfig, templateConfig) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useMergedConfig.useMemo": ()=>{
            const support = !!propConfig;
            return [
                support,
                Object.assign(Object.assign({}, templateConfig), support && typeof propConfig === 'object' ? propConfig : null)
            ];
        }
    }["useMergedConfig.useMemo"], [
        propConfig
    ]);
}
}),
"[project]/frontend/node_modules/antd/es/typography/hooks/usePrevious.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
const usePrevious = (value)=>{
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePrevious.useEffect": ()=>{
            ref.current = value;
        }
    }["usePrevious.useEffect"]);
    return ref.current;
};
const __TURBOPACK__default__export__ = usePrevious;
}),
"[project]/frontend/node_modules/antd/es/typography/hooks/useTooltipProps.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
const useTooltipProps = (tooltip, editConfigText, children)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useTooltipProps.useMemo": ()=>{
            if (tooltip === true) {
                return {
                    title: editConfigText !== null && editConfigText !== void 0 ? editConfigText : children
                };
            }
            if (/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"])(tooltip)) {
                return {
                    title: tooltip
                };
            }
            if (typeof tooltip === 'object') {
                return Object.assign({
                    title: editConfigText !== null && editConfigText !== void 0 ? editConfigText : children
                }, tooltip);
            }
            return {
                title: tooltip
            };
        }
    }["useTooltipProps.useMemo"], [
        tooltip,
        editConfigText,
        children
    ]);
const __TURBOPACK__default__export__ = useTooltipProps;
}),
"[project]/frontend/node_modules/antd/es/typography/Typography.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/classnames/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$ref$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/ref.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/warning.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$config$2d$provider$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/config-provider/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/style/index.js [app-client] (ecmascript)");
"use client";
var __rest = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
;
;
;
;
;
;
const Typography = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((props, ref)=>{
    const { prefixCls: customizePrefixCls, component: Component = 'article', className, rootClassName, setContentRef, children, direction: typographyDirection, style } = props, restProps = __rest(props, [
        "prefixCls",
        "component",
        "className",
        "rootClassName",
        "setContentRef",
        "children",
        "direction",
        "style"
    ]);
    const { getPrefixCls, direction: contextDirection, className: contextClassName, style: contextStyle } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$config$2d$provider$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useComponentConfig"])('typography');
    const direction = typographyDirection !== null && typographyDirection !== void 0 ? typographyDirection : contextDirection;
    const mergedRef = setContentRef ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$ref$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["composeRef"])(ref, setContentRef) : ref;
    const prefixCls = getPrefixCls('typography', customizePrefixCls);
    if ("TURBOPACK compile-time truthy", 1) {
        const warning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["devUseWarning"])('Typography');
        warning.deprecated(!setContentRef, 'setContentRef', 'ref');
    }
    // Style
    const [wrapCSSVar, hashId, cssVarCls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$style$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(prefixCls);
    const componentClassName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(prefixCls, contextClassName, {
        ["".concat(prefixCls, "-rtl")]: direction === 'rtl'
    }, className, rootClassName, hashId, cssVarCls);
    const mergedStyle = Object.assign(Object.assign({}, contextStyle), style);
    return wrapCSSVar(/*#__PURE__*/ // @ts-expect-error: Expression produces a union type that is too complex to represent.
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](Component, Object.assign({
        className: componentClassName,
        style: mergedStyle,
        ref: mergedRef
    }, restProps), children));
});
if ("TURBOPACK compile-time truthy", 1) {
    Typography.displayName = 'Typography';
}
const __TURBOPACK__default__export__ = Typography;
}),
"[project]/frontend/node_modules/antd/es/typography/Base/util.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNode",
    ()=>getNode,
    "isEleEllipsis",
    ()=>isEleEllipsis,
    "isValidText",
    ()=>isValidText,
    "toList",
    ()=>toList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function toList(val) {
    if (val === false) {
        return [
            false,
            false
        ];
    }
    return Array.isArray(val) ? val : [
        val
    ];
}
function getNode(dom, defaultNode, needDom) {
    if (dom === true || dom === undefined) {
        return defaultNode;
    }
    return dom || needDom && defaultNode;
}
function isEleEllipsis(ele) {
    // Create a new div to get the size
    const childDiv = document.createElement('em');
    ele.appendChild(childDiv);
    // For test case
    if ("TURBOPACK compile-time truthy", 1) {
        childDiv.className = 'ant-typography-css-ellipsis-content-measure';
    }
    const rect = ele.getBoundingClientRect();
    const childRect = childDiv.getBoundingClientRect();
    // Reset
    ele.removeChild(childDiv);
    // Range checker
    return(// Horizontal out of range
    rect.left > childRect.left || childRect.right > rect.right || // Vertical out of range
    rect.top > childRect.top || childRect.bottom > rect.bottom);
}
const isValidText = (val)=>[
        'string',
        'number'
    ].includes(typeof val);
}),
"[project]/frontend/node_modules/antd/es/typography/Base/CopyBtn.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$CheckOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/icons/es/icons/CheckOutlined.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$CopyOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/icons/es/icons/CopyOutlined.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$LoadingOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/icons/es/icons/LoadingOutlined.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/classnames/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/tooltip/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/util.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const CopyBtn = (param)=>{
    let { prefixCls, copied, locale, iconOnly, tooltips, icon, tabIndex, onCopy, loading: btnLoading } = param;
    const tooltipNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toList"])(tooltips);
    const iconNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toList"])(icon);
    const { copied: copiedText, copy: copyText } = locale !== null && locale !== void 0 ? locale : {};
    const systemStr = copied ? copiedText : copyText;
    const copyTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getNode"])(tooltipNodes[copied ? 1 : 0], systemStr);
    const ariaLabel = typeof copyTitle === 'string' ? copyTitle : systemStr;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        title: copyTitle,
        getPopupContainer: (node)=>node.parentNode
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("button", {
        type: "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("".concat(prefixCls, "-copy"), {
            ["".concat(prefixCls, "-copy-success")]: copied,
            ["".concat(prefixCls, "-copy-icon-only")]: iconOnly
        }),
        onClick: onCopy,
        "aria-label": ariaLabel,
        tabIndex: tabIndex
    }, copied ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getNode"])(iconNodes[1], /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$CheckOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], null), true) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getNode"])(iconNodes[0], btnLoading ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$LoadingOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], null) : /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$CopyOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], null), true)));
};
const __TURBOPACK__default__export__ = CopyBtn;
}),
"[project]/frontend/node_modules/antd/es/typography/Base/Ellipsis.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EllipsisMeasure
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$babel$2f$runtime$2f$helpers$2f$esm$2f$toConsumableArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Children$2f$toArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/Children/toArray.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/hooks/useLayoutEffect.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/util.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const MeasureText = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((param, ref)=>{
    let { style, children } = param;
    const spanRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"](ref, {
        "MeasureText.useImperativeHandle": ()=>({
                isExceed: ({
                    "MeasureText.useImperativeHandle": ()=>{
                        const span = spanRef.current;
                        return span.scrollHeight > span.clientHeight;
                    }
                })["MeasureText.useImperativeHandle"],
                getHeight: ({
                    "MeasureText.useImperativeHandle": ()=>spanRef.current.clientHeight
                })["MeasureText.useImperativeHandle"]
            })
    }["MeasureText.useImperativeHandle"]);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("span", {
        "aria-hidden": true,
        ref: spanRef,
        style: Object.assign({
            position: 'fixed',
            display: 'block',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 0, 0, 0.65)'
        }, style)
    }, children);
});
const getNodesLen = (nodeList)=>nodeList.reduce((totalLen, node)=>totalLen + ((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidText"])(node) ? String(node).length : 1), 0);
function sliceNodes(nodeList, len) {
    let currLen = 0;
    const currentNodeList = [];
    for(let i = 0; i < nodeList.length; i += 1){
        // Match to return
        if (currLen === len) {
            return currentNodeList;
        }
        const node = nodeList[i];
        const canCut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidText"])(node);
        const nodeLen = canCut ? String(node).length : 1;
        const nextLen = currLen + nodeLen;
        // Exceed but current not which means we need cut this
        // This will not happen on validate ReactElement
        if (nextLen > len) {
            const restLen = len - currLen;
            currentNodeList.push(String(node).slice(0, restLen));
            return currentNodeList;
        }
        currentNodeList.push(node);
        currLen = nextLen;
    }
    return nodeList;
}
// Measure for the `text` is exceed the `rows` or not
const STATUS_MEASURE_NONE = 0;
const STATUS_MEASURE_PREPARE = 1;
const STATUS_MEASURE_START = 2;
const STATUS_MEASURE_NEED_ELLIPSIS = 3;
const STATUS_MEASURE_NO_NEED_ELLIPSIS = 4;
const lineClipStyle = {
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical'
};
function EllipsisMeasure(props) {
    const { enableMeasure, width, text, children, rows, expanded, miscDeps, onEllipsis } = props;
    const nodeList = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "EllipsisMeasure.useMemo[nodeList]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Children$2f$toArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(text)
    }["EllipsisMeasure.useMemo[nodeList]"], [
        text
    ]);
    const nodeLen = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "EllipsisMeasure.useMemo[nodeLen]": ()=>getNodesLen(nodeList)
    }["EllipsisMeasure.useMemo[nodeLen]"], [
        text
    ]);
    // ========================= Full Content =========================
    // Used for measure only, which means it's always render as no need ellipsis
    const fullContent = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "EllipsisMeasure.useMemo[fullContent]": ()=>children(nodeList, false)
    }["EllipsisMeasure.useMemo[fullContent]"], [
        text
    ]);
    // ========================= Cut Content ==========================
    const [ellipsisCutIndex, setEllipsisCutIndex] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const cutMidRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    // ========================= NeedEllipsis =========================
    const measureWhiteSpaceRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const needEllipsisRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    // Measure for `rows-1` height, to avoid operation exceed the line height
    const descRowsEllipsisRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const symbolRowEllipsisRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const [canEllipsis, setCanEllipsis] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [needEllipsis, setNeedEllipsis] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](STATUS_MEASURE_NONE);
    const [ellipsisHeight, setEllipsisHeight] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const [parentWhiteSpace, setParentWhiteSpace] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    // Trigger start measure
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "EllipsisMeasure.useLayoutEffect": ()=>{
            if (enableMeasure && width && nodeLen) {
                setNeedEllipsis(STATUS_MEASURE_PREPARE);
            } else {
                setNeedEllipsis(STATUS_MEASURE_NONE);
            }
        }
    }["EllipsisMeasure.useLayoutEffect"], [
        width,
        text,
        rows,
        enableMeasure,
        nodeList
    ]);
    // Measure process
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "EllipsisMeasure.useLayoutEffect": ()=>{
            var _a, _b, _c, _d;
            if (needEllipsis === STATUS_MEASURE_PREPARE) {
                setNeedEllipsis(STATUS_MEASURE_START);
                // Parent ref `white-space`
                const nextWhiteSpace = measureWhiteSpaceRef.current && getComputedStyle(measureWhiteSpaceRef.current).whiteSpace;
                setParentWhiteSpace(nextWhiteSpace);
            } else if (needEllipsis === STATUS_MEASURE_START) {
                const isOverflow = !!((_a = needEllipsisRef.current) === null || _a === void 0 ? void 0 : _a.isExceed());
                setNeedEllipsis(isOverflow ? STATUS_MEASURE_NEED_ELLIPSIS : STATUS_MEASURE_NO_NEED_ELLIPSIS);
                setEllipsisCutIndex(isOverflow ? [
                    0,
                    nodeLen
                ] : null);
                setCanEllipsis(isOverflow);
                // Get the basic height of ellipsis rows
                const baseRowsEllipsisHeight = ((_b = needEllipsisRef.current) === null || _b === void 0 ? void 0 : _b.getHeight()) || 0;
                // Get the height of `rows - 1` + symbol height
                const descRowsEllipsisHeight = rows === 1 ? 0 : ((_c = descRowsEllipsisRef.current) === null || _c === void 0 ? void 0 : _c.getHeight()) || 0;
                const symbolRowEllipsisHeight = ((_d = symbolRowEllipsisRef.current) === null || _d === void 0 ? void 0 : _d.getHeight()) || 0;
                const maxRowsHeight = Math.max(baseRowsEllipsisHeight, // height of rows with ellipsis
                descRowsEllipsisHeight + symbolRowEllipsisHeight);
                setEllipsisHeight(maxRowsHeight + 1);
                onEllipsis(isOverflow);
            }
        }
    }["EllipsisMeasure.useLayoutEffect"], [
        needEllipsis
    ]);
    // ========================= Cut Measure ==========================
    const cutMidIndex = ellipsisCutIndex ? Math.ceil((ellipsisCutIndex[0] + ellipsisCutIndex[1]) / 2) : 0;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "EllipsisMeasure.useLayoutEffect": ()=>{
            var _a;
            const [minIndex, maxIndex] = ellipsisCutIndex || [
                0,
                0
            ];
            if (minIndex !== maxIndex) {
                const midHeight = ((_a = cutMidRef.current) === null || _a === void 0 ? void 0 : _a.getHeight()) || 0;
                const isOverflow = midHeight > ellipsisHeight;
                let targetMidIndex = cutMidIndex;
                if (maxIndex - minIndex === 1) {
                    targetMidIndex = isOverflow ? minIndex : maxIndex;
                }
                setEllipsisCutIndex(isOverflow ? [
                    minIndex,
                    targetMidIndex
                ] : [
                    targetMidIndex,
                    maxIndex
                ]);
            }
        }
    }["EllipsisMeasure.useLayoutEffect"], [
        ellipsisCutIndex,
        cutMidIndex
    ]);
    // ========================= Text Content =========================
    const finalContent = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "EllipsisMeasure.useMemo[finalContent]": ()=>{
            // Skip everything if `enableMeasure` is disabled
            if (!enableMeasure) {
                return children(nodeList, false);
            }
            if (needEllipsis !== STATUS_MEASURE_NEED_ELLIPSIS || !ellipsisCutIndex || ellipsisCutIndex[0] !== ellipsisCutIndex[1]) {
                const content = children(nodeList, false);
                // Limit the max line count to avoid scrollbar blink unless no need ellipsis
                // https://github.com/ant-design/ant-design/issues/42958
                if ([
                    STATUS_MEASURE_NO_NEED_ELLIPSIS,
                    STATUS_MEASURE_NONE
                ].includes(needEllipsis)) {
                    return content;
                }
                return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("span", {
                    style: Object.assign(Object.assign({}, lineClipStyle), {
                        WebkitLineClamp: rows
                    })
                }, content);
            }
            return children(expanded ? nodeList : sliceNodes(nodeList, ellipsisCutIndex[0]), canEllipsis);
        }
    }["EllipsisMeasure.useMemo[finalContent]"], [
        expanded,
        needEllipsis,
        ellipsisCutIndex,
        nodeList
    ].concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$babel$2f$runtime$2f$helpers$2f$esm$2f$toConsumableArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(miscDeps)));
    // ============================ Render ============================
    const measureStyle = {
        width,
        margin: 0,
        padding: 0,
        whiteSpace: parentWhiteSpace === 'nowrap' ? 'normal' : 'inherit'
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], null, finalContent, needEllipsis === STATUS_MEASURE_START && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](MeasureText, {
        style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
            WebkitLineClamp: rows
        }),
        ref: needEllipsisRef
    }, fullContent), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](MeasureText, {
        style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
            WebkitLineClamp: rows - 1
        }),
        ref: descRowsEllipsisRef
    }, fullContent), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](MeasureText, {
        style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
            WebkitLineClamp: 1
        }),
        ref: symbolRowEllipsisRef
    }, children([], true))), needEllipsis === STATUS_MEASURE_NEED_ELLIPSIS && ellipsisCutIndex && ellipsisCutIndex[0] !== ellipsisCutIndex[1] && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](MeasureText, {
        style: Object.assign(Object.assign({}, measureStyle), {
            top: 400
        }),
        ref: cutMidRef
    }, children(sliceNodes(nodeList, cutMidIndex), true)), needEllipsis === STATUS_MEASURE_PREPARE && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("span", {
        style: {
            whiteSpace: 'inherit'
        },
        ref: measureWhiteSpaceRef
    }));
}
}),
"[project]/frontend/node_modules/antd/es/typography/Base/EllipsisTooltip.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/tooltip/index.js [app-client] (ecmascript)");
"use client";
;
;
const EllipsisTooltip = (param)=>{
    let { enableEllipsis, isEllipsis, children, tooltipProps } = param;
    if (!(tooltipProps === null || tooltipProps === void 0 ? void 0 : tooltipProps.title) || !enableEllipsis) {
        return children;
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
        open: isEllipsis ? undefined : false
    }, tooltipProps), children);
};
if ("TURBOPACK compile-time truthy", 1) {
    EllipsisTooltip.displayName = 'EllipsisTooltip';
}
const __TURBOPACK__default__export__ = EllipsisTooltip;
}),
"[project]/frontend/node_modules/antd/es/typography/Base/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$babel$2f$runtime$2f$helpers$2f$esm$2f$toConsumableArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EditOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/node_modules/@ant-design/icons/es/icons/EditOutlined.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/classnames/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$resize$2d$observer$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-resize-observer/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Children$2f$toArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/Children/toArray.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/hooks/useLayoutEffect.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useMergedState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/hooks/useMergedState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$omit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/omit.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$ref$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/ref.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Dom$2f$styleChecker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/Dom/styleChecker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$config$2d$provider$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/config-provider/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$locale$2f$useLocale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/locale/useLocale.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/tooltip/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Editable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Editable.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useCopyClick$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/hooks/useCopyClick.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useMergedConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/hooks/useMergedConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$usePrevious$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/hooks/usePrevious.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useTooltipProps$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/hooks/useTooltipProps.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Typography.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$CopyBtn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/CopyBtn.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$Ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/Ellipsis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$EllipsisTooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/EllipsisTooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/util.js [app-client] (ecmascript)");
"use client";
;
var __rest = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function wrapperDecorations(param, content) {
    let { mark, code, underline, delete: del, strong, keyboard, italic } = param;
    let currentContent = content;
    function wrap(tag, needed) {
        if (!needed) {
            return;
        }
        currentContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](tag, {}, currentContent);
    }
    wrap('strong', strong);
    wrap('u', underline);
    wrap('del', del);
    wrap('code', code);
    wrap('mark', mark);
    wrap('kbd', keyboard);
    wrap('i', italic);
    return currentContent;
}
const ELLIPSIS_STR = '...';
const DECORATION_PROPS = [
    'delete',
    'mark',
    'code',
    'underline',
    'strong',
    'keyboard',
    'italic'
];
const Base = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((props, ref)=>{
    var _a;
    const { prefixCls: customizePrefixCls, className, style, type, disabled, children, ellipsis, editable, copyable, component, title } = props, restProps = __rest(props, [
        "prefixCls",
        "className",
        "style",
        "type",
        "disabled",
        "children",
        "ellipsis",
        "editable",
        "copyable",
        "component",
        "title"
    ]);
    const { getPrefixCls, direction } = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$config$2d$provider$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfigContext"]);
    const [textLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$locale$2f$useLocale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('Text');
    const typographyRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const editIconRef = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    // ============================ MISC ============================
    const prefixCls = getPrefixCls('typography', customizePrefixCls);
    const textProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$omit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(restProps, DECORATION_PROPS);
    // ========================== Editable ==========================
    const [enableEdit, editConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useMergedConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(editable);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useMergedState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(false, {
        value: editConfig.editing
    });
    const { triggerType = [
        'icon'
    ] } = editConfig;
    const triggerEdit = (edit)=>{
        var _a;
        if (edit) {
            (_a = editConfig.onStart) === null || _a === void 0 ? void 0 : _a.call(editConfig);
        }
        setEditing(edit);
    };
    // Focus edit icon when back
    const prevEditing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$usePrevious$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(editing);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "Base.useLayoutEffect": ()=>{
            var _a;
            if (!editing && prevEditing) {
                (_a = editIconRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }
    }["Base.useLayoutEffect"], [
        editing
    ]);
    const onEditClick = (e)=>{
        e === null || e === void 0 ? void 0 : e.preventDefault();
        triggerEdit(true);
    };
    const onEditChange = (value)=>{
        var _a;
        (_a = editConfig.onChange) === null || _a === void 0 ? void 0 : _a.call(editConfig, value);
        triggerEdit(false);
    };
    const onEditCancel = ()=>{
        var _a;
        (_a = editConfig.onCancel) === null || _a === void 0 ? void 0 : _a.call(editConfig);
        triggerEdit(false);
    };
    // ========================== Copyable ==========================
    const [enableCopy, copyConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useMergedConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(copyable);
    const { copied, copyLoading, onClick: onCopyClick } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useCopyClick$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        copyConfig,
        children
    });
    // ========================== Ellipsis ==========================
    const [isLineClampSupport, setIsLineClampSupport] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [isTextOverflowSupport, setIsTextOverflowSupport] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [isJsEllipsis, setIsJsEllipsis] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [isNativeEllipsis, setIsNativeEllipsis] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [isNativeVisible, setIsNativeVisible] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](true);
    const [enableEllipsis, ellipsisConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useMergedConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(ellipsis, {
        expandable: false,
        symbol: {
            "Base.useMergedConfig": (isExpanded)=>isExpanded ? textLocale === null || textLocale === void 0 ? void 0 : textLocale.collapse : textLocale === null || textLocale === void 0 ? void 0 : textLocale.expand
        }["Base.useMergedConfig"]
    });
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useMergedState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(ellipsisConfig.defaultExpanded || false, {
        value: ellipsisConfig.expanded
    });
    const mergedEnableEllipsis = enableEllipsis && (!expanded || ellipsisConfig.expandable === 'collapsible');
    // Shared prop to reduce bundle size
    const { rows = 1 } = ellipsisConfig;
    const needMeasureEllipsis = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "Base.useMemo[needMeasureEllipsis]": ()=>// Disable ellipsis
            mergedEnableEllipsis && (// Provide suffix
            ellipsisConfig.suffix !== undefined || ellipsisConfig.onEllipsis || // Can't use css ellipsis since we need to provide the place for button
            ellipsisConfig.expandable || enableEdit || enableCopy)
    }["Base.useMemo[needMeasureEllipsis]"], [
        mergedEnableEllipsis,
        ellipsisConfig,
        enableEdit,
        enableCopy
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "Base.useLayoutEffect": ()=>{
            if (enableEllipsis && !needMeasureEllipsis) {
                setIsLineClampSupport((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Dom$2f$styleChecker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStyleSupport"])('webkitLineClamp'));
                setIsTextOverflowSupport((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Dom$2f$styleChecker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStyleSupport"])('textOverflow'));
            }
        }
    }["Base.useLayoutEffect"], [
        needMeasureEllipsis,
        enableEllipsis
    ]);
    const [cssEllipsis, setCssEllipsis] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](mergedEnableEllipsis);
    const canUseCssEllipsis = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "Base.useMemo[canUseCssEllipsis]": ()=>{
            if (needMeasureEllipsis) {
                return false;
            }
            if (rows === 1) {
                return isTextOverflowSupport;
            }
            return isLineClampSupport;
        }
    }["Base.useMemo[canUseCssEllipsis]"], [
        needMeasureEllipsis,
        isTextOverflowSupport,
        isLineClampSupport
    ]);
    // We use effect to change from css ellipsis to js ellipsis.
    // To make SSR still can see the ellipsis.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$hooks$2f$useLayoutEffect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "Base.useLayoutEffect": ()=>{
            setCssEllipsis(canUseCssEllipsis && mergedEnableEllipsis);
        }
    }["Base.useLayoutEffect"], [
        canUseCssEllipsis,
        mergedEnableEllipsis
    ]);
    const isMergedEllipsis = mergedEnableEllipsis && (cssEllipsis ? isNativeEllipsis : isJsEllipsis);
    const cssTextOverflow = mergedEnableEllipsis && rows === 1 && cssEllipsis;
    const cssLineClamp = mergedEnableEllipsis && rows > 1 && cssEllipsis;
    // >>>>> Expand
    const onExpandClick = (e, info)=>{
        var _a;
        setExpanded(info.expanded);
        (_a = ellipsisConfig.onExpand) === null || _a === void 0 ? void 0 : _a.call(ellipsisConfig, e, info);
    };
    const [ellipsisWidth, setEllipsisWidth] = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const onResize = (param)=>{
        let { offsetWidth } = param;
        setEllipsisWidth(offsetWidth);
    };
    // >>>>> JS Ellipsis
    const onJsEllipsis = (jsEllipsis)=>{
        var _a;
        setIsJsEllipsis(jsEllipsis);
        // Trigger if changed
        if (isJsEllipsis !== jsEllipsis) {
            (_a = ellipsisConfig.onEllipsis) === null || _a === void 0 ? void 0 : _a.call(ellipsisConfig, jsEllipsis);
        }
    };
    // >>>>> Native ellipsis
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Base.useEffect": ()=>{
            const textEle = typographyRef.current;
            if (enableEllipsis && cssEllipsis && textEle) {
                const currentEllipsis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isEleEllipsis"])(textEle);
                if (isNativeEllipsis !== currentEllipsis) {
                    setIsNativeEllipsis(currentEllipsis);
                }
            }
        }
    }["Base.useEffect"], [
        enableEllipsis,
        cssEllipsis,
        children,
        cssLineClamp,
        isNativeVisible,
        ellipsisWidth
    ]);
    // https://github.com/ant-design/ant-design/issues/36786
    // Use IntersectionObserver to check if element is invisible
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Base.useEffect": ()=>{
            const textEle = typographyRef.current;
            if (typeof IntersectionObserver === 'undefined' || !textEle || !cssEllipsis || !mergedEnableEllipsis) {
                return;
            }
            /* eslint-disable-next-line compat/compat */ const observer = new IntersectionObserver({
                "Base.useEffect": ()=>{
                    setIsNativeVisible(!!textEle.offsetParent);
                }
            }["Base.useEffect"]);
            observer.observe(textEle);
            return ({
                "Base.useEffect": ()=>{
                    observer.disconnect();
                }
            })["Base.useEffect"];
        }
    }["Base.useEffect"], [
        cssEllipsis,
        mergedEnableEllipsis
    ]);
    // ========================== Tooltip ===========================
    const tooltipProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$hooks$2f$useTooltipProps$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(ellipsisConfig.tooltip, editConfig.text, children);
    const topAriaLabel = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "Base.useMemo[topAriaLabel]": ()=>{
            if (!enableEllipsis || cssEllipsis) {
                return undefined;
            }
            return [
                editConfig.text,
                children,
                title,
                tooltipProps.title
            ].find(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$util$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidText"]);
        }
    }["Base.useMemo[topAriaLabel]"], [
        enableEllipsis,
        cssEllipsis,
        title,
        tooltipProps.title,
        isMergedEllipsis
    ]);
    // =========================== Render ===========================
    // >>>>>>>>>>> Editing input
    if (editing) {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Editable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            value: (_a = editConfig.text) !== null && _a !== void 0 ? _a : typeof children === 'string' ? children : '',
            onSave: onEditChange,
            onCancel: onEditCancel,
            onEnd: editConfig.onEnd,
            prefixCls: prefixCls,
            className: className,
            style: style,
            direction: direction,
            component: component,
            maxLength: editConfig.maxLength,
            autoSize: editConfig.autoSize,
            enterIcon: editConfig.enterIcon
        });
    }
    // >>>>>>>>>>> Typography
    // Expand
    const renderExpand = ()=>{
        const { expandable, symbol } = ellipsisConfig;
        return expandable ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("button", {
            type: "button",
            key: "expand",
            className: "".concat(prefixCls, "-").concat(expanded ? 'collapse' : 'expand'),
            onClick: (e)=>onExpandClick(e, {
                    expanded: !expanded
                }),
            "aria-label": expanded ? textLocale.collapse : textLocale === null || textLocale === void 0 ? void 0 : textLocale.expand
        }, typeof symbol === 'function' ? symbol(expanded) : symbol) : null;
    };
    // Edit
    const renderEdit = ()=>{
        if (!enableEdit) {
            return;
        }
        const { icon, tooltip, tabIndex } = editConfig;
        const editTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$Children$2f$toArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(tooltip)[0] || (textLocale === null || textLocale === void 0 ? void 0 : textLocale.edit);
        const ariaLabel = typeof editTitle === 'string' ? editTitle : '';
        return triggerType.includes('icon') ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$tooltip$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            key: "edit",
            title: tooltip === false ? '' : editTitle
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("button", {
            type: "button",
            ref: editIconRef,
            className: "".concat(prefixCls, "-edit"),
            onClick: onEditClick,
            "aria-label": ariaLabel,
            tabIndex: tabIndex
        }, icon || /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$node_modules$2f40$ant$2d$design$2f$icons$2f$es$2f$icons$2f$EditOutlined$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            role: "button"
        }))) : null;
    };
    // Copy
    const renderCopy = ()=>{
        if (!enableCopy) {
            return null;
        }
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$CopyBtn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
            key: "copy"
        }, copyConfig, {
            prefixCls: prefixCls,
            copied: copied,
            locale: textLocale,
            onCopy: onCopyClick,
            loading: copyLoading,
            iconOnly: children === null || children === undefined
        }));
    };
    const renderOperations = (canEllipsis)=>[
            canEllipsis && renderExpand(),
            renderEdit(),
            renderCopy()
        ];
    const renderEllipsis = (canEllipsis)=>[
            canEllipsis && !expanded && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("span", {
                "aria-hidden": true,
                key: "ellipsis"
            }, ELLIPSIS_STR),
            ellipsisConfig.suffix,
            renderOperations(canEllipsis)
        ];
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$resize$2d$observer$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
        onResize: onResize,
        disabled: !mergedEnableEllipsis
    }, (resizeRef)=>/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$EllipsisTooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            tooltipProps: tooltipProps,
            enableEllipsis: mergedEnableEllipsis,
            isEllipsis: isMergedEllipsis
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$classnames$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                ["".concat(prefixCls, "-").concat(type)]: type,
                ["".concat(prefixCls, "-disabled")]: disabled,
                ["".concat(prefixCls, "-ellipsis")]: enableEllipsis,
                ["".concat(prefixCls, "-ellipsis-single-line")]: cssTextOverflow,
                ["".concat(prefixCls, "-ellipsis-multiple-line")]: cssLineClamp
            }, className),
            prefixCls: customizePrefixCls,
            style: Object.assign(Object.assign({}, style), {
                WebkitLineClamp: cssLineClamp ? rows : undefined
            }),
            component: component,
            ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$ref$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["composeRef"])(resizeRef, typographyRef, ref),
            direction: direction,
            onClick: triggerType.includes('text') ? onEditClick : undefined,
            "aria-label": topAriaLabel === null || topAriaLabel === void 0 ? void 0 : topAriaLabel.toString(),
            title: title
        }, textProps), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$Ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            enableMeasure: mergedEnableEllipsis && !cssEllipsis,
            text: children,
            rows: rows,
            width: ellipsisWidth,
            onEllipsis: onJsEllipsis,
            expanded: expanded,
            miscDeps: [
                copied,
                expanded,
                copyLoading,
                enableEdit,
                enableCopy,
                textLocale
            ].concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$babel$2f$runtime$2f$helpers$2f$esm$2f$toConsumableArray$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(DECORATION_PROPS.map((key)=>props[key])))
        }, (node, canEllipsis)=>wrapperDecorations(props, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], null, node.length > 0 && canEllipsis && !expanded && topAriaLabel ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"]("span", {
                key: "show-content",
                "aria-hidden": true
            }, node) : node, renderEllipsis(canEllipsis)))))));
});
const __TURBOPACK__default__export__ = Base;
}),
"[project]/frontend/node_modules/antd/es/typography/Link.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/warning.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/index.js [app-client] (ecmascript)");
"use client";
var __rest = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
;
;
;
const Link = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((_a, ref)=>{
    var { ellipsis, rel } = _a, restProps = __rest(_a, [
        "ellipsis",
        "rel"
    ]);
    if ("TURBOPACK compile-time truthy", 1) {
        const warning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["devUseWarning"])('Typography.Link');
        ("TURBOPACK compile-time truthy", 1) ? warning(typeof ellipsis !== 'object', 'usage', '`ellipsis` only supports boolean value.') : "TURBOPACK unreachable";
    }
    const mergedProps = Object.assign(Object.assign({}, restProps), {
        rel: rel === undefined && restProps.target === '_blank' ? 'noopener noreferrer' : rel
    });
    // @ts-expect-error: https://github.com/ant-design/ant-design/issues/26622
    delete mergedProps.navigate;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({}, mergedProps, {
        ref: ref,
        ellipsis: !!ellipsis,
        component: "a"
    }));
});
const __TURBOPACK__default__export__ = Link;
}),
"[project]/frontend/node_modules/antd/es/typography/Paragraph.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/index.js [app-client] (ecmascript)");
"use client";
;
;
const Paragraph = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((props, ref)=>/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
        ref: ref
    }, props, {
        component: "div"
    })));
const __TURBOPACK__default__export__ = Paragraph;
}),
"[project]/frontend/node_modules/antd/es/typography/Text.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$omit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/rc-util/es/omit.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/warning.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/index.js [app-client] (ecmascript)");
"use client";
var __rest = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
;
;
;
;
const Text = (_a, ref)=>{
    var { ellipsis } = _a, restProps = __rest(_a, [
        "ellipsis"
    ]);
    const mergedEllipsis = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "Text.useMemo[mergedEllipsis]": ()=>{
            if (ellipsis && typeof ellipsis === 'object') {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$rc$2d$util$2f$es$2f$omit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(ellipsis, [
                    'expandable',
                    'rows'
                ]);
            }
            return ellipsis;
        }
    }["Text.useMemo[mergedEllipsis]"], [
        ellipsis
    ]);
    if ("TURBOPACK compile-time truthy", 1) {
        const warning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["devUseWarning"])('Typography.Text');
        ("TURBOPACK compile-time truthy", 1) ? warning(typeof ellipsis !== 'object' || !ellipsis || !('expandable' in ellipsis) && !('rows' in ellipsis), 'usage', '`ellipsis` do not support `expandable` or `rows` props.') : "TURBOPACK unreachable";
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
        ref: ref
    }, restProps, {
        ellipsis: mergedEllipsis,
        component: "span"
    }));
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](Text);
}),
"[project]/frontend/node_modules/antd/es/typography/Title.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/_util/warning.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Base/index.js [app-client] (ecmascript)");
"use client";
var __rest = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
;
;
;
const TITLE_ELE_LIST = [
    1,
    2,
    3,
    4,
    5
];
const Title = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"]((props, ref)=>{
    const { level = 1 } = props, restProps = __rest(props, [
        "level"
    ]);
    if ("TURBOPACK compile-time truthy", 1) {
        const warning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$_util$2f$warning$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["devUseWarning"])('Typography.Title');
        ("TURBOPACK compile-time truthy", 1) ? warning(TITLE_ELE_LIST.includes(level), 'usage', 'Title only accept `1 | 2 | 3 | 4 | 5` as `level` value. And `5` need 4.6.0+ version.') : "TURBOPACK unreachable";
    }
    const component = TITLE_ELE_LIST.includes(level) ? "h".concat(level) : "h1";
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Base$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], Object.assign({
        ref: ref
    }, restProps, {
        component: component
    }));
});
const __TURBOPACK__default__export__ = Title;
}),
"[project]/frontend/node_modules/antd/es/typography/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Paragraph$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Paragraph.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Text.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Title$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Title.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/Typography.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const Typography = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
Typography.Text = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
Typography.Link = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
Typography.Title = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Title$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
Typography.Paragraph = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$Paragraph$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
const __TURBOPACK__default__export__ = Typography;
}),
"[project]/frontend/node_modules/antd/es/typography/index.js [app-client] (ecmascript) <export default as Typography>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Typography",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$antd$2f$es$2f$typography$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/antd/es/typography/index.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=9e883_antd_es_typography_97fe782a._.js.map