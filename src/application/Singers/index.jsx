import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Horizon from "../../baseUI/horizon-item";
import Scroll from "../../baseUI/scroll";
import { categoryTypes, alphaTypes } from "../../api/config";
import { NavContainer, List, ListItem, ListContainer } from "./style";
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList,
} from "./store/actionCreators";
import Loading from "../../baseUI/loading";
import LazyLoad, { forceCheck } from "react-lazyload";
import { useNavigate, Outlet } from "react-router-dom";

function Singers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [alpha, setAlpha] = useState("");
  const handleUpdateAlpha = useCallback((val) => {
    setAlpha(val);
  }, []);

  const handleUpdateCatetory = useCallback((val) => {
    setCategory(val);
  }, []);

  const enterDetail = (id) => {
    navigate(`${id}`);
  };

  const {
    singerList,
    enterLoading,
    pullDownLoading,
    pullUpLoading,
    pageCount,
    songsCount,
  } = useSelector((state) => {
    return {
      singerList: state.getIn(["singers", "singerList"])?.toJS() || [],
      enterLoading: state.getIn(["singers", "enterLoading"]),
      pullUpLoading: state.getIn(["singers", "pullUpLoading"]),
      pullDownLoading: state.getIn(["singers", "pullDownLoading"]),
      pageCount: state.getIn(["singers", "pageCount"]),
      songsCount: state.getIn(["player", "playList"]).size,
    };
  });

  useEffect(() => {
    !singerList.size && dispatch(getHotSingerList());
  }, []);

  //  // 滑到最底部刷新部分的处理
  const handlePullUp = () => {
    dispatch(changePullUpLoading(true));
    dispatch(changePageCount(pageCount + 1));
    if (category === "" && alpha === "") {
      dispatch(refreshMoreHotSingerList());
    } else {
      dispatch(refreshMoreSingerList(category, alpha));
    }
  };
  // //顶部下拉刷新
  const handlePullDown = () => {
    dispatch(changePullDownLoading(true));
    dispatch(changePageCount(0)); //属于重新获取数据
    if (category === "" && alpha === "") {
      dispatch(getHotSingerList());
    } else {
      dispatch(getSingerList(category, alpha));
    }
  };

  useEffect(() => {
    dispatch(changePageCount(0)); //由于改变了分类，所以pageCount清零
    dispatch(changeEnterLoading(true)); //loading，现在实现控制逻辑，效果实现放到下一节，后面的loading同理
    dispatch(getSingerList(category, alpha));
  }, [category, alpha]);

  // 渲染函数，返回歌手列表
  const renderSingerList = useMemo(() => {
    return (
      <List>
        {singerList.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + "" + index}
              onClick={() => enterDetail(item.id)}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require("./singer.png")}
                      alt="music"
                    />
                  }
                >
                  <img
                    src={`${item.picUrl}?param=300x300`}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name">{item.name}</span>
            </ListItem>
          );
        })}
      </List>
    );
  }, [singerList]);
  const renderHeader = useMemo(() => {
    return (
      <NavContainer>
        <Horizon
          list={categoryTypes}
          title={"分类 (默认热门):"}
          handleClick={handleUpdateCatetory}
          oldVal={category}
        ></Horizon>
        <Horizon
          list={alphaTypes}
          title={"首字母:"}
          handleClick={handleUpdateAlpha}
          oldVal={alpha}
        ></Horizon>
      </NavContainer>
    );
  }, []);
  return (
    <div>
      {renderHeader}
      <ListContainer play={songsCount}>
        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList}
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
      <Outlet />
    </div>
  );
}

export default React.memo(Singers);
