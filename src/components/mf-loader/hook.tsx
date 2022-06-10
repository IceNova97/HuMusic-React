import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { initialiseApp } from "@seeyon/global";

/**
 * 已经加载过的栏目的缓存
 */
const portletCache: Record<string, any> = {};

/**
 * 记录已经加载过的remoteEntry url
 */
const remoteEntryMapper: any = {};
interface RemoteCmpModel {
  /**隶属的子应用名称 */
  app: string;
  /**组件名称 */
  name: string;
  /**子应用的访问地址 */
  url?: string;
}

export type ScriptsArgs = {
  url: string;
  appId: string;
  id?: string;
  module: string;
  i18nAppName?: string;
  instanceKey?: string;
};

// 加载一个远程组件需要的参数
export type RemoteComponentProps = {
  // 项目名
  scope: string;
  // 组件名
  module: string;
  url: string;
  i18nAppName?: string;
  instanceKey?: string;
};

// 从window中获取远程加载的组件并缓存
export function loadComponent(scope: string, module: string) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // @ts-ignore
    await __webpack_init_sharing__("default");
    const container = (window as any)[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    const factory = await (window as any)[scope].get(`./${module}`);
    const Module = factory();
    portletCache[`${scope}-${module}`] = Module;
    return Module;
  };
}

export const useDynamicScript = (args: ScriptsArgs) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!args.url || !args.appId) {
      return;
    }

    // 如果已经加载过此remoteEntry，不再append script标签
    if (
      args.module !== "Entry" &&
      (remoteEntryMapper[args.url] || (window as any)[args.appId])
    ) {
      setReady(true);
      setFailed(false);
      return;
    }

    const element = document.createElement("script");

    element.src = args.url + "?mf=" + new Date().getTime();
    element.type = "text/javascript";
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.info(`Dynamic Script onload: ${args.url}`);
      setReady(true);
      document.head.removeChild(element);
      remoteEntryMapper[args.url] = "1";
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      document.head.removeChild(element);
      setReady(false);
      setFailed(true);
    };

    new Promise((resolve, reject) => {
      initialiseApp(args.appId, resolve, reject, "all");
    })
      .catch(() => {
        console.log("国际化资源加载不全");
      })
      .finally(() => {
        document.head.appendChild(element);
      });

    return () => {
      // console.log(`Dynamic Script Removed: ${args.url}`);
      Reflect.deleteProperty(remoteEntryMapper, args.url);
    };
  }, [args.url, args.module, args?.id]);

  return {
    ready,
    failed,
  };
};

export function useComponent(name: string, portlet: Record<string, string>) {
  const [Cmp, setCmp] = useState<{ cmp?: any; jsxCmpt?: boolean }>({});
  const [portletConfig, setPortletConfig] = useState<RemoteComponentProps>();
  const state = useSelector((state) => state) as any;

  useEffect(() => {
    const remoteCmpts: Record<string, RemoteCmpModel> = {};
    if (portlet) {
      const { appId, exposeName } = portlet;
      remoteCmpts[`${appId}-${exposeName}`] = { app: appId, name: exposeName };
    }
    // 1.cache中有直接取
    // TODO 改造为缓存或者innerDB？
    if (portletCache[name]) {
      setCmp({ cmp: portletCache[name] });
      // 有缓存重新设置config
      const { appId, exposeName } = portlet;
      const remotesUrlMap = state.applications?.apps;
      const appUrl = remotesUrlMap?.[appId]?.url;
      setPortletConfig({
        scope: appId,
        url: appUrl,
        module: exposeName,
      });
      return;
    }

    const cmpData = remoteCmpts[name];
    // 2.如果所有已注册的栏目中无此栏目，则返回默认渲染
    // if (!cmpData) {
    //   setCmp({ cmp: NoFoundCmp, jsxCmpt: true });
    //   return;
    // }

    // 3.其余情况，则去拉取对应子应用的remotes代码，然后加载其中的组件
    const { app: appName, name: cmptName } = cmpData;
    // todo，兼容性写法，后续需要修改兼容main-mobile工程的栏目渲染
    const remotesUrlMap = state.applications?.apps;
    const appUrl = remotesUrlMap?.[appName]?.url;
    if (!appUrl) {
      setCmp({ cmp: NoFoundCmp, jsxCmpt: true });
      return;
    }
    //尚未加载过此远程组件，返回url
    setPortletConfig({
      scope: appName,
      url: appUrl,
      module: cmptName,
    });
    setCmp({});
  }, [name, state.applications.apps]);

  return { Cmp, portletConfig };
}

/**
 * 获取远程非栏目组件
 * 如果缓存中有此组件直接返回
 * 否则返回获取此组件需要的配置
 * @param name
 * @param appId
 * @returns
 */
export function getRemoteSettingCmp(
  name: string,
  appId: string,
  remotesUrlMap: any
) {
  const res: any = {
    Cmp: null,
    cmptConfig: null,
  };
  // 1.cache中有直接取
  // TODO 改造为缓存或者innerDB？
  if (portletCache[`${appId}-${name}`]) {
    res.Cmp = { cmp: portletCache[`${appId}-${name}`] };
    return res;
  }

  // 判断此appId是否注册
  if (!remotesUrlMap || !remotesUrlMap[appId]) {
    return res;
  }

  res.cmptConfig = {
    scope: appId,
    url: remotesUrlMap[appId].url,
    module: name,
  };

  return res;
}

const NoFoundCmp: React.FC<{ message?: string }> = ({
  message = "未经注册的栏目",
}) => {
  return <div>{message}</div>;
};
