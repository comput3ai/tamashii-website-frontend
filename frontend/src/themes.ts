import { css } from '@linaria/core'
import { forest, slate } from './colors.js'

export const sharedTheme = css`
	:global() {
		:root {
			color-scheme: light dark;

			font-synthesis: none;
			text-rendering: optimizeLegibility;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}

		* {
			box-sizing: border-box;
		}

		html {
			overflow-x: hidden;
		}

		body {
			margin: 0;
			min-height: 100vh;
		}

		#root {
			min-height: 100vh;
		}
	}

	color: var(--color-fg);
`

const bgSvg = (fill: string, opacity: number) =>
	`url("data:image/svg+xml;charset=UTF-8, <svg width='347.7' height='260.8' xmlns='http://www.w3.org/2000/svg'><path style='opacity:${opacity};fill:${encodeURIComponent(fill)};stroke:none' d='M65-1s48 0 53 65C-2 64-2 11-2 11v129s0-54 120-54c-5 65-53 65-53 65h129s-48 0-53-65c120 1 120 54 120 54V11s0 53-120 53c5-65 53-65 53-65h-64Z' transform='translate(2 1)'/></svg>")`

export const lightTheme = css`
	--color-bg: #ffffff;
	--color-fg: #0a0a0a;

	background: var(--color-bg);
	--bg-svg: ${bgSvg('#f5f5f5', 0.2)};
`
export const darkTheme = css`
	--color-bg: #0a0a0a;
	--color-fg: #ffffff;

	background: var(--color-bg);
	--bg-svg: ${bgSvg('#1a1a1a', 0.3)};
`
