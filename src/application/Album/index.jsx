import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, TopDesc, Menu } from "./style";
import { CSSTransition } from "react-transition-group";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./../../baseUI/header";
import Scroll from "../../baseUI/scroll";
import Loading from "../../baseUI/loading";
import { getCount, isEmptyObject } from "./../../api/utils";
import style from "../../assets/global-style";
import { changeEnterLoading, getAlbumList } from "./store/actionCreators";
import SongsList from "../SongsList";
import MusicNote from "../../baseUI/music-note/index";

export const HEADER_HEIGHT = 45;

function Album(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("id: ", id);

  // const location = useLocation();
  const dispatch = useDispatch();
  const [showStatus, setShowStatus] = useState(true);
  const [title, setTitle] = useState("歌单");
  const [isMarquee, setIsMarquee] = useState(false); // 是否跑马灯
  const headerEl = useRef();
  const { currentAlbum, enterLoading, songsCount } = useSelector((state) => {
    return {
      currentAlbum: state.getIn(["album", "currentAlbum"])?.toJS() || [],
      enterLoading: state.getIn(["album", "enterLoading"]),
      songsCount: state.getIn(["player", "playList"]).size,
    };
  });
  const musicNoteRef = useRef();

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y });
  };

  useEffect(() => {
    dispatch(changeEnterLoading(true));
    dispatch(getAlbumList(id));
  }, []);

  const handleBack = useCallback(() => {
    setShowStatus(false);
  }, []);
  const handleClick = () => {
    navigate(-1);
  };
  const handleScroll = useCallback(
    (pos) => {
      let minScrollY = -HEADER_HEIGHT;
      let percent = Math.abs(pos.y / minScrollY);
      let headerDom = headerEl.current;
      // 滑过顶部的高度开始变化
      if (pos.y < minScrollY) {
        headerDom.style.backgroundColor = style["theme-color"];
        headerDom.style.opacity = Math.min(1, (percent - 1) / 2);
        setTitle(currentAlbum.name);
        setIsMarquee(true);
      } else {
        headerDom.style.backgroundColor = "";
        headerDom.style.opacity = 1;
        setTitle("歌单");
        setIsMarquee(false);
      }
    },
    [currentAlbum]
  );

  const renderTopDesc = () => {
    return (
      <TopDesc background={currentAlbum.coverImgUrl}>
        <div className="background">
          <div className="filter"></div>
        </div>
        <div className="img_wrapper">
          <div className="decorate"></div>
          <img src={currentAlbum.coverImgUrl} alt="" />
          <div className="play_count">
            <i className="iconfont play">&#xe885;</i>
            <span className="count">
              {getCount(currentAlbum.subscribedCount)}
            </span>
          </div>
        </div>
        <div className="desc_wrapper">
          <div className="title">{currentAlbum.name}</div>
          <div className="person">
            <div className="avatar">
              <img src={currentAlbum.creator.avatarUrl} alt="" />
            </div>
            <div className="name">{currentAlbum.creator.nickname}</div>
          </div>
        </div>
      </TopDesc>
    );
  };

  const renderMenu = () => {
    return (
      <Menu>
        <div>
          <i className="iconfont">&#xe6ad;</i>
          评论
        </div>
        <div>
          <i className="iconfont">&#xe86f;</i>
          点赞
        </div>
        <div>
          <i className="iconfont">&#xe62d;</i>
          收藏
        </div>
        <div>
          <i className="iconfont">&#xe606;</i>
          更多
        </div>
      </Menu>
    );
  };

  return (
    <CSSTransition
      in={showStatus} // 是否打开
      timeout={300} // 动画的持续时间
      classNames="fly" // 附加css样式的前缀
      appear={true} // 是否开启进入时的css样式
      unmountOnExit
      onExited={handleClick}
    >
      <Container play={songsCount}>
        <Header
          ref={headerEl}
          title={title}
          handleClick={handleBack}
          isMarquee={isMarquee}
        ></Header>
        {!isEmptyObject(currentAlbum) && (
          <Scroll bounceTop={false} onScroll={handleScroll}>
            <div>
              {renderTopDesc()}
              {renderMenu()}
              <SongsList
                songs={currentAlbum.tracks}
                collectCount={currentAlbum.subscribedCount}
                showCollect={true}
                showBackground={true}
                musicAnimation={musicAnimation}
              />
            </div>
          </Scroll>
        )}
        <Loading show={enterLoading} />
        <MusicNote ref={musicNoteRef}></MusicNote>
      </Container>
    </CSSTransition>
  );
}

export default React.memo(Album);
