import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen,
} from "./store/actionCreators";
import MiniPlayer from "./miniPlayer";
import NormalPlayer from "./normalPlayer";
import { findIndex, getSongUrl, isEmptyObject, shuffle } from "../../api/utils";
import Toast from "./../../baseUI/Toast";
import { playMode } from "../../api/config";
import PlayList from "./PlayList";
import { getLyricRequest } from "../../api/request";
import Lyric from "./../../api/lyric-parser";

function Player(props) {
  const dispatch = useDispatch();
  const {
    fullScreen,
    playing,
    currentSong,
    showPlayList,
    mode,
    currentIndex,
    playList,
    sequencePlayList,
  } = useSelector((state) => {
    return {
      fullScreen: state.getIn(["player", "fullScreen"]),
      playing: state.getIn(["player", "playing"]),
      currentSong: state.getIn(["player", "currentSong"]).toJS() || {},
      showPlayList: state.getIn(["player", "showPlayList"]),
      mode: state.getIn(["player", "mode"]),
      currentIndex: state.getIn(["player", "currentIndex"]),
      playList: state.getIn(["player", "playList"]).toJS() || [],
      sequencePlayList:
        state.getIn(["player", "sequencePlayList"]).toJS() || [],
    };
  });
  //记录当前的歌曲，以便于下次重渲染时比对是否是一首歌
  const [preSong, setPreSong] = useState({});
  const [modeText, setModeText] = useState("");
  const toastRef = useRef();
  const songReady = useRef(true);
  const currentLyric = useRef();

  const handleClearPreSong = () => {
    setPreSong({});
  };

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady.current // 标志位为 false
    )
      return;
    const current = playList[currentIndex];
    dispatch(changeCurrentSong(current)); //赋值currentSong
    setPreSong(current);
    songReady.current = false; // 把标志位置为 false, 表示现在新的资源没有缓冲完成，不能切歌
    dispatch(changeCurrentSong(current)); // 赋值 currentSong
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      audioRef.current.play().then(() => {
        songReady.current = true;
      });
    });
    dispatch(changePlayingState(true)); //播放状态
    setCurrentTime(0); //从头开始播放
    setDuration((current.dt / 1000) | 0); //时长
    getLyric(current.id);
    setCurrentTime(0);
    setDuration((current.dt / 1000) | 0);
  }, [playList, currentIndex]);

  const handleError = () => {
    songReady.current = true;
    alert("播放出错");
  };

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);
  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //即时歌词
  const [currentPlayingLyric, setPlayingLyric] = useState("");
  //当前行数
  const currentLineNum = useRef(0);
  //歌曲播放进度
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;
  const toggleFullScreenDispatch = (data) => {
    dispatch(changeFullScreen(data));
  };
  const togglePlayListDispatch = (data) => {
    dispatch(changeShowPlayList(data));
  };
  const clickPlaying = (e, state) => {
    e.stopPropagation();
    dispatch(changePlayingState(state));
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000);
    }
  };
  const audioRef = useRef();
  const updateTime = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  const onProgressChange = (curPercent) => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      dispatch(changePlayingState(true));
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000);
    }
  };
  //一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    changePlayingState(true);
    audioRef.current.play();
  };

  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) dispatch(changePlayingState(true));
    dispatch(changeCurrentIndex(index));
  };

  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) dispatch(changePlayingState(true));
    dispatch(changeCurrentIndex(index));
  };

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      dispatch(changePlayList(sequencePlayList));
      let index = findIndex(currentSong, sequencePlayList);
      dispatch(changeCurrentIndex(index));
      setModeText("顺序循环");
    } else if (newMode === 1) {
      //单曲循环
      dispatch(changePlayList(sequencePlayList));
      setModeText("单曲循环");
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      dispatch(changePlayList(newList));
      dispatch(changeCurrentIndex(index));
      setModeText("随机播放");
    }
    dispatch(changePlayMode(newMode));

    toastRef.current.show();
  };
  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  };

  const handleLyric = ({ lineNum, txt }) => {
    if (!currentLyric.current) return;
    currentLineNum.current = lineNum;
    setPlayingLyric(txt);
  };

  const getLyric = (id) => {
    let lyric = "";
    if (currentLyric.current) {
      currentLyric.current.stop();
    }
    // 避免 songReady 恒为 false 的情况
    getLyricRequest(id)
      .then((data) => {
        lyric = data.lrc.lyric;
        if (!lyric) {
          currentLyric.current = null;
          return;
        }
        currentLyric.current = new Lyric(lyric, handleLyric);
        currentLyric.current.play();
        currentLineNum.current = 0;
        currentLyric.current.seek(0);
      })
      .catch(() => {
        songReady.current = true;
        audioRef.current.play();
      });
  };
  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          percent={percent}
          togglePlayList={togglePlayListDispatch}
        />
      )}
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          duration={duration} //总时长
          currentTime={currentTime} //播放时间
          percent={percent} //进度
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          mode={mode}
          changeMode={changeMode}
          togglePlayList={togglePlayListDispatch}
          currentLyric={currentLyric.current}
          currentPlayingLyric={currentPlayingLyric}
          currentLineNum={currentLineNum.current}
        />
      )}
      <audio
        onTimeUpdate={updateTime}
        ref={audioRef}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <Toast text={modeText} ref={toastRef}></Toast>
      <PlayList handleClearAll={handleClearPreSong} />
    </div>
  );
}

export default React.memo(Player);
