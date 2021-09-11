import {MycorizaExtension, MycorizaHookResultType} from "../engine";
import {useEffect} from "react";

/**
 * Executes the cleanup function upon component unload.
 * @param data
 */
export function useCleanup<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F>  {
  useEffect(() => {
    return data[2]
  }, [])
  return data;
}

/**
 *
 */
export function cleanUpOnUnload<T, F extends (...args: any) => void>(): MycorizaExtension<T, F> {
  return {
    useExtendedLogic([state, fetch, cleanup]: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F> {
      useEffect(() => {
        return cleanup
      }, [])
      return [state, fetch, cleanup];
    }
  }
}
