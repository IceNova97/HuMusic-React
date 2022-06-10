import styled from "styled-components";
import style from "../../assets/global-style";
// 由于基础组件样式较少，直接写在 index.js 中
export const List = styled.div`
  display: flex;
  align-items: center;
  height: 30px;
  overflow: hidden;
  width: fit-content;
  > span:first-of-type {
    display: block;
    flex: 0 0 auto;
    padding: 5px 0;
    margin-right: 5px;
    color: grey;
    font-size: ${style["font-size-m"]};
    vertical-align: middle;
  }
`;
export const ListItem = styled.span`
  flex: 0 0 auto;
  font-size: ${style["font-size-m"]};
  padding: 5px 8px;
  border-radius: 10px;
  &.selected {
    color: ${style["theme-color"]};
    border: 1px solid ${style["theme-color"]};
    opacity: 0.8;
  }
`;
