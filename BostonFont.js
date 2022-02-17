var bostonFontStyles = document.createElement("style");
document.head.appendChild(bostonFontStyles);
bostonFontStyles.setAttribute("boston-font-styles", "");
bostonFontStyle.textContent = `
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 100; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonLight.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 100; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonLightIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 200; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonExtraLight.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 200; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonExtraLightIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 300; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonLight.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 300; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonLightIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 400; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonRegular.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 400; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonRegularIt.otf")}

  @font-face {font-family: 'Boston', font-style: normal; font-weight: 500; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonSemiBold.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 500; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonSemiBoldIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 600; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonBold.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 600; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonBoldIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 700; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonBlack.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 700; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonBlackIt.otf")}
  
  @font-face {font-family: 'Boston', font-style: normal; font-weight: 800; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonHeavy.otf")}
  @font-face {font-family: 'Boston', font-style: italic; font-weight: 800; src: url("https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/BostonHeavyIt.otf")}
`

function BostonFont(styles) {
  var t = this;
  t.styles = {
    fontWeight: styles && styles.weight ? styles.weight : 400,
    fontStyle: styles && styles.style ? styles.style : "normal"
  }
  t.package = "https://cdn.jsdelivr.net/gh/mdestagreddy/Collection-JavaScript/BostonFont/";

  t.cssFont = `font-family: 'Boston', sans-serif; font-style: ${t.styles.fontStyle}; font-weight: ${t.styles.fontWeight}; `
}
