import themes from '../themes'

const css = (theme: typeof themes[keyof typeof themes]): string => `
  .text-light {
    color: #${theme.text_color};
  }
  .text-primary {
    color: #${theme.title_color};
  }
  .bg-gray-gray0 {
    background-color: #${theme.bg_color};
  }
  .border-b { border: none }
  circle {
    fill: #${theme.title_color} !important;
  }
  path {
    fill: #${theme.bg_color} !important;
  }
`

export default css
