import React, { lazy, Suspense } from "react";
import Home from "../application/Home";
const RecommendComponent = lazy(() => import("../application/Recommend/"));
const SingersComponent = lazy(() => import("../application/Singers/"));
const RankComponent = lazy(() => import("../application/Rank/"));
const AlbumComponent = lazy(() => import("../application/Album/"));
const SingerComponent = lazy(() => import("./../application/Singer/"));
const SearchComponent = lazy(() => import("./../application/Search/"));

const SuspenseComponent = (props) => {
  const { Ele, ...rest } = props;
  return (
    <Suspense fallback={null}>
      <Ele {...rest}></Ele>
    </Suspense>
  );
};

const routes = [
  {
    path: "/",
    element: <Home />,
    children: [
      {
        index: true,
        element: <SuspenseComponent Ele={RecommendComponent} />,
      },
      {
        path: "recommend",
        element: <SuspenseComponent Ele={RecommendComponent} />,
        children: [
          {
            path: ":id",
            element: <SuspenseComponent Ele={AlbumComponent} />,
          },
        ],
      },
      {
        path: "singers",
        element: <SuspenseComponent Ele={SingersComponent} />,
        children: [
          {
            path: ":id",
            element: <SuspenseComponent Ele={SingerComponent} />,
          },
        ],
      },
      {
        path: "rank",
        element: <SuspenseComponent Ele={RankComponent} />,
        children: [
          {
            path: ":id",
            element: <SuspenseComponent Ele={AlbumComponent} />,
          },
        ],
      },
      {
        path: "album/:id",
        element: <SuspenseComponent Ele={AlbumComponent} />,
      },
      {
        path: "search/*",
        element: <SuspenseComponent Ele={SearchComponent} />,
      },
    ],
  },
];
export default routes;
