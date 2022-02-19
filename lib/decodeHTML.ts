export const decodeHTML = (rawText: string) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = rawText
  return txt.value
}
