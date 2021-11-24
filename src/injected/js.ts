const js = (): string => `
  const getSvgFromUrl = async (url) => {
    const data = await fetch(url)
    const text = await data.text()
    return text
  };
  // remove navbar
  document.querySelector('.navbar-border').remove();
  // remove copy profile link button
  document.querySelector('h1').nextElementSibling.nextElementSibling.nextElementSibling.remove();
  // inline <img /> svgs to be able to theme them
  Array.from(document.querySelectorAll('img[alt*=profile-link]')).forEach(
    async (node) => {
      const svg = document.createElement('svg')
      svg.className = 'w-5 h-5 hover:opacity-60 lg:mx-2 mr-4'
      svg.innerHTML = await getSvgFromUrl(node.currentSrc)
      node.replaceWith(svg)
    }
  )
`

export default js
