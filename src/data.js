export const testCases =  [
    {
        testCase: "focused_button",
        title: "Focused button",
        ratio: 3,
        colors: [
            "Background",
            "Focus outline",
            "Button"
        ],
        triangle: true,
        req: "Focused buttons description."
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
    }
]