import { createContext } from 'react'
import { pageLabel } from './pages'

/** 各冊講義頁碼標籤的產生方式（第二冊預設；第三冊提供自己的對照）。 */
export const PageLabelContext = createContext<(text: string) => string>(pageLabel)
