import { styled } from '@linaria/react'

import TamashiiLogo from '../assets/icons/tamashii-box.svg?react'
import Symbol02 from '../assets/icons/symbol-02.svg?react'
import CornerFleur from '../assets/icons/corner-fleur.svg?react'
import Sun from '../assets/icons/sun.svg?react'
import Moon from '../assets/icons/moon.svg?react'
import { css } from '@linaria/core'
import { text } from '../fonts.js'
import { Button } from './Button.js'
import { c, svgFillCurrentColor } from '../utils.js'
import { useDarkMode } from 'usehooks-ts'
import { iconClass } from '../icon.js'
import { SymbolSeparatedItems } from './SymbolSeparatedItems.js'
import { Link } from '@tanstack/react-router'

const smallBreakpoint = '872px'

const NavContainer = styled.div`
	display: flex;
	flex-direction: row;
	padding: 16px 24px;
	background: var(--color-bg);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
`

const NavMain = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	max-width: 1400px;
	margin: 0 auto;
	gap: 32px;

	& > .blurb {
		flex: 1;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	& > .buttons {
		display: flex;
		gap: 8px;
	}

	@media (width < ${smallBreakpoint}) {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		
		& > .buttons {
			align-self: flex-end;
		}

		& > .blurb {
			text-align: left;
		}
	}

	& a.homelink,
	a:visited.homelink {
		text-decoration: none;
		color: var(--color-fg);
		transition: opacity 0.2s;
		
		&:hover {
			opacity: 0.8;
		}
	}
`

const VerticalStack = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: fit-content;

	& span {
		display: inline-flex;
		align-items: center;
	}
`

const tamashiiLogo = css`
	width: 1em;
	height: 1em;
	padding-right: 12px;
`

const symbol02 = css`
	padding-left: 8px;
	height: 1.5em;
	width: 2em;
`
const Chip = styled.div`
	background: rgba(255, 255, 255, 0.15);
	color: var(--color-fg);
	width: fit-content;
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 0.75rem;
	letter-spacing: 0.05em;
	border: 1px solid rgba(255, 255, 255, 0.2);
`

const cornerFleur = css`
	min-width: 128px;
	height: 128px;

	@media (width < ${smallBreakpoint}) {
		position: absolute;
		overflow: visible;
		top: 8px;
		right: 0;
	}

	@media (width < 380px) {
		width: 25vw;
		height: 25vw;
	}
`
export function Header() {
	const {
		isDarkMode,
		enable: enableDarkMode,
		disable: disableDarkMode,
	} = useDarkMode()
	return (
		<NavContainer>
			<NavMain>
				<VerticalStack>
					<Link to="/" className="homelink">
						<span className={text['display/5xl']} style={{ 
							fontFamily: 'monospace',
							fontWeight: 'bold',
							letterSpacing: '0.05em'
						}}>
							<span>TAMASHII-NETWORK</span>
						</span>
					</Link>
					<span className={text['body/sm/medium']} style={{ 
						opacity: 0.7,
						fontSize: '0.75rem',
						letterSpacing: '0.1em'
					}}>
						DISTRIBUTED INTELLIGENCE NETWORK
					</span>
					<Chip className={text['aux/xs/semibold']}>TESTNET</Chip>
				</VerticalStack>
				<VerticalStack className={c(text['body/sm/medium'], 'blurb')}>
					<div>Cooperative training over&#8209;the&#8209;internet</div>
					<SymbolSeparatedItems>
						<a
							href="https://github.com/TamashiiFoundation/tamashii"
							title="tamashii's source code"
						>
							github
						</a>
						<a
							href="https://forum.tamashii.network/"
							title="discuss tamashii's code & propose new models"
						>
							forum
						</a>
						<a
							href="https://nousresearch.com/nous-tamashii/"
							title="read the tamashii announcement"
						>
							about tamashii
						</a>
						<a
							href="https://docs.tamashii.network/"
							title="read about how tamashii works"
						>
							docs
						</a>
					</SymbolSeparatedItems>
				</VerticalStack>
				<VerticalStack className="buttons">
					<Button
						style="theme"
						icon={{ side: 'left', svg: Sun }}
						pressed={!isDarkMode}
						onClick={disableDarkMode}
					>
						Light
					</Button>
					<Button
						style="theme"
						icon={{ side: 'left', svg: Moon }}
						pressed={isDarkMode}
						onClick={enableDarkMode}
					>
						Dark
					</Button>
				</VerticalStack>
			</NavMain>
		</NavContainer>
	)
}

