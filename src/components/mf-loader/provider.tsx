import { createContext, FC, useState, SetStateAction, Dispatch } from 'react';

type InternalMap = { [key: string]: boolean };

interface ModuleFederationCxt {
  failedMap: InternalMap;
  readyMap: InternalMap;
  setFailedMap: Dispatch<SetStateAction<InternalMap>>;
  setReadyMap: Dispatch<SetStateAction<InternalMap>>;
}
const defaultInternalMap = {} as InternalMap;

export const moduleFederationCtx = createContext({} as ModuleFederationCxt);

export const ModuleFederationProvider: FC = ({ children }) => {
  const [failedMap, setFailedMap] = useState(defaultInternalMap);
  const [readyMap, setReadyMap] = useState(defaultInternalMap);

  return (
    <moduleFederationCtx.Provider value={{ failedMap, readyMap, setFailedMap, setReadyMap }}>
      {children}
    </moduleFederationCtx.Provider>
  );
};
