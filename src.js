const form = document.querySelector('#form')

////

fillFormElementsWithQueryParametersValues(form)

trackHistoryChanges()

form.addEventListener('submit', e => {
  e.preventDefault()

  const elements = getFormDataAsObject(form)

  console.log(elements)

  // loop over all items in the object
  for (const [key, value] of Object.entries(elements)) {
    addParamToURL(key, value)
  }
})

/////

function addParamToURL(key, value) {
  // Create a new URL object
  const url = new URL(window.location)

  // Update the query parameter
  // Do not use append as that creates duplicates
  if (value) {
    url.searchParams.set(key, encodeURI(value))
  } else {
    url.searchParams.delete(key) // Remove the parameter if the input is empty
  }

  // Update the browser URL without reloading the page
  window.history.replaceState({}, '', url)
}

function trackHistoryChanges() {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  // Override pushState
  history.pushState = function (state, title, url) {
    const result = originalPushState.apply(this, arguments)
    window.dispatchEvent(new CustomEvent('pushstate', { detail: { state, title, url } }))
    return result
  }

  // Override replaceState
  history.replaceState = function (state, title, url) {
    const result = originalReplaceState.apply(this, arguments)
    window.dispatchEvent(new CustomEvent('replacestate', { detail: { state, title, url } }))
    return result
  }

  // Listen for custom pushstate and replacestate events
  window.addEventListener('pushstate', event => {
    console.log('pushState called:', event.detail)
  })

  window.addEventListener('replacestate', event => {
    console.log('replaceState called:', event.detail)
  })

  // Listen for popstate as well
  window.addEventListener('popstate', event => {
    console.log('popstate event triggered:', event.state)
  })
}

function getFormDataAsObject(form) {
  const formData = new FormData(form)
  return Object.fromEntries(formData)
}

function getQueryParametersAsObject() {
  function getParams() {
    // This returns an object with all the query parameters in the URL
    // Example: { name: 'Pepe', age: '23' }
    return Object.fromEntries(new URLSearchParams(window.location.search))
  }

  const params = getParams() // Set initial query parameters.

  // Not sure what this does exactly - is it needed or not?
  window.addEventListener('popstate', getParams)

  return params
}

function fillFormElementsWithQueryParametersValues(form) {
  // get all query param values as an object
  const queryParams = getQueryParametersAsObject()

  // check if the object has any key|values
  if (Object.entries(queryParams).length) {
    for (const [key, value] of Object.entries(queryParams)) {
      form.elements[key].value = decodeURIComponent(value) || ''
    }
  }
}
