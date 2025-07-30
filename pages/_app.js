import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    @font-face {
        font-family: 'SF Pro Display';
        src: url('/fonts/SFPRODISPLAYREGULAR.OTF') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }
    @font-face {
        font-family: 'Formula1';
        src: url('/fonts/Formula1-Regular.ttf') format('trueType');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }

    :root {
        --space-0: 0px;
        --space-1: 2px;
        --space-2: 4px;
        --space-3: 8px;
        --space-4: 16px;
        --space-5: 32px;
        --space-6: 64px;

        --colour-bg: #0E0E0E;
        --colour-fg: #d9dadc;
        --colour-border: #555;
        --colour-offset: #222;

        --fontSize-small: 10px;
        --fontSize-body: 12px;
        --fontFamily-body: 'Formula1', monospace;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    body {
        background-color: var(--colour-bg);
        color: var(--colour-fg);
        font-family: var(--fontFamily-body);
        font-size: var(--fontSize-small);
        -webkit-text-size-adjust: 100%;

        @media screen and (min-width: 900px) {
            font-size: var(--fontSize-body);
        }
    }

    button {
        appearance: none;
        background-color: var(--colour-bg);
        color: var(--colour-fg);
        border: 1px solid var(--colour-fg);
        padding: var(--space-2) var(--space-3);
        font-size: var(--fontSize-small);
        font-family: var(--fontFamily-body);
        cursor: pointer;

        @media screen and (min-width: 900px) {
            font-size: var(--fontSize-body);
        }
    }

    /* --- WeatherCircle styles --- */
    .circle-container {
        width: 70px;
        height: 70px;
        position: relative;
        margin-inline: var(--space-3);
    }

    .circle-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
    }

    .circle-svg circle.bg {
        fill: none;
        stroke: #333;
        stroke-width: 10;
    }

    .circle-svg circle.fg {
        fill: none;
        stroke-width: 10;
        transition: stroke-dashoffset 0.3s ease;
    }

    .circle-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
    }
    .type-name{
        background: #0E0E0E;
        border-radius: 30px;
        padding-top: 5px;
        position: relative;
        top:-29%;
        text-align: center;
    }
    .circle-value {
        font-size: 0.9rem;
        font-weight: bold;
        line-height: 1;
    }

    .circle-icon {
        font-size: 0.8rem;
        display: block;
        margin-top: 2px;
    }

    .circle-label {
        font-size: 0.7rem;
        color: #9ce860;
        margin-top: 1px;
        letter-spacing: 0.5px;
    }
`;

export default function App({ Component, pageProps }) {
    return (
        <>
            <GlobalStyle />
            <Component {...pageProps} />
        </>
    );
}
