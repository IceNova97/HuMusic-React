import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { filterIndex } from "../../api/utils";
import { getRankList } from "./store";
import { List, ListItem, Container, SongList } from "./style";
import Scroll from "../../baseUI/scroll";
import Loading from "../../baseUI/loading";
import { Outlet, useNavigate } from "react-router-dom";

function Rank() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rankList, loading, songsCount } = useSelector((state) => {
    return {
      rankList: state.getIn(["rank", "rankList"])?.toJS() || [],
      loading: state.getIn(["rank", "loading"]),
      songsCount: state.getIn(["player", "playList"]).size,
    };
  });
  useEffect(() => {
    dispatch(getRankList());
  }, []);
  const globalStartIndex = filterIndex(rankList);
  const officialList = rankList.slice(0, globalStartIndex);
  const globalList = rankList.slice(globalStartIndex);
  const enterDetail = (detail) => {
    navigate(`${detail.id}`);
  };
  // 这是渲染榜单列表函数，传入 global 变量来区分不同的布局方式
  const renderRankList = (list, global) => {
    return (
      <List globalRank={global}>
        {list.map((item, index) => {
          return (
            <ListItem
              key={index}
              tracks={item.tracks}
              onClick={() => enterDetail(item)}
            >
              <div className="img_wrapper">
                <img src={item.coverImgUrl} alt="" />
                <div className="decorate"></div>
                <span className="update_frequency">{item.updateFrequency}</span>
              </div>
              {renderSongList(item.tracks)}
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderSongList = (list) => {
    return list.length ? (
      <SongList>
        {list.map((item, index) => {
          return (
            <li key={index}>
              {index + 1}. {item.first} - {item.second}
            </li>
          );
        })}
      </SongList>
    ) : null;
  };

  // 榜单数据未加载出来之前都给隐藏
  let displayStyle = loading ? { display: "none" } : { display: "" };

  return (
    <Container play={songsCount}>
      <Scroll>
        <div>
          <h1 className="official" style={displayStyle}>
            {" "}
            官方榜{" "}
          </h1>
          {renderRankList(officialList)}
          <h1 className="global" style={displayStyle}>
            {" "}
            全球榜{" "}
          </h1>
          {renderRankList(globalList, true)}
          <Loading show={loading}></Loading>
        </div>
      </Scroll>
      <Outlet />
    </Container>
  );
}

export default React.memo(Rank);
