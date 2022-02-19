export const loading = (context) => {
  const $loading = document.getElementById('loading')
  const $loadingBar = $loading.find('#loading-bar')
  const $context = $loadingBar.find('#context')
  const $progress = $loadingBar.find('#progress')
  $context.text(context || '')

  return (min: number) => (max: number) => () => {
    if (min >= max) {
      $loading.fadeOut()
      return
    }

    const percentage = Math.min(Math.floor((min * 100) / max), 100)
    $loading.fadeIn()
    $progress.text(`${percentage}%`)
    $loadingBar.css('width', `${percentage}%`)
    ++min
  }
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
