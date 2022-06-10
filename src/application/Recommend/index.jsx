import React, { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import Slider from "../../components/slide";
import RecommendList from "../../components/list";
import { Content } from "./style";
import Scroll from "../../baseUI/scroll";
import { getBannerList, getRecommendList } from "./store/actionCreators";
import { forceCheck } from "react-lazyload";
import Loading from "../../baseUI/loading/index";
import { Outlet } from "react-router-dom";

function Recommend() {
  const dispatch = useDispatch();
  const { bannerList, recommendList, enterLoading, songsCount } = useSelector(
    (state) => {
      return {
        bannerList: state.getIn(["recommend", "bannerList"]),
        recommendList: state.getIn(["recommend", "recommendList"]),
        enterLoading: state.getIn(["recommend", "enterLoading"]),
        songsCount: state.getIn(["player", "playList"]).size,
      };
    },
    shallowEqual
  );
  const bannerListJS = bannerList ? bannerList.toJS() : [];
  const recommendListJS = recommendList ? recommendList.toJS() : [];

  useEffect(() => {
    !bannerList.size && dispatch(getBannerList());
    !recommendList.size && dispatch(getRecommendList());
  }, []);

  return (
    // Content做外部容器显然更合适。可以灵活控制组件的边界。
    // 而如果是ScrollContainer作为外部容器，那么每个组件的边界就定死了
    <Content play={songsCount}>
      {/* 当我们滑动的时候，让下面相应的图片显示  forceCheck*/}
      <Scroll className="list" onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      <Loading show={enterLoading}></Loading>
      <Outlet />
    </Content>
  );
}

export default React.memo(Recommend);
