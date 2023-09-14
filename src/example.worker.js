self.onmessage = (event) => console.log('Worker received:', event.data)
self.postMessage('from Worker')
