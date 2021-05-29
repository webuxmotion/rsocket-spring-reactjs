import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { Item } from './Catalog.styles';

const Catalog = ({ items, fetchMoreData, isLoading }) => {

  return (
    
    <div>
      <h1>demo: react-infinite-scroll-component</h1>
      <hr />
      {isLoading
      ?
        <div>Loading...</div>
      :
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMoreData}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
          {items.map((i, index) => {
            
            return (
              <Item key={index}>
                div - #{index} {i.id} {i.chunkId}
              </Item>
            )
          })}
        </InfiniteScroll>
      }
      
    </div>
  );
}

export default Catalog;
