import React, { useState, useEffect, useCallback, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
  Container,
  HotKey,
  ShortcutWrapper,
  List,
  ListItem,
  SongItem,
} from "./style";
import SearchBox from "./../../baseUI/search-box";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getHotKeyWords,
  getSuggestList,
  changeEnterLoading,
} from "./store/actionCreators";
import { getSongDetail } from "../Player/store/actionCreators";
import Scroll from "../../baseUI/scroll";
import Loading from "../../baseUI/loading";
import LazyLoad, { forceCheck } from "react-lazyload";
import { getName } from "../../api/utils";
import MusicalNote from "../../baseUI/music-note";
function Search(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const musicNoteRef = useRef();
  const { hotList, enterLoading, suggestList, songsCount, songsList } =
    useSelector((state) => {
      return {
        hotList: state.getIn(["search", "hotList"]).toJS() || [],
        enterLoading: state.getIn(["search", "enterLoading"]),
        suggestList: state.getIn(["search", "suggestList"]).toJS() || [],
        songsCount: state.getIn(["player", "playList"]).size,
        songsList: state.getIn(["search", "songsList"]).toJS() || [],
      };
    });
  // 控制动画
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const searchBack = useCallback(() => {
    setShow(false);
  }, []);
  useEffect(() => {
    setShow(true);
  }, []);
  const handleQuery = (q) => {
    setQuery(q);
    if (!q) return;
    dispatch(changeEnterLoading(true));
    dispatch(getSuggestList(q));
  };
  const renderSingers = () => {
    let singers = suggestList.artists;
    if (!singers || !singers.length) return;
    return (
      <List>
        <h1 className="title"> 相关歌手 </h1>
        {singers.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + "" + index}
              onClick={() => {
                navigate(`/singers/${item.id}`);
              }}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require("./singer.png")}
                      alt="singer"
                    />
                  }
                >
                  <img
                    src={item.picUrl}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name"> 歌手: {item.name}</span>
            </ListItem>
          );
        })}
      </List>
    );
  };
  const renderAlbum = () => {
    let albums = suggestList.playlists;
    if (!albums || !albums.length) return;
    return (
      <List>
        <h1 className="title"> 相关歌单 </h1>
        {albums.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + "" + index}
              onClick={() => {
                navigate(`/album/${item.id}`);
              }}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require("./music.png")}
                      alt="music"
                    />
                  }
                >
                  <img
                    src={item.coverImgUrl}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name"> 歌单: {item.name}</span>
            </ListItem>
          );
        })}
      </List>
    );
  };
  const renderSongs = () => {
    return (
      <SongItem style={{ paddingLeft: "20px" }}>
        {songsList.map((item) => {
          return (
            <li key={item.id} onClick={(e) => selectItem(e, item.id)}>
              <div className="info">
                <span>{item.name}</span>
                <span>
                  {getName(item.artists)} - {item.album.name}
                </span>
              </div>
            </li>
          );
        })}
      </SongItem>
    );
  };
  const renderHotKey = () => {
    return (
      <ul>
        {hotList.map((item) => {
          return (
            <li
              className="item"
              key={item.first}
              onClick={() => {
                setQuery(item.first);
              }}
            >
              <span>{item.first}</span>
            </li>
          );
        })}
      </ul>
    );
  };
  useEffect(() => {
    setShow(true);
    // 用了 redux 缓存，不再赘述
    if (!hotList.size) dispatch(getHotKeyWords());
  }, []);
  const selectItem = (e, id) => {
    dispatch(getSongDetail(id));
    musicNoteRef.current.startAnimation({
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
    });
  };
  return (
    <CSSTransition
      in={show}
      timeout={300}
      appear={true}
      classNames="fly"
      unmountOnExit
      onExited={() => navigate(-1)}
    >
      <Container play={songsCount}>
        <div className="search_box_wrapper">
          <SearchBox
            back={searchBack}
            newQuery={query}
            handleQuery={handleQuery}
          ></SearchBox>
        </div>
        <ShortcutWrapper show={!query}>
          <Scroll>
            <div>
              <HotKey>
                <h1 className="title"> 热门搜索 </h1>
                {renderHotKey()}
              </HotKey>
            </div>
          </Scroll>
        </ShortcutWrapper>
        <ShortcutWrapper show={query}>
          <Scroll onScorll={forceCheck}>
            <div>
              {renderSingers()}
              {renderAlbum()}
              {renderSongs()}
            </div>
          </Scroll>
        </ShortcutWrapper>
        <MusicalNote ref={musicNoteRef}></MusicalNote>
        <Loading show={enterLoading} />
      </Container>
    </CSSTransition>
  );
}

export default React.memo(Search);
