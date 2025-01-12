# A word about `NetworkState`

By nature, the network calls are asynchronous. Therefore, in most HTTP clients, the network call
results are modeled after the promises. The promises work well with javascript, yet in react 
components, promises makes confusions. Mycoriza prefer states to promise, as handling state is more natural.

## Network State
Mycoriza introduces a new generic type `NetworkState<T>`. It follows predefined state flow as follows.

![Network State diagram](https://kroki.io/ditaa/svg/eNq9kj0OAiEQhfs5xVxgwwU2dhZ2RltigxOzDSbAGos5vDHIMvxtKR2Pj5nh8QAAu0tNv6WhI07TgRFPdgmIPGdVwiyq6QQoIfIARrw1yg783fHxTWYNtAdfyFPgYeXtuLz6quDIDYbJpg0nV8LAM9n7Yh_ZQF3BjOldwsAkcQNXnpRz_xW-rsaQ9_FrnHu6Bm6tqio3AeSt6izCpItExl6pRzd12I0lwAcHqpJr)

* **Init**: This state means that the network call is not yet initiated. 
* **Pending**: Upon initiating the call, the `NetworkState` moves to `Pending` state. Loaders can be rendered within this state
* **Success**: `NetworkState` moves to this state upon a successful completion of the network call. This state contains a
a property called `data` which contains the result of the execution.
* **Error**: `NetworkState` moves to this state upon a failure of the network call. This state contains the metadata about 
the failure of the network call.

## Typesafe Utilities

Some of those utility functions contains additional information related to the operation. To mine out this information,
Mycoriza provides a set of utility functions as follows

### isInit 

This function checks whether the NetworkState is in init state. Usage can be listed as follows.

```jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isInit(state)) {
        return <InitStateContent/>
    }
    
    return null;
}
``` 

### isPending

This function checks whether the NetworkState is in pending state. Usually the loaders can be rendered in this state.

```jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isPending(state)) {
        return <Loader/>
    }

    return null;
}
```

### isSuccess

This function check whether the NetworkState is in success state. This state contains the result in the 
`data` property. 
It can be used as follows.

```jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()
    
    // Following code fails as state is not confirmed to be in Success state.
    console.log(state.data)
    if (isSuccess(state)) {
        return <SuccessContent/>
    }

    return null;
}
```

### isError

This function check whether the NetworkState is in success state. This state contains the error in the `error` property.
It can be used as follows.

```jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isError(state)) {
        return <Error/>
    }

    return null;
}
```

## Interoperability

While the `NetworkStates`s are tempting, there might be instances where you still need to use `Promises`.
Therefore, Mycoriza provides two additional hooks to support this interoperability.

### `useAsNetworkState` hook

Features like `async-storage` and permissions in react-native uses `Promise`. To port those features to the 
`NetworkState`, Mycoriza provides `useAsNetworkState` hook. This hook accepts a function which provides a promise,
and returns the regular Mycoriza hook results. The hook can be used as below.

```jsx
    function MyComponent() {
        const [state, execute] = useAsNetworkState(() => new Promise((resolve, reject) => { ... })
      
        useEffect(() => {
            if(isSuccess(state)) {
              //do on success
            } else if (isError(state)) {
              //do on error
            }
        }, [state.state])
    
        return null;
    }
```

### `useAsPromise` hook

When dealing with asynchronous behaviors, most of the libraries out there requires promises. In order to support
this functionality, Mycoriza provides `useAsPromise` hook. This hook accepts a regular Mycoriza generated hook 
result and returns a function which creates a `Promise`.

Each time the result function is called, it creates a promise and upon network sate change to terminated state, 
the promise completes. The hook can be used as below.

```jsx
function MyComponent() {
    const fetchData = useAsPromise(useDataAsNetworkState());
  
    useEffect(() => {
        fetchData().then(data => {
          //Do on data
        }).catch(e => {
          //Do on error
        })
    }, [])
    
    return null;
}
```
