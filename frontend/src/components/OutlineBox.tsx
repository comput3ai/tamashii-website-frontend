import { css } from '@linaria/core'
import { styled } from '@linaria/react'
import { type PropsWithChildren, type ReactNode } from 'react'
import { text } from '../fonts.js'
import { forest, slate } from '../colors.js'
import { c } from '../utils.js'

const boxHeaderChild = css`
	padding: 0 0.4ch;
	font-family: 'Geist Mono', monospace;
	font-weight: 700;
	letter-spacing: 0.15em;
	text-transform: uppercase;
	text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
	
	.theme-light & {
		color: ${forest[700]};
	}
	.theme-dark & {
		color: #00ff88;
		text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px rgba(0, 255, 136, 0.5);
	}
	
	/* Cyberpunk glitch effect on hover */
	&:hover {
		animation: glitch 0.3s infinite;
	}
	
	@keyframes glitch {
		0%, 100% {
			transform: translate(0);
		}
		20% {
			transform: translate(-2px, 2px);
		}
		40% {
			transform: translate(-2px, -2px);
		}
		60% {
			transform: translate(2px, 2px);
		}
		80% {
			transform: translate(2px, -2px);
		}
	}
`

const BoxHeader = styled.legend`
	margin: 0 1ch;
	transform: translateY(-10%);
`
const BoxContainer = styled.fieldset`
	position: relative;
	border: 2px solid;
	padding: 0;
	flex-shrink: 1;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	.theme-light & {
		border-color: ${slate[500]};
	}
	.theme-dark & {
		border-color: ${forest[500]};
	}
`

export function OutlineBox({
	children,
	title,
	className,
	titleClassName,
}: PropsWithChildren<{
	className?: string
	titleClassName?: string
	title: ReactNode
}>) {
	return (
		<BoxContainer className={className}>
			<BoxHeader>
				<span
					className={c(boxHeaderChild, titleClassName ?? text['display/4xl'])}
				>
					{title}
				</span>
			</BoxHeader>
			{children}
		</BoxContainer>
	)
}
