import ErrorBoundary from '@components/error-boundary';
import { Skeleton } from '@seeyon/ui';
import { loadComponent, useDynamicScript } from './hook';
import React from 'react';
import { i18n } from '@seeyon/global';
const { t } = i18n;
interface ModuleFederationLoaderProps {
  /**remoteEntry.js的url */
  url: string;
  /**应用id */
  appId: string;
  /**模块名称 */
  module: string;
  title?: string;
  properties?: {
    [prop: string]: any;
  };
  innerRef?: any;
  pathname?: string;
  id?: string;
}

/**
 * 远程加载栏目
 * @param props
 */
const ModuleFederationLoader: React.FC<ModuleFederationLoaderProps> = ({
  url,
  appId,
  module,
  properties = {},
  innerRef,
  title = '',
  id,
}) => {
  const { ready, failed } = useDynamicScript({
    url,
    appId,
    module,
    id,
  });

  if (!ready) {
    return title ? (
      <span>
        {t('main.mobile.loading')}『{title}』
      </span>
    ) : null;
  }

  if (failed) {
    return (
      <span>
        {t('main.mobile.load')}
        {title}
        {t('common.fail.label')}: {url}
      </span>
    );
  }

  const Component = React.lazy(loadComponent(appId, module));
  const refProp = {} as any;
  if (innerRef) {
    refProp.ref = innerRef;
  }

  const { needSkeleton = true, ...rest } = properties;
  return (
    <ErrorBoundary>
      <React.Suspense fallback={needSkeleton ? <Skeleton active /> : null}>
        <Component appId={appId} {...rest} {...refProp} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

const MFLoader = React.memo(ModuleFederationLoader, (props, nextProps) => {
  // 这里有点不好理解
  // 当location的pathname变化(一级导航二级导航都有可能)
  // 如果pathname不包含当前应用的appId，则不需要重新渲染当前应用
  // 避免应用错误地修改路由
  if (nextProps.pathname && !nextProps.pathname?.includes(nextProps.appId)) {
    return true;
  }
  return false;
});

export default MFLoader;
