import * as core from '@actions/core'
import css from './injected/css'
import fs from 'fs'
import js from './injected/js'
import puppeteer from 'puppeteer'
import themes from './themes'
import {uploadImageToGithub} from './utils'

const sizeMap = {
  sm: 400,
  md: 600,
  lg: 1920
}
type SizeMapKeys = keyof typeof sizeMap

export const WRAPPER_CLASS = '.border-b.border-primaryBorder.flex'
const DEFAULT_OUTPUT_PATH = 'images/peerlist-profile.png'

async function run(): Promise<void> {
  try {
    const username = core.getInput('username', {
      required: false,
      trimWhitespace: true
    })
    const card_size = core.getInput('card_size') || 'lg'
    const theme_name = core.getInput('theme_name') || 'default'
    const outputPath = core.getInput('outputPath') || DEFAULT_OUTPUT_PATH
    const text_color = core.getInput('text_color')
    const title_color = core.getInput('title_color')
    const bg_color = core.getInput('bg_color')

    const endpoint = `https://peerlist.io/${username}`
    const width = sizeMap?.[card_size as SizeMapKeys] || parseInt(card_size, 10)

    // theme
    const theme = themes[theme_name as keyof typeof themes]
    if (text_color) theme.text_color = text_color
    if (title_color) theme.title_color = title_color
    if (bg_color) theme.bg_color = bg_color

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable'
    })
    const page = await browser.newPage()
    await page.setViewport({
      width,
      height: 600,
      deviceScaleFactor: 2.0
    })
    await page.goto(endpoint, {waitUntil: 'networkidle0'})

    // Inject additional css & js
    page.addStyleTag({
      content: `
        ${WRAPPER_CLASS} {
          position: relative;
        }
        ${WRAPPER_CLASS}:after {
          content: "⚡by peerlist.io/${username}";
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #${theme.text_color}
        }
      `
    })
    if (theme_name !== 'default') {
      page.addStyleTag({
        content: css(theme)
      })
    }
    await page.addScriptTag({
      content: js()
    })

    await page.waitForSelector(`${WRAPPER_CLASS}`)
    const element = await page.$(`${WRAPPER_CLASS}`)

    if (element == null) {
      await browser.close()
      return
    }

    await element.screenshot({path: 'peerlist-profile.png'})

    await browser.close()

    const imagePath = './peerlist-profile.png'
    const bytes = fs.readFileSync(imagePath, 'binary')
    const buffer = Buffer.from(bytes, 'binary')
    const imageContent = buffer.toString('base64')

    await uploadImageToGithub(imageContent, outputPath)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
