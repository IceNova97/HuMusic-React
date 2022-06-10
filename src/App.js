import { GlobalStyle } from "./style";
import { IconStyle } from "./assets/iconfont/iconfont";
import { useRoutes, HashRouter } from "react-router-dom";
import routes from "./routes";
import { Provider } from "react-redux";
import store from "./store";
const Pages = () => {
  let element = useRoutes(routes);
  return element;
};
export function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <GlobalStyle></GlobalStyle>
        <IconStyle></IconStyle>
        <Pages />
      </HashRouter>
    </Provider>
  );
}
