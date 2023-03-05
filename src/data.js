export const testCases =  [
    {
        testCase: "text_regular",
        title: "Regular text",
        ratio: 4.5,
        colors: [
            "Background",
            "Text"
        ],
        triangle: true,
        req: "Regular size text needs to have a contrast ratio of 4.5 against its background."
    },
    {
        testCase: "focused_button_notext",
        title: "Focused button without text",
        ratio: 3,
        colors: [
            "Background",
            "Focus outline",
            "Button"
        ],
        triangle: true,
        req: "A focus indicator should have a contrast of 3 against the button and the background."
    },
    {
        testCase: "focused_button",
        title: "Focused button with text",
        ratio: 4.5,
        colors: [
            "Background/text",
            "Focus outline",
            "Button"
        ],
        triangle: true,
        req: "Strictly speaking, the focus indicator requires a focus of 3 against the button, while the text requires a contrast of 4.5 against the button. This pattern assumes the same color is used for the background and the text, but it is possible to use four colors and have a more complex contrast relationship."
    },
    {
        testCase: "button",
        title: "Button",
        ratio: 4.5,
        colors: [
            "Background/text",
            "Button"
        ],
        triangle: true,
        req: "The button's text must have a contrast of 4.5 against the button's background. The page's background color is not required to contrast, but keeping contrast between the button and page is good practice."
    },
    {
        testCase: "link",
        title: "Link without underline",
        ratio: 4.5,
        colors: [
            "Background",
            "Regular text",
            "Link text"
        ],
        triangle: true,
        req: "Links without underlines need to be contrast compliant with the background and with other text at a ratio of 4.5. If you underline links, they don't need to contrast with other text."
    },
 
    {
        testCase: "text_large",
        title: "Large text",
        ratio: 3,
        colors: [
            "Background",
            "Text"
        ],
        triangle: true,
        req: "Large text (18pt or greater) needs to have a contrast ratio of 3 against its background."
    },
    {
        testCase: "neutral_2",
        title: "Just colors",
        ratio: 3,
        colors: [
            "Color 1",
            "Color 2",
        ],
        triangle: false,
        req: "Meaningful UI elements need a contrast ratio of 3."
    },
    {
        testCase: "neutral_3",
        title: "Just colors",
        ratio: 3,
        colors: [
            "Color 1",
            "Color 2",
            "Color 3"
        ],
        triangle: true,
        req: "Meaningful UI elements need a contrast ratio of 3."
    }
]