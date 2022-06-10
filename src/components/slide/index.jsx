import React from "react";
import { SliderContainer } from "./style";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

function Slider(props) {
  const { bannerList } = props;

  return (
    <SliderContainer>
      <Swiper
        className="slider-container"
        modules={[Pagination]}
        loop
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        scrollbar={{ draggable: true }}
        pagination={{
          clickable: true,
        }}
      >
        {bannerList.map((slider) => {
          return (
            <SwiperSlide key={slider.imageUrl}>
              <div className="slider-nav">
                <img
                  src={slider.imageUrl}
                  width="100%"
                  height="100%"
                  alt="推荐"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="before"></div>
    </SliderContainer>
  );
}

export default React.memo(Slider);
